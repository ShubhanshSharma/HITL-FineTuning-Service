from sqlalchemy import Integer, Boolean, Text, String, Column, DateTime, ForeignKey, func, Enum, UniqueConstraint
import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base

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

    hmac_secret = Column(Text, nullable=False)

    @property
    def hmac(self) -> str:
        return fernet.decrypt(self.hmac_secret.encode()).decode()

    @hmac.setter
    def hmac(self, raw_secret: str):
        self.hmac_secret = fernet.encrypt(
            raw_secret.encode()
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

    version = Column (Integer,nullable=False)
    
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    organization = relationship("Organization", back_populates="feedbacks")



# model version and docs 
class ModelVersion(Base):
    __tablename__="model_version"

    id = Column(UUID(as_uuid=True), default=uuid.uuid4, nullable=False, primary_key=True)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organization.id"), nullable=False)

    version = Column(Integer, nullable=False)
    json_url = Column(Text,)
    row_count = Column(Integer)

    adapter_url = Column(Text)
    sha256 = Column(Text, nullable=False)

    status = Column(
        String,
        nullable=True
    )

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    organization = relationship("Organization", back_populates="model_versions")

    __table_args__ = (
        UniqueConstraint("org_id", "version", name="uq_org_version"),
    )

