from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional
from uuid import UUID

class org_register(BaseModel):
    contact_name:str
    company_name: str
    email: EmailStr
    password: str
    # confirm_password: str
    LLM_endpoint: HttpUrl 
    llm_api_key: str
    model: str
    webhook_endpoint: HttpUrl | None = None




class OrgRegisterResponse(BaseModel):
    id: UUID
    name: str
    contact_email: EmailStr
    model_version_id: UUID
    model_version: int


class APIResponse(BaseModel):
    message: str
    data: OrgRegisterResponse
