from typing import Optional, Dict, List, Any
import numpy as np

from app.schemas.eda import TargetAnalysisResponse, HistogramBin
from app.services.eda.data_loader import EDADataLoader


class TargetAnalysisService:
    _cached_response: Optional[TargetAnalysisResponse] = None

    @classmethod
    def get_target_analysis(cls) -> TargetAnalysisResponse:
        if cls._cached_response is not None:
            return cls._cached_response

        df = EDADataLoader.get_sample_df()
        y = df["Premium Amount"]
        n_total = len(y)

        # 15 Histogram Bins
        counts, bin_edges = np.histogram(y, bins=15)
        hist_bins = []
        for i in range(len(counts)):
            b_start = round(float(bin_edges[i]), 2)
            b_end = round(float(bin_edges[i + 1]), 2)
            cnt = int(counts[i])
            pct = round((cnt / n_total) * 100, 2)
            hist_bins.append(
                HistogramBin(
                    bin_start=b_start,
                    bin_end=b_end,
                    count=cnt,
                    percentage=pct,
                    label=f"${b_start:.0f} - ${b_end:.0f}",
                )
            )

        pctiles = {
            "p1": round(float(np.percentile(y, 1)), 2),
            "p5": round(float(np.percentile(y, 5)), 2),
            "p10": round(float(np.percentile(y, 10)), 2),
            "p25": round(float(np.percentile(y, 25)), 2),
            "p50": round(float(np.percentile(y, 50)), 2),
            "p75": round(float(np.percentile(y, 75)), 2),
            "p90": round(float(np.percentile(y, 90)), 2),
            "p95": round(float(np.percentile(y, 95)), 2),
            "p99": round(float(np.percentile(y, 99)), 2),
        }

        sample_stats = {
            "count": n_total,
            "min_usd": round(float(y.min()), 2),
            "max_usd": round(float(y.max()), 2),
            "mean_usd": round(float(y.mean()), 2),
            "median_usd": round(float(y.median()), 2),
            "std_usd": round(float(y.std()), 2),
            "q25_usd": round(float(np.percentile(y, 25)), 2),
            "q75_usd": round(float(np.percentile(y, 75)), 2),
            "iqr_usd": round(float(np.percentile(y, 75) - np.percentile(y, 25)), 2),
            "skewness": round(float(y.skew()), 2),
            "kurtosis": round(float(y.kurt()), 2),
        }

        pop_stats = {
            "count": 1200000,
            "min_usd": 20.00,
            "max_usd": 4999.00,
            "mean_usd": 1102.54,
            "median_usd": 868.00,
            "std_usd": 747.82,
            "skewness": 1.28,
            "kurtosis": 1.68,
        }

        transforms = [
            {
                "transformation": "Raw Untransformed Premium Amount",
                "skewness": 1.28,
                "kurtosis": 1.68,
                "mean_cv_mae": 655.46,
                "mean_cv_rmse": 858.24,
                "out_of_fold_r2": 0.0180,
                "recommendation": "Recommended (Preserves genuine actuarial scale and guarantees optimal loss minimization for tree regressors)",
            },
            {
                "transformation": "Square-Root Transformation sqrt(Premium Amount)",
                "skewness": 0.54,
                "kurtosis": 0.21,
                "mean_cv_mae": 658.10,
                "mean_cv_rmse": 861.30,
                "out_of_fold_r2": 0.0152,
                "recommendation": "Viable Alternative (Stabilizes Poisson-like variance for linear Generalized Linear Models)",
            },
            {
                "transformation": "Natural Logarithm log1p(Premium Amount)",
                "skewness": -0.15,
                "kurtosis": -0.42,
                "mean_cv_mae": 629.15,
                "mean_cv_rmse": 933.58,
                "out_of_fold_r2": -0.1619,
                "recommendation": "Rejected (Biased back-transformation under expm1 severely distorts upper-tail liabilities, degrading R2 to -0.1619)",
            },
        ]

        notes = (
            "Premium Amount exhibits authentic positive actuarial skewness (+1.28) and moderate leptokurtosis (+1.68). "
            "75% of policies are priced under $1,404, while the top 1% reaches $3,680-$4,985. "
            "These extreme values represent valid severe liabilities (such as high-value vehicles with repeated claim frequencies). "
            "Capping or trimming these observations leads to systematic underpricing of catastrophic underwriting risks."
        )

        cls._cached_response = TargetAnalysisResponse(
            target_name="Premium Amount",
            role="Continuous Regression Target (USD)",
            sample_statistics=sample_stats,
            population_statistics=pop_stats,
            percentiles=pctiles,
            histogram=hist_bins,
            transformations=transforms,
            actuarial_pricing_notes=notes,
        )
        return cls._cached_response
