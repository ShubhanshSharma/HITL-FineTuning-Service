
from pydantic import BaseModel, Field, field_validator
from typing import List


ALLOWED_BASE_MODELS = {
    "meta-llama/Meta-Llama-3-8B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.2",
    "Qwen/Qwen2.5-7B-Instruct",
    "microsoft/phi-3-mini-4k-instruct",
}

ALLOWED_TARGET_MODULES = {
    "q_proj",
    "k_proj",
    "v_proj",
    "o_proj",
    "gate_proj",
    "up_proj",
    "down_proj",
    "query_key_value",
}


class LoraConfigSchema(BaseModel):
    r: int = Field(ge=4, le=64)
    alpha: int = Field(ge=8, le=128)
    dropout: float = Field(ge=0.0, le=0.3)
    target_modules: List[str]

    @field_validator("target_modules")
    @classmethod
    def validate_target_modules(cls, v):
        if not v:
            raise ValueError("target_modules cannot be empty")

        invalid = set(v) - ALLOWED_TARGET_MODULES
        if invalid:
            raise ValueError(f"Invalid target modules: {invalid}")

        return v


class TrainingConfigSchema(BaseModel):
    epochs: int = Field(ge=1, le=5)
    batch_size: int = Field(ge=1, le=16)
    learning_rate: float = Field(ge=1e-5, le=5e-4)
    seed: int = Field(ge=0, le=10_000)


class AdapterConfigRequestSchema(BaseModel):
    base_model: str
    lora: LoraConfigSchema
    training: TrainingConfigSchema

    @field_validator("base_model")
    @classmethod
    def validate_base_model(cls, v):
        if v not in ALLOWED_BASE_MODELS:
            raise ValueError("Unsupported base model")
        return v
