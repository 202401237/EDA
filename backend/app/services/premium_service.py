import json
import logging
import threading
from typing import Optional, Dict, Any
import joblib
import pandas as pd
from fastapi import HTTPException, status

from app.config import settings
from app.ml.preprocessing import FEATURE_MAPPING, NUMERICAL_FEATURES, CATEGORICAL_FEATURES
from app.schemas.premium import PremiumPredictionInput, PremiumPredictionResult

logger = logging.getLogger(__name__)


class PremiumService:
    _model = None
    _metadata: Optional[Dict[str, Any]] = None
    _lock = threading.Lock()

    @classmethod
    def is_model_loaded(cls) -> bool:
        return cls._model is not None

    @classmethod
    def get_metadata(cls) -> Optional[Dict[str, Any]]:
        if cls._metadata is None and settings.MODEL_METADATA_PATH.exists():
            try:
                with open(settings.MODEL_METADATA_PATH, "r", encoding="utf-8") as f:
                    cls._metadata = json.load(f)
            except Exception as e:
                logger.error(f"Failed to load model metadata: {e}")
        return cls._metadata

    @classmethod
    def load_model(cls, force_reload: bool = False) -> None:
        """Loads serialized model pipeline and metadata with thread-safety."""
        with cls._lock:
            if cls._model is not None and not force_reload:
                return

            if not settings.MODEL_PATH.exists():
                logger.warning(f"Model artifact not found at {settings.MODEL_PATH}")
                cls._model = None
                return

            try:
                logger.info(f"Loading premium model from: {settings.MODEL_PATH}")
                cls._model = joblib.load(settings.MODEL_PATH)
                logger.info("Premium ML model pipeline loaded successfully.")
            except Exception as e:
                logger.error(f"Error loading model artifact: {e}")
                cls._model = None
                raise RuntimeError(f"Could not load premium model artifact: {e}")

            if settings.MODEL_METADATA_PATH.exists():
                try:
                    with open(settings.MODEL_METADATA_PATH, "r", encoding="utf-8") as f:
                        cls._metadata = json.load(f)
                except Exception as e:
                    logger.error(f"Error reading model metadata: {e}")

    @classmethod
    def predict(cls, data: PremiumPredictionInput) -> PremiumPredictionResult:
        """
        Executes inference using the fitted Scikit-Learn regression pipeline.
        Maps camelCase input properties to exact dataset column names.
        """
        if cls._model is None:
            cls.load_model()

        if cls._model is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Premium prediction model is not available. Artifact is missing or failed to initialize.",
            )

        # 1. Transform Pydantic input to dataset DataFrame row
        input_dict = data.model_dump()
        row_dict = {}
        for api_field, col_name in FEATURE_MAPPING.items():
            val = input_dict.get(api_field)
            # For enums, use their raw string value
            if hasattr(val, "value"):
                val = val.value
            row_dict[col_name] = [val]

        df_input = pd.DataFrame(row_dict)

        # Ensure correct column ordering expected by pipeline
        expected_cols = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
        df_input = df_input[expected_cols]

        # 2. Run model inference
        try:
            raw_prediction = cls._model.predict(df_input)
            predicted_val = float(raw_prediction[0])
            # Premium amount cannot be negative in insurance domain
            estimated_premium = max(20.0, round(predicted_val, 2))
        except Exception as e:
            logger.error(f"Inference execution failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Inference failed during model evaluation: {str(e)}",
            )

        # 3. Categorize premium based on documented empirical percentiles
        low_max = settings.PREMIUM_CATEGORY_LOW_MAX
        medium_max = settings.PREMIUM_CATEGORY_MEDIUM_MAX

        if estimated_premium < low_max:
            category = "Low"
        elif estimated_premium < medium_max:
            category = "Medium"
        else:
            category = "High"

        return PremiumPredictionResult(
            estimatedPremium=estimated_premium,
            policyType=data.policyType,
            confidenceLow=None,
            confidenceHigh=None,
            premiumCategory=category,
            isDemoResult=False,  # Genuine ML prediction
            submittedInputs=data,
        )
