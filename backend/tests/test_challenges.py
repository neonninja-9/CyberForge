from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_challenges():
    response = client.get("/api/challenges/")
    assert response.status_code == 200
    for ch in response.json():
        assert "answer" not in ch
        assert "answer_hash" not in ch

def test_submit_correct_answer():
    # CryptoForge is answer for c2
    response = client.post("/api/challenges/c2/submit", json={"answer": "CryptoForge"})
    assert response.status_code == 200
    assert response.json()["correct"] == True

def test_submit_incorrect_answer():
    response = client.post("/api/challenges/c2/submit", json={"answer": "Wrong"})
    assert response.status_code == 200
    assert response.json()["correct"] == False
