import json
from fastapi import APIRouter, Depends, HTTPException, Response, status
import uuid

from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.schemas.org import OrgRegister, APIResponse, OrgRegisterResponse
from app.db.session import session_local
from app.api.deps import get_db
from app.db.models import Organization
from sqlalchemy.exc import IntegrityError
from app.services.jwt_helper import create_org_token
# to generate hmac
import secrets

from app.services.org_service import create_organization_with_initial_model
from app.services.mail import send_otp
from app.services.otp import generate_and_save_otp, verify_otp

router = APIRouter()


def generate_hmac_key() -> str:
    return secrets.token_urlsafe(16)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_org(
    payload: OrgRegister,
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

class LoginRequst (BaseModel):
    email: str
@router.post("/login", status_code=status.HTTP_200_OK)
def login_org(
    payload: LoginRequst,
    response: Response,
    db: Session = Depends(get_db)
):
    print('Starting login process')
    print(f'email:- {payload.email}')
    
    try:
        print('Querying organization by email')
        org = (
            db.query(Organization)
            .filter(Organization.contact_email == payload.email)
            .first()
        )
        print(f'Organization found: {org}')
        
        if not org:
            print('Email not found in database')
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email not found"
            )
        print(f'Organization ID: {org.id}, Email: {org.contact_email}')
        print('Creating OTP')
        otp = generate_and_save_otp(payload.email, db)
        print(f'OTP created: {otp}')
        print(f'Sending OTP to {org.contact_email}')
        send_otp(org.contact_email, otp)
        print('OTP sent successfully')
        
    except HTTPException as e:
        print(f'HTTPException raised: {e.detail}')
        raise
    except Exception as e:
        print(f'Exception occurred: {type(e).__name__}: {str(e)}')
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="could not login organization",
        )

    print('Returning success response')
    return {
        "message": "OTP sent successfully",
        "data": {
            "email": org.contact_email
        }
    }

class VerifyOtpRequest (BaseModel):
    email: str
    otp: int


@router.post('/verify-otp', status_code=status.HTTP_200_OK)
def verify_login_otp(
    payload: VerifyOtpRequest,
    db: Session = Depends(get_db)
):
    try:
        print(f'Starting OTP verification for email: {payload.email}')
        print(f'OTP received: {payload.otp}')
        
        is_valid = verify_otp( payload.email, payload.otp, db)
        print(f'OTP validation result: {is_valid}')
        
        if not is_valid:
            print('OTP is invalid')
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP"
            )
        
        print(f'Querying organization by email: {payload.email}')
        org = db.query(Organization).filter(Organization.contact_email == payload.email).first()
        print(f'Organization found: {org}')
        
        if not org:
            print('Organization not found for email')
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        print(f'Creating token for org ID: {org.id}')
        token = create_org_token(str(org.id), version=1)
        print('Token created successfully')

        return {
            "message": "OTP verified successfully",
            "token": token
        }
    except HTTPException as e:
        print(f'HTTPException raised: {e.detail}')
        raise
    except Exception as e:
        print(f'Exception occurred: {type(e).__name__}: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="could not verify OTP",
        )
    