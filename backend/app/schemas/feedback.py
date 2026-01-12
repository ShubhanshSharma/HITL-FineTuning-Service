from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field
import enum
from sqlalchemy import Enum

class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    # model: str
    max_tokens: int = Field(default=256, ge=1, le=1024)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)

class GenerateResponse(BaseModel):
    output: str
    # model: str


class FeedbackRequest(BaseModel):
    prompt: str
    model_response: str
    corrected_response: Optional[str] = None
    rating: int
    tags: Optional[List[str]] = Field(default=None)



class feedbackResponse(BaseModel):
    message: str





class FeedbackTag(enum.Enum):
    hallucination = "hallucination"
    incorrect = "incorrect"
    speculative = "speculative"
    incomplete = "incomplete"
    overcomplete = "overcomplete"
    partial_compliance = "partial_compliance"
    wrong_format = "wrong_format"
    ignored_constraints = "ignored_constraints"
    unclear = "unclear"
    verbose = "verbose"
    too_short = "too_short"
    unsafe = "unsafe"
    policy_violation = "policy_violation"



class FeedbackOut(BaseModel):
    id: UUID
    prompt: str
    model_response: str
    corrected_response: Optional[str]
    tags: List[str]
    rating: int
    timestamp: datetime

class FeedbackFilterResponse(BaseModel):
    feedbacks: List[FeedbackOut]



class AddFeedbackRequest(BaseModel):
    feedback_id: UUID
