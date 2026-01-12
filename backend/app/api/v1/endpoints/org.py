import json
from fastapi import APIRouter, Depends, HTTPException, Response, status
import uuid

from sqlalchemy.orm import Session
from app.schemas.org import org_register, APIResponse, OrgRegisterResponse
from app.db.session import session_local
from app.api.deps import get_db
from app.db.models import Organization
from sqlalchemy.exc import IntegrityError
from app.services.jwt_helper import create_org_token
# to generate hmac
import secrets

from app.services.org_service import create_organization_with_initial_model

router = APIRouter()


def generate_hmac_key() -> str:
    return secrets.token_urlsafe(16)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_org(
    payload: org_register,
    response: Response,
    db: Session = Depends(get_db)
):
    try:
        org, model_version = create_organization_with_initial_model(db, payload)
        # print('done org creation')
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="could not register organization",
        )

    token = create_org_token(str(org.id), version=1)

    return {
        "message": "Organization registered successfully",
        "data": {
            "id": org.id,
            "model_version_id": model_version.id,
            "version": model_version.version,
            "access_token": token,
            "token_type": "bearer"
        }
    }

