from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status

from app.schemas.eda import ImputationSummaryResponse, ImputationBenchmarkResponse
from app.services.eda.data_loader import EDADataLoader


class ImputationService:
    @classmethod
    def get_imputation_summary(cls) -> ImputationSummaryResponse:
        matrix = EDADataLoader.get_summary_table("missing_value_decision_matrix")
        audit_summary = EDADataLoader.get_imputation_audit_summary()

        profile = {
            "dataset_filename": "insurance_sample_20000_imputed.csv",
            "rows": 20000,
            "total_columns": 27,
            "raw_feature_columns": 21,
            "engineered_indicator_columns": 6,
            "indicators": [
                "is_missing_Age",
                "is_missing_Annual_Income",
                "is_missing_Number_of_Dependents",
                "is_missing_Previous_Claims",
                "is_missing_Health_Score",
                "is_missing_Credit_Score",
            ],
            "remaining_missing_cells": 0,
            "target_unaltered": True,
            "reproducibility_seed": 42,
        }

        return ImputationSummaryResponse(
            imputation_decision_matrix=matrix,
            imputed_dataset_profile=profile,
            imputation_audit_summary=audit_summary,
        )

    @classmethod
    def get_imputation_benchmark(cls, column: Optional[str] = None) -> ImputationBenchmarkResponse:
        benchmarks = EDADataLoader.get_summary_table("imputation_method_comparison")
        cols_evaluated = sorted(list(set(r["column_name"] for r in benchmarks)))

        if column:
            matched = [r for r in benchmarks if r["column_name"].lower() == column.lower()]
            if not matched:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Column '{column}' not found in imputation benchmark. Available columns: {cols_evaluated}",
                )
            results = matched
        else:
            results = benchmarks

        return ImputationBenchmarkResponse(
            total_benchmarks=len(results),
            columns_evaluated=cols_evaluated,
            benchmark_results=results,
        )
