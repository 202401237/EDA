# Insurance Intelligence & Machine Learning Frontend

An enterprise-grade, responsive, and interactive React SaaS frontend for insurance pricing estimation, underwriting risk analysis, customer churn detection, fraud audit triage, and a complete Exploratory Data Analysis (EDA) Research Lab.

---

## 1. Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **FastAPI Backend**: Running at `http://127.0.0.1:8000`

### Installation & Launch
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the development server
npm run dev
```

The application will launch at `http://localhost:5173`.

---

## 2. Project Architecture & Folder Structure

```
frontend/
├── public/
├── src/
│   ├── assets/                       # Static branding icons
│   ├── components/
│   │   ├── ProtectedRoute.tsx        # Role-based route guards for Customer & Admin
│   │   ├── eda/                      # Reusable EDA analytics & chart components
│   │   │   ├── EdaCard.tsx           # Standardized container card with icon, title, badge
│   │   │   ├── EdaMetricCard.tsx     # KPI statistics card with delta & accent styles
│   │   │   ├── EdaSectionHeader.tsx  # Uniform section title, subtitle, and action buttons
│   │   │   ├── EdaLoading.tsx        # Spinner loading state with backend status
│   │   │   ├── EdaError.tsx          # Error alert with retry action
│   │   │   ├── EdaDataTable.tsx      # Interactive search, sort, and pagination table
│   │   │   ├── EdaFigureModal.tsx    # Modal for full-resolution publication figures
│   │   │   └── EdaFigureCard.tsx     # Figure preview card with modal trigger
│   │   └── ui/                       # Accessible reusable design components
│   │       ├── Breadcrumb.tsx        # Navigation breadcrumbs
│   │       ├── Button.tsx            # Multi-variant button with loading & icons
│   │       ├── DemoBadge.tsx         # Clear demo disclaimer badges
│   │       ├── FormField.tsx         # Accessible inputs, select dropdowns & units
│   │       ├── KPICard.tsx           # Stat metric cards with trend indicators
│   │       ├── LoadingSpinner.tsx    # SVG spinner
│   │       ├── ResultCard.tsx        # Standardized prediction/analysis result card
│   │       └── RiskBadge.tsx         # Low/Medium/High risk badges
│   ├── config/
│   │   └── index.ts                  # App configuration & demo credentials
│   ├── context/
│   │   └── AuthContext.tsx           # Demo session management (Customer vs Admin)
│   ├── layouts/
│   │   ├── AdminLayout.tsx           # Dark enterprise sidebar & navigation
│   │   ├── CustomerLayout.tsx        # Navy sidebar & policyholder navigation
│   │   └── EdaLayout.tsx             # Actuarial EDA sidebar with 5 categorized groupings
│   ├── lib/
│   │   ├── mockDashboardData.ts      # Recharts sample data & case audit records
│   │   └── utils.ts                  # Currency formatting (₹), tailwind-merge (cn)
│   ├── pages/
│   │   ├── WelcomePage.tsx           # Public landing with 3 role portals
│   │   ├── auth/                     # Authentication pages
│   │   ├── customer/                 # Consumer prediction & under-insurance pages
│   │   ├── admin/                    # Underwriter risk & portfolio analytics
│   │   └── eda/                      # 18 Dedicated EDA Analytics Pages
│   │       ├── EdaOverviewPage.tsx   # Executive overview & pipeline progression
│   │       ├── DatasetOverviewPage.tsx # 4 stages & 21-feature data dictionary
│   │       ├── DataQualityPage.tsx   # Row completeness & synthetic signatures
│   │       ├── SamplingAnalysisPage.tsx # SRS-WOR seed 42 KS/Chi-Square validation
│   │       ├── MissingValueAnalysisPage.tsx # 19.9k cells, Little's test, MNAR
│   │       ├── ImputationAnalysisPage.tsx # Hybrid matrix, 19,910 audit, benchmarks
│   │       ├── OutlierAnalysisPage.tsx # IQR/MAD outlier detection & treatment CV
│   │       ├── UnivariateAnalysisPage.tsx # 15-bin histograms & moments
│   │       ├── BivariateAnalysisPage.tsx # Quantile-binned predictor stratification
│   │       ├── CorrelationAnalysisPage.tsx # 9x9 Pearson & Spearman heatmaps
│   │       ├── MultivariateAnalysisPage.tsx # Compound cohorts & VIF scores (< 1.05)
│   │       ├── TemporalAnalysisPage.tsx # Trends & 15:21:39 fixed timestamp audit
│   │       ├── HypothesisTestingPage.tsx # Inferential battery with FDR adjustment
│   │       ├── TargetAnalysisPage.tsx # Premium Amount histogram & transforms
│   │       ├── FeatureEngineeringPage.tsx # Domain ratios & indicator +75% lift
│   │       ├── ModelDiagnosticsPage.tsx # 6 regression pipeline comparisons
│   │       ├── EdaInsightsPage.tsx   # Executive findings & 18-point coverage
│   │       └── VisualizationsGalleryPage.tsx # Categorized 23 publication figures
│   ├── services/
│   │   ├── api.ts                    # Prediction & administrative rule APIs
│   │   ├── edaApi.ts                 # Centralized typed EDA API service (FastAPI)
│   │   └── mock.ts                   # Demo fallback predictions
│   ├── types/
│   │   ├── eda.ts                    # Complete TypeScript interfaces for all EDA schemas
│   │   ├── auth.ts                   # User roles & session types
│   │   ├── dataset.ts                # Verified dataset column types & ranges
│   │   └── features.ts               # Request/Response TypeScript interfaces
│   ├── App.tsx                       # Full React Router v6 routing table
│   ├── index.css                     # Tailwind CSS directives & custom styling
│   └── main.tsx                      # Root mount point
├── .env                              # VITE_API_BASE_URL=http://127.0.0.1:8000
├── package.json                      # Dependencies & build scripts
├── tailwind.config.js                # Custom InsurTech color palette
├── tsconfig.json                     # TypeScript compiler configuration
└── vite.config.ts                    # Vite build configuration
```

---

## 3. EDA Application Routes

| Route | Category | Description |
|---|---|---|
| `/eda/overview` | Executive | Master overview, 4 pipeline stages, and coverage summary |
| `/eda/dataset` | Foundation | 4 pipeline stages comparison & 21-feature data dictionary |
| `/eda/data-quality` | Foundation | Row completeness audit (67.7%) & 3 synthetic signatures |
| `/eda/sampling` | Foundation | SRS-WOR seed 42 KS and Chi-square goodness-of-fit validation |
| `/eda/missing-values` | Integrity | 19,910 missing cells, Little's omnibus test, MNAR target signal |
| `/eda/imputation` | Integrity | Hybrid decision matrix, 19,910 audit log, CV benchmarks |
| `/eda/outliers` | Integrity | Tukey IQR, Z-Score, Modified MAD, and treatment comparison |
| `/eda/univariate` | Distributions | 15-bin interactive histograms & distribution moments |
| `/eda/bivariate` | Distributions | Quantile-binned predictor stratification vs Premium Amount |
| `/eda/correlation` | Distributions | 9x9 Pearson and Spearman correlation heatmaps |
| `/eda/multivariate` | Distributions | Compound risk interaction cohorts and VIF collinearity (< 1.05) |
| `/eda/temporal` | Distributions | Annual/monthly trends & 15:21:39 synthetic timestamp audit |
| `/eda/hypothesis-testing` | Inference | Inferential battery (Welch t, MWU, KS, Chi2, ANOVA, FDR) |
| `/eda/target-analysis` | Inference | Continuous Premium Amount histogram, P1-P99 percentiles |
| `/eda/feature-engineering` | Inference | Actuarial domain ratios formulas & indicator +75% lift |
| `/eda/model-diagnostics` | Inference | 6 regression pipeline comparisons & indicator alpha |
| `/eda/insights` | Synthesis | 6 core empirical findings & 4 strategic recommendations |
| `/eda/visualizations` | Gallery | Categorized grid of all 23 verified publication figures |
| `/customer/signup` | Public | Customer registration |
| `/customer/dashboard` | Customer | Overview, recent predictions & tools |
| `/customer/premium-prediction` | Customer | **Feature 1:** Insurance Premium Prediction (₹) |
| `/customer/under-insurance-warning` | Customer | **Feature 2:** Under-Insurance Warning Engine |
| `/admin/login` | Public | Restricted enterprise admin login |
| `/admin/dashboard` | Admin | Executive Recharts telemetry & analytics |
| `/admin/underwriting-margin` | Admin | **Feature 3:** Underwriting Profit Margin Buffer |
| `/admin/claim-burst-risk` | Admin | **Feature 4:** Claim Burst & Location-Based Risk |
| `/admin/customer-churn` | Admin | **Feature 5:** Customer Churn & Retention Alert |
| `/admin/fraud-audit` | Admin | **Feature 6:** Fraud Suspicion Audit Flag |

---

## 4. Demo-Only Credentials (NOT Real User Accounts)

> [!CAUTION]
> **DEMO-ONLY CREDENTIALS NOTICE:**
> The credentials below are **strictly demo-only credentials** created for local UI presentation, rapid review, and evaluator walkthroughs.
> - **These are NOT real user accounts.**
> - They do not link to real persons, databases, or live authentication services.
> - For presentation ease, both login pages feature a **"Fill Demo"** shortcut button.

- **Demo-Only Policyholder Account:**
  - Role: Demo Customer / Policyholder (not a real user account)
  - Email: `arjun.sharma@demo.com` (Demo placeholder)
  - Password: `Demo@1234` (Demo presentation key)
- **Demo-Only Administrative Account:**
  - Role: Demo Underwriter / Actuary Admin (not a real user account)
  - Username: `admin` (Demo placeholder)
  - Password: `Admin@1234` (Demo presentation key)

> [!WARNING]
> **Authentication Security Notice:** Browser-side fixed credentials and `sessionStorage` sessions simulate authentication for frontend evaluation only. These are strictly demo-only credentials and not real user accounts. In a production release, this must be replaced with Spring Boot / FastAPI OAuth2 JWT authentication with BCrypt password hashing.

---

## 5. Mock Engine & Dataset Alignment

All mock calculations in `src/services/mock.ts` are calibrated against our **20,000-row representative dataset sample** (`insurance_sample_20000.csv`):

- **Premium Prediction:** Uses dataset empirical baseline (Median: ₹867, Mean: ₹1,098) with actuarial adjustments for claims, credit score, vehicle age, and location.
- **Under-Insurance Warning:** Evaluates: `(Dependents ≥ 2) AND (Income ≥ $25k) AND (Vehicle Age ≤ 2 yrs) AND (Plan == Basic)`.
- **Underwriting Profit Margin:** Calculates `Customer-Paid Premium − Risk-Adjusted Minimum Premium`.
- **Claim Burst Risk:** Evaluates: `(Vehicle Age ≥ 10 yrs) AND (Previous Claims ≥ 2) AND (Location == Urban)`.
- **Customer Churn Alert:** Evaluates: `(Feedback == Poor) OR (Rate Hike > 15%)`.
- **Fraud Suspicion Flag:** Evaluates 3 configurable flags: (1) Concealed prior claims, (2) Income ≤ 100, (3) Credit score < 450.

All outputs are prominently badged with `DEMO RESULT — NOT A REAL ML PREDICTION` or `DEMO ASSESSMENT`.

---

## 6. Future Spring Boot & Machine Learning Integration

The frontend uses a decoupled service architecture (`src/services/api.ts`). To connect the real backend in Phase 2:

1. Open `.env.local` (or create it from `.env.example`).
2. Update the backend URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   VITE_USE_MOCK=false
   ```
3. The UI will automatically issue `POST` requests to:
   - `POST /api/v1/predict/premium`
   - `POST /api/v1/predict/under-insurance`
   - `POST /api/v1/analyze/underwriting-margin`
   - `POST /api/v1/analyze/claim-burst-risk`
   - `POST /api/v1/analyze/customer-churn`
   - `POST /api/v1/analyze/fraud-suspicion`

No modifications to UI components or page routes are required!

---

## 7. Open Data Science Gaps to Clarify in Backend Phase

| # | Gap | Impact on ML Phase |
|---|---|---|
| 1 | **No claim dollar amounts** | Underwriting Margin requires external loss cost per claim (e.g. ₹X per claim) |
| 2 | **No ground-truth churn label** | Customer Churn model requires labeled renewal/lapse data to be supervised |
| 3 | **No ground-truth fraud label** | Fraud model will be unsupervised (Isolation Forest) unless historical fraud labels are supplied |
| 4 | **Annual Income ≤ 100 threshold** | In dataset, $1.00 is a synthetic floor artifact. The threshold unit must be confirmed |
| 5 | **Geographic resolution** | Dataset has only Urban/Suburban/Rural. Micro-geography (PIN code/city) can be added in future |
