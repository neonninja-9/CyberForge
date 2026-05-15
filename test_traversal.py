from fastapi.testclient import TestClient
from backend.app.main import app
import os
from pathlib import Path

# Create fake static dir and index.html so it doesn't just return 404/skip
_static_dir = Path('./backend/static')
os.makedirs(_static_dir, exist_ok=True)
with open(_static_dir / 'index.html', 'w') as f:
    f.write('index html content')

client = TestClient(app)
# Need to urlencode or just pass path traversal
# TestClient might normalize paths. Let's make an actual request if we can.
response = client.get("/..%2f..%2f..%2f..%2f..%2f..%2fetc%2fpasswd")
print("Response status:", response.status_code)
if "root" in response.text:
    print("VULNERABLE!")
else:
    print("Safe:", response.text[:50])

response = client.get("/../../../../../../etc/passwd")
print("Response 2 status:", response.status_code)
if "root" in response.text:
    print("VULNERABLE!")
else:
    print("Safe 2:", response.text[:50])
