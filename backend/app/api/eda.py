from typing import Optional, List, Dict, Any
import os
from fastapi import APIRouter, Query, status

from app.config import settings
from app.schemas.eda import (
    DatasetOverviewResponse,
    DatasetSchemaResponse,
    DataQualityResponse,
    SamplingValidationResponse,
    MissingValuesResponse,
    MissingnessPatternsResponse,
    MissingnessMechanismsResponse,
    ImputationSummaryResponse,
    ImputationBenchmarkResponse,
    OutliersResponse,
    OutlierTreatmentResponse,
    UnivariateResponse,
    BivariateResponse,
    CorrelationResponse,
    MultivariateResponse,
    VIFResponse,
    TemporalResponse,
    HypothesisTestingResponse,
    TargetAnalysisResponse,
    FeatureEngineeringResponse,
    ModelDiagnosticsResponse,
    InsightsResponse,
    CoverageResponse,
)
from app.services.eda import (
    DatasetOverviewService,
    DataQualityService,
    SamplingValidationService,
    MissingValuesService,
    ImputationService,
    OutliersService,
    UnivariateService,
    BivariateService,
    CorrelationService,
    MultivariateService,
    TemporalService,
    HypothesisTestingService,
    TargetAnalysisService,
    FeatureEngineeringService,
    ModelDiagnosticsService,
    InsightsService,
)

router = APIRouter(prefix="/eda", tags=["Exploratory Data Analysis (EDA)"])


# 1. Dataset Overview
@router.get(
    "/overview",
    response_model=DatasetOverviewResponse,
    summary="Dataset Overview & Pipeline Stages",
    description="Exposes structural metadata across population (1.2M), sample (20k), cleaned, and imputed dataset stages.",
)
def get_dataset_overview() -> DatasetOverviewResponse:
    return DatasetOverviewService.get_overview()


# 2. Dataset Schema
@router.get(
    "/dataset-schema",
    response_model=DatasetSchemaResponse,
    summary="Comprehensive Feature Schema & Data Dictionary",
    description="Returns data dictionary specifications, roles, types, population/sample missingness, and cardinality for all 21 attributes.",
)
def get_dataset_schema() -> DatasetSchemaResponse:
    return DatasetOverviewService.get_schema()


# 3. Data Quality
@router.get(
    "/data-quality",
    response_model=DataQualityResponse,
    summary="Data Quality Audit & Synthetic Signatures",
    description="Audits row-level completeness (67.7% incomplete), uniqueness, duplicate rows, and synthetic generation artifacts.",
)
def get_data_quality() -> DataQualityResponse:
    return DataQualityService.get_data_quality()


# 4. Sampling Validation
@router.get(
    "/sampling-validation",
    response_model=SamplingValidationResponse,
    summary="Population vs 20k Sample Representativeness Validation",
    description="Validation of SRS-WOR 20,000-row sample against 1,200,000 population via Kolmogorov-Smirnov and Chi-Square goodness-of-fit tests.",
)
def get_sampling_validation() -> SamplingValidationResponse:
    return SamplingValidationService.get_sampling_validation()


# 5. Missing Values
@router.get(
    "/missing-values",
    response_model=MissingValuesResponse,
    summary="Missing-Value Frequency & Feature Breakdown",
    description="Feature-by-feature missing value counts, percentages, unique values, and recommended treatments from verified audit tables.",
)
def get_missing_values() -> MissingValuesResponse:
    return MissingValuesService.get_missing_values()


# 6. Missingness Patterns
@router.get(
    "/missingness-patterns",
    response_model=MissingnessPatternsResponse,
    summary="Missingness Patterns, Co-occurrence & Listwise Hazard",
    description="Multi-attribute missingness combinations, pairwise phi correlations, and quantification of the listwise deletion penalty.",
)
def get_missingness_patterns() -> MissingnessPatternsResponse:
    return MissingValuesService.get_missingness_patterns()


# 7. Missingness Mechanisms (MCAR/MAR/MNAR)
@router.get(
    "/missingness-mechanisms",
    response_model=MissingnessMechanismsResponse,
    summary="Missing Data Mechanism Testing (Little's Test & MNAR Audit)",
    description="Results of Little's MCAR omnibus test (p < 1e-15) and empirical target association tests demonstrating informative MNAR missingness.",
)
def get_missingness_mechanisms() -> MissingnessMechanismsResponse:
    return MissingValuesService.get_missingness_mechanisms()


# 8. Imputation Summary
@router.get(
    "/imputation-summary",
    response_model=ImputationSummaryResponse,
    summary="Imputation Strategy Matrix & Production Dataset Profile",
    description="Per-column actuarial imputation strategy, missingness indicator retention, and 19,910-cell audit verification summary.",
)
def get_imputation_summary() -> ImputationSummaryResponse:
    return ImputationService.get_imputation_summary()


# 9. Imputation Benchmark
@router.get(
    "/imputation-benchmark",
    response_model=ImputationBenchmarkResponse,
    summary="Multi-Method Imputation Reconstruction Benchmark",
    description="5-fold cross-validation reconstruction metrics (MAE, RMSE, Bias, R2, Accuracy, F1) across candidate imputation algorithms.",
)
def get_imputation_benchmark(
    column: Optional[str] = Query(None, description="Optional column name filter (e.g. 'Age', 'Health Score')")
) -> ImputationBenchmarkResponse:
    return ImputationService.get_imputation_benchmark(column=column)


# 10. Outlier Detection
@router.get(
    "/outliers",
    response_model=OutliersResponse,
    summary="Multi-Method Outlier Audit (IQR, Z-Score, Modified MAD)",
    description="Comprehensive outlier detection comparing Tukey's IQR, standard Z-Score (|Z|>3), and Modified Z-Score with MAD (>3.5).",
)
def get_outliers(
    method: Optional[str] = Query(None, description="Optional method filter: 'iqr', 'zscore', 'mad'")
) -> OutliersResponse:
    return OutliersService.get_outliers(method=method)


# 11. Outlier Treatment Comparison
@router.get(
    "/outlier-treatment",
    response_model=OutlierTreatmentResponse,
    summary="Outlier Treatment Benchmark & Actuarial Decision",
    description="Empirical comparison of retaining original outliers vs Winsorization, Trimming, and Target Log Transformations via 5-fold CV.",
)
def get_outlier_treatment() -> OutlierTreatmentResponse:
    return OutliersService.get_outlier_treatment()


# 12. Univariate Analysis
@router.get(
    "/univariate",
    response_model=UnivariateResponse,
    summary="Univariate Profiles, Moments & Chart Histograms",
    description="Parametric and non-parametric statistics, quantiles, skewness, kurtosis, and 15-bin chart histograms for all features.",
)
def get_univariate(
    feature: Optional[str] = Query(None, description="Optional feature name to filter (e.g. 'Age', 'Location')")
) -> UnivariateResponse:
    return UnivariateService.get_univariate(feature=feature)


# 13. Bivariate Analysis
@router.get(
    "/bivariate",
    response_model=BivariateResponse,
    summary="Bivariate Predictor-to-Target Stratification",
    description="Quantile-binned target statistics for numerical predictors and categorical stratification across Premium Amount.",
)
def get_bivariate(
    feature: Optional[str] = Query(None, description="Optional feature name to filter (e.g. 'Previous Claims', 'Policy Type')")
) -> BivariateResponse:
    return BivariateService.get_bivariate(feature=feature)


# 14. Correlation Analysis
@router.get(
    "/correlation",
    response_model=CorrelationResponse,
    summary="Linear (Pearson) & Monotonic (Spearman) Correlation Matrices",
    description="Complete 9x9 correlation matrices, ranking of predictors against target, and orthogonality verification.",
)
def get_correlations(
    method: Optional[str] = Query(None, description="Optional correlation method filter: 'pearson', 'spearman', or 'both'")
) -> CorrelationResponse:
    return CorrelationService.get_correlations(method=method)


# 15. Multivariate Analysis
@router.get(
    "/multivariate",
    response_model=MultivariateResponse,
    summary="Multivariate Risk Slices & Interaction Cohorts",
    description="Compound feature interactions (e.g. Vehicle Age x Previous Claims, Age x Credit Score) and their actuarial pricing impacts.",
)
def get_multivariate() -> MultivariateResponse:
    return MultivariateService.get_multivariate()


# 16. Multicollinearity Diagnostics (VIF)
@router.get(
    "/vif",
    response_model=VIFResponse,
    summary="Variance Inflation Factor (VIF) Multicollinearity Audit",
    description="VIF scores for all numerical predictors demonstrating complete absence of multicollinearity (all VIF < 1.05).",
)
def get_vif() -> VIFResponse:
    return MultivariateService.get_vif()


# 17. Temporal Analysis
@router.get(
    "/temporal",
    response_model=TemporalResponse,
    summary="Longitudinal Trends & Fixed Timestamp Signature",
    description="Temporal breakdowns of Policy Start Date by year, month, and day of week, plus synthetic generation timestamp audit.",
)
def get_temporal() -> TemporalResponse:
    return TemporalService.get_temporal_analysis()


# 18. Hypothesis Testing
@router.get(
    "/hypothesis-testing",
    response_model=HypothesisTestingResponse,
    summary="Inferential Statistical Hypothesis Testing Battery",
    description="Little's test, Welch's t-tests, Mann-Whitney U tests, KS tests, Chi-Square tests, and ANOVA with FDR corrections.",
)
def get_hypothesis_testing() -> HypothesisTestingResponse:
    return HypothesisTestingService.get_hypothesis_testing()


# 19. Target Variable Analysis
@router.get(
    "/target-analysis",
    response_model=TargetAnalysisResponse,
    summary="Detailed Premium Amount Distribution & Transformation Audit",
    description="Continuous regression target profile: percentiles, tail risk, and transformation comparisons (Raw vs Sqrt vs Log1p).",
)
def get_target_analysis() -> TargetAnalysisResponse:
    return TargetAnalysisService.get_target_analysis()


# 20. Feature Engineering
@router.get(
    "/feature-engineering",
    response_model=FeatureEngineeringResponse,
    summary="Actuarial Feature Engineering Benchmarks & Ratios",
    description="5-fold CV benchmark of engineered domain interaction terms (Claims_per_Duration, Risk_Score_Proxy, etc.).",
)
def get_feature_engineering() -> FeatureEngineeringResponse:
    return FeatureEngineeringService.get_feature_engineering()


# 21. Model Diagnostics
@router.get(
    "/model-diagnostics",
    response_model=ModelDiagnosticsResponse,
    summary="Downstream Regression Pipeline Benchmark on Premium Amount",
    description="Comparative 5-fold CV metrics (MAE, RMSE, R2) across 6 distinct imputation and preprocessing pipeline architectures.",
)
def get_model_diagnostics() -> ModelDiagnosticsResponse:
    return ModelDiagnosticsService.get_model_diagnostics()


# 22. Executive Insights
@router.get(
    "/insights",
    response_model=InsightsResponse,
    summary="Consolidated Statistical & Actuarial Findings",
    description="Comprehensive executive synthesis of verified findings, domain interpretations, and strategic machine learning recommendations.",
)
def get_insights() -> InsightsResponse:
    return InsightsService.get_insights()


# 23. Comprehensive Coverage Matrix
@router.get(
    "/coverage",
    response_model=CoverageResponse,
    summary="18-Point Comprehensive EDA Coverage Audit Matrix",
    description="Full audit status across all 18 mandated EDA dimensions, linked artifacts, empirical findings, and documented limitations.",
)
def get_coverage() -> CoverageResponse:
    return InsightsService.get_coverage()


# Visualizations catalog endpoint
@router.get(
    "/visualizations/catalog",
    summary="Visualizations Catalog & Metadata",
    description="Lists all 23 verified publication figure artifacts generated during EDA with topics, descriptions, and static image paths.",
)
def get_visualizations_catalog() -> Dict[str, Any]:
    vis_dir = settings.EDA_VISUALIZATIONS_DIR
    categories = []
    if vis_dir.exists():
        for cat_dir in sorted(vis_dir.iterdir()):
            if cat_dir.is_dir():
                figs = []
                for f in sorted(cat_dir.glob("*.png")):
                    figs.append({
                        "filename": f.name,
                        "category": cat_dir.name,
                        "url_path": f"/static/visualizations/{cat_dir.name}/{f.name}",
                        "size_bytes": f.stat().st_size,
                    })
                if figs:
                    categories.append({
                        "category": cat_dir.name,
                        "figure_count": len(figs),
                        "figures": figs,
                    })
    return {
        "total_categories": len(categories),
        "total_figures": sum(c["figure_count"] for c in categories),
        "categories": categories,
    }
