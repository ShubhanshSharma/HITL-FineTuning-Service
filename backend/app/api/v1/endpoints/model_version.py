from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.models import ModelVersion
from app.schemas.model_version import ModelVersionOut
from app.api.deps import get_db
from app.services.jwt_helper import get_org_context

router = APIRouter()


@router.get("/get-models", response_model=List[ModelVersionOut])
def get_models(
    db: Session = Depends(get_db),
    ctx=Depends(get_org_context),
):
    """
    Returns all model versions for the org in JWT.
    """
    org_id = ctx["org_id"]

    models = (
        db.query(ModelVersion)
        .filter(ModelVersion.org_id == org_id)
        .order_by(ModelVersion.version.desc())
        .all()
    )

    return models
