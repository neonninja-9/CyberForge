from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_pipeline_error_generic():
    response = client.post("/api/pipelines/execute", json={
        "input": "hello",
        "steps": [
            {
                "algorithm_id": "playfair",
                "params": {"key": 123}
            }
        ]
    })
    assert response.status_code == 400
    assert response.json() == {'detail': 'Step 1 (Playfair Cipher): Invalid parameter type or format provided.'}

def test_algorithm_error_generic():
    response = client.post("/api/algorithms/playfair/execute", json={
        "input": "hello",
        "params": {"key": 123}
    })
    assert response.status_code == 400
    assert response.json() == {'detail': 'Invalid parameter type or format provided.'}
