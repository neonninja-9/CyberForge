from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import algorithms, pipelines, challenges

app = FastAPI(
    title="CryptoForge API",
    description="Backend API for CryptoForge — Gamified Cryptography Learning Platform",
    version="1.0.0",
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(algorithms.router, prefix="/api/algorithms", tags=["Algorithms"])
app.include_router(pipelines.router, prefix="/api/pipelines", tags=["Pipelines"])
app.include_router(challenges.router, prefix="/api/challenges", tags=["Challenges"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "CryptoForge API"}
