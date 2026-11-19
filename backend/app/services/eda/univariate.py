from typing import Optional, Dict, Any
import numpy as np
import pandas as pd
from fastapi import HTTPException, status

from app.schemas.eda import (
    UnivariateResponse,
    NumericalUnivariateProfile,
    CategoricalUnivariateProfile,
    HistogramBin,
    CategoryFrequency,
)
from app.services.eda.data_loader import EDADataLoader


NUM_COLS = [
    "Age", "Annual Income", "Number of Dependents", "Health Score",
    "Previous Claims", "Vehicle Age", "Credit Score", "Insurance Duration", "Premium Amount"
]

CAT_COLS = [
    "Gender", "Marital Status", "Education Level", "Occupation",
    "Location", "Policy Type", "Customer Feedback", "Smoking Status",
    "Exercise Frequency", "Property Type"
]


class UnivariateService:
    _cached_response: Optional[UnivariateResponse] = None

    @classmethod
    def _compute_profiles(cls) -> UnivariateResponse:
        if cls._cached_response is not None:
            return cls._cached_response

        df = EDADataLoader.get_sample_df()
        n_total = len(df)

        num_profiles: Dict[str, NumericalUnivariateProfile] = {}
        for col in NUM_COLS:
            s = df[col].dropna()
            n_valid = len(s)
            n_miss = n_total - n_valid
            pct_miss = round((n_miss / n_total) * 100, 2)

            q25 = float(s.quantile(0.25))
            q75 = float(s.quantile(0.75))
            iqr = round(q75 - q25, 2)
            skew = round(float(s.skew()), 2)
            kurt = round(float(s.kurt()), 2)

            # Determine shape description
            if skew > 1.0:
                shape = "Right-skewed with long positive tail"
            elif skew < -1.0:
                shape = "Left-skewed distribution"
            elif kurt < -1.0:
                shape = "Platykurtic uniform distribution"
            else:
                shape = "Symmetric / bell-shaped distribution"

            # Compute 15 histogram bins
            counts, bin_edges = np.histogram(s, bins=15)
            bins = []
            for i in range(len(counts)):
                b_start = round(float(bin_edges[i]), 2)
                b_end = round(float(bin_edges[i + 1]), 2)
                cnt = int(counts[i])
                pct = round((cnt / n_valid) * 100, 2) if n_valid > 0 else 0.0
                bins.append(
                    HistogramBin(
                        bin_start=b_start,
                        bin_end=b_end,
                        count=cnt,
                        percentage=pct,
                        label=f"{b_start:.1f} - {b_end:.1f}",
                    )
                )

            num_profiles[col] = NumericalUnivariateProfile(
                column_name=col,
                count=n_valid,
                missing_count=n_miss,
                missing_pct=pct_miss,
                min=round(float(s.min()), 2),
                max=round(float(s.max()), 2),
                mean=round(float(s.mean()), 2),
                median=round(float(s.median()), 2),
                std=round(float(s.std()), 2),
                q25=q25,
                q75=q75,
                iqr=iqr,
                skewness=skew,
                kurtosis=kurt,
                distribution_shape=shape,
                histogram=bins,
            )

        cat_profiles: Dict[str, CategoricalUnivariateProfile] = {}
        for col in CAT_COLS:
            s = df[col]
            n_valid = int(s.notnull().sum())
            n_miss = n_total - n_valid
            pct_miss = round((n_miss / n_total) * 100, 2)

            vc = s.value_counts(dropna=False)
            freqs = []
            for cat_name, cnt in vc.items():
                cat_label = str(cat_name) if pd.notnull(cat_name) else "Missing"
                pct = round((cnt / n_total) * 100, 2)
                freqs.append(CategoryFrequency(category=cat_label, count=int(cnt), percentage=pct))

            n_unique = int(s.nunique(dropna=True))
            balance = "Uniformly Balanced" if n_miss == 0 else f"Balanced categories with {pct_miss}% missingness"

            cat_profiles[col] = CategoricalUnivariateProfile(
                column_name=col,
                count=n_valid,
                missing_count=n_miss,
                missing_pct=pct_miss,
                unique_categories=n_unique,
                balance_status=balance,
                frequencies=freqs,
            )

        cls._cached_response = UnivariateResponse(
            numerical_profiles=num_profiles,
            categorical_profiles=cat_profiles,
        )
        return cls._cached_response

    @classmethod
    def get_univariate(cls, feature: Optional[str] = None) -> UnivariateResponse:
        full_res = cls._compute_profiles()
        if not feature:
            return full_res

        matched_num = {k: v for k, v in full_res.numerical_profiles.items() if k.lower() == feature.lower()}
        matched_cat = {k: v for k, v in full_res.categorical_profiles.items() if k.lower() == feature.lower()}

        if not matched_num and not matched_cat:
            available = list(full_res.numerical_profiles.keys()) + list(full_res.categorical_profiles.keys())
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Feature '{feature}' not recognized. Available features: {available}",
            )

        return UnivariateResponse(
            numerical_profiles=matched_num,
            categorical_profiles=matched_cat,
        )
