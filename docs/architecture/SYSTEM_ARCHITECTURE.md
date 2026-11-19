# Insurance Intelligence - System Architecture & Enterprise Design

This document details the architectural blueprint, data flow, component interactions, and deployment model of the Insurance Intelligence enterprise platform.

---

## 1. High-Level Architecture Overview

```mermaid
graph TD
    subgraph Client ["Frontend Client (React 18 + Vite + TypeScript)"]
        UI["Tailwind CSS + Lucide Icons + Recharts UI"]
        Routing["React Router (Admin & Customer Portals)"]
        Forms["React Hook Form + Zod Validation"]
        ApiClient["Axios / Fetch API Client (services/api.ts)"]
        UI --> Routing
        Routing --> Forms
        Forms --> ApiClient
    end

    subgraph Gateway ["Reverse Proxy & Networking"]
        CORS["FastAPI CORS Middleware"]
        Router["FastAPI Application Router (app/main.py)"]
    end

    subgraph Backend ["FastAPI Backend Microservice (Python 3.11)"]
        ApiRoutes["API Controllers (/api/v1/...)"]
        
        subgraph Services ["Domain Service Layer"]
            PremSvc["PremiumService (Thread-safe ML Cache)"]
            UnderSvc["UnderwritingService (Coverage & Margin Audit)"]
            ClaimSvc["ClaimRiskService (Loss Frequency Engine)"]
            ChurnSvc["ChurnService (Disjunctive Retention Hazard)"]
            FraudSvc["FraudService (Subprime / Missing Audit Triage)"]
        end
        
        subgraph ML ["Machine Learning Inference Pipeline"]
            Preprocessor["ML Preprocessing Pipeline (app/ml/preprocessing.py)"]
            ModelArtifact["Trained Scikit-Learn Model (app/ml/artifacts/premium_model.joblib)"]
            Metadata["Model Metadata & Thresholds (app/ml/artifacts/model_metadata.json)"]
        end
    end

    subgraph Data ["Data & Analytical Assets (EDA/)"]
        SampleData["20,000 Representative Records (Seed 42)"]
        ImputedData["Cleaned Imputed Production Dataset (0 Nulls, 27 Cols)"]
        AuditTrail["Granular Imputation Audit Trail (19,910 Records)"]
        DataDict["Data Dictionary & Column Metadata"]
    end

    ApiClient -->|REST JSON over HTTP| CORS
    CORS --> Router
    Router --> ApiRoutes
    ApiRoutes --> Services
    PremSvc --> Preprocessor
    Preprocessor --> ModelArtifact
    PremSvc --> Metadata
    Services -.-> Data
```

---

## 2. Component Decoupling & Responsibilities

### Frontend Layer (`frontend/`)
- **Technology:** React 18, TypeScript, Vite 5, Tailwind CSS, Lucide React, Recharts.
- **Portals:**
  - *Customer Portal:* Self-service quote generation, under-insurance risk auditing, coverage recommendations.
  - *Admin Portal:* Portfolio loss forecasting, claim burst analysis, retention hazard monitoring, and fraud audit triage.
- **Resilience:** Includes a dual-mode service architecture (`api.ts` vs `mock.ts`), allowing full UI demonstration even if the backend is offline.

### Backend Layer (`backend/`)
- **Technology:** Python 3.11, FastAPI, Pydantic v2, Scikit-Learn, Joblib, Uvicorn.
- **Stateless Design:** All endpoints are stateless and horizontally scalable.
- **Concurrency & Thread Safety:** The `PremiumService` employs thread-safe double-checked locking for lazy model loading, ensuring zero startup latency blocks.
- **ML Inference Performance:** In-memory inference executes in $< 15\text{ ms}$ per policyholder request.

### Exploratory Data Analysis & Analytics (`EDA/`)
- **Fidelity Proof:** 20,000-row sample rigorously verified to match the 1.2M population ($p > 0.15$ on Kolmogorov-Smirnov distribution tests).
- **Leakage-Safe Imputation:** Preprocessing decisions validated via 5-fold cross-validation, confirming that retaining extreme outliers yields optimal actuarial pricing performance.
