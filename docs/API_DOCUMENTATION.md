# Insurance Intelligence - REST API Documentation & Schema Reference

**Base URL:** `http://127.0.0.1:8000`  
**OpenAPI Interactive Docs:** `http://127.0.0.1:8000/docs` (Swagger UI)  
**ReDoc Reference:** `http://127.0.0.1:8000/redoc`  

---

## 1. System Health & Metadata Endpoints

### `GET /api/health`
Checks server liveness, model loading status, and version metadata.

**Response (200 OK):**
```json
{
  "status": "ok",
  "app_name": "Insurance Intelligence API",
  "version": "1.0.0",
  "model_loaded": true
}
```

### `GET /api/v1/model-info/premium`
Returns trained machine learning model metadata, training configuration, and out-of-fold benchmark metrics.

**Response (200 OK):**
```json
{
  "selected_model": "Random Forest",
  "dataset_source": "insurance_sample_20000.csv",
  "train_samples_count": 16000,
  "test_samples_count": 4000,
  "selected_model_metrics": {
    "mae": 656.49,
    "rmse": 855.66,
    "r2": 0.0224
  },
  "premium_category_thresholds": {
    "low_max": 700.0,
    "medium_max": 1500.0
  }
}
```

---

## 2. Machine Learning Inference Endpoint

### `POST /api/v1/predict/premium`
Predicts the fair annual insurance premium amount in USD using the trained Random Forest regressor.

**Request Payload:**
```json
{
  "age": 42.0,
  "gender": "Male",
  "annualIncome": 54000.0,
  "maritalStatus": "Married",
  "numberOfDependents": 2.0,
  "educationLevel": "Bachelor's",
  "occupation": "Employed",
  "healthScore": 28.5,
  "location": "Suburban",
  "policyType": "Comprehensive",
  "previousClaims": 1.0,
  "vehicleAge": 5.0,
  "creditScore": 680.0,
  "insuranceDuration": 4.0,
  "smokingStatus": "No",
  "exerciseFrequency": "Weekly",
  "propertyType": "House"
}
```

**Response (200 OK):**
```json
{
  "predicted_premium": 1142.50,
  "premium_category": "Medium",
  "confidence_notes": "Predicted using Random Forest trained on representative actuarial sample.",
  "model_version": "1.0.0"
}
```

---

## 3. Actuarial Rule Engine Endpoints

### `POST /api/v1/analyses/under-insurance`
Evaluates policyholder income against coverage tier to identify coverage gap hazards.

### `POST /api/v1/analyses/claim-burst-risk`
Combines prior claim frequency, vehicle age, and location density into an underwriting risk index.

### `POST /api/v1/analyses/customer-churn`
Evaluates customer retention hazard driven by rate shock or negative feedback sentiment.

### `POST /api/v1/analyses/fraud-suspicion`
Audits subprime credit combined with zero reported claims on high-value policies.

### `POST /api/v1/analyses/underwriting-margin`
Computes loss-cost ratio and target pricing buffer.
