# Insurance Intelligence — FastAPI Machine Learning Backend

Production-ready, leakage-free Python FastAPI backend powering the Insurance Intelligence enterprise decision-support application. Integrates a genuine Scikit-Learn machine learning regressor for fair annual premium estimation and five transparent actuarial / underwriting rule engines.

---

## Architecture Overview

```text
backend/
├── app/
│   ├── main.py                     # FastAPI entry point, lifespan, CORS, static mounts & exception handlers
│   ├── config.py                   # Pydantic BaseSettings configuration & path definitions
│   ├── api/
│   │   ├── health.py               # /api/health, /api/status, /api/v1/model-info/premium
│   │   ├── premium.py              # POST /api/v1/predict/premium (Trained ML Model)
│   │   ├── analyses.py             # 5 rule-based and formulaic analysis endpoints
│   │   └── eda.py                  # 23 REST endpoints exposing verified EDA analytics
│   ├── schemas/
│   │   ├── common.py               # Shared actuarial enums (Gender, PolicyType, RiskLevel, etc.)
│   │   ├── premium.py              # PremiumPredictionInput & PremiumPredictionResult
│   │   ├── underwriting.py         # Under-Insurance & Underwriting Margin schemas
│   │   ├── claim_risk.py           # ClaimBurstRiskInput & ClaimBurstRiskResult
│   │   ├── churn.py                # CustomerChurnInput & CustomerChurnResult
│   │   ├── fraud.py                # FraudSuspicionInput & FraudSuspicionResult
│   │   └── eda.py                  # Pydantic response models for all EDA dimensions
│   ├── services/
│   │   ├── premium_service.py      # Thread-safe cached ML inference service
│   │   ├── underwriting_service.py # Under-insurance coverage audit & margin spread calculations
│   │   ├── claim_risk_service.py   # Loss frequency, vehicle aging & geographic exposure heuristic
│   │   ├── churn_service.py        # Disjunctive retention hazard evaluator (Poor Feedback OR Rate Shock)
│   │   ├── fraud_service.py        # Audit triage flag evaluating missing claims & subprime credit
│   │   └── eda/                    # High-performance modular EDA analytics services
│   │       ├── data_loader.py      # Thread-safe cached data loader & NaN/Inf sanitization
│   │       ├── dataset_overview.py # Population vs sample stages & data dictionary schema
│   │       ├── data_quality.py     # Completeness, duplicates & synthetic signatures audit
│   │       ├── sampling.py         # SRS-WOR seed 42 validation vs 1.2M population
│   │       ├── missing_values.py   # Row distribution, mechanisms (Little's test), listwise hazard
│   │       ├── imputation.py       # Imputation decision matrix, 19,910 audit & benchmarks
│   │       ├── outliers.py         # IQR, Z-score, MAD summaries & treatment comparisons
│   │       ├── univariate.py       # Moments, distributions, and 15-bin histograms
│   │       ├── bivariate.py        # Quantile-binned and categorical predictor vs target
│   │       ├── correlation.py      # Pearson and Spearman 9x9 correlation matrices
│   │       ├── multivariate.py     # Compound feature interactions & VIF scores (< 1.05)
│   │       ├── temporal.py         # Temporal trend breakdowns & 15:21:39 fixed timestamp audit
│   │       ├── hypothesis_testing.py # Inferential battery (t-test, MWU, KS, Chi2, ANOVA, FDR)
│   │       ├── target_analysis.py  # Premium Amount percentiles & transformation benchmarks
│   │       ├── feature_engineering.py # Actuarial ratio experiments & indicator benchmarks
│   │       ├── model_diagnostics.py # 6 downstream regression pipeline benchmarks
│   │       └── insights.py         # Executive findings, recommendations & coverage matrix
│   ├── ml/
│   │   ├── preprocessing.py        # Leakage-free ColumnTransformer with OneHotEncoder & SimpleImputer
│   │   ├── evaluation.py           # Regression metrics calculator (MAE, RMSE, R²)
│   │   ├── train_premium_model.py  # Reproducible ML training pipeline comparing Baseline vs Candidates
│   │   └── artifacts/
│   │       ├── premium_model.joblib # Serialized fitted Scikit-Learn regression pipeline
│   │       └── model_metadata.json  # Comprehensive training metadata, dataset stats & metrics
│   └── utils/
├── tests/
│   ├── conftest.py                 # TestClient and payload fixtures
│   ├── test_health.py              # Health, status, and model metadata tests
│   ├── test_premium.py             # Premium inference, bounds, and validation tests
│   ├── test_analyses.py            # Comprehensive tests for all 5 rule-based engines
│   ├── test_ml_pipeline.py         # Leakage, imputation & unseen category tolerance tests
│   └── test_eda.py                 # 25 automated tests verifying all EDA endpoints
├── requirements.txt                # Pinned production backend dependencies
├── .env.example                    # Environment variable template
└── README.md                       # Complete backend documentation
```

---

## Feature Matrix & Implementation Nature

| Feature | Endpoint Path | Method | Engine Type | Target / Metric |
| :--- | :--- | :---: | :---: | :--- |
| **1. Insurance Premium Prediction** | `/api/v1/predict/premium` | `POST` | **Genuine ML Regressor** | `Premium Amount` (Scikit-Learn Random Forest Pipeline) |
| **2. Under-Insurance Warning** | `/api/v1/predict/under-insurance` | `POST` | **Rule-Based Actuarial** | Dependency & asset replacement vs basic coverage tier |
| **3. Underwriting Profit Margin** | `/api/v1/analyze/underwriting-margin` | `POST` | **Deterministic Arithmetic** | Spread $= \text{Customer Premium} - \text{Risk Adjusted Benchmark}$ |
| **4. Claim Burst & Location Risk** | `/api/v1/analyze/claim-burst-risk` | `POST` | **Rule-Based Exposure** | Aging vehicle ($\ge 10$ yr), prior claims ($\ge 2$), Urban density |
| **5. Customer Churn Alert** | `/api/v1/analyze/customer-churn` | `POST` | **Rule-Based Retention** | Disjunctive OR: Poor Feedback OR Rate Shock ($> 15\%$) |
| **6. Fraud Suspicion Audit Flag** | `/api/v1/analyze/fraud-suspicion` | `POST` | **Rule-Based Triage** | Undisclosed claims, subprime credit ($< 450$), income floor |

---

## Machine Learning Model: Selection & Performance

Trained using `insurance_sample_20000.csv` (20,000 empirical observations, Seed 42, 80/20 train-test split):

| Model Candidate | Test MAE | Test RMSE | Test $R^2$ | Status |
| :--- | :---: | :---: | :---: | :--- |
| **Dummy Regressor (Median Baseline)** | $638.93 | $891.47 | $-0.0611$ | Actuarial Baseline |
| **Ridge Regression ($\alpha=100$)** | $669.55 | $864.60 | $+0.0019$ | Underperforms |
| **HistGradientBoosting** | $658.55 | $855.21 | $+0.0234$ | Strong Candidate |
| **Random Forest Regressor** | **$656.49** | **$855.66** | **$+0.0224$** | **Selected Best Model** |

### Transparent Model Scope & Educational Prototype Notice
> [!WARNING]
> **Model Capability Notice: Experimental Demo Prototype (Not a Production Pricing System)**
> The trained premium prediction model achieves a holdout coefficient of determination of $R^2 = 0.0224$ (RMSE = \$855.66, MAE = \$656.49).
> 
> **This model is strictly an experimental demonstration and research prototype.** It demonstrates complete end-to-end full-stack integration (FastAPI microservice inference, Pydantic data validation, Scikit-Learn pipeline preprocessing, and actuarial decision rules), but it is **not a highly accurate production pricing system**. Due to the weak feature-to-target correlations in the underlying synthetic dataset (maximum Pearson $r \approx 0.044$), it should not be utilized for live commercial underwriting, financial risk reserving, or binding policy premium determination.
> 
> The underlying synthetic Kaggle insurance dataset exhibits inherently low linear and non-linear correlation between demographic predictor features and `Premium Amount`. Consequently, $R^2$ remains modest ($0.0224$), which is reported transparently without synthetic metric inflation.

---

## Local Windows Run Instructions

### 1. Setup Virtual Environment
```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Retrain Model (Optional — Pre-trained artifact included)
```powershell
$env:PYTHONPATH="backend"
python -m app.ml.train_premium_model
```

### 3. Run Automated Tests
```powershell
$env:PYTHONPATH="backend"
pytest -v
```

### 4. Start FastAPI Server
```powershell
$env:PYTHONPATH="backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/api/health`
- Status Endpoint: `http://127.0.0.1:8000/api/status`
- Model Metadata: `http://127.0.0.1:8000/api/v1/model-info/premium`

---

## Exploratory Data Analysis (EDA) API Specification

The backend integrates the full, verified Exploratory Data Analysis project into 23 high-performance REST API endpoints. All endpoints read from the verified artifacts in `EDA_Project_Final/` and return chart-ready JSON structures for Recharts / React dashboards.

### EDA Endpoints Directory

| Category | Endpoint Path | Method | Purpose & Description |
| :--- | :--- | :---: | :--- |
| **Dataset Overview** | `/api/eda/overview` | `GET` | Structural metadata across all 4 dataset stages (Population, Sample, Cleaned, Imputed) |
| **Feature Schema** | `/api/eda/dataset-schema` | `GET` | Complete 21-feature data dictionary, roles, types, cardinality, and population missingness |
| **Data Quality** | `/api/eda/data-quality` | `GET` | Row completeness (67.7% incomplete), uniqueness (0 duplicates), and synthetic generation artifacts |
| **Sampling Validation** | `/api/eda/sampling-validation` | `GET` | KS and Chi-Square goodness-of-fit validation for the 20,000-row sample (SRS-WOR, Seed 42) |
| **Missing Values** | `/api/eda/missing-values` | `GET` | Per-feature missing counts, missingness percentages, and recommended imputation treatments |
| **Missingness Patterns** | `/api/eda/missingness-patterns` | `GET` | Multi-attribute co-occurrence, phi correlations, and quantification of the listwise deletion hazard |
| **Mechanisms (MCAR/MAR/MNAR)**| `/api/eda/missingness-mechanisms` | `GET` | Little's MCAR test ($\chi^2 = 372.05, p < 10^{-15}$) and empirical target association tests |
| **Imputation Summary** | `/api/eda/imputation-summary` | `GET` | Column-by-column imputation strategies, indicator flags, and 19,910-cell audit verification |
| **Imputation Benchmark** | `/api/eda/imputation-benchmark` | `GET` | 5-fold CV metrics (MAE, RMSE, Bias, R², Acc, F1) across candidate imputation algorithms |
| **Outlier Detection** | `/api/eda/outliers` | `GET` | Tukey's IQR, standard Z-Score, and Modified Z-Score (MAD) feature-wise outlier summaries |
| **Outlier Treatment** | `/api/eda/outlier-treatment` | `GET` | Empirical 5-fold CV comparison of retaining outliers vs Winsorization, Trimming, and Log-transform |
| **Univariate Analysis** | `/api/eda/univariate` | `GET` | Parametric and non-parametric statistics, moments, quantiles, and 15-bin chart histograms |
| **Bivariate Analysis** | `/api/eda/bivariate` | `GET` | Quantile-binned numerical predictors and categorical groups evaluated against Premium Amount |
| **Correlation Analysis** | `/api/eda/correlation` | `GET` | Complete 9x9 Pearson and Spearman correlation matrices with p-values and target correlation ranking |
| **Multivariate Analysis** | `/api/eda/multivariate` | `GET` | Compound risk interaction slices (e.g. Vehicle Age $\ge 13 \times$ Claims $\ge 3$) and pricing lifts |
| **Multicollinearity (VIF)** | `/api/eda/vif` | `GET` | Variance Inflation Factors for all numerical features confirming zero collinearity ($\text{VIF} < 1.05$) |
| **Temporal Analysis** | `/api/eda/temporal` | `GET` | Annual, monthly, and day-of-week trends, plus `15:21:39` fixed synthetic generation timestamp signature |
| **Hypothesis Testing** | `/api/eda/hypothesis-testing` | `GET` | Comprehensive inferential battery (Welch's $t$, Mann-Whitney $U$, KS, $\chi^2$, ANOVA, Benjamini-Hochberg FDR) |
| **Target Variable Analysis** | `/api/eda/target-analysis` | `GET` | Premium Amount distribution, tail risk percentiles (P1-P99), and transformation benchmarks |
| **Feature Engineering** | `/api/eda/feature-engineering` | `GET` | 5-fold CV experiments and mathematical formulas for domain interaction ratios |
| **Model Diagnostics** | `/api/eda/model-diagnostics` | `GET` | 6 downstream regression pipeline benchmarks on Premium Amount and missingness indicator value |
| **Executive Insights** | `/api/eda/insights` | `GET` | Consolidated executive findings, actuarial implications, and 4 core strategic recommendations |
| **Coverage Matrix** | `/api/eda/coverage` | `GET` | 18-point audit matrix showing 100% completion across all mandated EDA dimensions |
| **Visualizations Catalog** | `/api/eda/visualizations/catalog` | `GET` | Complete catalog of all 23 publication-grade visualization PNG artifacts |

All EDA endpoints are also available under the `/api/v1/eda/...` prefix for backward compatibility.

---

## Dataset Provenance & Pipeline Stages

| Stage Name | Canonical File Path | Records | Columns | Role / Purpose |
| :--- | :--- | :---: | :---: | :--- |
| **1. Population Dataset** | `EDA_Project_Final/dataset/original_dataset/train.csv` | 1,200,000 | 21 | Full population benchmark (~194 MB raw CSV) |
| **2. Analytical Sample** | `EDA_Project_Final/dataset/sampled_dataset/insurance_sample_20000.csv` | 20,000 | 21 | Representative sample (SRS-WOR, Seed 42, 1.6667%) |
| **3. Cleaned Sample** | `EDA_Project_Final/dataset/sampled_dataset/insurance_sample_20000_cleaned.csv` | 20,000 | 27 | Sample augmented with 6 binary missingness indicators |
| **4. Imputed Production** | `EDA_Project_Final/processed_data/insurance_sample_20000_imputed.csv` | 20,000 | 27 | 100% complete dataset (0 missing cells remaining) |
| **5. Imputation Audit** | `EDA_Project_Final/processed_data/imputation_audit.csv` | 19,910 | 8 | Granular cell-by-cell audit of every imputed value |

---

## Connecting the Frontend

In the `frontend/` directory, set `.env.local`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_USE_MOCK=false
VITE_APP_NAME=Insurance Intelligence
```

Start Vite dev server:
```powershell
cd frontend
npm run dev
```
Access UI at `http://127.0.0.1:5173`.
