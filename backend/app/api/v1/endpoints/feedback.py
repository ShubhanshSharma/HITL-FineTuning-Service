import os
from typing import Optional
import requests
import sqlalchemy as sa
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import cast
from sqlalchemy.dialects.postgresql import ARRAY
from app.schemas.feedback import AddFeedbackRequest, FeedbackFilterResponse, GenerateRequest, GenerateResponse, FeedbackRequest, feedbackResponse
from sqlalchemy.orm import session
from app.db.session import session_local
from app.db.models import Feedback, ModelVersion, Organization
from app.api.deps import get_db
from app.services.jwt_helper import get_org_context

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import requests
import json

router = APIRouter()

OPENAI_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama-3.1-8b-instant"  # cheap, fast, great for feedback systems
OPENAI_URL = "https://api.groq.com/openai/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {OPENAI_API_KEY}",
    "Content-Type": "application/json",
}

@router.post("/generate", response_model=GenerateResponse)
def generate_text(
    payload: GenerateRequest,
    ctx=Depends(get_org_context),
    db: Session = Depends(get_db),
):
    org_id = ctx["org_id"]

    # load org
    org = (
        db.query(Organization)
        .filter(Organization.id == org_id)
        .first()
    )

    if not org:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid organization",
        )

    if not org.inference_url or not org.llm_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Organization LLM configuration missing",
        )

    # load deployed model version (exactly one)
    model_version = (
        db.query(ModelVersion)
        .filter(
            ModelVersion.org_id == org.id,
            ModelVersion.status == "COLLECTING_FEEDBACK",
        )
        .one_or_none()
    )

    if not model_version:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No deployed model or model is being finetuned.",
        )

    # call LLM
    response = requests.post(
        org.inference_url,
        headers={
            "Authorization": f"Bearer {org.llm_api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model":  org.model,  # base LLM name
            "messages": [
                {"role": "user", "content": payload.prompt}
            ],
            "max_tokens": payload.max_tokens,
            "temperature": payload.temperature,
        },
        timeout=30,
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="LLM request failed",
        )

    try:
        generated_text = response.json()["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected LLM response format",
        )

    return GenerateResponse(output=generated_text)



@router.post(
    "/store-feedback",
    status_code=status.HTTP_201_CREATED,
    response_model=feedbackResponse
)
def store_feedback(
    payload: FeedbackRequest,
    ctx=Depends(get_org_context),
    db: Session = Depends(get_db)
):
    org_id = ctx["org_id"]

    # load deployed model version (single source of truth)
    model_version = (
        db.query(ModelVersion)
        .filter(
            ModelVersion.org_id == org_id,
            ModelVersion.status == "COLLECTING_FEEDBACK",
        )
        .one_or_none()
    )

    if not model_version:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No deployed model version to attach feedback",
        )
    
    if model_version.status != "COLLECTING_FEEDBACK":
        raise HTTPException(
            status_code=400,
            detail="Training already requested or in progress",
        )

    feedback = Feedback(
        org_id=org_id,
        model_version_id=model_version.id,
        prompt=payload.prompt,
        model_response=payload.model_response,
        corrected_response=payload.corrected_response,
        rating=payload.rating,
        tags=payload.tags,
    )

    try:
        db.add(feedback)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not store feedback",
        )

    return {"message": "Feedback registered"}



@router.get("/filter", response_model=FeedbackFilterResponse)
def filter_feedbacks(
    ratings: Optional[str] = None,
    tags: Optional[str] = None,
    has_correction: Optional[bool] = None,
    ctx=Depends(get_org_context),
    db: Session = Depends(get_db),
):
    org_id = ctx["org_id"]

    # ---- get current deployed model version ----
    deployed_version = (
        db.query(ModelVersion)
        .filter(
            ModelVersion.org_id == org_id,
            ModelVersion.status == "COLLECTING_FEEDBACK",
        )
        .one_or_none()
    )

    if not deployed_version:
        raise HTTPException(
            status_code=409,
            detail="No deployed model version",
        )

    # ---- collect feedback_ids already used in training ----
    used_feedback_ids = (
        db.query(sa.func.unnest(ModelVersion.feedback_ids))
        .filter(ModelVersion.org_id == org_id)
        .subquery()
    )

    # ---- base query ----
    query = (
        db.query(Feedback)
        .filter(
            Feedback.org_id == org_id,
            Feedback.model_version_id == deployed_version.id,
            ~Feedback.id.in_(used_feedback_ids),
        )
    )

    # ---- ratings filter ----
    if ratings:
        rating_list = [int(r) for r in ratings.split(",")]
        query = query.filter(Feedback.rating.in_(rating_list))

    # ---- tags filter ----
    if tags:
        tag_list = tags.split(",")
        query = query.filter(
            Feedback.tags.overlap(tag_list)
        )

    # ---- correction filter ----
    if has_correction is True:
        query = query.filter(Feedback.corrected_response.isnot(None))
    elif has_correction is False:
        query = query.filter(Feedback.corrected_response.is_(None))

    feedbacks = query.order_by(Feedback.created_at.desc()).all()

    return {
        "feedbacks": [
            {
                "id": fb.id,
                "prompt": fb.prompt,
                "model_response": fb.model_response,
                "corrected_response": fb.corrected_response,
                "tags": fb.tags or [],
                "rating": fb.rating,
                "timestamp": fb.created_at,
            }
            for fb in feedbacks
        ]
    }

@router.post("/add-feedback", status_code=200)
def add_feedback_to_model_version(
    payload: AddFeedbackRequest,
    ctx=Depends(get_org_context),
    db: Session = Depends(get_db),
):
    org_id = ctx["org_id"]

    # ---- load feedback ----
    feedback = (
        db.query(Feedback)
        .filter(
            Feedback.id == payload.feedback_id,
            Feedback.org_id == org_id,
        )
        .one_or_none()
    )

    if not feedback:
        raise HTTPException(
            status_code=404,
            detail="Feedback not found",
        )

    # ---- load deployed model version ----
    model_version = (
        db.query(ModelVersion)
        .filter(
            ModelVersion.org_id == org_id,
            ModelVersion.status == "COLLECTING_FEEDBACK",
        )
        .one_or_none()
    )

    if not model_version:
        raise HTTPException(
            status_code=409,
            detail="No deployed model version",
        )
    
    if model_version.status != "COLLECTING_FEEDBACK":
        raise HTTPException(
            status_code=400,
            detail="Training already requested or in progress",
        )

    # ---- enforce same-model invariant ----
    if feedback.model_version_id != model_version.id:
        raise HTTPException(
            status_code=409,
            detail="Feedback does not belong to current model version",
        )

    # ---- prevent duplicates ----
    if payload.feedback_id in model_version.feedback_ids:
        raise HTTPException(
            status_code=409,
            detail="Feedback already added for training",
        )

    # ---- append feedback id ----
    model_version.feedback_ids = (
        model_version.feedback_ids + [payload.feedback_id]
    )

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not add feedback to training set",
        )

    return {
        "message": "Feedback added to training set",
        "model_version_id": model_version.id,
        "total_feedbacks": len(model_version.feedback_ids),
    }


@router.post("/delete-feedback", status_code=200)
def delete_feedback(
    payload: AddFeedbackRequest,
    ctx=Depends(get_org_context),
    db: Session = Depends(get_db),
):
    org_id = ctx["org_id"]

    # ---- load feedback ----
    feedback = (
        db.query(Feedback)
        .filter(
            Feedback.id == payload.feedback_id,
            Feedback.org_id == org_id,
        )
        .one_or_none()
    )

    if not feedback:
        raise HTTPException(
            status_code=404,
            detail="Feedback not found",
        )

    # ---- load deployed model version ----
    model_version = (
        db.query(ModelVersion)
        .filter(
            ModelVersion.org_id == org_id,
            ModelVersion.status == "COLLECTING_FEEDBACK",
        )
        .one_or_none()
    )

    if not model_version:
        raise HTTPException(
            status_code=409,
            detail="No deployed model version",
        )

    # ---- enforce same-model invariant ----
    if feedback.model_version_id != model_version.id:
        raise HTTPException(
            status_code=409,
            detail="Feedback does not belong to current model version",
        )

    

    # ---- remove feedback id from model version ----
    model_version.feedback_ids = [
        fid for fid in model_version.feedback_ids
        if fid != payload.feedback_id
    ]

    # ---- delete feedback row ----
    db.delete(feedback)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not delete feedback",
        )

    return {
        "message": "Feedback deleted successfully",
        "model_version_id": model_version.id,
        "total_feedbacks": len(model_version.feedback_ids),
    }




@router.get("/get-training-stats", status_code=status.HTTP_200_OK)
def get_training_stats(
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No model version found",
        )

    if not model_version.feedback_ids:
        return {
            "model": model_version.organization.model,
            "version": model_version.version,
            "feedbacks": [],
        }

    feedbacks = (
        db.query(Feedback)
        .filter(
            Feedback.id.in_(model_version.feedback_ids),
            Feedback.org_id == org_id,
        )
        .order_by(Feedback.created_at.asc())
        .all()
    )

    return {
        "model": model_version.organization.model,
        "version": model_version.version,
        "feedbacks": [
            {
                "id": fb.id,
                "prompt": fb.prompt,
                "model_response": fb.model_response,
                "corrected_response": fb.corrected_response,
                "tags": fb.tags or [],
                "rating": fb.rating,
                "timestamp": fb.created_at,
            }
            for fb in feedbacks
        ],
    }
