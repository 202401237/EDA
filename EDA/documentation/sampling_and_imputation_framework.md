# Actuarial Sampling & Imputation Engineering Framework

This guide documents the statistical theory, mathematical proofs, and pipeline architecture governing the representative sampling, missing value imputation, and production dataset generation.

---

## 1. Representative Sampling Theory (SRS-WOR)

### Problem Formulation
Given population $\mathcal{D} = \{(\mathbf{x}_i, y_i)\}_{i=1}^N$ with $N = 1,200,000$ policy records, extract sub-sample $\mathcal{S}$ of size $n = 20,000$ (sampling fraction $f = 1/60$) such that:
$$\sup_{t \in \mathbb{R}} |F_n(t) - F(t)| \xrightarrow{a.s.} 0 \quad (\text{Glivenko-Cantelli Theorem})$$

### Empirical Verification Results
- **Numerical Moment Concordance:** Mean error across all 9 continuous columns is strictly bounded:
  - Age: Pop mean 41.15 vs Samp mean 41.05 ($\Delta = 0.236\%$, KS $p = 0.4268$)
  - Annual Income: Pop mean $32,745.22 vs Samp mean $32,644.99 ($\Delta = 0.306\%$, KS $p = 0.8114$)
  - Health Score: Pop mean 25.61 vs Samp mean 25.42 ($\Delta = 0.752\%$, KS $p = 0.0370$)
  - Previous Claims: Pop mean 1.00 vs Samp mean 0.99 ($\Delta = 1.308\%$, KS $p = 0.7398$)
  - Premium Amount: Pop mean $1,102.54 vs Samp mean $1,098.31 ($\Delta = 0.384\%$, KS $p = 0.6805$)
- **Categorical Proportions:** Maximum shift across all 33 categorical strata is 0.582%. All 10 Chi-Square tests yield $p > 0.19$.

---

## 2. Definitive Preprocessing Decision Matrix

| Column Name | Type | Missing Rate | Recommended Strategy | Reason for Selection | Retain Indicator? |
| :--- | :---: | :---: | :--- | :--- | :---: |
| **Age** | Numerical | 1.50% | Median (41.0) | Uniform distribution; median is robust | True |
| **Annual Income** | Numerical | 3.66% | Median ($23,897) | Heavy right skew (+1.46); median avoids mean distortion | True |
| **Dependents** | Numerical | 8.91% | Median (2.0) | Discrete uniform variable (0-4); median is robust | True |
| **Health Score** | Numerical | 5.87% | Iterative Bayesian Ridge | Continuous bell-shaped variable; captures multivariate covariance | True |
| **Previous Claims**| Numerical | 30.01%| Median (1.0) | Discrete count; strong linear target predictor | True |
| **Credit Score** | Numerical | 11.73%| Iterative Bayesian Ridge | Continuous normal-like distribution; preserves joint structure | True |
| **Marital Status** | Nominal | 1.50% | Constant 'Missing' | Strong MNAR signal (missing = +$198 premium); category captures signal | False |
| **Occupation** | Nominal | 29.70%| Constant 'Missing' | 30% missing rate; mode imputation would inflate one category by 30% | False |
| **Customer Feedback**| Nominal | 6.68% | Constant 'Missing' | Missingness associated with +$102 premium; category acts as indicator | False |

---

## 3. Production Cleaned Dataset (`insurance_sample_20000_imputed.csv`)
- **Dimensions:** 20,000 rows $\times$ 27 columns.
- **Null Count:** Exactly 0 missing values across all columns.
- **Target Integrity:** `Premium Amount` retained 100% unmodified.
- **Engineered Indicator Columns:**
  1. `is_missing_Age` (binary uint8)
  2. `is_missing_Annual_Income` (binary uint8)
  3. `is_missing_Number_of_Dependents` (binary uint8)
  4. `is_missing_Health_Score` (binary uint8)
  5. `is_missing_Previous_Claims` (binary uint8)
  6. `is_missing_Credit_Score` (binary uint8)
- **Granular Audit Trail:** Every imputed value is logged row-by-row in `imputation_audit.csv` (19,910 rows) with original row id, feature name, imputation algorithm, imputed value, and post-imputation range validation status (`True`).
