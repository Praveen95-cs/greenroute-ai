from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api.health import router as health_router
from app.api.mobility import router as mobility_router
from app.utils.config import settings

app = FastAPI(
    title="GreenRoute AI Service",
    description="AI/ML service for constraint extraction, recommendations, and analytics",
    version=__version__,
)

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(mobility_router)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "service": "greenroute-ai-service",
        "status": "running",
        "docs": "/docs",
    }
