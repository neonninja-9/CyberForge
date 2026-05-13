#!/bin/bash
# CryptoForge — Start both frontend and backend

set -e
trap 'kill 0' EXIT

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔥 Starting CryptoForge..."
echo ""

# Backend
echo "⚙️  Starting Backend (FastAPI) on http://localhost:8000"
(cd "$ROOT_DIR/backend" && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000) &

# Frontend
echo "🎨 Starting Frontend (Vite) on http://localhost:5173"
(cd "$ROOT_DIR/frontend" && npm run dev -- --host 0.0.0.0 --port 5173) &

echo ""
echo "✅ Both servers running. Press Ctrl+C to stop."
wait
