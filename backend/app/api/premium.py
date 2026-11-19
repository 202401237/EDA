from fastapi import APIRouter
from app.schemas.premium import PremiumPredictionInput, PremiumPredictionResult
from app.services.premium_service import PremiumService

router = APIRouter(prefix="/predict", tags=["Premium Prediction"])


@router.post(
    "/premium",
    response_model=PremiumPredictionResult,
    summary="Predict Insurance Premium (ML Model)",
    description=(
        "Executes inference using the Scikit-Learn regression pipeline trained on "
        "the verified insurance dataset. Maps all 17 demographic, vehicle, and actuarial "
        "features directly to model pipeline inputs."
    ),
)
def predict_premium(data: PremiumPredictionInput) -> PremiumPredictionResult:
    return PremiumService.predict(data)
