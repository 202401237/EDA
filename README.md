# Insurance Intelligence: Enterprise Underwriting & Fair Premium Estimation Platform

[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.2+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.9.1-F7931E.svg?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Project Title & Overview
**Insurance Intelligence** is an enterprise-grade decision-support and predictive pricing platform designed for actuarial risk assessment, underwriting governance, customer churn forecasting, and insurance policy pricing.

The system integrates a **React 18 SaaS web interface**, a **high-performance FastAPI backend microservice**, a **Scikit-Learn Random Forest regression engine** trained on representative actuarial data, five **transparent rule engines**, and an **exhaustive 18-dimension Exploratory Data Analysis (EDA)** portfolio.

> [!IMPORTANT]
> **Scientific Integrity & Model Scope Disclosure:**  
> The machine learning premium model achieves a holdout coefficient of determination of $R^2 = 0.0224$ (RMSE = \$855.66, MAE = \$656.49). It is strictly designed as an **experimental demonstration and research prototype** illustrating full-stack ML integration, feature engineering pipelines, and rule engine synthesis. It is **NOT** a highly accurate production pricing system. In real-world insurance environments, commercial rate filing requires domain-specific risk exposure variables, telematics, and loss history not present in synthetic benchmark datasets.

---

## 2. Problem Statement
Traditional property and casualty insurance pricing workflows often rely on static generalized linear models that struggle to capture non-linear risk interactions. Furthermore, real-world insurance datasets frequently suffer from severe row-level missingness (over 67% in this dataset), high-claim outliers, and subtle synthetic artifacts.

**Insurance Intelligence** provides a transparent, scientifically validated solution:
- Fair annual insurance premium estimation without synthetic inflation.
- Automated detection of under-insurance coverage gaps.
- Real-time customer churn hazard evaluation to preempt rate-shock defection.
- Fraud audit triage identifying high-risk combinations of subprime credit and missing claim histories.
- Comprehensive actuarial auditability through complete data dictionaries and empirical decision matrices.

---

## 3. Main Features
1. **Interactive SaaS Portals:** Dual role-based portals for Policyholders (Customer Portal) and Actuaries / Underwriters (Admin Dashboard).
2. **Machine Learning Premium Pricing:** Instant inference for continuous policy pricing (`Premium Amount`) using a trained Scikit-Learn Random Forest pipeline.
3. **Five Transparent Actuarial Rule Engines:**
   - *Under-Insurance Coverage Audit:* Diagnoses coverage shortfalls relative to policyholder gross annual income.
   - *Claim Burst Risk Engine:* Compares prior claim velocity against vehicle aging and urban density.
   - *Customer Retention / Churn Evaluator:* Disjunctive hazard assessment triggered by negative sentiment or double-digit premium increases.
   - *Fraud Audit Triage:* Flags subprime credit ratings ($< 450$) coupled with unrecorded claim counts on high-value policies.
   - *Underwriting Margin Engine:* Projects loss-cost ratios and target underwriting margins.
4. **Complete 18-Point EDA Portfolio:** Population fidelity proofs, missingness mechanism tests (MCAR/MAR/MNAR), multi-method outlier audits, and leakage-safe feature engineering benchmarks.
5. **Zero-Null Production Dataset:** 20,000 policy records with complete feature restoration and 19,910 row-level audit logs.

---

## 4. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Client** | React 18, TypeScript 5, Vite 5, Tailwind CSS, Lucide React, Recharts, React Hook Form, Zod |
| **Backend Service** | Python 3.11, FastAPI, Pydantic v2, Uvicorn, Python-dotenv |
| **Machine Learning** | Scikit-Learn 1.9.1 (Random Forest Regressor, HistGradientBoosting, ExtraTrees, RidgeCV), Joblib 1.6, NumPy, Pandas, SciPy |
| **EDA & Statistics** | Missingno, Statsmodels, Matplotlib, Seaborn, ReportLab, Python-Docx, Nbformat |
| **Testing & Quality** | Pytest, AnyIO, Starlette TestClient, ESLint |

---

## 5. System Architecture
The application adheres to clean separation of concerns:

```text
[ Browser Client ]  <--->  [ React 18 / Vite SPA ]  <--->  [ FastAPI REST API ]
                                                                   |
                    +----------------------------------------------+-------------------------+
                    |                                              |                         |
          [ ML Regressor Engine ]                       [ 5 Actuarial Services ]     [ In-Memory Cache ]
       (app/ml/artifacts/model.joblib)                   (Underwriting / Churn)        (Metadata / Enums)
```

For detailed component interaction diagrams and latency characteristics, see [`docs/architecture/SYSTEM_ARCHITECTURE.md`](docs/architecture/SYSTEM_ARCHITECTURE.md).

---

## 6. Frontend Setup
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Configure environment
cp .env.example .env.local

# 4. Start local development server
npm run dev
```
Access the web dashboard at `http://localhost:5173`.

### Demo-Only Presentation Credentials (NOT Real User Accounts)
For convenient prototype evaluation, pre-configured demo credentials are provided:
- **Policyholder Demo:** `arjun.sharma@demo.com` / `Demo@1234` (Mock customer)
- **Actuary Admin Demo:** `admin` / `Admin@1234` (Mock underwriter)

*(Note: These credentials are mock UI demonstration placeholders and are not real user accounts.)*

---

## 7. Backend Setup
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a Python virtual environment
python -m venv .venv
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Linux / macOS:
source .venv/bin/activate

# 3. Install pinned dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env

# 5. Launch the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API live at `http://127.0.0.1:8000`.  
Interactive Swagger docs available at `http://127.0.0.1:8000/docs`.

---

## 8. Machine Learning Model Description
- **Target Variable:** `Premium Amount` (Continuous actuarial pricing target in USD).
- **Algorithm Selected:** Scikit-Learn `RandomForestRegressor` with 100 estimators, max depth 12, and min samples leaf 4.
- **Model Artifact Location:** `backend/app/ml/artifacts/premium_model.joblib` (7.82 MB).
- **Metadata Specification:** `backend/app/ml/artifacts/model_metadata.json`.
- **Training Population:** 16,000 policyholder records sampled representatively from the insurance dataset (Seed 42).
- **Holdout Validation:** 4,000 independent test records.
- **Scikit-Learn Version:** 1.9.1 (exact verified model training version, pinned in `requirements.txt` to eliminate deserialization warnings).

> [!WARNING]
> **Model Capability Notice: Experimental Demo Prototype (Not a Production Pricing System)**  
> The trained premium prediction model achieves an empirical holdout coefficient of determination of $R^2 = 0.0224$ (RMSE = \$855.66, MAE = \$656.49).  
> 
> **This model is strictly an experimental demonstration and research prototype.** It demonstrates complete end-to-end full-stack integration (FastAPI microservice inference, Pydantic data validation, Scikit-Learn pipeline preprocessing, and actuarial decision rules), but it is **not a highly accurate production pricing system**. Due to the weak feature-to-target correlations in the underlying synthetic dataset (maximum Pearson $r \approx 0.044$), it should not be utilized for live commercial underwriting, financial risk reserving, or binding policy premium determination.

---

## 9. Actual Model Evaluation Metrics

| Metric | Baseline Linear Model | Selected Random Forest Model | HistGradientBoosting |
| :--- | :---: | :---: | :---: |
| **Mean Absolute Error (MAE)** | \$669.55 | **\$656.49** | \$658.55 |
| **Root Mean Squared Error (RMSE)** | \$864.60 | **\$855.66** | \$855.21 |
| **Coefficient of Determination ($R^2$)** | 0.0019 | **0.0224** | 0.0234 |

*Note on $R^2$ Variance:* The Kaggle Playground Series s4e12 synthetic dataset exhibits inherently weak linear correlation between isolated demographic features and `Premium Amount` (max Pearson $r \approx 0.044$). In strict adherence to scientific integrity, these metrics reflect true empirical holdout performance without artificial data fabrication.

---

## 10. Exploratory Data Analysis (EDA) Overview
The `EDA/` directory houses the complete analytical work, including:
1. **Executed Notebooks:**
   - `01_comprehensive_insurance_eda.ipynb` (45 cells covering sampling validation, univariate, bivariate, multivariate, and hypothesis tests).
   - `02_missing_value_and_imputation_analysis.ipynb` (21 cells covering MCAR/MAR/MNAR tests, outlier benchmarks, VIF, and imputation).
2. **Visualizations:** 32 publication-grade 300 DPI figures organized into 8 distinct categories (`EDA/visualizations/`).
3. **Formal Reports:** Academic Submission PDF (`EDA_Final_Report.pdf`), Word DOCX, and Technical Markdown report.
4. **Summary Tables:** 11 empirical benchmark CSV tables (`EDA/dataset/processed_data/summary_tables/`).

---

## 11. Dataset Description & Dimensions
- **Sample Dataset (`EDA/dataset/sampled_dataset/insurance_sample_20000.csv`):**
  - **Cardinality:** Exactly 20,000 records $\times$ 21 features.
  - **Sampling Strategy:** Simple Random Sampling Without Replacement (SRS-WOR), Random Seed 42.
  - **Distributional Fidelity:** Average numerical mean error $< 0.453\%$; Kolmogorov-Smirnov distribution identity confirmed ($p > 0.15$).
- **Cleaned Imputed Dataset (`EDA/dataset/processed_data/insurance_sample_20000_imputed.csv`):**
  - **Cardinality:** 20,000 records $\times$ 27 features (0 nulls, including 6 binary missingness indicator columns).
- **Data Dictionary:** Formally defined in [`EDA/dataset/data_dictionary/data_dictionary.md`](EDA/dataset/data_dictionary/data_dictionary.md).

---

## 12. Dataset Availability
- **Exclusion of `train.csv`:** The original 1,200,000-row raw training dataset (`train.csv`, ~194 MB) has been **intentionally excluded from this repository** to satisfy standard GitHub storage limits (<100MB per file) and eliminate unneeded bulk.
- **Self-Contained Functionality:** The backend ML model is already trained and fully serialized in `premium_model.joblib`. Neither the frontend nor the backend requires `train.csv` for inference or testing.
- **Running EDA with Included Sample:** Both master notebooks and all stage scripts run seamlessly out-of-the-box using the included 20,000-row representative dataset (`insurance_sample_20000.csv`).
- **Optional Full-Population Re-Execution:** If researchers wish to re-generate the full-population sampling simulations from scratch, they may place the original Kaggle s4e12 `train.csv` into `EDA/dataset/original_dataset/train.csv`. The notebooks will automatically detect and load it.

---

## 13. API Endpoint Documentation Summary

| HTTP Verb | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service liveness, status, and model readiness check |
| `GET` | `/api/status` | Extended system uptime and memory status |
| `GET` | `/api/v1/model-info/premium` | Model architecture, hyperparameters, and holdout scores |
| `POST` | `/api/v1/predict/premium` | Machine learning fair annual premium prediction |
| `POST` | `/api/v1/analyses/under-insurance` | Actuarial coverage gap & liability shortfall audit |
| `POST` | `/api/v1/analyses/claim-burst-risk` | Frequency-severity loss index calculation |
| `POST` | `/api/v1/analyses/customer-churn` | Retention hazard and rate-shock defection triage |
| `POST` | `/api/v1/analyses/fraud-suspicion` | Subprime credit / missing claims audit flag |
| `POST` | `/api/v1/analyses/underwriting-margin` | Actuarial loss ratio and pricing spread computation |

Complete request and response payload schemas are documented in [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md).

---

## 14. Environment Configuration
- **Backend:** Defined in `backend/.env.example`. Configures host, port, CORS origins, and actuarial threshold limits.
- **Frontend:** Defined in `frontend/.env.example`. Configures API base URL and demo mode fallback.

---

## 15. Commands to Run the Complete Project

```bash
# Terminal 1: Launch Backend API
cd backend
source .venv/bin/activate  # or .venv\Scripts\Activate.ps1 on Windows
uvicorn app.main:app --reload --port 8000

# Terminal 2: Launch Frontend Web App
cd frontend
npm run dev

# Open browser at http://localhost:5173
```

---

## 16. Testing Instructions

### Run Unified Test Suite
```bash
python tests/run_all_tests.py
```
This single command executes:
1. `train.csv` exclusion compliance check.
2. Sample dataset 20,000-row integrity validation.
3. Machine learning model deserialization and live inference verification.
4. Backend unit test suite via `pytest`.

### Run Frontend Production Build Check
```bash
cd frontend
npm run build
```

---

## 17. Workspace Folder Structure

```text
Insurance_Intelligence_Project_Final/
├── README.md                                          # Master repository documentation
├── .gitignore                                         # Comprehensive Git exclusion rules
├── FINAL_PROJECT_AUDIT.md                             # Detailed project extraction & verification audit
│
├── frontend/                                          # React 18 + Vite + TypeScript web application
│   ├── src/                                           # Components, pages, hooks, services, types
│   ├── public/                                        # Static assets (favicon, icons)
│   ├── package.json                                   # NPM dependencies
│   ├── vite.config.ts                                 # Vite build configuration
│   └── tailwind.config.js                             # Tailwind CSS styling configuration
│
├── backend/                                           # FastAPI machine learning microservice
│   ├── app/
│   │   ├── api/                                       # Route controllers
│   │   ├── ml/                                        # ML preprocessing & artifacts (premium_model.joblib)
│   │   ├── schemas/                                   # Pydantic validation schemas
│   │   ├── services/                                  # ML inference & 5 actuarial rule engines
│   │   ├── config.py                                  # Application settings
│   │   └── main.py                                    # FastAPI entry point
│   ├── tests/                                         # Pytest test suite (28 passing tests)
│   ├── requirements.txt                               # Pinned backend Python dependencies
│   └── .env.example                                   # Environment variable template
│
├── EDA/                                               # Exploratory Data Analysis & Actuarial Research
│   ├── dataset/
│   │   ├── sampled_dataset/                           # 20k representative sample (Seed 42) & cleaned baseline
│   │   ├── processed_data/                            # Final zero-null imputed dataset & 11 summary CSVs
│   │   └── data_dictionary/                           # Markdown & CSV data dictionaries
│   ├── notebooks/                                     # Executed master Jupyter notebooks (01 & 02)
│   ├── scripts/                                       # Data generation, pipeline stages, benchmarks
│   ├── visualizations/                                # 32 publication-grade figures (300 DPI)
│   ├── reports/                                       # Academic Submission PDF, Word DOCX, Markdown reports
│   └── documentation/                                 # Statistical methodology & sampling framework
│
├── docs/                                              # Comprehensive system documentation
│   ├── architecture/                                  # SYSTEM_ARCHITECTURE.md (Mermaid diagrams)
│   ├── API_DOCUMENTATION.md                           # Complete REST API reference
│   └── PROJECT_SETUP.md                               # Step-by-step developer deployment guide
│
└── tests/
    └── run_all_tests.py                               # Master test runner orchestrating all validations
```

---

## 18. Known Limitations
1. **Experimental ML Pricing Prototype:** The premium model ($R^2 = 0.0224$) serves as an architectural prototype demonstrating ML pipeline integration and decision-rule synthesis, not an accurate production pricing engine. Real-world underwriting requires domain-specific actuarial loss experience, telemetry data, and external credit/loss-history bureaus.
2. **Synthetic Tabular Origin:** Analysis uncovered synthetic generation artifacts in the Kaggle dataset, such as a uniform 15:21:39 timestamp across policy start dates and a $1.00 income floor.
3. **Subtle Predictor Correlation:** Unconditional correlation between individual demographic factors and premium amount is modest (max Pearson $r \approx 0.044$), making non-linear decision tree interactions necessary.
4. **Subsampling Tail Quantiles:** Ultra-rare events with population prevalence $< 1$ in 60,000 (e.g. policyholders with 7–9 previous claims) occur 0 times in the 20,000 sample. For specialized high-loss pricing stress tests, researchers should extract targeted edge-case slices from Kaggle's original dataset.
