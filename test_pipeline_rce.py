from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)
response = client.post("/api/pipelines/execute", json={
    "input": "hello",
    "steps": [
        {
            "algorithm_id": "playfair",
            "params": {"__import__('os').system('touch /tmp/pwned')": 1}
        }
    ]
})
print(response.status_code)
print(response.json())
