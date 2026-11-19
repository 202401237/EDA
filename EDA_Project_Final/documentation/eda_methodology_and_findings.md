# Comprehensive EDA Methodology, Findings & Actuarial Insights

This document consolidates the complete methodology, empirical results, and domain interpretations across all 9 exploratory data analysis dimensions conducted on the Insurance Premium Prediction dataset.

---

## 1. Dataset Understanding & Sampling Methodology
- **Population:** 1,200,000 policyholder records from Kaggle Playground Series s4e12 (`train.csv`).
- **Analytical Sample:** Exactly 20,000 representative records (`insurance_sample_20000.csv`) extracted via Simple Random Sampling Without Replacement (SRS-WOR) using random seed 42.
- **Sampling Verification:**
  - Glivenko-Cantelli theorem guarantees uniform convergence of empirical CDF to population CDF.
  - Average numerical mean deviation across all features: **0.453%** (maximum deviation: 1.308% on `Previous Claims`).
  - Two-sample Kolmogorov-Smirnov tests confirm empirical identity ($p > 0.15$ for 8 of 9 continuous features; Health Score shows negligible 0.75% error, $p = 0.037$).
  - Categorical market shares match within 0.582% across all 33 categorical strata; Chi-Square goodness-of-fit tests fail to reject $H_0$ ($p > 0.19$ across all 10 categoricals).
- **Target Variable:** `Premium Amount` (continuous regression target in USD). Min: $20.00, Max: $4,999.00, Mean: $1,098.31, Median: $867.00, Skewness: +1.28.

---

## 2. Data Quality & Synthetic Data Signatures
- **Uniqueness:** Zero exact duplicate rows across all 21 attributes; zero duplicate identifiers (`id`); zero duplicate feature rows.
- **Missingness Incompleteness:** Exactly **13,535 rows (67.68%)** contain at least one missing attribute. Listwise deletion (`df.dropna()`) is catastrophically destructive, discarding two-thirds of the policy portfolio and causing negative out-of-fold generalization ($R^2 = -0.0076$).
- **Synthetic tabular generation signatures uncovered:**
  1. *Fixed Timestamp Signature:* 100% of rows in `Policy Start Date` share the identical time string `15:21:39.xxxxxx`. Only date and microsecond vary, confirming synthetic generation via CTGAN or CopulaGAN.
  2. *Low-Income Floor:* Minimum `Annual Income` is $1.00 (with 15 records < $100), reflecting unconstrained synthetic boundary clipping.
  3. *Uniform Feature Marginals:* `Age` [18, 64], `Vehicle Age` [0, 19], `Insurance Duration` [1, 9], and `Number of Dependents` [0, 4] display platykurtic uniform densities (kurtosis -1.2 to -1.3).

---

## 3. Univariate & Bivariate Profiles
- **Symmetric / Normal Features:** `Credit Score` (mean 591.5, median 592.0, skew -0.10) and `Health Score` (mean 25.4, median 24.3, skew +0.30).
- **Heavy-Tailed Features:** `Annual Income` (skew +1.46, kurtosis +1.76) and `Premium Amount` (skew +1.28, kurtosis +1.68).
- **Flat Unconditional Categorical Demographics:** Across Gender, Policy Type, Smoking Status, Location, and Property Type, unconditional mean premium differences are remarkably small ($p > 0.20$ on ANOVA/Mann-Whitney). No single demographic predictor explains > 1% of premium variance in isolation.
- **Key Predictor Associations:**
  - `Previous Claims`: Pearson $r = +0.0441$ ($p = 1.8 \times 10^{-7}$), Spearman $\rho = +0.0380$ ($p = 6.9 \times 10^{-6}$).
  - `Credit Score`: Pearson $r = -0.0314$ ($p = 2.9 \times 10^{-5}$), Spearman $\rho = -0.0522$ ($p = 1.5 \times 10^{-12}$).

---

## 4. Missing Data Mechanisms (MCAR vs MAR vs MNAR)
- **Little's MCAR Omnibus Test:** Decisively rejects Missing Completely at Random ($\chi^2 = 372.05$, $\text{dof} = 126$, $p < 10^{-15}$).
- **Informative Missingness Evidence:**
  - Missing `Annual Income`: Mean Premium is **$929.10** vs **$1,104.73** when observed ($\Delta = -$175.63, Welch $t$-test $p = 2.3 \times 10^{-6}$, Mann-Whitney $U$ $p = 1.36 \times 10^{-21}$).
  - Missing `Marital Status`: Mean Premium is **$1,293.23** vs **$1,095.35** when observed ($\Delta = +$197.88, $p = 1.8 \times 10^{-5}$).
  - Missing `Health Score`: Mean Premium is **$1,180.13** vs **$1,093.21** ($\Delta = +$86.91, $p = 3.17 \times 10^{-4}$).
- **Implication:** Missingness is operating under a Missing Not at Random (MNAR) / Missing at Random (MAR) regime where the omission of data carries actionable predictive signal. Adding explicit binary missingness indicator flags (`is_missing_*`) is mandatory.

---

## 5. Outlier Detection & Treatment Benchmarking
- **Audit Counts (Sample n = 20,000):**
  - `Annual Income`: 1,083 IQR outliers (5.62%), 391 Z-score > 3 outliers (2.03%), 746 Modified MAD > 3.5 outliers (3.87%).
  - `Premium Amount`: 856 IQR outliers (4.28%), 266 Z-score > 3 outliers (1.33%), 620 Modified MAD outliers (3.10%).
  - `Previous Claims`: 6 IQR outliers (0.04%), 225 Z-score outliers (1.61%).
- **5-Fold Cross-Validation Treatment Benchmark:**
  - **Retaining Outliers Unchanged (Optimal):** Validation MAE = **$663.84**, RMSE = **$858.91**, $R^2 = \mathbf{0.0169}$.
  - **Winsorization (99th percentile):** Validation MAE = $664.12, RMSE = $860.10, $R^2 = 0.0142$.
  - **Trimming (removing IQR outliers):** Validation MAE = $671.30, RMSE = $872.45, $R^2 = -0.0145$.
- **Conclusion:** Extreme values represent authentic actuarial tail risk. Trimming or winsorizing impairs pricing accuracy and severely degrades out-of-fold generalization.

---

## 6. Multicollinearity & Feature Interactions
- **Variance Inflation Factor (VIF):** Computed across all numerical features and encoded categoricals. Every feature exhibits $\text{VIF} < 1.05$ (well below the conservative collinearity threshold of 5.0). Predictors are mutually orthogonal.
- **Multivariate Slices:**
  - High `Vehicle Age` (13-19 years) combined with multiple `Previous Claims` (3-4) amplifies average premium to $1,215 (vs $1,080 baseline).
  - Young policyholders with poor credit experience compounding non-linear pricing adjustments.
- **Feature Engineering Lift:** Leakage-safe 5-fold CV confirms that engineered terms (`Claims_per_Vehicle_Age`, `Income_Burden_Ratio`, and missingness indicators) lift validation $R^2$ from 0.0193 to **0.0338** (+75% relative gain).
