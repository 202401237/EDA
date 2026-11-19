export interface DatasetStage {
  stage_name: string;
  file_path: string;
  row_count: number;
  column_count: number;
  description: string;
  status: string;
}

export interface DatasetOverviewResponse {
  population_records: number;
  population_columns: number;
  sample_records: number;
  sample_columns: number;
  cleaned_records: number;
  cleaned_columns: number;
  imputed_records: number;
  imputed_columns: number;
  target_variable: string;
  target_type: string;
  numerical_features_count: number;
  categorical_features_count: number;
  temporal_features_count: number;
  identifier_features_count: number;
  sampling_seed: number;
  sampling_method: string;
  stages: DatasetStage[];
}

export interface FeatureSchemaItem {
  column_name: string;
  data_type: string;
  role: string;
  description: string;
  min_value?: string | null;
  max_value?: string | null;
  missing_count_pop: number;
  missing_pct_pop: number;
  missing_count_sample: number;
  missing_pct_sample: number;
  cardinality: number;
  recommended_treatment: string;
}

export interface DatasetSchemaResponse {
  total_features: number;
  numerical_features: string[];
  categorical_features: string[];
  temporal_features: string[];
  identifier_features: string[];
  target_feature: string;
  features: FeatureSchemaItem[];
}

export interface SyntheticSignature {
  signature_name: string;
  affected_attribute: string;
  evidence: string;
  implication: string;
  prevalence_pct: number;
}

export interface DataQualityResponse {
  total_records: number;
  exact_duplicate_rows: number;
  identifier_duplicates: number;
  feature_only_duplicates: number;
  complete_rows: number;
  complete_rows_pct: number;
  incomplete_rows: number;
  incomplete_rows_pct: number;
  synthetic_generation_signatures: SyntheticSignature[];
  data_consistency: string;
  overall_quality_verdict: string;
}

export interface ContinuousValidationItem {
  feature: string;
  pop_mean: number;
  sample_mean?: number;
  samp_mean?: number;
  mean_error_pct: number;
  pop_std?: number;
  sample_std?: number;
  ks_statistic?: number;
  ks_stat?: number;
  ks_p_value?: number;
  ks_pval?: number;
  ks_test_result?: string;
  inference?: string;
}

export interface SamplingValidationResponse {
  methodology: string;
  random_seed: number;
  population_size: number;
  sample_size: number;
  sampling_fraction_pct: number;
  theoretical_guarantee: string;
  average_mean_error_pct: number;
  continuous_feature_validation: ContinuousValidationItem[];
  categorical_feature_validation: {
    test_type: string;
    attributes_evaluated: number;
    all_tests_passed: boolean;
    min_p_value: number;
    max_p_value: number;
    max_strata_proportion_shift_pct: number;
    summary: string;
    strata_details: Array<{
      attribute: string;
      levels: number;
      max_drift_pct: number;
      chi2_pval: number;
    }>;
  };
  methodology_benchmark: Array<{
    method: string;
    random_seed: number;
    avg_numerical_error_pct: number;
    max_numerical_error_pct: number;
    max_categorical_shift_pct: number;
    max_missingness_shift_pct: number;
    mean_abs_corr_diff: number;
    verdict: string;
  }>;
}

export interface MissingValueItem {
  Feature?: string;
  'Missing Count'?: number;
  'Missing %'?: number;
  'Data Type'?: string;
  'Unique Values'?: number;
  'Recommended Imputation'?: string;
  [key: string]: any;
}

export interface MissingValuesResponse {
  total_records: number;
  total_features: number;
  features_with_missing: number;
  total_missing_cells: number;
  overall_missing_pct: number;
  summary: MissingValueItem[];
}

export interface MissingnessPatternsResponse {
  row_level_distribution: Array<{
    missing_features_count: number;
    row_count: number;
    percentage: number;
    cumulative_pct: number;
    description: string;
  }>;
  complete_rows: number;
  complete_rows_pct: number;
  incomplete_rows: number;
  incomplete_rows_pct: number;
  max_pairwise_phi_correlation: number;
  top_missingness_combinations: Array<{
    signature: string;
    affected_columns: string[];
    row_count: number;
    percentage: number;
  }>;
  listwise_deletion_hazard: {
    policy: string;
    rows_retained: number;
    rows_discarded: number;
    discard_percentage: number;
    downstream_r2: number;
    baseline_median_r2: number;
    actuarial_verdict: string;
  };
}

export interface MissingnessMechanismsResponse {
  little_mcar_test: {
    test_name: string;
    test_statistic_chi2: number;
    degrees_of_freedom: number;
    p_value: string;
    null_hypothesis: string;
    verdict: string;
    interpretation: string;
  };
  feature_mechanisms: Array<{
    Feature?: string;
    Mechanism?: string;
    Evidence?: string;
    'Actionable Implication'?: string;
    [key: string]: any;
  }>;
  informative_missingness_evidence: Array<{
    feature: string;
    missing_pct: number;
    mean_target_when_missing: number;
    mean_target_when_observed: number;
    delta_usd: number;
    welch_t_pval: string;
    mwu_pval?: string;
    mechanism: string;
    actuarial_insight: string;
  }>;
}

export interface ImputationSummaryResponse {
  imputation_decision_matrix: Array<{
    Feature?: string;
    'Missing Count'?: number;
    'Missing %'?: number;
    Mechanism?: string;
    'Candidate Methods'?: string;
    'Recommended Strategy'?: string;
    'Actuarial Justification'?: string;
    [key: string]: any;
  }>;
  imputed_dataset_profile: {
    dataset_filename: string;
    rows: number;
    total_columns: number;
    raw_feature_columns: number;
    engineered_indicator_columns: number;
    indicators: string[];
    remaining_missing_cells: number;
    target_unaltered: boolean;
    reproducibility_seed: number;
  };
  imputation_audit_summary: {
    total_imputed_cells: number;
    validation_pass_rate_pct: number;
    imputation_methods_applied: Record<string, number>;
    cells_imputed_per_feature: Record<string, number>;
    target_variable_imputed: number;
    target_sanctity_verified: boolean;
  };
}

export interface ImputationBenchmarkItem {
  column_name: string;
  method: string;
  imputation_type: string;
  mae?: number | null;
  rmse?: number | null;
  bias?: number | null;
  r2?: number | null;
  accuracy?: number | null;
  f1?: number | null;
  fit_time_seconds?: number | null;
}

export interface ImputationBenchmarkResponse {
  total_benchmarks: number;
  columns_evaluated: string[];
  benchmark_results: ImputationBenchmarkItem[];
}

export interface OutlierSummaryItem {
  Feature?: string;
  'IQR Outliers Count'?: number;
  'IQR Outliers %'?: number;
  'Z-Score Outliers Count'?: number;
  'Z-Score Outliers %'?: number;
  'Modified MAD Outliers Count'?: number;
  'Modified MAD Outliers %'?: number;
  'Actuarial Nature'?: string;
  [key: string]: any;
}

export interface OutliersResponse {
  audit_methods: string[];
  outlier_summaries: OutlierSummaryItem[];
  target_variable_outliers: {
    feature: string;
    iqr_outliers_count: number;
    iqr_outliers_pct: number;
    extreme_iqr_fences_count: number;
    zscore_outliers_count: number;
    zscore_outliers_pct: number;
    modified_mad_outliers_count: number;
    modified_mad_outliers_pct: number;
    classification: string;
    actuarial_verdict: string;
  };
}

export interface OutlierTreatmentResponse {
  treatment_strategies: Array<{
    Treatment?: string;
    'Rows Retained'?: number;
    'CV MAE ($)'?: number;
    'CV RMSE ($)'?: number;
    'CV R2'?: number;
    'Actuarial Trade-off'?: string;
    [key: string]: any;
  }>;
  selected_strategy: string;
  actuarial_justification: string;
}

export interface HistogramBin {
  bin_start: number;
  bin_end: number;
  count: number;
  percentage: number;
  label: string;
}

export interface NumericalUnivariateProfile {
  column_name: string;
  count: number;
  missing_count: number;
  missing_pct: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  std: number;
  q25: number;
  q75: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
  distribution_shape: string;
  histogram: HistogramBin[];
}

export interface CategoryFrequency {
  category: string;
  count: number;
  percentage: number;
}

export interface CategoricalUnivariateProfile {
  column_name: string;
  count: number;
  missing_count: number;
  missing_pct: number;
  cardinality: number;
  mode: string;
  frequencies: CategoryFrequency[];
}

export interface UnivariateResponse {
  numerical_profiles: Record<string, NumericalUnivariateProfile>;
  categorical_profiles: Record<string, CategoricalUnivariateProfile>;
}

export interface BivariateNumericalBin {
  bin_range: string;
  bin_min: number;
  bin_max: number;
  count: number;
  mean_premium: number;
  median_premium: number;
}

export interface BivariateCategoricalGroup {
  category: string;
  count: number;
  mean_premium: number;
  median_premium: number;
  std_premium: number;
}

export interface BivariateResponse {
  target_variable: string;
  numerical_bivariate: Record<string, BivariateNumericalBin[]>;
  categorical_bivariate: Record<string, BivariateCategoricalGroup[]>;
  key_findings: string[];
}

export interface TargetCorrelationItem {
  feature: string;
  pearson_r: number;
  pearson_pval: string;
  spearman_rho: number;
  spearman_pval: string;
  relationship: string;
}

export interface CorrelationResponse {
  correlation_methods: string[];
  features: string[];
  pearson_matrix: Record<string, Record<string, number>>;
  spearman_matrix: Record<string, Record<string, number>>;
  target_correlations: TargetCorrelationItem[];
}

export interface MultivariateInteraction {
  interaction_pair: string;
  strata_definition: string;
  cohort_mean_premium: number;
  portfolio_baseline_premium: number;
  premium_lift_usd: number;
  premium_lift_pct: number;
  sample_count: number;
  actuarial_interpretation: string;
}

export interface MultivariateResponse {
  interactions: MultivariateInteraction[];
  key_insights: string[];
}

export interface VIFItem {
  feature: string;
  vif_score: number;
  multicollinearity_status: string;
}

export interface VIFResponse {
  vif_results: VIFItem[];
  conservative_threshold: number;
  collinearity_detected: boolean;
  actuarial_interpretation: string;
}

export interface AnnualTemporalItem {
  year: number;
  policy_count: number;
  percentage: number;
  mean_premium: number;
}

export interface MonthlyTemporalItem {
  month_number: number;
  month_name: string;
  policy_count: number;
  percentage: number;
  mean_premium: number;
}

export interface DayOfWeekTemporalItem {
  day_number: number;
  day_name: string;
  policy_count: number;
  percentage: number;
}

export interface TemporalResponse {
  temporal_column: string;
  total_records: number;
  earliest_date: string;
  latest_date: string;
  annual_breakdown: AnnualTemporalItem[];
  monthly_breakdown: MonthlyTemporalItem[];
  day_of_week_breakdown: DayOfWeekTemporalItem[];
  fixed_timestamp_signature: {
    fixed_hour_minute_second: string;
    prevalence_rate_pct: number;
    sample_records_verified: number;
    population_records_verified: number;
    data_engineering_interpretation: string;
    seasonality_verdict: string;
  };
}

export interface HypothesisTestItem {
  test_category: string;
  test_name: string;
  null_hypothesis: string;
  test_statistic: string;
  p_value: string;
  p_value_adjusted?: string;
  conclusion: string;
  effect_size: string;
}

export interface HypothesisTestingResponse {
  total_tests_executed: number;
  fdr_correction_applied: boolean;
  tests: HypothesisTestItem[];
}

export interface TargetAnalysisResponse {
  target_name: string;
  sample_statistics: {
    count: number;
    min_usd: number;
    max_usd: number;
    mean_usd: number;
    median_usd: number;
    std_usd: number;
    q25_usd: number;
    q75_usd: number;
    iqr_usd: number;
    skewness: number;
    kurtosis: number;
  };
  population_statistics: {
    count: number;
    min_usd: number;
    max_usd: number;
    mean_usd: number;
    median_usd: number;
    std_usd: number;
    skewness: number;
    kurtosis: number;
  };
  histogram: HistogramBin[];
  percentiles: Record<string, number>;
  transformations: Array<{
    transformation: string;
    skewness: number;
    kurtosis: number;
    mean_cv_mae: number;
    mean_cv_rmse: number;
    out_of_fold_r2: number;
    recommendation: string;
  }>;
}

export interface FeatureDefinitionItem {
  feature_name: string;
  formula: string;
  description: string;
  rationale: string;
  cv_gain: string;
}

export interface FeatureEngineeringResponse {
  experiments: Array<{
    'Experiment Set'?: string;
    'Engineered Features Added'?: string;
    'CV MAE ($)'?: number;
    'CV RMSE ($)'?: number;
    'CV R2'?: number;
    'Relative Gain vs Baseline'?: string;
    [key: string]: any;
  }>;
  engineered_features_definitions: FeatureDefinitionItem[];
  methodology: string;
}

export interface ModelDiagnosticsResponse {
  pipelines_benchmarked: Array<{
    Pipeline?: string;
    Imputation?: string;
    Features?: string;
    'CV MAE ($)'?: number;
    'CV RMSE ($)'?: number;
    'CV R2'?: number;
    [key: string]: any;
  }>;
  best_pipeline: string;
  missing_indicator_contribution: {
    baseline_median_mae: number;
    augmented_indicators_mae: number;
    mae_reduction_usd: number;
    baseline_median_r2: number;
    augmented_indicators_r2: number;
    relative_r2_gain_pct: number;
    conclusion: string;
  };
  listwise_deletion_penalty: {
    portfolio_dropped_pct: number;
    rows_lost: number;
    rows_retained: number;
    validation_r2: number;
    r2_degradation: number;
    conclusion: string;
  };
}

export interface CoreFindingItem {
  category: string;
  title: string;
  finding: string;
  actuarial_implication: string;
  empirical_evidence: string;
}

export interface RecommendationItem {
  area: string;
  recommendation: string;
  rationale: string;
}

export interface InsightsResponse {
  executive_summary: string;
  core_findings: CoreFindingItem[];
  actionable_recommendations: RecommendationItem[];
}

export interface CoverageItem {
  dimension?: string;
  eda_activity?: string;
  status?: string;
  key_findings?: string;
  evidence_artifact?: string;
  [key: string]: any;
}

export interface CoverageResponse {
  total_dimensions: number;
  completed_dimensions: number;
  coverage_percentage: number;
  dimensions: CoverageItem[];
}

export interface FigureItem {
  filename: string;
  category: string;
  url_path: string;
  size_bytes: number;
}

export interface FigureCategory {
  category: string;
  figure_count: number;
  figures: FigureItem[];
}

export interface VisualizationsCatalogResponse {
  total_categories: number;
  total_figures: number;
  categories: FigureCategory[];
}
