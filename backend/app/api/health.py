from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from app.config import settings
from app.services.premium_service import PremiumService

router = APIRouter(tags=["Health & Status"])


@router.get("/health", summary="Basic Health Check")
def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/status", summary="System & Model Operational Status")
def system_status():
    metadata = PremiumService.get_metadata()
    model_loaded = PremiumService.is_model_loaded()
    artifact_exists = settings.MODEL_PATH.exists()

    return {
        "status": "operational",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "datasets": {
            "sample_20k_available": settings.SAMPLE_DATASET_PATH.exists(),
            "train_1_2m_available": settings.TRAIN_DATASET_PATH.exists(),
        },
        "ml_model": {
            "name": "Insurance Premium Regressor",
            "target": "Premium Amount",
            "artifact_present": artifact_exists,
            "is_loaded": model_loaded,
            "selected_model": metadata.get("selected_model") if metadata else None,
            "test_mae": metadata.get("selected_model_metrics", {}).get("mae") if metadata else None,
            "test_rmse": metadata.get("selected_model_metrics", {}).get("rmse") if metadata else None,
            "test_r2": metadata.get("selected_model_metrics", {}).get("r2") if metadata else None,
            "trained_at": metadata.get("trained_at_utc") if metadata else None,
        },
        "rule_analysis_services": {
            "under_insurance_warning": "available",
            "underwriting_profit_margin": "available",
            "claim_burst_risk": "available",
            "customer_churn_alert": "available",
            "fraud_suspicion_audit": "available",
        },
    }


@router.get("/v1/model-info/premium", summary="Detailed Premium Model Metadata")
def premium_model_info():
    metadata = PremiumService.get_metadata()
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metadata is not available. Ensure the ML model has been trained.",
        )
    return metadata
