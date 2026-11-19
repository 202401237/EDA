import math
import numpy as np
import pandas as pd
from app.ml.preprocessing import (
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    build_preprocessor,
)
from app.services.premium_service import PremiumService


def test_pipeline_artifact_loaded():
    assert PremiumService.is_model_loaded() is True
    metadata = PremiumService.get_metadata()
    assert metadata is not None
    assert metadata["target_column"] == "Premium Amount"
    assert metadata["random_seed"] == 42
    assert "mae" in metadata["selected_model_metrics"]


def test_preprocessor_handles_nan_and_unseen_categories():
    preprocessor = build_preprocessor(scale_numerical=False)

    train_data = pd.DataFrame(
        {
            "Age": [25, 45, 60],
            "Annual Income": [30000.0, 60000.0, 90000.0],
            "Number of Dependents": [1, 2, 0],
            "Health Score": [20.0, 30.0, 40.0],
            "Previous Claims": [0, 1, 2],
            "Vehicle Age": [2, 5, 10],
            "Credit Score": [600, 700, 800],
            "Insurance Duration": [2, 4, 6],
            "Gender": ["Male", "Female", "Male"],
            "Marital Status": ["Single", "Married", "Divorced"],
            "Education Level": ["Bachelor's", "Master's", "PhD"],
            "Occupation": ["Employed", "Self-Employed", "Unemployed"],
            "Location": ["Urban", "Suburban", "Rural"],
            "Policy Type": ["Basic", "Comprehensive", "Premium"],
            "Smoking Status": ["No", "Yes", "No"],
            "Exercise Frequency": ["Weekly", "Daily", "Monthly"],
            "Property Type": ["House", "Apartment", "Condo"],
        }
    )

    preprocessor.fit(train_data)

    # Test data containing missing values and brand new unseen categories
    test_data = pd.DataFrame(
        {
            "Age": [np.nan],
            "Annual Income": [np.nan],
            "Number of Dependents": [np.nan],
            "Health Score": [np.nan],
            "Previous Claims": [np.nan],
            "Vehicle Age": [3],
            "Credit Score": [np.nan],
            "Insurance Duration": [1],
            "Gender": ["AlienCategory"],  # unseen
            "Marital Status": [np.nan],  # missing
            "Education Level": ["UnknownDegree"],  # unseen
            "Occupation": [np.nan],  # missing
            "Location": ["Mars"],  # unseen
            "Policy Type": ["Basic"],
            "Smoking Status": ["No"],
            "Exercise Frequency": ["Never"],  # unseen
            "Property Type": ["Spaceship"],  # unseen
        }
    )

    transformed = preprocessor.transform(test_data)
    assert transformed is not None
    assert not np.isnan(transformed).any()
    assert transformed.shape[0] == 1


def test_model_prediction_output_validity(valid_premium_payload):
    result = PremiumService.predict(
        PremiumService._model if False else None  # call via predict method
    ) if False else None

    # Use client to verify end to end
    from app.schemas.premium import PremiumPredictionInput
    p_input = PremiumPredictionInput(**valid_premium_payload)
    res = PremiumService.predict(p_input)
    assert math.isfinite(res.estimatedPremium)
    assert res.estimatedPremium > 0.0
    assert res.isDemoResult is False
    assert res.premiumCategory in ["Low", "Medium", "High"]
