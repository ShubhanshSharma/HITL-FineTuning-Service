from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.models import ModelVersion, Feedback
from app.services.jwt_helper import get_org_context
from app.schemas.sidebar import SidebarResponse
from app.api.deps import get_db

router = APIRouter()


@router.get("/get-sidebar", response_model=SidebarResponse)
def get_sidebar_data(
    db: Session = Depends(get_db),
    current_user=Depends(get_org_context),
):
    org_id = current_user["org_id"]

    # ---------------------------
    # Model Versions
    # ---------------------------
    model_versions = (
        db.query(ModelVersion)
        .filter(ModelVersion.org_id == org_id)
        .order_by(ModelVersion.created_at.desc())
        .all()
    )

    latest_model = model_versions[0] if model_versions else None

    models = [
        {
            "id": m.id,
            "version": m.version,
            "status": m.status,
            "adapter_url": m.adapter_url,
            "row_count": m.row_count,
        }
        for m in model_versions
    ]

     # ---------------------------
    # Feedback
    # ---------------------------
    feedback_count = (
        db.query(func.count(Feedback.id))
        .filter(Feedback.org_id == org_id, Feedback.model_version_id == latest_model.id)
        .scalar()
    )

    return {
        "org_id": org_id,

        "chat": {
            "live_model_id": latest_model.id if latest_model else None,
            "live_model_version": latest_model.version if latest_model else None,
        },

        "training": {
            "latest_model_id": latest_model.id if latest_model else None,
            "latest_model_version": latest_model.version if latest_model else None,
            "latest_status": latest_model.status if latest_model else "NO_MODEL",
        },

        "feedback": {
            "count": feedback_count,
        },

        "models": models,
    }
