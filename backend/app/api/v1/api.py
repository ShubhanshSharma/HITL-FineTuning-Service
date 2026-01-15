from fastapi import APIRouter
from app.api.v1.endpoints import org, feedback, training, model_version, sidebar
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



router.include_router(
    model_version.router,
    prefix='/model_version',
    tags=["model_version"]
)

router.include_router(
    sidebar.router,
    prefix='/sidebar',
    tags=["sidebar"]
)