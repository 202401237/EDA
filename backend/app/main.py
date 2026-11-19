import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.api import api_router
from app.services.premium_service import PremiumService
from fastapi.staticfiles import StaticFiles

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("insurance_intelligence")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Application startup: attempt to preload ML model
    logger.info("Initializing Insurance Intelligence API backend...")
    try:
        PremiumService.load_model()
        if PremiumService.is_model_loaded():
            logger.info("Premium regression model successfully preloaded into memory.")
        else:
            logger.warning(
                "Premium model artifact not found. Train the model using: python -m app.ml.train_premium_model"
            )
    except Exception as e:
        logger.error(f"Error during model preload on startup: {e}")
    yield
    # Application shutdown
    logger.info("Shutting down Insurance Intelligence API backend...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Production-grade Python FastAPI backend integrating genuine machine learning "
        "and actuarial intelligence services with the React frontend."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware for local Vite / frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include unified API router
app.include_router(api_router)

# Mount static visualizations if present
if settings.EDA_VISUALIZATIONS_DIR.exists():
    app.mount(
        "/static/visualizations",
        StaticFiles(directory=str(settings.EDA_VISUALIZATIONS_DIR)),
        name="visualizations",
    )


# Global Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        msg = err.get("msg", "Invalid input")
        errors.append(f"{loc}: {msg}")
    logger.warning(f"Validation error on {request.method} {request.url.path}: {errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Input validation error",
            "errors": errors,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please verify inputs or review backend logs."},
    )


@app.get("/", summary="Root Endpoint")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/health",
        "status": "/api/status",
    }
