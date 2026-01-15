from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID


class SidebarModel(BaseModel):
    id: UUID
    version: int
    status: str
    adapter_url: Optional[str]
    row_count: Optional[int]


class SidebarChat(BaseModel):
    live_model_id: Optional[UUID]
    live_model_version: Optional[int]


class SidebarTraining(BaseModel):
    latest_model_id: Optional[UUID]
    latest_model_version: Optional[int]
    latest_status: str


class SidebarFeedback(BaseModel):
    count: int


class SidebarResponse(BaseModel):
    org_id: UUID
    chat: SidebarChat
    training: SidebarTraining
    feedback: SidebarFeedback
    models: List[SidebarModel]
