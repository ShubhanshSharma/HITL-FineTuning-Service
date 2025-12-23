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
    webhook_endpoint: HttpUrl | None = None
    model : Optional[str] = None




class OrgRegisterResponse(BaseModel):
    id: UUID
    name: str
    contact_email: EmailStr

class APIResponse(BaseModel):
    message: str
    data: OrgRegisterResponse