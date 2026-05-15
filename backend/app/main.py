import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from anyio import to_thread
from app.routes import algorithms, pipelines, challenges

load_dotenv()

app = FastAPI(
    title="CryptoForge API",
    description="Backend API for CryptoForge — Gamified Cryptography Learning Platform",
    version="1.0.0",
    # Disable docs in production if desired: set DOCS_ENABLED=false
    docs_url="/docs" if os.getenv("DOCS_ENABLED", "true").lower() == "true" else None,
    redoc_url="/redoc" if os.getenv("DOCS_ENABLED", "true").lower() == "true" else None,
)

# CORS — configurable via environment variable (comma-separated origins)
_default_origins = "http://localhost:5173,http://localhost:3000"
allowed_origins = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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


# ─── Production: serve built frontend from /static ───
# When the Docker image bundles the Vite build into ./static,
# we serve those assets and use SPA fallback for client-side routing.
_static_dir = Path(__file__).resolve().parent.parent / "static"

if _static_dir.is_dir():
    # Serve JS/CSS/assets with caching headers
    assets_dir = _static_dir / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def spa_fallback(request: Request, full_path: str):
        """Serve static files or fall back to index.html for SPA routes."""
        def check_file():
            try:
                file_path = (_static_dir / full_path).resolve()
                if not file_path.is_relative_to(_static_dir.resolve()):
                    return None
                if file_path.is_file():
                    return file_path
            except ValueError:
                pass
            return None

        file_path = await to_thread.run_sync(check_file)
        if file_path:
            return FileResponse(file_path)
        return FileResponse(_static_dir / "index.html")

