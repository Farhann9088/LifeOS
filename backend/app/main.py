
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.tasks import router as tasks_router
from app.api.routes.goals import router as goals_router
from app.api.routes.career import router as career_router
from app.api.routes.ai import router as ai_router

from app.database.session import Base, engine
from app import models
from app.api.routes.auth import router as auth_router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="LifeOS API",
    description="Backend API for LifeOS Personal Management System",
    version="1.0.0"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routes
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(goals_router)
app.include_router(career_router)
app.include_router(ai_router)

@app.get("/")
def root():
    return {
        "message": "Welcome to LifeOS API",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "LifeOS"
    }
