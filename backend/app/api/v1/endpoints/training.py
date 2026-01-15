import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from requests import Session

from app.api.deps import get_db
from app.db.models import Feedback, ModelVersion
from app.services.jwt_helper import get_org_context
from app.schemas.jsonl_cleaning import clean_feedbacks
from app.schemas.training import AdapterConfigRequestSchema
from app.services.training import trigger_training
from app.services.supabase_upload import upload_jsonl

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

    # ---- local jsonl generation ----
    output_dir = Path("training_data")
    output_dir.mkdir(exist_ok=True)

    file_path = output_dir / f"{model_version.id}.jsonl"

    if file_path.exists():
        raise HTTPException(409, "Training dataset already exists")

    raw_feedbacks = (
        db.query(Feedback)
        .filter(
            Feedback.id.in_(model_version.feedback_ids),
            Feedback.org_id == org_id,
        )
        .all()
    )

    cleaned_feedbacks = clean_feedbacks(raw_feedbacks)

    if not cleaned_feedbacks:
        raise HTTPException(400, "No valid feedbacks after cleaning")

    with file_path.open("w", encoding="utf-8") as f:
        for fb in cleaned_feedbacks:
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

    # ---- upload to supabase ----
    object_path = f"{org_id}/{model_version.id}/dataset.jsonl"

    try:
        public_url = upload_jsonl(file_path, object_path)
    except Exception as e:
        raise HTTPException(500, f"Upload failed: {str(e)}")

    # ---- lifecycle transition ----
    model_version.status = "TRAINING_REQUESTED"
    model_version.json_url = public_url
    model_version.row_count = len(cleaned_feedbacks)

    
    db.commit()

    return {
        "message": "Training dataset created",
        "json_url": public_url,
        "rows": len(cleaned_feedbacks),
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
