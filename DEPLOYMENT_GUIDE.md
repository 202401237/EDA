# Insurance Intelligence — Production Deployment Guide

This guide provides comprehensive, production-grade instructions for building, configuring, deploying, and maintaining the **Insurance Intelligence** full-stack actuarial and machine learning platform.

---

## 1. System Architecture Overview

```mermaid
flowchart TD
    Client["Client Browser (Desktop / Tablet / Mobile)"]

    subgraph ReverseProxy["Reverse Proxy & Edge (Nginx / Caddy / Cloudflare)"]
        Nginx["Nginx Reverse Proxy (:80 / :443)"]
    end

    subgraph FrontendApp["Frontend Static Distribution"]
        Dist["Vite Static Build (/dist)\nHTML5 Single Page App (SPA)"]
    end

    subgraph BackendApp["Python FastAPI Application Server"]
        Uvicorn["Gunicorn / Uvicorn Workers (:8000)\nAsync ASGI Engine"]
        MLService["Scikit-Learn ML In-Memory Pipeline\n(premium_model.joblib)"]
        EDAService["EDA Service Layer\n(Data Loader & Summary Tables)"]
        StaticVis["Static File Mount\n(/static/visualizations)"]
    end

    Client -->|HTTPS :443| Nginx
    Nginx -->|Route /* (Static Assets)| Dist
    Nginx -->|Route /api/* (API Traffic)| Uvicorn
    Nginx -->|Route /static/* (Figures)| StaticVis

    Uvicorn --> MLService
    Uvicorn --> EDAService
    Uvicorn --> StaticVis
```

---

## 2. Prerequisites & Environment Requirements

### Operating System
- **Supported:** Linux (Ubuntu 22.04 LTS / Debian 12 / RHEL 9), macOS, Windows Server 2022.
- **Recommended Production:** Ubuntu 22.04 LTS x86_64.

### Runtime Engines
- **Python:** 3.11+ (Python 3.11.9 verified).
- **Node.js:** v18.0.0+ or v20.x LTS (Node 20+ recommended).
- **Package Managers:** `pip` (v23+), `npm` (v9+).
- **Hardware Sizing:**
  - **Minimum:** 2 vCPU, 4 GB RAM, 10 GB Disk (for local demonstration / evaluation).
  - **Recommended Production:** 4 vCPU, 8 GB RAM, 25 GB SSD (for high-concurrency API inference and static visual artifact delivery).

---

## 3. Backend Deployment Instructions

### Step 3.1: Python Virtual Environment Setup

Navigate to the project root and create a dedicated Python virtual environment:

```bash
cd /path/to/Insurance_Intelligence_Project_Final

# Create virtual environment inside backend/
python3.11 -m venv backend/.venv

# Activate virtual environment
# On Linux/macOS:
source backend/.venv/bin/activate

# On Windows PowerShell:
.\backend\.venv\Scripts\Activate.ps1
```

### Step 3.2: Dependency Installation

Install all required Python dependencies:

```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

Verify the installation of core packages:
```bash
python -c "import fastapi, uvicorn, sklearn, pydantic, pandas, numpy; print('All core dependencies installed successfully.')"
```

### Step 3.3: Environment Configuration (`backend/.env`)

Create or update `backend/.env` based on `backend/.env.example`:

```ini
# Core Application Settings
APP_NAME="Insurance Intelligence API"
APP_VERSION="1.0.0"
HOST="0.0.0.0"
PORT=8000
DEBUG=false

# Allowed CORS Origins (Replace with production domain)
CORS_ORIGINS=["https://insurance-intelligence.yourdomain.com", "http://localhost:5173", "http://127.0.0.1:5173"]

# Actuarial & Heuristic Rule Thresholds
UNDER_INSURANCE_INCOME_THRESHOLD=25000.0
FRAUD_INCOME_THRESHOLD=100.0
FRAUD_CREDIT_THRESHOLD=450
CHURN_RATE_HIKE_THRESHOLD=15.0
PREMIUM_CATEGORY_LOW_MAX=700.0
PREMIUM_CATEGORY_MEDIUM_MAX=1500.0
```

### Step 3.4: Verify Model Artifact Preload

Ensure that the trained Scikit-Learn model pipeline exists:
- Artifact Path: `backend/app/ml/artifacts/premium_model.joblib`
- Metadata Path: `backend/app/ml/artifacts/model_metadata.json`

If absent, train the pipeline using the reproducible training script:
```bash
python -m app.ml.train_premium_model
```

### Step 3.5: Production Service Startup (Gunicorn / Uvicorn)

For local evaluation or development:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

For production deployment with multiple worker processes:
```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile /var/log/insurance_intelligence/access.log \
  --error-logfile /var/log/insurance_intelligence/error.log \
  --timeout 60 \
  --keep-alive 5
```

---

## 4. Frontend Deployment Instructions

### Step 4.1: Install Node Dependencies

```bash
cd frontend
npm ci  # or npm install
```

### Step 4.2: Configure Environment (`frontend/.env`)

Configure the production API target in `frontend/.env.production` (or `frontend/.env`):

```ini
# Backend API Base URL (empty string if proxied under same domain, or absolute URL)
VITE_API_BASE_URL=https://insurance-intelligence.yourdomain.com

# Disable mock mode to force live FastAPI inference
VITE_USE_MOCK=false

# UI Display Name
VITE_APP_NAME=Insurance Intelligence
```

### Step 4.3: Execute Production Build

Compile the React TypeScript code with route-based code-splitting:

```bash
npm run build
```

This generates the static distribution inside `frontend/dist/`:
- `index.html` (entry point)
- `assets/index-*.js` (optimized core application bundle: ~177 kB)
- `assets/vendor-*.js` (chunked vendor bundles: React, Recharts, Lucide)
- `assets/*.js` (18 dynamically loaded EDA route chunks: 5-9 kB each)
- `assets/index-*.css` (Tailwind CSS styling)

### Step 4.4: Local Production Preview

To test the compiled production artifacts locally:
```bash
npm run preview -- --port 5173
```

---

## 5. Nginx Production Reverse Proxy Configuration

Below is a complete, production-ready Nginx server block configuring SSL termination, static SPA routing, API proxying, and caching for publication figures:

```nginx
server {
    listen 80;
    server_name insurance-intelligence.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name insurance-intelligence.yourdomain.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/insurance-intelligence.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/insurance-intelligence.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Root Directory for React Vite SPA
    root /var/www/insurance-intelligence/frontend/dist;
    index index.html;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 1. Frontend SPA Routing (Fall back to index.html for React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Static Asset Caching (JS, CSS, SVGs, Fonts)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 3. Static Publication Visualizations (/static/visualizations)
    location /static/visualizations/ {
        alias /var/www/insurance-intelligence/EDA_Project_Final/visualizations/;
        expires 7d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # 4. Backend API Proxying (/api and /docs)
    location ~ ^/(api|docs|redoc|openapi.json) {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # 5. Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;
}
```

---

## 6. Systemd Service Configuration (Linux Daemons)

To ensure the FastAPI backend starts automatically upon system reboot and restarts on failure, create a systemd service unit:

`/etc/systemd/system/insurance-intelligence.service`:

```ini
[Unit]
Description=Insurance Intelligence FastAPI Backend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/insurance-intelligence
Environment="PYTHONPATH=/var/www/insurance-intelligence/backend"
Environment="PATH=/var/www/insurance-intelligence/backend/.venv/bin"
ExecStart=/var/www/insurance-intelligence/backend/.venv/bin/gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8000 \
    --access-logfile /var/log/insurance-intelligence/access.log \
    --error-logfile /var/log/insurance-intelligence/error.log
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and activate the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable insurance-intelligence
sudo systemctl start insurance-intelligence
sudo systemctl status insurance-intelligence
```

---

## 7. Common Deployment Issues & Troubleshooting

| Symptom | Probable Cause | Corrective Action |
| :--- | :--- | :--- |
| **CORS Network Error in Browser Console** | Frontend origin missing from `CORS_ORIGINS` in backend configuration. | Add the exact frontend origin URL (including protocol and port) to `CORS_ORIGINS` in `backend/.env`. Restart Uvicorn/Gunicorn. |
| **Static Images 404 Not Found (`/static/visualizations/*`)** | `EDA_VISUALIZATIONS_DIR` path misconfigured or directory not mounted. | Verify that `EDA_Project_Final/visualizations/` exists at the project root. Check that `settings.EDA_VISUALIZATIONS_DIR.exists()` is true in `backend/app/main.py`. |
| **`Model file not found` Warning on Startup** | Missing `premium_model.joblib` artifact in `backend/app/ml/artifacts/`. | Run `python -m app.ml.train_premium_model` inside the virtual environment to generate the trained regression pipeline. |
| **HTTP 422 Unprocessable Entity on Prediction Submit** | Request body field names formatted in snake_case rather than camelCase. | Ensure frontend form payload matches `PremiumPredictionInput` schema: `annualIncome`, `maritalStatus`, `previousClaims`, etc. |
| **Direct URL Refresh Shows 404 on Non-Root Routes** | Nginx or web server attempting to serve route as static file. | Add `try_files $uri $uri/ /index.html;` to Nginx server block to delegate client-side routing to React Router. |
| **Excessive Memory Usage During Startup** | Overly large CSV files loaded simultaneously into RAM. | The service layer caches parsed summary tables in memory upon first request; ensure host server has at least 4 GB available RAM. |

---

## 8. Health Check & Monitoring

The backend exposes dedicated health verification endpoints:

```bash
# 1. Basic Health Ping
curl -s http://127.0.0.1:8000/api/health | jq .
# Expected: {"status": "ok", "timestamp": "...", "app": "Insurance Intelligence API"}

# 2. Detailed System Status & Model Preload Check
curl -s http://127.0.0.1:8000/api/status | jq .
# Expected: {"status": "operational", "model_loaded": true, "model_type": "...", "eda_artifacts_online": true}

# 3. Model Metadata Verification
curl -s http://127.0.0.1:8000/api/v1/model-info/premium | jq .
# Expected: Returns model algorithm, training metrics, features list, and sample size.
```
