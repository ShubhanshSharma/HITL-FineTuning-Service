import modal
from pathlib import Path
import os
import requests
import json

import shutil
from supabase import create_client

# ---------- Modal app ----------
app = modal.App("lora-training-dev")

# ---------- Image ----------
# Lightweight image, CUDA + bitsandbytes + peft
image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.1.0-runtime-ubuntu22.04",
        add_python="3.10",
    )
    .pip_install(
        "torch",
        "transformers",
        "datasets",
        "peft",
        "bitsandbytes",
        "accelerate",
        "requests",
        "supabase",
    )
)

# ---------- GPU ----------
GPU = "T4" # cheapest, enough for QLoRA dev


@app.function(
    image=image,
    gpu=GPU,
    timeout=60 * 60,      # 1 hour max
    retries=0,
    secrets=[
        modal.Secret.from_name("hf-platform"),
        modal.Secret.from_name("supabase"),
    ],
)
def train_lora(
    model_version_id: str,
    json_url: str,
    adapter_config_json: str,
):
    """
    This function runs INSIDE Modal GPU.
    Backend should pass:
      - model_version_id
      - json_url (Supabase public URL)
      - adapter_config (from DB)
    """

    workdir = Path("/workspace")
    workdir.mkdir(exist_ok=True)

    dataset_path = workdir / "dataset.jsonl"
    adapter_dir = workdir / "adapter"

    adapter_config = json.loads(adapter_config_json)

    # --------------------
    # 1️⃣ Download JSONL
    # --------------------
    r = requests.get(json_url, timeout=30)
    r.raise_for_status()
    dataset_path.write_bytes(r.content)

    # --------------------
    # 2️⃣ Load dataset
    # --------------------
    from datasets import load_dataset

    dataset = load_dataset(
        "json",
        data_files=str(dataset_path),
        split="train",
    )

    # --------------------
    # 3️⃣ Load base model (QLoRA)
    # --------------------
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from peft import LoraConfig, get_peft_model

    base_model = adapter_config["base_model"]
    lora_cfg_raw = adapter_config["lora"]
    training_cfg = adapter_config["training"]

    hf_token = os.environ["HF_TOKEN"]

    tokenizer = AutoTokenizer.from_pretrained(base_model, token=hf_token)
    tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        base_model,
        token=hf_token,
        load_in_4bit=True,
        device_map="auto",
    )

    lora_cfg = LoraConfig(
        r=lora_cfg_raw["r"],
        lora_alpha=lora_cfg_raw["alpha"],
        lora_dropout=lora_cfg_raw["dropout"],
        target_modules=lora_cfg_raw["target_modules"],
        task_type="CAUSAL_LM",
    )


    model = get_peft_model(model, lora_cfg)

    model.gradient_checkpointing_enable()
    model.enable_input_require_grads()


    # --------------------
    # 4️⃣ Training (VERY minimal)
    # --------------------
    from transformers import TrainingArguments, Trainer

    def tokenize(row):
        text = f"""### Instruction:
{row['instruction']}

### Input:
{row['input']}

### Output:
{row['output']}"""
        tokens = tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=256,
        )
        tokens["labels"] = tokens["input_ids"]
        return tokens

    tokenized = dataset.map(tokenize, remove_columns=dataset.column_names)

    training_args = TrainingArguments(
        output_dir=str(adapter_dir),
        per_device_train_batch_size=training_cfg["batch_size"],
        learning_rate=training_cfg["learning_rate"],
        num_train_epochs=training_cfg["epochs"],
        gradient_accumulation_steps=8,
        fp16=True,
        logging_steps=10,
        save_strategy="no",
        report_to="none",
        optim="paged_adamw_8bit",
    )


    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized,
    )

    trainer.train()

    # --------------------
    # 5️⃣ Save adapter
    # --------------------
    adapter_dir.mkdir(exist_ok=True)
    model.save_pretrained(adapter_dir)
    tokenizer.save_pretrained(adapter_dir)

    # --------------------
    # 5.5️⃣ Zip adapter
    # --------------------

    zip_path = workdir / f"{model_version_id}.zip"

    shutil.make_archive(
        base_name=str(zip_path).replace(".zip", ""),
        format="zip",
        root_dir=str(adapter_dir),
    )

    # --------------------
    # 5.6️⃣ Upload to Supabase
    # --------------------
    supabase = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )

    BUCKET = "lora-adapters"
    object_path = f"{model_version_id}/adapter.zip"

    with zip_path.open("rb") as f:
        supabase.storage.from_(BUCKET).upload(
            path=object_path,
            file=f,
            file_options={
                "content-type": "application/zip",
                "upsert": "true",
            },
        )

    adapter_url = supabase.storage.from_(BUCKET).get_public_url(object_path)
    

    # --------------------
    # 6️⃣ Return metadata
    # --------------------
    return {
        "model_version_id": model_version_id,
        "adapter_dir": str(adapter_url),
        "files": [p.name for p in adapter_dir.iterdir()],
    }


if __name__ == "__main__":
    app.run()
