from fastapi import APIRouter
from app.api.v1.endpoints import org
router = APIRouter()

router.include_router(
    org.router,
    prefix='/org',
    tags=["org"]
)
