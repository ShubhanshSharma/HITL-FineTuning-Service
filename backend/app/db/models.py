from sqlalchemy import  JSON, CheckConstraint, Integer, Boolean, Text, String, Column, DateTime, ForeignKey, func, Enum, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY
import uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum
from .base import Base
from app.schemas.feedback import FeedbackTag

# encrtption
from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

load_dotenv()

fernet = Fernet(os.getenv("FERNET_KEY"))

# to generate hmac
import secrets


class Organization(Base):
    __tablename__ = "organization"

    id = Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True, index=True)

    name = Column(Text, nullable=False)
    contact_name = Column(Text, nullable=False)
    contact_email = Column(Text, nullable=False, unique=True)

    inference_url = Column(Text, nullable=False)
    reload_url = Column(Text, nullable=True)
    callback_url = Column(Text, nullable=True)
    
    model = Column(Text, nullable=True)
    version = Column(Integer, nullable=False, default=0);

    hmac_secret = Column(Text, nullable=False)

    llm_request_schema = Column(JSONB)

    @property
    def hmac(self) -> str:
        return fernet.decrypt(self.hmac_secret.encode()).decode()

    @hmac.setter
    def hmac(self, raw_secret: str):
        self.hmac_secret = fernet.encrypt(
            raw_secret.encode()
        ).decode()
    
    llm_api_key_encrypted = Column(Text, nullable=True)
    @property
    def llm_api_key(self) -> str | None:
        if not self.llm_api_key_encrypted:
            return None
        return fernet.decrypt(
            self.llm_api_key_encrypted.encode()
        ).decode()

    @llm_api_key.setter
    def llm_api_key(self, raw_key: str):
        self.llm_api_key_encrypted = fernet.encrypt(
            raw_key.encode()
        ).decode()
        
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    
    feedbacks = relationship("Feedback", back_populates="organization")
    model_versions = relationship("ModelVersion", back_populates="organization")



# to maintain feedbacks
class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True, index=True)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False)

    prompt = Column(Text, nullable=False)
    model_response = Column(Text, nullable=False)
    corrected_response = Column(Text, nullable=True)

    model_version_id = Column(
        UUID(as_uuid=True),
        ForeignKey("model_version.id"),
        nullable=False
    )
    tags = Column(
        ARRAY(
            Enum(
                FeedbackTag,
                name="feedback_tag_enum",
                create_type=True
            )
        ),
        nullable=True,
        default=list
    )
    rating = Column(Integer, nullable=False)
    
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    organization = relationship("Organization", back_populates="feedbacks")

    model_version = relationship(
        "ModelVersion",
        back_populates="feedbacks"
    )
    __table_args__ = (
        CheckConstraint("rating IN (-1, 0, 1)", name="rating_valid_values"),
    )



# model version and docs 
class ModelVersion(Base):
    __tablename__="model_version"

    id = Column(UUID(as_uuid=True), default=uuid.uuid4, nullable=False, primary_key=True)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False)

    # Human-facing version
    version = Column(Integer, nullable=False)

    # Lineage
    parent_model_version_id = Column(
        UUID(as_uuid=True),
        ForeignKey("model_version.id"),
        nullable=True
    )


    # Immutable training snapshot
    feedback_ids = Column(
        ARRAY(UUID(as_uuid=True)),
        nullable=False
    )

    adapter_config = Column(JSON, nullable=True)
    json_url = Column(Text,)
    row_count = Column(Integer)

    adapter_url = Column(Text)
    sha256 = Column(Text, nullable=False)

    status = Column(String, nullable=True)


    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    organization = relationship("Organization", back_populates="model_versions")
    feedbacks = relationship("Feedback", back_populates="model_version")

    __table_args__ = (
        UniqueConstraint("org_id", "version", name="uq_org_version"),
    )




# ...existing code...

class OTP(Base):
    __tablename__ = "otp"
    id = Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True, index=True)  # Added primary key
    email = Column(Text, nullable=False, unique=True, index=True)
    otp_code = Column(String(6), nullable=False)
    
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False, default=lambda: func.now() + func.interval('6 minutes'))
    

    __table_args__ = (
        CheckConstraint("LENGTH(otp_code) = 6", name="otp_code_length"),
    )