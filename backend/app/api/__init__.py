from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.premium import router as premium_router
from app.api.analyses import router as analyses_router
from app.api.eda import router as eda_router

api_router = APIRouter()
# Health endpoints are at /api/health and /api/status and /api/v1/model-info/premium
api_router.include_router(health_router, prefix="/api")

# EDA endpoints are exposed at /api/eda/... and /api/v1/eda/...
api_router.include_router(eda_router, prefix="/api")

# Feature endpoints are at /api/v1/...
v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(premium_router)
v1_router.include_router(analyses_router)
v1_router.include_router(eda_router)

api_router.include_router(v1_router)

__all__ = ["api_router"]
