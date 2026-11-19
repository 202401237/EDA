from typing import List, Dict, Any
from app.schemas.eda import FeatureEngineeringResponse
from app.services.eda.data_loader import EDADataLoader


class FeatureEngineeringService:
    @classmethod
    def get_feature_engineering(cls) -> FeatureEngineeringResponse:
        experiments = EDADataLoader.get_summary_table("feature_engineering_experiments")

        definitions = [
            {
                "feature_name": "Claims_per_Duration",
                "formula": "Previous Claims / (Insurance Duration + 1e-5)",
                "description": "Annualized claim frequency rate per year of policyholder tenure.",
                "rationale": "Distinguishes policyholders who had 3 claims in 1 year from those with 3 claims across 9 years.",
                "cv_gain": "Reduces validation MAE by $0.42",
            },
            {
                "feature_name": "Income_per_Dependent",
                "formula": "Annual Income / (Number of Dependents + 1)",
                "description": "Per-capita household financial buffer metric.",
                "rationale": "Captures true household purchasing power and under-insurance susceptibility better than raw gross income.",
                "cv_gain": "Improves premium tail calibration",
            },
            {
                "feature_name": "Risk_Score_Proxy",
                "formula": "Health Score / ((Credit Score / 100.0) + 1e-5)",
                "description": "Actuarial composite risk quotient.",
                "rationale": "Blends lifestyle / health vulnerability with credit solvency into a single ratio.",
                "cv_gain": "Captures non-linear adverse selection risk",
            },
            {
                "feature_name": "Vehicle_Risk_Index",
                "formula": "Vehicle Age * (Previous Claims + 1)",
                "description": "Compound mechanical and behavioral risk index.",
                "rationale": "Identifies high-frequency claimants driving deteriorating vehicle platforms.",
                "cv_gain": "Explains extreme claim cost deviations",
            },
            {
                "feature_name": "Missingness Indicators (is_missing_*)",
                "formula": "1 if column is null else 0",
                "description": "Binary informative missingness flags for Age, Income, Dependents, Claims, Health Score, Credit Score.",
                "rationale": "Captures MNAR signal where missingness carries actionable pricing predictive alpha.",
                "cv_gain": "Lifts out-of-fold R2 from 0.0193 to 0.0338 (+75% relative gain)",
            },
        ]

        return FeatureEngineeringResponse(
            experiments=experiments,
            engineered_features_definitions=definitions,
            methodology="Leakage-safe 5-fold cross-validation with HistGradientBoostingRegressor. All categorical encoders, scalers, and interaction terms fitted strictly inside training folds to prevent out-of-fold data leakage.",
        )
