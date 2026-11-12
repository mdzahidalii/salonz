from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import init_database, close_database, db_manager
from app.routers import auth, services, owner, worker, customer, payments

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB Atlas & seed collections
    print(f"--> [AURA Salon API] Initializing database and security layer...")
    await init_database()
    yield
    # Shutdown: Cleanly close DB client
    await close_database()
    print(f"--> [AURA Salon API] Server shutdown completed.")

app = FastAPI(
    title=settings.APP_NAME,
    description="Modern Salon Management, Appointment Booking, and Role-Based Administration API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows Vite dev server & production frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(customer.router)
app.include_router(worker.router)
app.include_router(owner.router)
app.include_router(payments.router)

@app.get("/api/health")
async def health_check():
    """Health check endpoint for API status."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "database": "connected" if db_manager.is_connected_to_mongodb else "in-memory-fallback"
    }

# Serve built React frontend in production (Docker / Render single-service deploy)
DIST_DIR = (Path(__file__).resolve().parent.parent.parent / "frontend" / "dist").resolve()

if DIST_DIR.is_dir():
    assets_dir = DIST_DIR / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        """Serve built frontend files and fall back to index.html for SPA routes."""
        if full_path == "api" or full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")

        if full_path:
            candidate = (DIST_DIR / full_path).resolve()
            try:
                candidate.relative_to(DIST_DIR)
            except ValueError:
                raise HTTPException(status_code=404, detail="Not found")
            if candidate.is_file():
                return FileResponse(candidate)

        index_file = DIST_DIR / "index.html"
        if index_file.is_file():
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend build not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

