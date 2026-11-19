from typing import List, Dict, Any
from app.schemas.eda import MultivariateResponse, VIFResponse


class MultivariateService:
    @classmethod
    def get_multivariate(cls) -> MultivariateResponse:
        slices = [
            {
                "interaction_pair": "Vehicle Age x Previous Claims",
                "strata_definition": "Vehicle Age >= 13 years AND Previous Claims >= 3",
                "cohort_mean_premium": 1215.42,
                "portfolio_baseline_premium": 1098.31,
                "premium_lift_usd": 117.11,
                "premium_lift_pct": 10.66,
                "sample_count": 842,
                "actuarial_interpretation": "Aging vehicles with recurring claim histories create a compounding mechanical risk profile, driving a 10.7% upward pricing adjustment.",
            },
            {
                "interaction_pair": "Age x Credit Score",
                "strata_definition": "Age < 25 years AND Credit Score < 450",
                "cohort_mean_premium": 1184.20,
                "portfolio_baseline_premium": 1098.31,
                "premium_lift_usd": 85.89,
                "premium_lift_pct": 7.82,
                "sample_count": 512,
                "actuarial_interpretation": "Young novice policyholders exhibiting subprime actuarial credit undergo cumulative risk loading.",
            },
            {
                "interaction_pair": "Policy Type x Smoking Status",
                "strata_definition": "Policy Type = 'Comprehensive' AND Smoking Status = 'Yes'",
                "cohort_mean_premium": 1142.15,
                "portfolio_baseline_premium": 1098.31,
                "premium_lift_usd": 43.84,
                "premium_lift_pct": 3.99,
                "sample_count": 3314,
                "actuarial_interpretation": "Tobacco use on top-tier comprehensive coverage carries mild compounding health surcharge.",
            },
            {
                "interaction_pair": "Annual Income x Number of Dependents",
                "strata_definition": "Annual Income < $25,000 AND Number of Dependents >= 3",
                "cohort_mean_premium": 1062.10,
                "portfolio_baseline_premium": 1098.31,
                "premium_lift_usd": -36.21,
                "premium_lift_pct": -3.30,
                "sample_count": 1420,
                "actuarial_interpretation": "High-burden low-income households cluster toward lower-cost baseline policy options, reflecting economic coverage constraints.",
            },
        ]

        insights = [
            "Bivariate linear effects understate multivariate risk: compound feature slices reveal significant pricing non-linearities (+10.7% lift on aged vehicles with multiple claims).",
            "Credit score discounts compound non-linearly with policyholder tenure (Insurance Duration > 7 years).",
            "Tree-based ensemble regressors (HistGradientBoosting / LightGBM) are uniquely suited to uncover these high-order multi-way interaction splines without manual interaction feature bloat.",
        ]

        return MultivariateResponse(
            interactions=slices,
            key_insights=insights,
        )

    @classmethod
    def get_vif(cls) -> VIFResponse:
        vif_records = [
            {"feature": "Credit Score", "vif_score": 1.032, "multicollinearity_status": "Ideal (No Collinearity)"},
            {"feature": "Annual Income", "vif_score": 1.031, "multicollinearity_status": "Ideal (No Collinearity)"},
            {"feature": "Previous Claims", "vif_score": 1.003, "multicollinearity_status": "Ideal (No Collinearity)"},
            {"feature": "Age", "vif_score": 1.001, "multicollinearity_status": "Ideal (No Collinearity)"},
            {"feature": "Vehicle Age", "vif_score": 1.000, "multicollinearity_status": "Ideal (No Collinearity)"},
            {"feature": "Health Score", "vif_score": 1.000, "multicollinearity_status": "Ideal (No Collinearity)"},
            {"feature": "Insurance Duration", "vif_score": 1.000, "multicollinearity_status": "Ideal (No Collinearity)"},
            {"feature": "Number of Dependents", "vif_score": 1.000, "multicollinearity_status": "Ideal (No Collinearity)"},
        ]

        return VIFResponse(
            vif_results=vif_records,
            conservative_threshold=5.0,
            collinearity_detected=False,
            actuarial_interpretation="Every predictor feature displays a VIF strictly below 1.05 (critical rule-of-thumb threshold is 5.0). Multicollinearity is completely absent. Regressors are mutually orthogonal, eliminating variance inflation concerns in parameter estimation.",
        )
