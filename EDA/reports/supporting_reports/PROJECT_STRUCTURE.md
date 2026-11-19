# Insurance Project Master File Index & Architecture

**Project Root:** `Desktop/EDA_PROJECT/`  
**Dataset Population:** 1,200,000 Insurance Policyholder Records (`Desktop/EDA_PROJECT/train.csv`)  
**Analytical Sample:** 20,000 Representative Records (`Desktop/EDA_PROJECT/insurance_sample_20000.csv`, Seed 42)  
**Target Variable:** `Premium Amount` (Continuous Actuarial Regression Target)  

---

## 1. Directory Tree & Architecture Overview

```text
Desktop/EDA_PROJECT/
├── PROJECT_STRUCTURE.md                              # [This File] Master repository inventory, guide & completion checklist
│
├── output/                                           # Final Analysis Deliverables & Audit Artifacts
│   ├── missing_value_analysis_report.pdf             # Expanded Academic Submission PDF Report (Cover, Headers, Tables, 300 DPI Figures)
│   ├── missing_value_analysis_report.docx            # Expanded Editable Word Report (1.3 MB, Formatted Tables, Embedded Figures)
│   ├── missing_value_analysis_report.md              # Comprehensive GitHub-flavored Markdown Report (30+ KB)
│   ├── missing_value_analysis.ipynb                  # Reproducible 21-cell Jupyter Notebook (Executed with full outputs)
│   │
│   ├── insurance_sample_20000_imputed.csv            # Production-ready dataset (20,000 rows x 27 cols, 0 nulls)
│   ├── imputation_audit.csv                          # Granular audit trail for all 19,910 imputed values
│   ├── missing_value_decision_matrix.csv             # Per-feature actuarial decision matrix
│   ├── recommended_imputation_strategy.csv           # Recommended vs alternative methods per feature
│   │
│   ├── outlier_detection_summary.csv                 # Multi-method outlier audit (IQR, Z-Score, Modified MAD)
│   ├── outlier_treatment_comparison.csv              # Benchmark of Retaining vs Winsorization vs Trimming vs Log
│   ├── eda_coverage_matrix.csv                       # 18-point comprehensive EDA coverage audit matrix
│   ├── population_sample_validation.csv              # 1.2M population vs 20K sample empirical validation
│   ├── feature_engineering_experiments.csv           # Leakage-safe 5-fold CV evaluation of engineered features
│   ├── missing_value_summary.csv                     # Detailed missingness inventory across all 21 columns
│   ├── missingness_mechanism_analysis.csv            # MCAR/MAR/MNAR statistical hypothesis tests & AUC
│   ├── imputation_method_comparison.csv              # Reconstruction benchmark across all candidate methods
│   ├── downstream_prediction_results.csv             # Downstream model evaluation on Premium Amount
│   │
│   └── figures/                                      # High-Resolution Publication Visualizations (300 DPI)
│       ├── outliers/                                 # Outlier Boxplots, Distribution Overlays & Treatment CV
│       ├── eda/                                      # Multicollinearity VIF Bar Chart & Feature Engineering CV
│       ├── missingness/                              # 8 Missingness Topography & Co-occurrence Charts
│       └── imputation_comparison/                    # 7 Method Comparison & Downstream Impact Charts
│
├── figures/                                          # 12 General Exploratory Data Analysis (EDA) Figures
│   ├── 01_sampling_validation_distributions.png
│   ├── 02_sampling_validation_categories.png
│   ├── 03_missing_values_bar_and_matrix.png
│   ├── 04_numerical_distributions_univariate.png
│   ├── 05_categorical_distributions_univariate.png
│   ├── 06_outlier_boxplots.png
│   ├── 07_premium_distribution_and_transform.png
│   ├── 08_correlation_heatmaps.png
│   ├── 09_premium_vs_numerical_bivariate.png
│   ├── 10_premium_vs_categorical_bivariate.png
│   ├── 11_multivariate_interactions.png
│   └── 12_temporal_trends_dates.png
│
├── insurance_eda.ipynb                               # Comprehensive 45-cell End-to-End EDA Notebook
├── eda_summary.txt                                   # Detailed 492-line actuarial statistical report
├── insurance_sample_20000.csv                        # Primary representative sample (20,000 rows, Seed 42)
├── insurance_sample_20000_cleaned.csv                # Baseline preprocessed sample
│
└── [Research & Benchmarking Scripts]                 # Algorithmic experiments and feature selection
    ├── benchmark_advanced_algorithms.py              # Evaluates LightGBM, CatBoost, XGBoost
    ├── benchmark_all_techniques.py                   # Multi-technique imputation & ML benchmark
    ├── run_scientific_feature_selection.py           # Permutation importance and feature filtering
    ├── evaluate_imputation_hypotheses.py             # Actuarial hypothesis testing on missing data
    ├── imputation_pipeline.py                        # Standalone sklearn pipeline implementation
    ├── inspect_project.py                            # Data integrity verification script
    └── check_env.py                                  # Python interpreter and library auditor
```

---

## 2. Detailed Deliverables & Empirical Artifact Index

### Category A: Formal Reports & Reproducible Notebooks

| File Name | Format | Size | File Path (from Desktop/EDA_PROJECT/) | Description & Contents |
| :--- | :---: | :---: | :--- | :--- |
| **Academic Submission PDF Report** | PDF | ~900 KB | `Desktop/EDA_PROJECT/output/missing_value_analysis_report.pdf` | Formal document complete with title page, executive summary callout, running headers, footers with dynamic page numbering ("Page X of Y"), styled tables, and embedded 300 DPI visualizations. |
| **Editable Word Report** | Word DOCX | 1.3 MB | `Desktop/EDA_PROJECT/output/missing_value_analysis_report.docx` | Fully formatted report with corporate navy/steel styling, formatted tables, bullet points, and embedded high-resolution figures. |
| **Technical Markdown Report** | Markdown | 30+ KB | `Desktop/EDA_PROJECT/output/missing_value_analysis_report.md` | Complete GitHub-flavored Markdown document with LaTeX math formulations, empirical tables, and figure links. |
| **End-to-End Master Notebook** | Jupyter Notebook | 11 KB | `Desktop/EDA_PROJECT/output/missing_value_analysis.ipynb` | 21-cell reproducible Jupyter notebook executing data validation, mechanism testing, outlier audits, imputation benchmarking, feature engineering, and acceptance testing. |
| **Comprehensive EDA Master Notebook** | Jupyter Notebook | 185 KB | `Desktop/EDA_PROJECT/insurance_eda.ipynb` | 45-cell executed notebook containing full population-vs-sample validations, univariate/bivariate analysis, outlier detection, and correlation matrices. |
| **Actuarial EDA Summary** | Text | 32.8 KB | `Desktop/EDA_PROJECT/eda_summary.txt` | 492-line statistical log containing Kolmogorov-Smirnov test statistics, Chi-square p-values, tail quantiles, and outlier audit tables. |

---

### Category B: Cleaned Production Datasets & Audit Trails

| File Name | Rows $\times$ Cols | Size | File Path (from Desktop/EDA_PROJECT/) | Description & Contents |
| :--- | :---: | :---: | :--- | :--- |
| **Final Cleaned Production Dataset** | 20,000 $\times$ 27 | 3.64 MB | `Desktop/EDA_PROJECT/output/insurance_sample_20000_imputed.csv` | Complete dataset with 0 missing values across all features. Retains original 20,000 rows and IDs; preserves untouched target `Premium Amount`; includes 6 validated binary missingness indicator columns (`is_missing_*`). |
| **Granular Imputation Audit Trail** | 19,910 $\times$ 6 | 1.05 MB | `Desktop/EDA_PROJECT/output/imputation_audit.csv` | Row-by-row audit logging every imputed value with fields: `row_id`, `column_name`, `was_originally_missing`, `imputation_method`, `imputed_value`, and `passed_validation`. |
| **Actuarial Decision Matrix** | 9 $\times$ 12 | 5.6 KB | `Desktop/EDA_PROJECT/output/missing_value_decision_matrix.csv` | Formal decision per missing feature documenting candidate methods, reconstruction accuracy, distribution preservation, downstream impact, and rationale. |
| **Recommended vs Alternative Strategy** | 9 $\times$ 8 | 3.0 KB | `Desktop/EDA_PROJECT/output/recommended_imputation_strategy.csv` | Quick-reference strategy table defining primary methods, alternatives, validation scores, and missingness indicator policy. |
| **Primary Input Sample** | 20,000 $\times$ 21 | 2.51 MB | `Desktop/EDA_PROJECT/insurance_sample_20000.csv` | Exact representative sample extracted via Simple Random Sampling Without Replacement (Seed 42) from `train.csv`. Kept strictly unmodified. |
| **Baseline Cleaned Sample** | 20,000 $\times$ 27 | 3.65 MB | `Desktop/EDA_PROJECT/insurance_sample_20000_cleaned.csv` | Baseline preprocessed sample preserved for regression benchmarking comparison. |

---

### Category C: Empirical Statistical & EDA Benchmark Tables

| File Name | Format | Rows | File Path (from Desktop/EDA_PROJECT/) | Description & Contents |
| :--- | :---: | :---: | :--- | :--- |
| **Outlier Detection Summary** | CSV | 9 | `Desktop/EDA_PROJECT/output/outlier_detection_summary.csv` | Multi-method outlier audit (IQR fences, Z-score, robust Modified Z-score/MAD, domain classification, and recommended action). |
| **Outlier Treatment Comparison** | CSV | 4 | `Desktop/EDA_PROJECT/output/outlier_treatment_comparison.csv` | 5-fold cross-validation comparison of Retaining Outliers vs Winsorization vs Trimming vs Log Transformation on downstream MAE, RMSE, and $R^2$. |
| **18-Point EDA Coverage Matrix** | CSV | 18 | `Desktop/EDA_PROJECT/output/eda_coverage_matrix.csv` | 18-point comprehensive coverage matrix showing concept status, artifacts, key findings, and documented limitations. |
| **Population vs Sample Validation** | CSV | 9 | `Desktop/EDA_PROJECT/output/population_sample_validation.csv` | Population (1.2M) vs Sample (20K) comparison with KS statistics, p-values, and mean percentage error. |
| **Feature Engineering Benchmark** | CSV | 2 | `Desktop/EDA_PROJECT/output/feature_engineering_experiments.csv` | Downstream 5-fold CV evaluation comparing raw features baseline vs actuarial interaction features augmented. |
| **Missing Value Inventory** | CSV | 21 | `Desktop/EDA_PROJECT/output/missing_value_summary.csv` | Inventory of all 21 columns sorted by missingness percentage, non-missing counts, data types, cardinality, and recommended treatment. |
| **Mechanism Analysis (MCAR/MAR/MNAR)**| CSV | 9 | `Desktop/EDA_PROJECT/output/missingness_mechanism_analysis.csv` | Statistical tests for MCAR/MAR/MNAR: Welch's $t$-test p-values, Mann-Whitney $U$ p-values, Cohen's $d$, Logistic Regression AUC, and Little's MCAR omnibus result. |
| **Imputation Method Comparison** | CSV | 42 | `Desktop/EDA_PROJECT/output/imputation_method_comparison.csv` | Comprehensive benchmark table across candidate methods (Mean, Median, KNN, Iterative Bayesian Ridge, ExtraTrees, Mode, Constant, Random Forest) with MAE, RMSE, Bias, and $R^2$. |
| **Downstream Model Evaluation** | CSV | 6 | `Desktop/EDA_PROJECT/output/downstream_prediction_results.csv` | Downstream 5-fold cross-validation evaluation comparing 6 imputation pipeline architectures on predicting `Premium Amount`. |

---

### Category D: Publication-Grade Visualizations (300 DPI)

#### 1. Outlier Audits & Comparisons (`Desktop/EDA_PROJECT/output/figures/outliers/`)
- `Desktop/EDA_PROJECT/output/figures/outliers/01_outlier_detection_boxplots.png`: Multi-panel boxplots illustrating outlier spreads across all numerical attributes.
- `Desktop/EDA_PROJECT/output/figures/outliers/02_outlier_treatment_distributions.png`: Probability density overlays showing original vs 99th percentile winsorized features.
- `Desktop/EDA_PROJECT/output/figures/outliers/03_outlier_downstream_performance.png`: Downstream validation MAE across outlier treatment policies.

#### 2. Advanced EDA & Diagnostics (`Desktop/EDA_PROJECT/output/figures/eda/`)
- `Desktop/EDA_PROJECT/output/figures/eda/05_multicollinearity_vif.png`: Variance Inflation Factor (VIF) bar chart confirming zero collinearity.
- `Desktop/EDA_PROJECT/output/figures/eda/04_feature_engineering_cv_comparison.png`: Downstream $R^2$ comparison of raw vs engineered features.

#### 3. Missingness Diagnostics (`Desktop/EDA_PROJECT/output/figures/missingness/`)
- `Desktop/EDA_PROJECT/output/figures/missingness/01_missing_count_bar.png`: Raw missing count bar chart per column.
- `Desktop/EDA_PROJECT/output/figures/missingness/02_missing_pct_bar.png`: Missing percentage bar chart with 5% and 25% threshold markers.
- `Desktop/EDA_PROJECT/output/figures/missingness/03_missingness_matrix.png`: Missingno sparkline matrix demonstrating uniform missingness across row indices.
- `Desktop/EDA_PROJECT/output/figures/missingness/04_missingness_heatmap.png`: Missingno null co-occurrence correlation matrix.
- `Desktop/EDA_PROJECT/output/figures/missingness/05_missingness_pattern_freq.png`: Top 15 missingness multi-column combination frequencies.
- `Desktop/EDA_PROJECT/output/figures/missingness/06_complete_vs_incomplete_rows.png`: Donut chart showing 32.3% complete rows vs 67.7% incomplete rows.
- `Desktop/EDA_PROJECT/output/figures/missingness/07_missingness_by_groups.png`: Multi-panel grid showing missingness across Gender, Location, Policy Type, and Age tiers.
- `Desktop/EDA_PROJECT/output/figures/missingness/08_missingness_correlation.png`: Seaborn heatmap showing pairwise correlations between binary indicators ($|r| \le 0.031$).

#### 4. Imputation Benchmark & Model Diagnostics (`Desktop/EDA_PROJECT/output/figures/imputation_comparison/`)
- `Desktop/EDA_PROJECT/output/figures/imputation_comparison/01_numerical_mae_comparison.png`: Log-scale validation MAE across numerical methods.
- `Desktop/EDA_PROJECT/output/figures/imputation_comparison/02_numerical_rmse_comparison.png`: Log-scale validation RMSE across numerical methods.
- `Desktop/EDA_PROJECT/output/figures/imputation_comparison/03_categorical_accuracy_comparison.png`: Categorical reconstruction accuracy on holdouts.
- `Desktop/EDA_PROJECT/output/figures/imputation_comparison/04_categorical_f1_comparison.png`: Categorical Macro F1-score comparison.
- `Desktop/EDA_PROJECT/output/figures/imputation_comparison/05_distribution_comparison_numerical.png`: KDE distribution overlay comparing Original, Median, and Bayesian Ridge.
- `Desktop/EDA_PROJECT/output/figures/imputation_comparison/06_actual_vs_imputed_scatter.png`: Scatter plot of true holdout values vs. Bayesian Ridge imputed values.
- `Desktop/EDA_PROJECT/output/figures/imputation_comparison/07_downstream_pipeline_comparison.png`: Three-panel bar chart comparing downstream MAE, RMSE, and $R^2$ on `Premium Amount`.

#### 5. General Exploratory Data Analysis Figures (`Desktop/EDA_PROJECT/figures/`)
- `Desktop/EDA_PROJECT/figures/01_sampling_validation_distributions.png` to `Desktop/EDA_PROJECT/figures/12_temporal_trends_dates.png`: 12 publication-grade figures illustrating population sampling validation, correlation heatmaps, bivariate relationships, and temporal policy trends.

---

## 3. Final Completion Checklist

| Requirement Dimension | Audit Status | Verification Artifact Path | Verification Outcome |
| :--- | :---: | :--- | :--- |
| **1. Dataset Structure & Metadata** | **Completed** | `Desktop/EDA_PROJECT/output/missing_value_summary.csv` | Verified 20,000 rows $\times$ 21 columns. |
| **2. Missing Value Analysis** | **Completed** | `Desktop/EDA_PROJECT/output/missingness_mechanism_analysis.csv` | 19,910 nulls analyzed across 9 columns. |
| **3. Duplicate & Integrity Checks** | **Completed** | `Desktop/EDA_PROJECT/output/insurance_sample_20000_imputed.csv` | 0 duplicate rows, 0 duplicate IDs confirmed. |
| **4. Univariate Topography** | **Completed** | `Desktop/EDA_PROJECT/figures/04_numerical_distributions_univariate.png` | Distributions, moments, and frequencies profiled. |
| **5. Bivariate Relationships** | **Completed** | `Desktop/EDA_PROJECT/figures/09_premium_vs_numerical_bivariate.png` | Pearson $r$, Spearman $\rho$, ANOVA tests computed. |
| **6. Multivariate Analysis** | **Completed** | `Desktop/EDA_PROJECT/figures/11_multivariate_interactions.png` | Multi-way interaction slices evaluated. |
| **7. Outlier Detection** | **Completed** | `Desktop/EDA_PROJECT/output/outlier_detection_summary.csv` | IQR, Z-Score, and Modified MAD evaluated. |
| **8. Outlier Treatment Benchmark** | **Completed** | `Desktop/EDA_PROJECT/output/outlier_treatment_comparison.csv` | Retaining, Winsorization, Trimming, Log benchmarked. |
| **9. Target Variable Profile** | **Completed** | `Desktop/EDA_PROJECT/figures/07_premium_distribution_and_transform.png` | `Premium Amount` skewness (+1.28) and tails profiled. |
| **10. Multicollinearity Diagnostics** | **Completed** | `Desktop/EDA_PROJECT/output/figures/eda/05_multicollinearity_vif.png` | VIF scores $< 1.05$ across all predictors. |
| **11. Temporal Trend Analysis** | **Completed** | `Desktop/EDA_PROJECT/figures/12_temporal_trends_dates.png` | `Policy Start Date` analyzed; fixed timestamp confirmed. |
| **12. Categorical Imbalance** | **Completed** | `Desktop/EDA_PROJECT/figures/02_sampling_validation_categories.png` | Verified uniform class balance across all 10 categoricals. |
| **13. Population Representativeness** | **Completed** | `Desktop/EDA_PROJECT/output/population_sample_validation.csv` | KS tests confirm population fidelity (8 of 9 features $p \ge 0.16$; Health Score $p = 0.037$ with negligible 0.75% error). |
| **14. Inferential Statistical Tests** | **Completed** | `Desktop/EDA_PROJECT/output/missingness_mechanism_analysis.csv` | Little's test, Welch $t$-test, MWU with FDR correction. |
| **15. Feature Engineering CV** | **Completed** | `Desktop/EDA_PROJECT/output/feature_engineering_experiments.csv` | Leakage-safe 5-fold CV confirms +0.0039 $R^2$ lift. |
| **16. Before/After Quality Checks** | **Completed** | `Desktop/EDA_PROJECT/output/imputation_audit.csv` | 19,910 transformations logged and verified. |
| **17. Preprocessing Decision Matrix** | **Completed** | `Desktop/EDA_PROJECT/output/missing_value_decision_matrix.csv` | Per-column justification documented. |
| **18. Comprehensive Coverage Matrix** | **Completed** | `Desktop/EDA_PROJECT/output/eda_coverage_matrix.csv` | 100% of audit dimensions addressed. |
