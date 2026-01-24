import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from requests import Session

from app.api.deps import get_db
from app.db.models import Feedback, ModelVersion
from app.services.jwt_helper import get_org_context
from app.schemas.jsonl_cleaning import cpu_clean
from app.schemas.training import AdapterConfigRequestSchema
from app.services.training import trigger_training
from app.services.supabase_upload import upload_jsonl
from app.services.gpu_cleaning import trigger_gpu_cleaning

router = APIRouter()

@router.post("/start-training", status_code=202)
def generate_jsonl(
    ctx=Depends(get_org_context),
    db: Session = Depends(get_db),
):
    org_id = ctx["org_id"]

    model_version = (
        db.query(ModelVersion)
        .filter(ModelVersion.org_id == org_id)
        .order_by(ModelVersion.version.desc())
        .first()
    )

    if not model_version:
        raise HTTPException(404, "Model version not found")

    if model_version.status != "COLLECTING_FEEDBACK":
        raise HTTPException(400, "Training already requested or in progress")

    if not model_version.feedback_ids:
        raise HTTPException(400, "No feedbacks selected for training")

    output_dir = Path("training_data")
    output_dir.mkdir(exist_ok=True)

    cpu_file_path = output_dir / f"{model_version.id}_cpu.jsonl"

    raw_feedbacks = (
        db.query(Feedback)
        .filter(
            Feedback.id.in_(model_version.feedback_ids),
            Feedback.org_id == org_id,
        )
        .all()
    )

    # 1️⃣ CPU clean
    cpu_cleaned_feedbacks = cpu_clean(raw_feedbacks)

    if not cpu_cleaned_feedbacks:
        raise HTTPException(400, "No valid feedbacks after CPU cleaning")

    # 2️⃣ write CPU-cleaned JSONL
    with cpu_file_path.open("w", encoding="utf-8") as f:
        for fb in cpu_cleaned_feedbacks:
            f.write(
                json.dumps(
                    {
                        "instruction": fb.prompt.strip(),
                        "input": fb.model_response.strip(),
                        "output": (fb.corrected_response or "").strip(),
                    },
                    ensure_ascii=False,
                )
                + "\n"
            )

    # 3️⃣ upload CPU-cleaned JSONL
    cpu_object_path = f"{org_id}/{model_version.id}/cpu_cleaned.jsonl"

    try:
        cpu_jsonl_url = upload_jsonl(cpu_file_path, cpu_object_path)
    except Exception as e:
        raise HTTPException(500, f"CPU upload failed: {str(e)}")

    # 4️⃣ trigger GPU cleaning (Modal)
    gpu_result = trigger_gpu_cleaning(cpu_jsonl_url)

    cleaned_jsonl_url = gpu_result["cleaned_jsonl_url"]
    row_count = gpu_result["rows_kept"]

    if row_count == 0:
        raise HTTPException(400, "No valid feedbacks after GPU cleaning")

    # 5️⃣ lifecycle transition
    model_version.status = "TRAINING_REQUESTED"
    model_version.json_url = cleaned_jsonl_url
    model_version.row_count = row_count

    db.commit()

    return {
        "message": "Training dataset created",
        "json_url": cleaned_jsonl_url,
        "rows": row_count,
        "status": model_version.status,
    }





@router.post("/configure-lora", status_code=status.HTTP_201_CREATED)
def configure_lora_adapter(
    payload: AdapterConfigRequestSchema,
    ctx=Depends(get_org_context),
    db: Session = Depends(get_db),
):
    org_id = ctx["org_id"]

    model_version = (
        db.query(ModelVersion)
        .filter(ModelVersion.org_id == org_id)
        .order_by(ModelVersion.version.desc())
        .first()
    )

    if not model_version:
        raise HTTPException(404, "Model version not found")
    
    if model_version.adapter_config is not None:
        raise HTTPException(
            status_code=400,
            detail="Adapter config already set for this ModelVersion",
        )

    if model_version.status not in ["TRAINING_REQUESTED"]:
        raise HTTPException(400, "Adapter config can no longer be modified")

    
    model_version.adapter_config = payload.model_dump()
    model_version.status = "TRAINING_IN_PROGRESS"

    db.commit()
    db.refresh(model_version)

    # print('passing: ', model_version)
    result = trigger_training(
        model_version_id=str(model_version.id),
        json_url=model_version.json_url,
        adapter_config_json=json.dumps(model_version.adapter_config),
    )

    model_version.status = "READY"
    model_version.adapter_url = result["adapter_dir"]

    next_model_version = ModelVersion(
        org_id = model_version.org_id,
        version = model_version.version + 1,
        parent_model_version_id = model_version.id,
        feedback_ids=[],
        status="COLLECTING_FEEDBACK",
        sha256="bootstrap"
    )

    db.add(next_model_version)

    db.commit()

    return {
        "model_version_id": model_version.id,
        "status": "configured",
    }
