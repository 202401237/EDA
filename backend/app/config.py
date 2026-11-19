from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Insurance Intelligence API"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = False
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Heuristic & Actuarial Rule Thresholds
    UNDER_INSURANCE_INCOME_THRESHOLD: float = 25000.0
    FRAUD_INCOME_THRESHOLD: float = 100.0
    FRAUD_CREDIT_THRESHOLD: int = 450
    CHURN_RATE_HIKE_THRESHOLD: float = 15.0
    PREMIUM_CATEGORY_LOW_MAX: float = 700.0
    PREMIUM_CATEGORY_MEDIUM_MAX: float = 1500.0

    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    PROJECT_ROOT: Path = BASE_DIR.parent
    MODEL_DIR: Path = BASE_DIR / "app" / "ml" / "artifacts"
    MODEL_PATH: Path = MODEL_DIR / "premium_model.joblib"
    MODEL_METADATA_PATH: Path = MODEL_DIR / "model_metadata.json"

    # EDA Project Paths
    EDA_DIR: Path = PROJECT_ROOT / "EDA_Project_Final"
    EDA_DATASET_DIR: Path = EDA_DIR / "dataset"
    EDA_ORIGINAL_DATASET: Path = EDA_DATASET_DIR / "original_dataset" / "train.csv"
    EDA_SAMPLED_DATASET: Path = EDA_DATASET_DIR / "sampled_dataset" / "insurance_sample_20000.csv"
    EDA_CLEANED_DATASET: Path = EDA_DATASET_DIR / "sampled_dataset" / "insurance_sample_20000_cleaned.csv"
    EDA_IMPUTED_DATASET: Path = EDA_DIR / "processed_data" / "insurance_sample_20000_imputed.csv"
    EDA_IMPUTATION_AUDIT: Path = EDA_DIR / "processed_data" / "imputation_audit.csv"
    EDA_DATA_DICTIONARY: Path = EDA_DATASET_DIR / "data_dictionary" / "data_dictionary.csv"
    EDA_SUMMARY_TABLES_DIR: Path = EDA_DIR / "processed_data" / "summary_tables"
    EDA_VISUALIZATIONS_DIR: Path = EDA_DIR / "visualizations"
    EDA_REPORTS_DIR: Path = EDA_DIR / "reports"

    # Datasets (with fallbacks to EDA_Project_Final locations)
    SAMPLE_DATASET_PATH: Path = EDA_SAMPLED_DATASET
    TRAIN_DATASET_PATH: Path = EDA_ORIGINAL_DATASET

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
