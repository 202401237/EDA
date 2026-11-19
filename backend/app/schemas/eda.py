from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


# --- Overview & Schema ---
class DatasetOverviewResponse(BaseModel):
    population_records: int = 1200000
    population_columns: int = 21
    sample_records: int = 20000
    sample_columns: int = 21
    cleaned_records: int = 20000
    cleaned_columns: int = 27
    imputed_records: int = 20000
    imputed_columns: int = 27
    target_variable: str = "Premium Amount"
    target_type: str = "Continuous Regression Target (USD)"
    numerical_features_count: int = 9
    categorical_features_count: int = 10
    temporal_features_count: int = 1
    identifier_features_count: int = 1
    sampling_seed: int = 42
    sampling_method: str = "Simple Random Sampling Without Replacement (SRS-WOR)"
    stages: List[Dict[str, Any]]


class FeatureSchemaItem(BaseModel):
    column_name: str
    data_type: str
    role: str
    description: str
    min_value: Optional[str] = None
    max_value: Optional[str] = None
    missing_count_pop: int
    missing_pct_pop: float
    missing_count_sample: int
    missing_pct_sample: float
    cardinality: int
    recommended_treatment: str


class DatasetSchemaResponse(BaseModel):
    total_features: int
    numerical_features: List[str]
    categorical_features: List[str]
    temporal_features: List[str]
    identifier_features: List[str]
    target_feature: str
    features: List[FeatureSchemaItem]


# --- Data Quality ---
class DataQualityResponse(BaseModel):
    total_records: int
    exact_duplicate_rows: int
    identifier_duplicates: int
    feature_only_duplicates: int
    complete_rows: int
    complete_rows_pct: float
    incomplete_rows: int
    incomplete_rows_pct: float
    synthetic_generation_signatures: List[Dict[str, Any]]
    data_consistency: str
    overall_quality_verdict: str


# --- Sampling Validation ---
class SamplingValidationResponse(BaseModel):
    methodology: str
    random_seed: int
    population_size: int
    sample_size: int
    sampling_fraction_pct: float
    theoretical_guarantee: str
    average_mean_error_pct: float
    continuous_feature_validation: List[Dict[str, Any]]
    categorical_feature_validation: Dict[str, Any]
    methodology_benchmark: List[Dict[str, Any]]


# --- Missing Values & Patterns ---
class MissingValuesResponse(BaseModel):
    total_records: int
    total_features: int
    features_with_missing: int
    total_missing_cells: int
    overall_missing_pct: float
    summary: List[Dict[str, Any]]


class MissingnessPatternsResponse(BaseModel):
    row_level_distribution: List[Dict[str, Any]]
    complete_rows: int
    complete_rows_pct: float
    incomplete_rows: int
    incomplete_rows_pct: float
    max_pairwise_phi_correlation: float
    top_missingness_combinations: List[Dict[str, Any]]
    listwise_deletion_hazard: Dict[str, Any]


class MissingnessMechanismsResponse(BaseModel):
    little_mcar_test: Dict[str, Any]
    feature_mechanisms: List[Dict[str, Any]]
    informative_missingness_evidence: List[Dict[str, Any]]
    actuarial_implication: str


# --- Imputation ---
class ImputationSummaryResponse(BaseModel):
    imputation_decision_matrix: List[Dict[str, Any]]
    imputed_dataset_profile: Dict[str, Any]
    imputation_audit_summary: Dict[str, Any]


class ImputationBenchmarkResponse(BaseModel):
    total_benchmarks: int
    columns_evaluated: List[str]
    benchmark_results: List[Dict[str, Any]]


# --- Outliers ---
class OutlierSummaryItem(BaseModel):
    column_name: str
    valid_n: int
    min_value: float
    max_value: float
    mean: float
    median: float
    std: float
    iqr_fence_lower: float
    iqr_fence_upper: float
    iqr_outlier_count: int
    iqr_outlier_pct: float
    extreme_iqr_count: int
    zscore_outlier_count: int
    zscore_outlier_pct: float
    mad_outlier_count: int
    mad_outlier_pct: float
    domain_classification: str
    recommended_treatment: str


class OutliersResponse(BaseModel):
    audit_methods: List[str]
    outlier_summaries: List[OutlierSummaryItem]
    target_variable_outliers: Dict[str, Any]


class OutlierTreatmentResponse(BaseModel):
    treatment_strategies: List[Dict[str, Any]]
    selected_strategy: str
    actuarial_justification: str


# --- Univariate & Bivariate ---
class HistogramBin(BaseModel):
    bin_start: float
    bin_end: float
    count: int
    percentage: float
    label: str


class CategoryFrequency(BaseModel):
    category: str
    count: int
    percentage: float


class NumericalUnivariateProfile(BaseModel):
    column_name: str
    count: int
    missing_count: int
    missing_pct: float
    min: float
    max: float
    mean: float
    median: float
    std: float
    q25: float
    q75: float
    iqr: float
    skewness: float
    kurtosis: float
    distribution_shape: str
    histogram: List[HistogramBin]


class CategoricalUnivariateProfile(BaseModel):
    column_name: str
    count: int
    missing_count: int
    missing_pct: float
    unique_categories: int
    balance_status: str
    frequencies: List[CategoryFrequency]


class UnivariateResponse(BaseModel):
    numerical_profiles: Dict[str, NumericalUnivariateProfile]
    categorical_profiles: Dict[str, CategoricalUnivariateProfile]


class BivariateNumericalBin(BaseModel):
    bin_range: str
    bin_min: float
    bin_max: float
    count: int
    mean_premium: float
    median_premium: float


class BivariateCategoricalGroup(BaseModel):
    category: str
    count: int
    mean_premium: float
    median_premium: float
    std_premium: float


class BivariateResponse(BaseModel):
    target_variable: str
    numerical_bivariate: Dict[str, List[BivariateNumericalBin]]
    categorical_bivariate: Dict[str, List[BivariateCategoricalGroup]]
    key_findings: List[str]


# --- Correlation & Multivariate ---
class CorrelationResponse(BaseModel):
    features: List[str]
    pearson_matrix: Dict[str, Dict[str, float]]
    spearman_matrix: Dict[str, Dict[str, float]]
    target_correlations: List[Dict[str, Any]]
    key_findings: List[str]


class MultivariateResponse(BaseModel):
    interactions: List[Dict[str, Any]]
    key_insights: List[str]


class VIFResponse(BaseModel):
    vif_results: List[Dict[str, Any]]
    conservative_threshold: float = 5.0
    collinearity_detected: bool = False
    actuarial_interpretation: str


# --- Temporal & Hypothesis Testing ---
class TemporalResponse(BaseModel):
    temporal_column: str = "Policy Start Date"
    total_records: int
    earliest_date: str
    latest_date: str
    annual_breakdown: List[Dict[str, Any]]
    monthly_breakdown: List[Dict[str, Any]]
    day_of_week_breakdown: List[Dict[str, Any]]
    fixed_timestamp_signature: Dict[str, Any]


class HypothesisTestingResponse(BaseModel):
    tests: List[Dict[str, Any]]
    fdr_correction_applied: bool = True
    summary: str


# --- Target Analysis ---
class TargetAnalysisResponse(BaseModel):
    target_name: str = "Premium Amount"
    role: str = "Continuous Regression Target (USD)"
    sample_statistics: Dict[str, Any]
    population_statistics: Dict[str, Any]
    percentiles: Dict[str, float]
    histogram: List[HistogramBin]
    transformations: List[Dict[str, Any]]
    actuarial_pricing_notes: str


# --- Feature Engineering & Model Diagnostics ---
class FeatureEngineeringResponse(BaseModel):
    experiments: List[Dict[str, Any]]
    engineered_features_definitions: List[Dict[str, Any]]
    methodology: str


class ModelDiagnosticsResponse(BaseModel):
    pipelines_benchmarked: List[Dict[str, Any]]
    best_pipeline: str
    missing_indicator_contribution: Dict[str, Any]
    listwise_deletion_penalty: Dict[str, Any]


# --- Insights & Coverage ---
class InsightsResponse(BaseModel):
    executive_summary: str
    core_findings: List[Dict[str, Any]]
    actionable_recommendations: List[Dict[str, Any]]


class CoverageResponse(BaseModel):
    total_dimensions: int = 18
    completed_dimensions: int = 18
    coverage_percentage: float = 100.0
    dimensions: List[Dict[str, Any]]
