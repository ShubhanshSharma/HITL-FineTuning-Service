import sys
from pathlib import Path
import modal

ROOT = Path(__file__).resolve().parents[3]
sys.path.append(str(ROOT))


def trigger_gpu_cleaning(cpu_cleaned_jsonl_url: str):
    fn = modal.Function.from_name(
        "feedback-cleaning-dev",   # Modal app name
        "gpu_clean_feedbacks",     # function name
    )

    call = fn.spawn(
        cpu_cleaned_jsonl_url,
    )

    result = call.get()   # Modal job wait karega
    return result
