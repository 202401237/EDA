# Insurance Intelligence - Developer Setup & Operation Guide

This guide provides instructions to configure, run, test, and maintain the Insurance Intelligence platform.

---

## 1. Prerequisites
- **Python:** 3.10, 3.11, or 3.12 (Python 3.11 recommended).
- **Node.js:** v18.0.0 or higher (v20+ recommended).
- **Package Managers:** `pip` and `npm`.

---

## 2. Backend Setup & Local Launch

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# 3. Install pinned dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# 4. Copy environment configuration
cp .env.example .env

# 5. Start the FastAPI development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend API will be live at `http://127.0.0.1:8000`.  
Interactive API Swagger docs available at `http://127.0.0.1:8000/docs`.

---

## 3. Frontend Setup & Local Launch

```bash
# 1. Open a new terminal and navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Copy environment configuration
cp .env.example .env.local

# 4. Start Vite development server
npm run dev
```

The user interface will be live at `http://localhost:5173`.

### Demo-Only Presentation Credentials (NOT Real User Accounts)
For convenient prototype evaluation, pre-configured demo credentials are provided:
- **Policyholder Demo:** `arjun.sharma@demo.com` / `Demo@1234` (Mock customer)
- **Actuary Admin Demo:** `admin` / `Admin@1234` (Mock underwriter)

*(Note: These are mock UI demonstration placeholders and are not real user accounts.)*

---

## 4. Running Backend Tests

```bash
# From workspace root:
$env:PYTHONPATH="backend"
python -m pytest backend/tests -v
```

---

## 5. Running EDA Notebooks

```bash
# Navigate to EDA directory
cd EDA

# Install EDA dependencies
pip install -r requirements.txt

# Launch Jupyter Lab
jupyter lab notebooks/
```
Open `01_comprehensive_insurance_eda.ipynb` followed by `02_missing_value_and_imputation_analysis.ipynb`.
