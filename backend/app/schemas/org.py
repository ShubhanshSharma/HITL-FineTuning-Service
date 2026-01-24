from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional
from uuid import UUID

class AuthConfig(BaseModel):
    type: str
    header: str
    prefix: str


class PayloadDefaults(BaseModel):
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None


class RequestMapping(BaseModel):
    model: Optional[str] = None
    messages: Optional[str] = None
    temperature: Optional[str] = None
    max_tokens: Optional[str] = None


class ResponseMapping(BaseModel):
    text: Optional[str] = None


class LLMConfig(BaseModel):
    endpoint: HttpUrl
    method: str
    model: Optional[str] = None
    api_key: Optional[str] = None
    auth: Optional[AuthConfig] = None
    payload_defaults: Optional[PayloadDefaults] = None
    request_mapping: Optional[RequestMapping] = None
    response_mapping: Optional[ResponseMapping] = None


class OrgRegister(BaseModel):
    company_name: str
    contact_name: str
    email: EmailStr
    password: str
    llm_config: LLMConfig
    webhook_endpoint: Optional[HttpUrl] = None



class OrgRegisterResponse(BaseModel):
    id: UUID
    name: str
    contact_email: EmailStr
    model_version_id: UUID
    model_version: int


class APIResponse(BaseModel):
    message: str
    data: OrgRegisterResponse
