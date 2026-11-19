from typing import Dict, Any, List
from app.schemas.eda import DatasetOverviewResponse, FeatureSchemaItem, DatasetSchemaResponse
from app.services.eda.data_loader import EDADataLoader


class DatasetOverviewService:
    @classmethod
    def get_overview(cls) -> DatasetOverviewResponse:
        stages = [
            {
                "stage_name": "Original Population Dataset",
                "file_path": "dataset/original_dataset/train.csv",
                "row_count": 1200000,
                "column_count": 21,
                "description": "Full Kaggle Playground Series s4e12 insurance pricing competition dataset (~194 MB raw CSV, ~898 MB in-memory).",
                "status": "Archived & Verified",
            },
            {
                "stage_name": "Raw Analytical Sample",
                "file_path": "dataset/sampled_dataset/insurance_sample_20000.csv",
                "row_count": 20000,
                "column_count": 21,
                "description": "Representative 20,000-row sample extracted via Simple Random Sampling Without Replacement (SRS-WOR, Seed 42, 1.6667% fraction).",
                "status": "Validated via KS and Chi-Square Tests",
            },
            {
                "stage_name": "Cleaned Feature Dataset",
                "file_path": "dataset/sampled_dataset/insurance_sample_20000_cleaned.csv",
                "row_count": 20000,
                "column_count": 27,
                "description": "20,000-row sample augmented with 6 binary informative missingness indicator flags (is_missing_*).",
                "status": "Feature-Engineered",
            },
            {
                "stage_name": "Imputed Production Dataset",
                "file_path": "processed_data/insurance_sample_20000_imputed.csv",
                "row_count": 20000,
                "column_count": 27,
                "description": "Production dataset with all 19,910 missing values imputed via hybrid actuarial decision policy; exactly 0 nulls remain.",
                "status": "Production Ready",
            },
        ]

        return DatasetOverviewResponse(
            population_records=1200000,
            population_columns=21,
            sample_records=20000,
            sample_columns=21,
            cleaned_records=20000,
            cleaned_columns=27,
            imputed_records=20000,
            imputed_columns=27,
            target_variable="Premium Amount",
            target_type="Continuous Regression Target (USD)",
            numerical_features_count=9,
            categorical_features_count=10,
            temporal_features_count=1,
            identifier_features_count=1,
            sampling_seed=42,
            sampling_method="Simple Random Sampling Without Replacement (SRS-WOR)",
            stages=stages,
        )

    @classmethod
    def get_schema(cls) -> DatasetSchemaResponse:
        data_dict = EDADataLoader.get_data_dictionary()
        items = []
        num_cols = []
        cat_cols = []
        temp_cols = []
        id_cols = []
        target_col = "Premium Amount"

        for row in data_dict:
            item = FeatureSchemaItem(
                column_name=row["column_name"],
                data_type=str(row["data_type"]),
                role=str(row["role"]),
                description=str(row["description"]),
                min_value=str(row["min_value"]) if row.get("min_value") is not None else None,
                max_value=str(row["max_value"]) if row.get("max_value") is not None else None,
                missing_count_pop=int(row["missing_count_pop"]),
                missing_pct_pop=float(row["missing_pct_pop"]),
                missing_count_sample=int(row["missing_count_sample"]),
                missing_pct_sample=float(row["missing_pct_sample"]),
                cardinality=int(row["cardinality"]),
                recommended_treatment=str(row["recommended_treatment"]),
            )
            items.append(item)

            role = str(row["role"]).lower()
            name = row["column_name"]
            if "numerical" in role:
                num_cols.append(name)
            elif "categorical" in role:
                cat_cols.append(name)
            elif "temporal" in role:
                temp_cols.append(name)
            elif "identifier" in role:
                id_cols.append(name)
            elif "target" in role:
                target_col = name

        return DatasetSchemaResponse(
            total_features=len(items),
            numerical_features=num_cols,
            categorical_features=cat_cols,
            temporal_features=temp_cols,
            identifier_features=id_cols,
            target_feature=target_col,
            features=items,
        )
