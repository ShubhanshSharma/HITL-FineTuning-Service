from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID


class ModelVersionOut(BaseModel):
    id: UUID
    version: int
    adapter_url: Optional[str]
    json_url: Optional[str]
    row_count: Optional[int]
    adapter_config: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True
