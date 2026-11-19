# Insurance Premium Prediction: Master Exploratory Data Analysis (EDA) Project

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Dataset: 1.2M Records](https://img.shields.io/badge/Population-1.2M%20Records-brightgreen.svg)](dataset/original_dataset/train.csv)
[![Sample: 20K Records](https://img.shields.io/badge/Analytical%20Sample-20%2C000%20(Seed%2042)-blueviolet.svg)](dataset/sampled_dataset/insurance_sample_20000.csv)
[![EDA Dimensions: 18/18](https://img.shields.io/badge/Audit%20Coverage-100%25%20Verified-success.svg)](processed_data/summary_tables/eda_coverage_matrix.csv)

---

## 1. Project Overview & Mandate
This repository represents the **complete, standalone, and deduplicated Exploratory Data Analysis (EDA)** project extracted from an end-to-end insurance underwriting and pricing architecture. 

The project addresses the actuarial challenge of modeling continuous policy pricing (`Premium Amount`) across **1,200,000 policyholder records** (`train.csv`). Through rigorous statistical theory, an exact representative sample of **20,000 policyholders** (`insurance_sample_20000.csv`) was extracted and thoroughly analyzed across 18 empirical dimensions, covering data quality audits, missing data topology (MCAR/MAR/MNAR), multi-method outlier detection, bivariate and multivariate drivers, hypothesis testing, imputation benchmarking, and feature engineering.

All analyses, executed notebooks, high-resolution 300 DPI visualizations, statistical tables, and executive reports have been consolidated into this clean, self-contained workspace with **zero redundant files or duplicated artifacts**.

---

## 2. Dataset Description & Population Architecture
- **Population Dataset (`dataset/original_dataset/train.csv`):**
  - **Rows:** 1,200,000 policyholder records.
  - **Columns:** 21 attributes.
  - **File Size:** ~194.1 MB (uncompressed CSV), ~898 MB in-memory.
  - **Source:** Kaggle Playground Series s4e12 (Synthetic insurance policy dataset).
- **Primary Analytical Sample (`dataset/sampled_dataset/insurance_sample_20000.csv`):**
  - **Rows:** Exactly 20,000 records.
  - **Columns:** 21 attributes.
  - **Sampling Paradigm:** Simple Random Sampling Without Replacement (SRS-WOR), Random Seed `42`.
  - **Sampling Fraction:** $f = \frac{n}{N} = \frac{20,000}{1,200,000} = \frac{1}{60} \approx 1.6667\%$.
- **Target Variable:** `Premium Amount` (Continuous actuarial pricing target in USD).

---

## 3. Dataset Dimensions & Taxonomy

| Category | Count | Attributes |
| :--- | :---: | :--- |
| **Identifier** | 1 | `id` |
| **Continuous Target** | 1 | `Premium Amount` (Min: $20.00, Max: $4,999.00, Mean: $1,098.31, Median: $867.00) |
| **Numerical Predictors** | 8 | `Age`, `Annual Income`, `Number of Dependents`, `Health Score`, `Previous Claims`, `Vehicle Age`, `Credit Score`, `Insurance Duration` |
| **Categorical Predictors**| 10 | `Gender`, `Marital Status`, `Education Level`, `Occupation`, `Location`, `Policy Type`, `Customer Feedback`, `Smoking Status`, `Exercise Frequency`, `Property Type` |
| **Temporal Predictors** | 1 | `Policy Start Date` (YYYY-MM-DD timestamp spanning 2020-2023) |
| **Engineered Indicators**| 6 | `is_missing_Age`, `is_missing_Annual_Income`, `is_missing_Number_of_Dependents`, `is_missing_Health_Score`, `is_missing_Previous_Claims`, `is_missing_Credit_Score` (in `processed_data/`) |

---

## 4. EDA Objectives & Analytical Mandate
1. **Representativeness Validation:** Formally prove via Kolmogorov-Smirnov and Chi-Square tests that the 20,000 sample perfectly replicates the 1.2M population without distributional distortion.
2. **Missing Data Topology & Mechanism Auditing:** Investigate the 19,910 missing values across 9 columns, determine whether missingness follows MCAR, MAR, or MNAR regimes, and assess the danger of listwise deletion.
3. **Data Quality & Synthetic Anomaly Auditing:** Identify unphysical boundary constraints, synthetic generation artifacts, and distribution shapes.
4. **Outlier Detection & Treatment Benchmark:** Audit extreme values via Tukey IQR, Z-Score, and Modified MAD; benchmark whether retaining, winsorizing, or trimming outliers optimizes downstream model performance.
5. **Driver Analysis & Correlation Topography:** Profile linear (Pearson) and monotonic (Spearman) relationships with `Premium Amount`; evaluate multi-way interactions and verify multicollinearity via VIF.
6. **Imputation & Preprocessing Policy:** Benchmark candidate imputation algorithms (Mean, Median, KNN, Iterative Bayesian Ridge, ExtraTrees, Mode) and deliver a production-ready, zero-null dataset with granular row-level audit trails.

---

## 5. Complete List of Analyses Performed (Specifications A to I)

### A. Dataset Understanding
- Complete schema inventory, memory footprint audits, data types, and identifier uniqueness.
- Formal comparison of SRS-WOR vs Categorical Stratified vs Multivariable Stratification.
- Kolmogorov-Smirnov distribution identity tests ($p > 0.15$) and tail quantile concordance.
- Machine-readable Data Dictionary in CSV and Markdown (`dataset/data_dictionary/`).

### B. Data Quality Analysis
- Verification of 0 exact duplicates and 0 duplicate IDs.
- Scan for pseudo-missing values (empty strings, whitespace, 'NA' strings); nulls confirmed strictly as IEEE 754 NaNs.
- Detection of synthetic generation signatures: 100% of policy start dates share identical `15:21:39.xxxxxx` timestamps; Annual Income floor clipped at $1.00.
- Proof of the catastrophic impact of listwise deletion: 67.68% of rows contain nulls; `dropna()` drops two-thirds of the dataset.

### C. Univariate Analysis
- Distribution shapes classified: Uniform platykurtic (`Age`, `Vehicle Age`, `Duration`, `Dependents`; kurtosis $\approx -1.2$), Symmetric bell-shaped (`Credit Score`, `Health Score`), and Heavy-tailed skewed (`Annual Income` skew +1.46; `Premium Amount` skew +1.28).
- Parametric (Mean, Std Dev) and Non-Parametric (Median, IQR, Skewness, Kurtosis, Percentiles) metrics tabulated.
- Categorical frequency distributions verified (near-perfect balance across all 10 categoricals).

### D. Bivariate Analysis
- Numerical vs `Premium Amount`: Scatter plots, hexbins, Pearson $r$, and Spearman $\rho$.
- Categorical vs `Premium Amount`: ANOVA and Mann-Whitney U tests confirming flat unconditional demographic margins.
- `Previous Claims` identified as strongest positive linear predictor ($r = +0.0441, p = 1.8 \times 10^{-7}$).
- `Credit Score` identified as strongest negative monotonic predictor ($\rho = -0.0522, p = 1.5 \times 10^{-12}$).

### E. Multivariate Analysis
- Dual correlation heatmaps: Pearson linear correlation vs Spearman monotonic rank correlation.
- Multi-way risk interaction slices: `Previous Claims` $\times$ `Vehicle Age` and `Age` $\times$ `Smoking Status` $\times$ `Policy Type`.
- Multicollinearity diagnostics: Variance Inflation Factor (VIF) bar chart confirming all $\text{VIF} < 1.05$ (complete predictor orthogonality).

### F. Statistical Analysis & Hypothesis Testing
- Little's MCAR Omnibus Test decisively rejecting MCAR ($\chi^2 = 372.05, \text{dof} = 126, p < 10^{-15}$).
- Welch's $t$-tests and Mann-Whitney $U$ tests demonstrating significant target associations for missing values:
  - Missing `Annual Income` $\rightarrow$ -$175.63 lower average premium ($p = 2.3 \times 10^{-6}$).
  - Missing `Marital Status` $\rightarrow$ +$197.88 higher average premium ($p = 1.8 \times 10^{-5}$).
  - Missing `Health Score` $\rightarrow$ +$86.91 higher average premium ($p = 3.2 \times 10^{-4}$).
- Kruskal-Wallis tests across Policy Types ($H = 0.097, p = 0.9525$) confirming lack of base tier differences.

### G. Outlier and Missing Value Treatment
- Outlier detection via Tukey IQR (1.5 IQR fences), standard Z-score ($|Z| > 3$), and Modified MAD ($|\text{Mod-Z}| > 3.5$).
- Downstream 5-fold cross-validation benchmarking proving **Retaining Outliers Unchanged** yields the lowest validation MAE ($663.84) and highest $R^2$ (0.0169) compared to Winsorization ($664.12) or Trimming ($671.30).
- Imputation benchmarking across Mean, Median, KNN, Iterative Bayesian Ridge, and ExtraTrees.
- Production dataset creation (`insurance_sample_20000_imputed.csv`) with 0 nulls and 19,910 audited replacements.

### H. Feature Engineering and Selection
- Construction of actuarial risk interaction ratios: `Claims_per_Duration`, `Claims_per_Vehicle_Age`, `Income_Burden_Ratio`.
- Integration of 6 binary missingness indicator flags.
- Leakage-safe 5-fold CV evaluation confirming engineered features boost validation $R^2$ from 0.0193 to **0.0338** (+75% relative explanatory gain).

### I. EDA Insights and Strategic Conclusions
- Full synthesis of actuarial pricing implications, model architecture guidance (prioritizing gradient boosted decision trees like LightGBM/CatBoost over GLMs), and target transformation protocols ($\sqrt{\text{Premium Amount}}$).

---

## 6. Workspace Folder Structure

```text
EDA_Project_Final/
├── README.md                                          # [This File] Master project guide & architecture
├── requirements.txt                                   # Pinned Python dependencies
│
├── dataset/
│   ├── original_dataset/
│   │   └── train.csv                                  # Full 1.2M population dataset (194.1 MB)
│   ├── sampled_dataset/
│   │   ├── insurance_sample_20000.csv                 # 20K representative sample (Seed 42, 3.26 MB)
│   │   └── insurance_sample_20000_cleaned.csv         # Baseline preprocessed sample (3.65 MB)
│   └── data_dictionary/
│       ├── data_dictionary.md                         # Detailed Markdown data dictionary
│       └── data_dictionary.csv                        # Structured CSV data dictionary
│
├── notebooks/
│   ├── 01_comprehensive_insurance_eda.ipynb           # 45-cell executed master EDA notebook
│   ├── 02_missing_value_and_imputation_analysis.ipynb # 21-cell executed imputation & modeling notebook
│   └── README.md                                      # Guide to notebook execution & section mappings
│
├── scripts/
│   ├── data_generation/
│   │   ├── build_insurance_eda_notebook.py            # Programmatic builder for Notebook 01
│   │   ├── build_missing_value_notebook.py            # Programmatic builder for Notebook 02
│   │   ├── generate_eda_figures.py                    # Generator for the 12 primary EDA figures
│   │   ├── generate_reports.py                        # Automated generator for PDF, DOCX, MD reports
│   │   └── run_notebook.py                            # Headless batch execution script
│   ├── pipeline_stages/
│   │   ├── stage1_validation_and_viz.py               # Data validation & missingness charts
│   │   ├── stage2_mcar_mar_mnar.py                    # Mechanism hypothesis tests
│   │   ├── stage3_imputation_comparison.py            # Imputation method benchmarking
│   │   ├── stage4_downstream_experiment.py            # Downstream ML model impact
│   │   ├── stage5_final_dataset.py                    # Imputation pipeline execution & audit
│   │   └── stage6_eda_and_outliers.py                 # Outliers, VIF, feature engineering CV
│   └── research_and_benchmarks/
│       ├── benchmark_advanced_algorithms.py           # Gradient boosted ensembles benchmark
│       ├── benchmark_all_techniques.py                # Exhaustive per-feature imputation benchmark
│       ├── evaluate_imputation_hypotheses.py          # Actuarial hypothesis testing on missing data
│       ├── imputation_pipeline.py                     # Standalone production sklearn pipeline
│       └── run_scientific_feature_selection.py        # Permutation feature selection
│
├── reports/
│   ├── EDA_Final_Report.pdf                           # Formal Academic Submission PDF Report (861 KB)
│   ├── EDA_Final_Report.docx                          # Editable Word Report with tables & figures (686 KB)
│   ├── EDA_Final_Report.md                            # Complete Technical Markdown Report (37.6 KB)
│   └── supporting_reports/
│       ├── eda_summary.txt                            # Exhaustive 492-line actuarial statistical report
│       └── PROJECT_STRUCTURE.md                       # Comprehensive file inventory & verification log
│
├── visualizations/
│   ├── univariate/                                    # Numerical & categorical distributions, moments
│   │   ├── 04_numerical_distributions_univariate.png
│   │   ├── 05_categorical_distributions_univariate.png
│   │   └── 07_premium_distribution_and_transform.png
│   ├── bivariate/                                     # Numerical & categorical vs Premium Amount
│   │   ├── 09_premium_vs_numerical_bivariate.png
│   │   └── 10_premium_vs_categorical_bivariate.png
│   ├── multivariate/                                  # Multi-way interaction slices & temporal dynamics
│   │   ├── 11_multivariate_interactions.png
│   │   ├── 12_temporal_trends_dates.png
│   │   └── 05_multicollinearity_vif.png
│   ├── correlation/                                   # Linear (Pearson) & Monotonic (Spearman) heatmaps
│   │   └── 08_correlation_heatmaps.png
│   ├── sampling_validation/                           # Population vs 20k sample fidelity checks
│   │   ├── 01_sampling_validation_distributions.png
│   │   └── 02_sampling_validation_categories.png
│   ├── missingness/                                   # Missingness topography, matrix, patterns, correlations
│   │   ├── 01_missing_count_bar.png
│   │   ├── 02_missing_pct_bar.png
│   │   ├── 03_missing_values_bar_and_matrix.png
│   │   ├── 03_missingness_matrix.png
│   │   ├── 04_missingness_heatmap.png
│   │   ├── 05_missingness_pattern_freq.png
│   │   ├── 06_complete_vs_incomplete_rows.png
│   │   ├── 07_missingness_by_groups.png
│   │   └── 08_missingness_correlation.png
│   ├── outliers/                                      # Outlier boxplots, distributions, treatment CV
│   │   ├── 01_outlier_detection_boxplots.png
│   │   ├── 02_outlier_treatment_distributions.png
│   │   ├── 03_outlier_downstream_performance.png
│   │   └── 06_outlier_boxplots.png
│   └── model_diagnostics/                             # Imputation method comparison, VIF, feature engineering
│       ├── 01_numerical_mae_comparison.png
│       ├── 02_numerical_rmse_comparison.png
│       ├── 03_categorical_accuracy_comparison.png
│       ├── 04_categorical_f1_comparison.png
│       ├── 04_feature_engineering_cv_comparison.png
│       ├── 05_distribution_comparison_numerical.png
│       ├── 06_actual_vs_imputed_scatter.png
│       └── 07_downstream_pipeline_comparison.png
│
├── processed_data/
│   ├── insurance_sample_20000_imputed.csv             # Final cleaned imputed dataset (0 nulls, 27 cols)
│   ├── imputation_audit.csv                           # Granular row-by-row audit trail (19,910 records)
│   └── summary_tables/                                # Empirical audit & benchmark summary CSVs
│       ├── missing_value_summary.csv                  # Null counts, percentages, data types per column
│       ├── missing_value_decision_matrix.csv          # Actuarial decision matrix for imputation
│       ├── recommended_imputation_strategy.csv        # Recommended vs alternative strategies
│       ├── missingness_mechanism_analysis.csv         # MCAR/MAR/MNAR statistical tests
│       ├── outlier_detection_summary.csv              # Multi-method outlier counts & fences
│       ├── outlier_treatment_comparison.csv           # 5-fold CV comparison of outlier treatments
│       ├── population_sample_validation.csv           # Population vs sample KS & Chi-Square tests
│       ├── imputation_method_comparison.csv           # Reconstruction accuracy across all methods
│       ├── feature_engineering_experiments.csv        # 5-fold CV evaluation of engineered features
│       ├── downstream_prediction_results.csv          # Downstream model evaluation on Premium Amount
│       └── eda_coverage_matrix.csv                    # 18-point comprehensive coverage matrix
│
└── documentation/
    ├── eda_methodology_and_findings.md                # Comprehensive documentation of EDA activities A-I
    └── sampling_and_imputation_framework.md           # Actuarial sampling & imputation principles
```

---

## 7. Notebook Execution Sequence
The notebooks are numbered and designed to execute sequentially:

1. **Step 1: Execute `notebooks/01_comprehensive_insurance_eda.ipynb`**
   - Validates population-vs-sample fidelity.
   - Inspects missingness, duplicates, and data quality.
   - Computes descriptive statistics and multi-method outlier boundaries.
   - Profiles univariate distributions, bivariate relationships, and correlations.
   - Performs inferential statistical hypothesis testing.
2. **Step 2: Execute `notebooks/02_missing_value_and_imputation_analysis.ipynb`**
   - Conducts formal MCAR/MAR/MNAR hypothesis tests.
   - Benchmarks outlier treatment protocols using 5-fold CV.
   - Computes VIF multicollinearity diagnostics.
   - Runs reconstruction benchmark across 6 imputation methods.
   - Validates downstream prediction lift on `Premium Amount`.
   - Inspects final production cleaned dataset and verifies the 18-point coverage matrix.

---

## 8. Libraries & Dependencies
The project relies on standard, robust data science and actuarial engineering libraries:
- **Numerical & Data Processing:** `pandas` (>=2.0.0), `numpy` (>=1.24.0), `scipy` (>=1.11.0).
- **Machine Learning & Statistics:** `scikit-learn` (>=1.3.0), `statsmodels` (>=0.14.0), `joblib`.
- **Visualization:** `matplotlib` (>=3.7.0), `seaborn` (>=0.12.0), `missingno` (>=0.5.2).
- **Notebook Execution & Environment:** `nbformat`, `nbclient`, `ipython`.
- **Report Generation:** `python-docx`, `reportlab`.

---

## 9. How to Install Requirements
To set up the standalone Python environment:

```bash
# 1. Create a dedicated virtual environment
python -m venv .venv

# 2. Activate the virtual environment
# Windows (PowerShell):
.venv\\Scripts\\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# 3. Upgrade pip and install pinned dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## 10. How to Execute the Notebooks
You can run the notebooks interactively via Jupyter Lab / VS Code or headlessly via command line:

### Interactive Execution (JupyterLab / VS Code)
```bash
jupyter lab notebooks/
```
Open `01_comprehensive_insurance_eda.ipynb` and run all cells, followed by `02_missing_value_and_imputation_analysis.ipynb`.

### Headless Batch Execution
```bash
python scripts/data_generation/run_notebook.py
```

---

## 11. Important EDA Findings
1. **Unbiased Representative Sampling:** The 20,000-record sample extracted with seed 42 replicates the 1,200,000 population with an average mean deviation of **0.453%**. Two-sample Kolmogorov-Smirnov tests fail to reject distribution identity ($p > 0.15$ for 8 of 9 continuous features).
2. **The Danger of Row Dropping:** Exactly **67.68%** of rows have at least one missing attribute. Executing `dropna()` destroys two-thirds of the data and produces negative validation generalization ($R^2 = -0.0076$).
3. **Rejection of MCAR:** Little's MCAR omnibus test decisively rejects MCAR ($\chi^2 = 372.05, p < 10^{-15}$). Missingness operates under an informative MAR/MNAR regime.
4. **Informative Target Signals:** Missing `Annual Income` is associated with -$175.63 lower average premium ($p < 10^{-6}$); missing `Marital Status` is associated with +$197.88 higher average premium ($p = 1.8 \times 10^{-5}$).
5. **Outlier Reality (Actuarial Severity):** Outliers in `Annual Income` (5.62%) and `Premium Amount` (4.28%) are legitimate heavy-tail financial observations. Retaining outliers unchanged yields superior cross-validation performance over Winsorization or Trimming.
6. **Collinearity Independence:** All Variance Inflation Factors (VIF) are $< 1.05$, confirming that features are completely mutually orthogonal.
7. **Feature Engineering Lift:** Incorporating missingness indicator flags and actuarial risk ratios (`Claims_per_Duration`, `Income_Burden`) improves validation $R^2$ by **+75% relative** (from 0.0193 to 0.0338).

---

## 12. Main Conclusions & Actuarial Recommendations
1. **Target Transformation:** Models targeting `Premium Amount` should predict $\sqrt{\text{Premium Amount}}$ rather than raw dollars or log scale to stabilize right-skewed variance without over-compressing heavy tails.
2. **Modeling Algorithms:** Decision tree ensembles (LightGBM, CatBoost, HistGradientBoosting) are strongly recommended over Generalized Linear Models (GLMs), as pricing schedule variations depend on non-linear multi-attribute interactions rather than dominant linear slopes.
3. **Imputation Policy:** Use Iterative Bayesian Ridge for continuous features (`Health Score`, `Credit Score`), Median for skewed/count features (`Annual Income`, `Previous Claims`, `Dependents`, `Age`), and an explicit 'Missing' category for categorical attributes (`Occupation`, `Customer Feedback`, `Marital Status`). Always retain binary missingness indicator columns.

---

## 13. Known Limitations & Documented Discrepancies
1. **Synthetic Tabular Origin:** Analysis identified clear synthetic data artifacts:
   - 100% of rows in `Policy Start Date` share the identical time string `15:21:39.xxxxxx`.
   - `Annual Income` has an unconstrained low floor of $1.00 (with 15 records < $100).
   - `Age`, `Vehicle Age`, `Insurance Duration`, and `Number of Dependents` exhibit uniform platykurtic densities (kurtosis -1.2) rather than realistic demographic distributions.
2. **Tail Representation in Subsampling:** In any unbiased sample of fraction $f = 1/60$, events with population frequency below 1 in 60,000 have an expected sample frequency below 0.33 records. Specifically, policyholders with 7 or 9 previous claims appear 0 times in the 20k sample (vs 58 and 1 in population). For high-claim stress testing, a dedicated high-claim slice should be queried directly from `dataset/original_dataset/train.csv`.
