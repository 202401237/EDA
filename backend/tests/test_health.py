def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "app" in data
    assert "version" in data
    assert "timestamp" in data


def test_status_endpoint(client):
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "datasets" in data
    assert "ml_model" in data
    assert data["ml_model"]["artifact_present"] is True
    assert data["ml_model"]["is_loaded"] is True
    assert data["ml_model"]["target"] == "Premium Amount"
    assert data["ml_model"]["selected_model"] is not None
    assert "rule_analysis_services" in data
    assert len(data["rule_analysis_services"]) == 5


def test_model_info_endpoint(client):
    response = client.get("/api/v1/model-info/premium")
    assert response.status_code == 200
    data = response.json()
    assert data["target_column"] == "Premium Amount"
    assert len(data["features"]) == 17
    assert "selected_model" in data
    assert "baseline_metrics" in data
    assert "selected_model_metrics" in data
    assert data["baseline_metrics"]["mae"] > 0
    assert data["selected_model_metrics"]["mae"] > 0
