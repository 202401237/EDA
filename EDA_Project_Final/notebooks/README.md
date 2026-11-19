# Exploratory Data Analysis (EDA) Master Notebooks Guide

This directory contains the two comprehensive, reproducible Jupyter Notebooks embodying the entire analytical pipeline of the Insurance Premium Prediction project. Both notebooks are fully executed with rich inline visual outputs, tabular audits, and narrative actuarial markdown.

---

## 1. Notebook Index & Execution Order

### `01_comprehensive_insurance_eda.ipynb` (Part 1: Primary Exploratory Data Analysis)
- **Cell Count:** 45 executed cells (20 Markdown explanations, 25 executed code cells with full outputs).
- **Primary Data Sources:** `../dataset/original_dataset/train.csv` (1.2M population) and `../dataset/sampled_dataset/insurance_sample_20000.csv` (20k sample).
- **Core Coverage:**
  1. **Part 1: Representative Sampling Strategy & Validation:**
     - Mathematical formulation of sampling fraction ($f = 1/60 \approx 1.6667\%$).
     - Quantitative benchmark of candidate sampling paradigms: SRS-WOR vs Categorical Stratified vs Multivariable Stratified.
     - Kolmogorov-Smirnov (KS) two-sample distribution tests across continuous features.
     - Chi-square ($\chi^2$) goodness-of-fit tests across all 10 categorical attributes.
     - Tail concordance audits (p01, p05, p50, p95, p99, p99.9 quantiles).
  2. **Part 2: Comprehensive Exploratory Data Analysis (Sections A to M):**
     - Section A: Dataset Overview, Architecture & Data Dictionary.
     - Section B: Missing-Value Taxonomy, Patterns & Threat of Listwise Deletion (demonstrating that `dropna()` destroys 67.7% of data).
     - Section C: Duplicate Analysis across Identifiers & Analytical Features (0 exact duplicates, 0 duplicate IDs).
     - Section D: Data Quality, Range Validity & Synthetic Generation Signatures (fixed 15:21:39 timestamp and $1.00 income floor).
     - Section E: Descriptive Statistics (Parametric Mean/Std and Non-Parametric Median/IQR/Skew/Kurtosis).
     - Section F: Multi-Method Outlier Detection (Tukey IQR, Z-Score, Modified MAD, Domain Plausibility).
     - Section G: Univariate Topographies & Distribution Profiling.
     - Section H: Bivariate Interactions & Target Stratification (`Premium Amount` across categories).
     - Section I: Linear (Pearson) and Monotonic (Spearman) Correlation Structures.
     - Section J: Distributional Symmetry & Power Transformations (Square Root vs Log1p).
     - Section K: Date & Temporal Longitudinal Analysis (`Policy Start Date` monthly trends).
     - Section L: Multivariate Interaction Modeling (High vehicle age + previous claims risk amplification).
     - Section M: Inferential Statistical Hypothesis Testing (ANOVA, Kruskal-Wallis, Mann-Whitney U, Welch t-tests with Benjamini-Hochberg FDR correction).
  3. **Part 3: Executive Summary, Key Findings & Strategic Recommendations:**
     - Synthesis of actuarial pricing drivers, data quality anomalies, and modeling protocols.

---

### `02_missing_value_and_imputation_analysis.ipynb` (Part 2: Missingness, Imputation & Feature Engineering Benchmark)
- **Cell Count:** 21 executed cells (11 Markdown sections, 10 executed code cells with outputs).
- **Primary Data Source:** `../dataset/sampled_dataset/insurance_sample_20000.csv`.
- **Core Coverage:**
  1. **Section 1:** Project Setup, Environment & Ingestion Verification.
  2. **Section 2:** Population (1.2M) vs Sample (20,000) Representativeness Validation.
  3. **Section 3:** Missing Value Prevalence, Topology & Statistical Mechanism Testing (Little's MCAR test rejection $\chi^2 = 372.05, p < 10^{-15}$; Welch t-tests confirming informative MAR/MNAR missingness).
  4. **Section 4:** Multi-Method Outlier Audit (IQR, Z-Score, Modified MAD across 9 numerical features).
  5. **Section 5:** Outlier Treatment Comparison (5-Fold Cross-Validation of Retaining vs Winsorization vs Trimming vs Log Transformation on downstream MAE/RMSE/R2).
  6. **Section 6:** Multicollinearity Diagnostics & Variance Inflation Factor (VIF bar chart confirming all VIF < 1.05).
  7. **Section 7:** Imputation Benchmark (Holdout reconstruction accuracy across Mean, Median, KNN, Iterative Bayesian Ridge, ExtraTrees, Mode, and MissForest).
  8. **Section 8:** Actuarial Feature Engineering & Downstream Model Performance (5-Fold CV evaluation of interaction terms and missingness indicators).
  9. **Section 9:** Final Preprocessing Decisions, Acceptance Audits & Cleaned Dataset Verification (`insurance_sample_20000_imputed.csv`).
  10. **Section 10:** 18-Point Comprehensive EDA Coverage Audit Matrix.

---

## 2. Activity Coverage Mapping to Master Specifications

| Activity Dimension | Primary Notebook | Section / Cells | Key Finding / Artifact |
| :--- | :--- | :--- | :--- |
| **A. Dataset Understanding** | `01_comprehensive_insurance_eda.ipynb` | Part 1, Part 2 Sec A | 20k rows x 21 cols; 1 identifier, 9 numerical, 10 categorical, 1 date |
| **B. Data Quality Analysis** | `01_comprehensive_insurance_eda.ipynb` | Part 2 Sec B, C, D | 0 duplicates; 67.7% rows missing; synthetic 15:21:39 timestamp |
| **C. Univariate Analysis** | `01_comprehensive_insurance_eda.ipynb` | Part 2 Sec E, G | Numerical histograms, KDE, skewness, kurtosis; categorical bar charts |
| **D. Bivariate Analysis** | `01_comprehensive_insurance_eda.ipynb` | Part 2 Sec H, I | Scatter, hexbin, boxplots vs Premium; Pearson & Spearman correlations |
| **E. Multivariate Analysis** | `01_comprehensive_insurance_eda.ipynb` & `02_missing_value...` | Part 2 Sec I, L & Sec 6 | Heatmaps, multi-way interaction slices; VIF < 1.05 confirming zero collinearity |
| **F. Statistical Analysis** | `01_comprehensive_insurance_eda.ipynb` & `02_missing_value...` | Part 2 Sec M & Sec 3 | Little's MCAR test, Welch t-test, Mann-Whitney U, ANOVA, KS tests |
| **G. Outlier & Missing Treatment** | `02_missing_value...` & `01_comprehensive...` | Sec 4, 5, 7, 9 & Part 2 Sec F | Retaining outliers is optimal (lowest MAE); Bayesian Ridge + Mode + Indicators |
| **H. Feature Engineering** | `02_missing_value...` | Sec 8 | Claims-per-Duration and missingness indicator flags yield +75% relative R2 lift |
| **I. EDA Insights & Recommendations** | `01_comprehensive_insurance_eda.ipynb` & `02_missing_value...` | Part 3 & Sec 9-10 | Square-root target transform recommended; tree ensembles preferred over GLMs |
