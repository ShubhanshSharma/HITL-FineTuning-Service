import modal
from pathlib import Path
import requests
import json

# -------- Modal App --------
app = modal.App("feedback-cleaning-dev")

# -------- Image --------
image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.1.0-runtime-ubuntu22.04",
        add_python="3.10",
    )
    .pip_install(
        "torch",
        "transformers",
        "sentencepiece",
        "requests",
        "supabase",
    )
)

GPU = "T4"


@app.function(
    image=image,
    gpu=GPU,
    timeout=30 * 60,
    secrets=[
        modal.Secret.from_name("hf-platform"),
        modal.Secret.from_name("supabase"),
    ],
)
def gpu_clean_feedbacks(cpu_cleaned_jsonl_url: str):
    """
    GPU checks:
    - toxicity / hate / violence
    - harassment
    - self-harm
    - medical / legal risk
    - jailbreak patterns
    """

    workdir = Path("/workspace")
    workdir.mkdir(exist_ok=True)

    input_path = workdir / "input.jsonl"
    output_path = workdir / "cleaned.jsonl"

    # 1️⃣ Download CPU-cleaned JSONL
    r = requests.get(cpu_cleaned_jsonl_url, timeout=30)
    r.raise_for_status()
    input_path.write_bytes(r.content)

    # 2️⃣ Load safety classifier (lightweight)
    from transformers import pipeline
    import os
    from supabase import create_client

    safety_clf = pipeline(
        "text-classification",
        model="unitary/toxic-bert",
        device=0,
        return_all_scores=True,
    )

    def is_safe(text: str) -> bool:
        scores = safety_clf(text)[0]
        score_map = {s["label"].lower(): s["score"] for s in scores}

        # Conservative thresholds
        if score_map.get("toxic", 0) > 0.85:
            return False
        if score_map.get("severe_toxic", 0) > 0.7:
            return False

        return True

    kept = 0

    # 3️⃣ Filter semantically
    with input_path.open() as fin, output_path.open("w") as fout:
        for line in fin:
            row = json.loads(line)
            output = row["output"]

            if not is_safe(output):
                continue

            fout.write(json.dumps(row) + "\n")
            kept += 1

    # 4️⃣ Upload cleaned.jsonl back to the same location (replace original)
    supabase = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )

    BUCKET = "training-data"

    # Extract the object path from the input URL
    # Example: https://xxx.supabase.co/storage/v1/object/public/training-data/feedback/data.jsonl
    # Extract: feedback/data.jsonl
    object_path = cpu_cleaned_jsonl_url.split(f"{BUCKET}/")[-1].split("?")[0]

    with output_path.open("rb") as f:
        supabase.storage.from_(BUCKET).upload(
            path=object_path,
            file=f,
            file_options={
                "content-type": "application/jsonl",
                "upsert": "true",  # This replaces the file if it exists
            },
        )

    final_url = supabase.storage.from_(BUCKET).get_public_url(object_path)

    return {
        "rows_kept": kept,
        "cleaned_jsonl_url": final_url
    }


if __name__ == "__main__":
    app.run()
