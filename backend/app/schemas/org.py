from pydantic import BaseModel, EmailStr, HttpUrl
from uuid import UUID

class org_register(BaseModel):
    contact_name:str
    company_name: str
    email: EmailStr
    password: str
    # confirm_password: str
    LLM_endpoint: HttpUrl 
    webhook_endpoint: HttpUrl | None = None




class OrgRegisterResponse(BaseModel):
    id: UUID
    name: str
    contact_email: EmailStr

class APIResponse(BaseModel):
    message: str
    data: OrgRegisterResponse