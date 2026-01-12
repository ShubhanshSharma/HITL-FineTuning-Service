from pathlib import Path
import subprocess
import sys


def trigger_training(model_version_id):
    script_path = (
        Path(__file__).resolve().parents[1] / "services" / "train_lora.py"
    )

    subprocess.Popen(
        [
            sys.executable,              # ✅ use same venv python
            str(script_path),
            str(model_version_id),
        ],
        start_new_session=True,           # detach from uvicorn
    )
