import pytest
from fastapi.testclient import TestClient


def test_eda_overview(client: TestClient):
    response = client.get("/api/eda/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["population_records"] == 1200000
    assert data["sample_records"] == 20000
    assert data["cleaned_records"] == 20000
    assert data["imputed_records"] == 20000
    assert data["target_variable"] == "Premium Amount"
    assert len(data["stages"]) == 4
    assert data["numerical_features_count"] == 9
    assert data["categorical_features_count"] == 10


def test_eda_dataset_schema(client: TestClient):
    response = client.get("/api/eda/dataset-schema")
    assert response.status_code == 200
    data = response.json()
    assert data["total_features"] == 21
    assert "Age" in data["numerical_features"]
    assert "Location" in data["categorical_features"]
    assert data["target_feature"] == "Premium Amount"
    assert len(data["features"]) == 21

    # Check a specific feature schema
    age_feature = next(f for f in data["features"] if f["column_name"] == "Age")
    assert age_feature["role"] == "Numerical Predictor"
    assert age_feature["cardinality"] == 47


def test_eda_data_quality(client: TestClient):
    response = client.get("/api/eda/data-quality")
    assert response.status_code == 200
    data = response.json()
    assert data["exact_duplicate_rows"] == 0
    assert data["identifier_duplicates"] == 0
    assert data["feature_only_duplicates"] == 0
    assert data["complete_rows"] == 6465
    assert data["complete_rows_pct"] == 32.32
    assert data["incomplete_rows"] == 13535
    assert data["incomplete_rows_pct"] == 67.68
    assert len(data["synthetic_generation_signatures"]) == 3


def test_eda_sampling_validation(client: TestClient):
    response = client.get("/api/eda/sampling-validation")
    assert response.status_code == 200
    data = response.json()
    assert data["random_seed"] == 42
    assert "SRS-WOR" in data["methodology"]
    assert data["average_mean_error_pct"] == 0.453
    assert len(data["continuous_feature_validation"]) == 9
    assert data["categorical_feature_validation"]["all_tests_passed"] is True
    assert len(data["methodology_benchmark"]) == 3


def test_eda_missing_values(client: TestClient):
    response = client.get("/api/eda/missing-values")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] == 20000
    assert data["features_with_missing"] == 9
    assert data["total_missing_cells"] == 19910
    assert len(data["summary"]) == 21


def test_eda_missingness_patterns(client: TestClient):
    response = client.get("/api/eda/missingness-patterns")
    assert response.status_code == 200
    data = response.json()
    assert len(data["row_level_distribution"]) == 6
    assert data["complete_rows"] == 6465
    assert data["max_pairwise_phi_correlation"] == 0.031
    assert data["listwise_deletion_hazard"]["downstream_r2"] < 0


def test_eda_missingness_mechanisms(client: TestClient):
    response = client.get("/api/eda/missingness-mechanisms")
    assert response.status_code == 200
    data = response.json()
    assert "372.05" in str(data["little_mcar_test"]["test_statistic_chi2"])
    assert "Reject" in data["little_mcar_test"]["verdict"]
    assert len(data["feature_mechanisms"]) == 9
    assert len(data["informative_missingness_evidence"]) == 3

    # Check Annual Income delta
    inc = next(e for e in data["informative_missingness_evidence"] if e["feature"] == "Annual Income")
    assert inc["delta_usd"] < -100


def test_eda_imputation_summary(client: TestClient):
    response = client.get("/api/eda/imputation-summary")
    assert response.status_code == 200
    data = response.json()
    assert len(data["imputation_decision_matrix"]) == 9
    assert data["imputed_dataset_profile"]["total_columns"] == 27
    assert len(data["imputed_dataset_profile"]["indicators"]) == 6
    assert data["imputation_audit_summary"]["total_imputed_cells"] == 19910
    assert data["imputation_audit_summary"]["validation_pass_rate_pct"] == 100.0


def test_eda_imputation_benchmark(client: TestClient):
    response = client.get("/api/eda/imputation-benchmark")
    assert response.status_code == 200
    data = response.json()
    assert data["total_benchmarks"] == 42
    assert "Age" in data["columns_evaluated"]

    # Test filtering by column
    resp_filtered = client.get("/api/eda/imputation-benchmark?column=Age")
    assert resp_filtered.status_code == 200
    assert len(resp_filtered.json()["benchmark_results"]) > 0

    # Test invalid column
    resp_invalid = client.get("/api/eda/imputation-benchmark?column=InvalidColumn")
    assert resp_invalid.status_code == 404


def test_eda_outliers(client: TestClient):
    response = client.get("/api/eda/outliers")
    assert response.status_code == 200
    data = response.json()
    assert len(data["outlier_summaries"]) == 9
    assert data["target_variable_outliers"]["iqr_outliers_count"] == 856

    # Test valid method filter
    resp_iqr = client.get("/api/eda/outliers?method=iqr")
    assert resp_iqr.status_code == 200

    # Test invalid method filter
    resp_bad = client.get("/api/eda/outliers?method=unknown_method")
    assert resp_bad.status_code == 400


def test_eda_outlier_treatment(client: TestClient):
    response = client.get("/api/eda/outlier-treatment")
    assert response.status_code == 200
    data = response.json()
    assert len(data["treatment_strategies"]) == 4
    assert "Retain Original" in data["selected_strategy"]


def test_eda_univariate(client: TestClient):
    response = client.get("/api/eda/univariate")
    assert response.status_code == 200
    data = response.json()
    assert len(data["numerical_profiles"]) == 9
    assert len(data["categorical_profiles"]) == 10

    # Test single feature filter
    resp_single = client.get("/api/eda/univariate?feature=Age")
    assert resp_single.status_code == 200
    assert "Age" in resp_single.json()["numerical_profiles"]
    assert len(resp_single.json()["categorical_profiles"]) == 0

    # Test invalid feature
    resp_bad = client.get("/api/eda/univariate?feature=UnknownFeature")
    assert resp_bad.status_code == 404


def test_eda_bivariate(client: TestClient):
    response = client.get("/api/eda/bivariate")
    assert response.status_code == 200
    data = response.json()
    assert data["target_variable"] == "Premium Amount"
    assert len(data["numerical_bivariate"]) == 8
    assert len(data["categorical_bivariate"]) == 10
    assert len(data["key_findings"]) >= 3

    # Test feature filter
    resp_filt = client.get("/api/eda/bivariate?feature=Previous Claims")
    assert resp_filt.status_code == 200
    assert "Previous Claims" in resp_filt.json()["numerical_bivariate"]

    # Test invalid feature
    resp_bad = client.get("/api/eda/bivariate?feature=InvalidFeature")
    assert resp_bad.status_code == 404


def test_eda_correlation(client: TestClient):
    response = client.get("/api/eda/correlation")
    assert response.status_code == 200
    data = response.json()
    assert len(data["features"]) == 9
    assert "Premium Amount" in data["pearson_matrix"]
    assert len(data["target_correlations"]) == 8

    # Test method query param
    resp_p = client.get("/api/eda/correlation?method=pearson")
    assert resp_p.status_code == 200

    resp_bad = client.get("/api/eda/correlation?method=invalid_method")
    assert resp_bad.status_code == 400


def test_eda_multivariate(client: TestClient):
    response = client.get("/api/eda/multivariate")
    assert response.status_code == 200
    data = response.json()
    assert len(data["interactions"]) >= 4
    assert len(data["key_insights"]) >= 3


def test_eda_vif(client: TestClient):
    response = client.get("/api/eda/vif")
    assert response.status_code == 200
    data = response.json()
    assert len(data["vif_results"]) == 8
    assert data["collinearity_detected"] is False
    for v in data["vif_results"]:
        assert v["vif_score"] < 1.05


def test_eda_temporal(client: TestClient):
    response = client.get("/api/eda/temporal")
    assert response.status_code == 200
    data = response.json()
    assert data["temporal_column"] == "Policy Start Date"
    assert len(data["annual_breakdown"]) >= 4
    assert len(data["monthly_breakdown"]) == 12
    assert len(data["day_of_week_breakdown"]) == 7
    assert data["fixed_timestamp_signature"]["prevalence_rate_pct"] == 100.0


def test_eda_hypothesis_testing(client: TestClient):
    response = client.get("/api/eda/hypothesis-testing")
    assert response.status_code == 200
    data = response.json()
    assert len(data["tests"]) >= 10
    assert data["fdr_correction_applied"] is True


def test_eda_target_analysis(client: TestClient):
    response = client.get("/api/eda/target-analysis")
    assert response.status_code == 200
    data = response.json()
    assert data["target_name"] == "Premium Amount"
    assert data["sample_statistics"]["min_usd"] == 20.0
    assert data["sample_statistics"]["max_usd"] == 4985.0
    assert data["sample_statistics"]["skewness"] == 1.28
    assert len(data["histogram"]) == 15
    assert len(data["transformations"]) == 3


def test_eda_feature_engineering(client: TestClient):
    response = client.get("/api/eda/feature-engineering")
    assert response.status_code == 200
    data = response.json()
    assert len(data["experiments"]) == 2
    assert len(data["engineered_features_definitions"]) == 5


def test_eda_model_diagnostics(client: TestClient):
    response = client.get("/api/eda/model-diagnostics")
    assert response.status_code == 200
    data = response.json()
    assert len(data["pipelines_benchmarked"]) == 6
    assert data["missing_indicator_contribution"]["relative_r2_gain_pct"] > 70


def test_eda_insights(client: TestClient):
    response = client.get("/api/eda/insights")
    assert response.status_code == 200
    data = response.json()
    assert len(data["core_findings"]) == 6
    assert len(data["actionable_recommendations"]) == 4


def test_eda_coverage(client: TestClient):
    response = client.get("/api/eda/coverage")
    assert response.status_code == 200
    data = response.json()
    assert data["total_dimensions"] == 18
    assert data["completed_dimensions"] == 18
    assert data["coverage_percentage"] == 100.0
    assert len(data["dimensions"]) == 18


def test_eda_visualizations_catalog(client: TestClient):
    response = client.get("/api/eda/visualizations/catalog")
    assert response.status_code == 200
    data = response.json()
    assert data["total_figures"] >= 20
    assert data["total_categories"] >= 5


def test_v1_eda_alias(client: TestClient):
    # Verify backward compatible alias under /api/v1/eda/overview
    response = client.get("/api/v1/eda/overview")
    assert response.status_code == 200
    assert response.json()["sample_records"] == 20000
