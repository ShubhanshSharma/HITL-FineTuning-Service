# app/services/org_service.py
from sqlalchemy.orm import Session
from app.db.models import Organization, ModelVersion
import secrets

def create_organization_with_initial_model(db: Session, payload):

    print(Organization.__table__.columns.keys())

    # print('trying to create org')
    try:
        org = Organization(
            contact_name=payload.contact_name,
            name=payload.company_name,
            contact_email=payload.email,
            model=payload.model,
            inference_url=str(payload.LLM_endpoint),
            reload_url=str(payload.webhook_endpoint),
        )
    except Exception as e:
        print("❌ ORG CONSTRUCTOR FAILED:", repr(e))
        raise

    print('between org creation')
    org.hmac_secret = secrets.token_urlsafe(16)
    org.llm_api_key = payload.llm_api_key
    # print('created org')
    db.add(org)
    # print('added org')
    db.flush()  # 🔑 ensures org.id exists

    model_version = ModelVersion(
        org_id=org.id,
        version=0,
        parent_model_version_id=None,
        feedback_ids=[],
        status="COLLECTING_FEEDBACK",
        sha256="bootstrap"  # explicit placeholder
    )

    db.add(model_version)

    return org, model_version
