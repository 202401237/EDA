from app.schemas.eda import (
    MissingValuesResponse,
    MissingnessPatternsResponse,
    MissingnessMechanismsResponse,
)
from app.services.eda.data_loader import EDADataLoader


class MissingValuesService:
    @classmethod
    def get_missing_values(cls) -> MissingValuesResponse:
        summary_records = EDADataLoader.get_summary_table("missing_value_summary")
        total_missing = sum(int(r["Missing Count"]) for r in summary_records)
        cols_with_missing = sum(1 for r in summary_records if int(r["Missing Count"]) > 0)
        total_cells = 20000 * 21
        overall_pct = round((total_missing / total_cells) * 100, 2)

        return MissingValuesResponse(
            total_records=20000,
            total_features=21,
            features_with_missing=cols_with_missing,
            total_missing_cells=total_missing,
            overall_missing_pct=overall_pct,
            summary=summary_records,
        )

    @classmethod
    def get_missingness_patterns(cls) -> MissingnessPatternsResponse:
        row_dist = [
            {"missing_features_count": 0, "row_count": 6465, "percentage": 32.32, "cumulative_pct": 32.32, "description": "Fully complete records"},
            {"missing_features_count": 1, "row_count": 8417, "percentage": 42.08, "cumulative_pct": 74.41, "description": "Exactly one missing attribute"},
            {"missing_features_count": 2, "row_count": 4014, "percentage": 20.07, "cumulative_pct": 94.48, "description": "Two missing attributes"},
            {"missing_features_count": 3, "row_count": 962, "percentage": 4.81, "cumulative_pct": 99.29, "description": "Three missing attributes"},
            {"missing_features_count": 4, "row_count": 134, "percentage": 0.67, "cumulative_pct": 99.96, "description": "Four missing attributes"},
            {"missing_features_count": 5, "row_count": 8, "percentage": 0.04, "cumulative_pct": 100.0, "description": "Five missing attributes"},
        ]

        top_combos = [
            {"signature": "Previous Claims Only", "affected_columns": ["Previous Claims"], "row_count": 3612, "percentage": 18.06},
            {"signature": "Occupation Only", "affected_columns": ["Occupation"], "row_count": 3540, "percentage": 17.70},
            {"signature": "Credit Score Only", "affected_columns": ["Credit Score"], "row_count": 1120, "percentage": 5.60},
            {"signature": "Previous Claims + Occupation", "affected_columns": ["Previous Claims", "Occupation"], "row_count": 1795, "percentage": 8.98},
            {"signature": "Previous Claims + Credit Score", "affected_columns": ["Previous Claims", "Credit Score"], "row_count": 710, "percentage": 3.55},
            {"signature": "Occupation + Credit Score", "affected_columns": ["Occupation", "Credit Score"], "row_count": 698, "percentage": 3.49},
        ]

        hazard = {
            "policy": "Listwise Deletion (dropna())",
            "rows_retained": 6465,
            "rows_discarded": 13535,
            "discard_percentage": 67.68,
            "downstream_r2": -0.0076,
            "baseline_median_r2": 0.0193,
            "actuarial_verdict": "Catastrophically destructive. Discarding 67.7% of the portfolio introduces severe selection bias, collapses training sample size, and results in negative predictive generalization.",
        }

        return MissingnessPatternsResponse(
            row_level_distribution=row_dist,
            complete_rows=6465,
            complete_rows_pct=32.32,
            incomplete_rows=13535,
            incomplete_rows_pct=67.68,
            max_pairwise_phi_correlation=0.031,
            top_missingness_combinations=top_combos,
            listwise_deletion_hazard=hazard,
        )

    @classmethod
    def get_missingness_mechanisms(cls) -> MissingnessMechanismsResponse:
        records = EDADataLoader.get_summary_table("missingness_mechanism_analysis")

        little_test = {
            "test_name": "Little's MCAR Omnibus Test",
            "test_statistic_chi2": 372.05,
            "degrees_of_freedom": 126,
            "p_value": "< 1e-15",
            "null_hypothesis": "Data is Missing Completely at Random (MCAR)",
            "verdict": "Reject H0 (Decisively Not MCAR)",
            "interpretation": "Missingness mechanisms depend systematically on observed and unobserved covariate structures.",
        }

        evidence = [
            {
                "feature": "Annual Income",
                "missing_pct": 3.66,
                "mean_target_when_missing": 929.10,
                "mean_target_when_observed": 1104.73,
                "delta_usd": -175.63,
                "welch_t_pval": "2.30e-06",
                "mwu_pval": "1.36e-21",
                "mechanism": "MNAR / Informative Signal",
                "actuarial_insight": "Policyholders omitting income systematically represent lower-cost actuarial profiles (-$175.63 premium difference, p < 1e-6). Retaining a binary missingness indicator is mandatory.",
            },
            {
                "feature": "Marital Status",
                "missing_pct": 1.50,
                "mean_target_when_missing": 1293.23,
                "mean_target_when_observed": 1095.35,
                "delta_usd": 197.88,
                "welch_t_pval": "1.80e-05",
                "mwu_pval": "4.46e-04",
                "mechanism": "MNAR / Informative Signal",
                "actuarial_insight": "Missing marital status exhibits +$197.88 premium lift (p = 1.8e-5). Treating missingness as an explicit 'Missing' category captures authentic risk elevation.",
            },
            {
                "feature": "Health Score",
                "missing_pct": 5.87,
                "mean_target_when_missing": 1180.13,
                "mean_target_when_observed": 1093.21,
                "delta_usd": 86.91,
                "welch_t_pval": "3.17e-04",
                "mwu_pval": "9.27e-07",
                "mechanism": "MNAR / Informative Signal",
                "actuarial_insight": "Unreported health score correlates with +$86.91 premium increase, reflecting adverse selection in biometric underwriting.",
            },
        ]

        return MissingnessMechanismsResponse(
            little_mcar_test=little_test,
            feature_mechanisms=records,
            informative_missingness_evidence=evidence,
            actuarial_implication="Because missingness carries demonstrable predictive signal regarding customer risk liability, standard imputation without indicator augmentation loses critical underwriting information. Augmenting feature vectors with binary missingness indicators ('is_missing_*') preserves this alpha.",
        )
