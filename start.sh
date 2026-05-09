#!/bin/bash
# CryptoForge — Start both frontend and backend

trap 'kill 0' EXIT

echo "🔥 Starting CryptoForge..."
echo ""

# Backend
echo "⚙️  Starting Backend (FastAPI) on http://localhost:8000"
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

# Frontend
echo "🎨 Starting Frontend (Vite) on http://localhost:5173"
cd frontend && npm run dev -- --host 0.0.0.0 --port 5173 &

echo ""
echo "✅ Both servers running. Press Ctrl+C to stop."
wait
