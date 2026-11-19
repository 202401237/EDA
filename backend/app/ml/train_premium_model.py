import argparse
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any

import joblib
import numpy as np
import pandas as pd
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from app.config import settings
from app.ml.evaluation import evaluate_regression
from app.ml.preprocessing import (
    CATEGORICAL_FEATURES,
    FEATURE_MAPPING,
    NUMERICAL_FEATURES,
    TARGET_COLUMN,
    build_preprocessor,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def load_dataset(dataset_path: Path) -> pd.DataFrame:
    """Loads insurance dataset and ensures required columns exist."""
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset file not found at: {dataset_path}")
    logger.info(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    logger.info(f"Loaded {len(df):,} records with columns: {list(df.columns)}")
    return df


def train_and_evaluate(
    dataset_path: Path | None = None,
    output_dir: Path | None = None,
    random_state: int = 42,
    use_full_train: bool = False,
) -> Dict[str, Any]:
    """
    Executes reproducible ML training, comparison against baseline, and serialization.
    """
    if dataset_path is None:
        if use_full_train and settings.TRAIN_DATASET_PATH.exists():
            dataset_path = settings.TRAIN_DATASET_PATH
        elif settings.SAMPLE_DATASET_PATH.exists():
            dataset_path = settings.SAMPLE_DATASET_PATH
        elif settings.TRAIN_DATASET_PATH.exists():
            dataset_path = settings.TRAIN_DATASET_PATH
        else:
            raise FileNotFoundError("Neither sample nor train dataset could be found.")

    if output_dir is None:
        output_dir = settings.MODEL_DIR

    output_dir.mkdir(parents=True, exist_ok=True)

    # 1. Load data
    df = load_dataset(dataset_path)

    # 2. Extract selected features strictly aligned with frontend form inputs
    required_features = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
    missing_cols = [c for c in required_features + [TARGET_COLUMN] if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")

    X = df[required_features].copy()
    y = df[TARGET_COLUMN].copy()

    # Drop any records with missing target if present
    valid_mask = ~y.isnull()
    X = X[valid_mask]
    y = y[valid_mask]

    # 3. Train/Test Split (80% train, 20% test held-out) - No leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=random_state
    )
    logger.info(
        f"Train/Test split: {len(X_train):,} training samples, {len(X_test):,} held-out test samples."
    )

    # 4. Baseline Evaluation (DummyRegressor)
    dummy = DummyRegressor(strategy="median")
    dummy.fit(X_train, y_train)
    dummy_preds = dummy.predict(X_test)
    dummy_metrics = evaluate_regression(y_test.values, dummy_preds)
    logger.info(f"Baseline (Dummy Median) Test Metrics: {dummy_metrics}")

    # 5. Model Candidate Comparison
    candidate_models = {
        "Ridge Regression": Pipeline(
            steps=[
                ("preprocessor", build_preprocessor(scale_numerical=True)),
                ("regressor", Ridge(alpha=100.0, random_state=random_state)),
            ]
        ),
        "HistGradientBoosting": Pipeline(
            steps=[
                ("preprocessor", build_preprocessor(scale_numerical=False)),
                (
                    "regressor",
                    HistGradientBoostingRegressor(
                        max_iter=150,
                        learning_rate=0.08,
                        max_leaf_nodes=31,
                        random_state=random_state,
                    ),
                ),
            ]
        ),
        "Random Forest": Pipeline(
            steps=[
                ("preprocessor", build_preprocessor(scale_numerical=False)),
                (
                    "regressor",
                    RandomForestRegressor(
                        n_estimators=100,
                        max_depth=10,
                        random_state=random_state,
                        n_jobs=-1,
                    ),
                ),
            ]
        ),
    }

    comparison_results = {}
    best_model_name = None
    best_model_pipeline = None
    best_mae = float("inf")

    for name, pipeline in candidate_models.items():
        logger.info(f"Fitting candidate: {name}...")
        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)
        metrics = evaluate_regression(y_test.values, preds)
        logger.info(f"Candidate {name} Test Metrics: {metrics}")
        comparison_results[name] = metrics

        if metrics["mae"] < best_mae:
            best_mae = metrics["mae"]
            best_model_name = name
            best_model_pipeline = pipeline

    logger.info(f"Selected Best Model: {best_model_name} with MAE: {best_mae}")

    # 6. Save Model Pipeline & Metadata
    model_artifact_path = output_dir / "premium_model.joblib"
    metadata_artifact_path = output_dir / "model_metadata.json"

    joblib.dump(best_model_pipeline, model_artifact_path)
    logger.info(f"Saved model pipeline to: {model_artifact_path}")

    metadata = {
        "target_column": TARGET_COLUMN,
        "features": required_features,
        "numerical_features": NUMERICAL_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "feature_mapping": FEATURE_MAPPING,
        "dataset_source": str(dataset_path.name),
        "dataset_records_total": int(len(df)),
        "train_samples_count": int(len(X_train)),
        "test_samples_count": int(len(X_test)),
        "random_seed": random_state,
        "selected_model": best_model_name,
        "baseline_metrics": dummy_metrics,
        "selected_model_metrics": comparison_results[best_model_name],
        "all_candidate_metrics": comparison_results,
        "trained_at_utc": datetime.now(timezone.utc).isoformat(),
        "premium_category_thresholds": {
            "low_max": settings.PREMIUM_CATEGORY_LOW_MAX,
            "medium_max": settings.PREMIUM_CATEGORY_MEDIUM_MAX,
        },
        "limitations": (
            "The underlying synthetic Kaggle insurance dataset exhibits inherently low linear and non-linear "
            "correlation between demographic predictor features and Premium Amount (highest Pearson r ~ 0.044). "
            "Consequently, R² values typically remain modest (0.02 - 0.05), which is reported transparently without "
            "synthetic metric inflation."
        ),
        "sklearn_version": "1.9.1",
        "model_evaluation_role": (
            "Experimental Demonstration / Educational Prototype (R2=0.0224; not production pricing system)"
        ),
    }

    with open(metadata_artifact_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Saved model metadata to: {metadata_artifact_path}")

    return metadata


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Insurance Premium ML Model")
    parser.add_argument("--dataset", type=str, default=None, help="Path to training CSV")
    parser.add_argument("--use-full", action="store_true", help="Use full train.csv if present")
    args = parser.parse_args()

    ds_path = Path(args.dataset) if args.dataset else None
    train_and_evaluate(dataset_path=ds_path, use_full_train=args.use_full)
