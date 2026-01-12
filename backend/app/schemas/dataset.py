from datetime import datetime
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Literal
from uuid import UUID


class DatasetFilters(BaseModel):
    ratings: List[int] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    has_correction: Optional[bool] = None


class DatasetSelection(BaseModel):
    mode: Literal["manual", "auto"]
    feedback_ids: Optional[List[UUID]] = None


class CreateDatasetRequest(BaseModel):
    filters: DatasetFilters
    selection: DatasetSelection

class DatasetCreateResponse(BaseModel):
    dataset_version_id: UUID
    feedback_count: int
    status: str


class DatasetStats(BaseModel):
    total_feedbacks: int
    ratings_breakdown: Dict[int, int]
    tags_breakdown: Dict[str, int]
    corrected_count: int
    uncorrected_count: int


class DatasetDetailResponse(BaseModel):
    id: UUID
    org_id: UUID
    source_model_version: int
    status: str
    created_at: datetime

    rules: dict
    feedback_count: int

    stats: DatasetStats
