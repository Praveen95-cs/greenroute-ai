from fastapi import APIRouter

from app import __version__
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="healthy",
        service="greenroute-ai-service",
        version=__version__,
    )
