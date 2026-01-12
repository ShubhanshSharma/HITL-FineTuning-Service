from fastapi import APIRouter
from app.api.v1.endpoints import org, feedback, training
router = APIRouter()

router.include_router(
    org.router,
    prefix='/org',
    tags=["org"]
)


router.include_router(
    feedback.router,
    prefix='/feedback',
    tags=["feedback"]
)


router.include_router(
    training.router,
    prefix='/training',
    tags=["training"]
)
