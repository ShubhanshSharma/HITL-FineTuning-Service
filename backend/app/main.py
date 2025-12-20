from fastapi import FastAPI
from app.db.base import Base
from app.db.session import engine
from app.db import models
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

from app.api.v1.api import router as v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield  # startup complete, shutdown after

app = FastAPI()

@app.get("/")
def home():
    return{"message": "welcome to HOME ;)"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/feedback")
def submit_feedback(payload: dict):
    return {"message": "received"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js default
        "http://localhost:5173",   # Vite
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# include routes
app.include_router(v1_router, prefix="/v1")