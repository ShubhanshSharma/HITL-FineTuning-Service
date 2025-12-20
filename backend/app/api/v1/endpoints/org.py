from fastapi import APIRouter, Depends, HTTPException, status
import uuid

from sqlalchemy.orm import Session
from app.schemas.org import org_register, APIResponse, OrgRegisterResponse
from app.db.session import session_local
from app.api.deps import get_db
from app.db.models import Organization
from sqlalchemy.exc import IntegrityError
# to generate hmac
import secrets

router = APIRouter()


def generate_hmac_key() -> str:
    return secrets.token_urlsafe(16)

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model= APIResponse)
def register_org(payload: org_register, db: Session = Depends(get_db) ):
    
    org = Organization(
        contact_name = payload.contact_name,
        name = payload.company_name,
        contact_email = payload.email,
        inference_url = str(payload.LLM_endpoint),
        reload_url = str(payload.webhook_endpoint)
    )

    org.hmac = generate_hmac_key();

    try:
        db.add(org)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="could not register organization",
        )
    
    return {
        "message": "Organization registered successfully",
        "data": {
            "id": org.id,
            "name": org.name,
            "contact_email": org.contact_email,
        },
    }

    db.refresh(org)