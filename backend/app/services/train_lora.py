# train_lora.py
import sys
import json
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT))


from datetime import datetime

from app.db.session import session_local
from app.db.models import ModelVersion


def sha256_of_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()



def main(model_version_id: str):
    db = session_local()

    try:
        # 1️⃣ Load ModelVersion
        mv = (
            db.query(ModelVersion)
            .filter(ModelVersion.id == model_version_id)
            .first()
        )

        if not mv:
            raise RuntimeError("ModelVersion not found")

        if mv.status != "TRAINING_IN_PROGRESS":
            raise RuntimeError("Invalid state for training")

        if not mv.json_url:
            raise RuntimeError("json_url (training data) missing")
        
        if not mv.adapter_config:
            raise RuntimeError("adapter_config (training configuration) missing")

        jsonl_path = Path(mv.json_url)
        if not jsonl_path.exists():
            raise RuntimeError(f"Training data not found at {jsonl_path}")

        # 2️⃣ Create artifact directory
        artifacts_dir = Path("artifacts") / str(mv.org_id) / str(mv.id)
        artifacts_dir.mkdir(parents=True, exist_ok=True)

        adapter_bin = artifacts_dir / "adapter.bin"
        adapter_config = artifacts_dir / "adapter_config.json"

        # 3️⃣ Dummy training (placeholder for GPU work)
        # ------------------------------------------------
        # FUTURE GPU WORK WILL HAPPEN HERE:
        #
        # - load base model
        # - read jsonl_path
        # - apply PEFT / LoRA
        # - train on GPU
        # - save adapter weights
        # ------------------------------------------------

        adapter_bin.write_bytes(b"DUMMY LORA ADAPTER")
        adapter_config.write_text(
            json.dumps(mv.adapter_config or {}, indent=2)
        )

        # 4️⃣ Persist artifact metadata
        mv.adapter_url = str(artifacts_dir)
        mv.sha256 = sha256_of_file(adapter_bin)
        mv.status = "FINISHED"

        db.commit()

    except Exception as e:
        db.rollback()

        if "mv" in locals() and mv:
            mv.status = "FAILED"
            db.commit()

        Path("training_errors.log").write_text(
            f"{datetime.utcnow().isoformat()} | {model_version_id} | {str(e)}\n"
        )

    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise RuntimeError("Usage: python train_lora.py <model_version_id>")

    main(sys.argv[1])
