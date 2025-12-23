import os
import requests
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.feedback import GenerateRequest, GenerateResponse, FeedbackRequest, feedbackResponse
from sqlalchemy.orm import session
from app.db.session import session_local
from app.db.models import Feedback, Organization
from app.api.deps import get_db
from app.services.jwt_helper import get_org_context

router = APIRouter()

OPENAI_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama-3.1-8b-instant"  # cheap, fast, great for feedback systems
# OPENAI_URL = "https://api.openai.com/v1/chat/completions"
OPENAI_URL = "https://api.groq.com/openai/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {OPENAI_API_KEY}",
    "Content-Type": "application/json",
}

@router.post("/generate1", response_model=GenerateResponse)
def generate_text1(payload: GenerateRequest):
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY not configured"
        )

    response = requests.post(
        OPENAI_URL,
        headers=HEADERS,
        json={
            "model": GROQ_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": payload.prompt
                }
            ],
            "max_tokens": payload.max_tokens,
            "temperature": payload.temperature,
        },
        timeout=30,
    )

    if response.status_code != 200:
        try:
            err = response.json()
            detail = err.get("error", {}).get("message", "OpenAI request failed")
        except Exception:
            detail = response.text or "OpenAI request failed"

        raise HTTPException(
            status_code=502,
            detail=detail
        )

    data = response.json()

    try:
        generated_text = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise HTTPException(
            status_code=500,
            detail="Unexpected OpenAI response format"
        )

    return GenerateResponse(
        output=generated_text,
        model=GROQ_MODEL,
    )

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import requests
import json

@router.post("/generate", response_model=GenerateResponse)
def generate_text(
    payload: GenerateRequest,
    ctx=Depends(get_org_context),
    db: Session = Depends(get_db),
):
    org_id = ctx["org_id"]
    version = ctx["version"]

    # ---- load & validate org ----
    org = (
        db.query(Organization)
        .filter(
            Organization.id == org_id,
            Organization.version == version,
        )
        .first()
    )

    if not org:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid organization or version",
        )

    if not org.inference_url or not org.llm_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Organization LLM configuration missing",
        )

    # ---- call LLM ----
    response = requests.post(
        org.inference_url,
        headers={
            "Authorization": f"Bearer {org.llm_api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model" : org.model,
            # "model" : "llama-3.1-8b-instant",
            "messages": [
                {"role": "user", "content": payload.prompt}
            ],
            "max_tokens": payload.max_tokens,
            "temperature": payload.temperature,
        },
        timeout=30,
    )

    if response.status_code != 200:
        try:
            err = response.json()
            detail = err.get("error", {}).get("message", "LLM request failed")
        except Exception:
            detail = response.text or "LLM request failed"

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=detail,
        )

    try:
        generated_text = response.json()["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected LLM response format",
        )

    return GenerateResponse(output=generated_text)



@router.post("/store-feedback", status_code=status.HTTP_201_CREATED, response_class=feedbackResponse)
def store_feedback(payload: FeedbackRequest, db: session = Depends(get_db)):

    feedback = Feedback(
        prompt = payload.prompt,
        model_response = payload.model_response,
        corrected_response = payload.corrected_response,
    )

    try:
        db.add(feedback)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='could not store the feeback',
        )
    
    return {
        "message": "feedback Registered",
    }