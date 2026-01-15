import sys
from pathlib import Path

import modal

ROOT = Path(__file__).resolve().parents[3]  # project root
sys.path.append(str(ROOT))


from modal_apps.train_lora_app import train_lora


def trigger_training(model_version_id: str, json_url: str, adapter_config_json: str):

    fn = modal.Function.from_name(
        "lora-training-dev",   # app name
        "train_lora",          # function name
    )

    call = fn.spawn(
        model_version_id,
        json_url,
        adapter_config_json,
    )

    result = call.get()  # waits for Modal job

    return result
