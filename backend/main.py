# ========================================
# MAIN.PY - Point d'entrée FastAPI
# ========================================

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time

from app.core.config import settings
from app.core.logger import setup_logger
from app.api.v1 import auth, predictions, statistics, users, hospitals, models
from app.ml.model_manager import ModelManager
from app.db.session import engine, Base

# Setup logging
logger = setup_logger(__name__)

# Global model manager instance
model_manager = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for FastAPI app
    Handles startup and shutdown events
    """
    # Startup
    logger.info("🚀 Starting Malaria Detection API...")
    
    # Create database tables
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created/verified")
    except Exception as e:
        logger.error(f"❌ Database error: {e}")
    
    # Load ML models
    global model_manager
    try:
        model_manager = ModelManager()
        logger.info("✅ ML Models loaded successfully")
    except Exception as e:
        logger.error(f"❌ Error loading models: {e}")
        raise
    
    logger.info("✅ API is ready!")
    
    yield
    
    # Shutdown
    logger.info("👋 Shutting down API...")


# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "https://projet-detection-paludisme.vercel.app",
    "http://localhost:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with timing"""
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = time.time() - start_time
    
    # Log request
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    # Add custom header
    response.headers["X-Process-Time"] = str(process_time)
    
    return response


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """API Root - Health check and info"""
    return {
        "success": True,
        "message": "Malaria Detection API",
        "version": settings.VERSION,
        "status": "healthy",
        "docs": "/api/docs"
    }


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check"""
    global model_manager
    
    health_status = {
        "success": True,
        "status": "healthy",
        "version": settings.VERSION,
        "timestamp": time.time(),
        "components": {
            "api": "operational",
            "database": "operational",  # TODO: Add actual DB check
            "ml_models": "operational" if model_manager else "unavailable"
        }
    }
    
    if model_manager:
        health_status["models_loaded"] = len(model_manager.models)
        health_status["default_model"] = model_manager.current_model_id
    
    return health_status


# Include API routers
app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

app.include_router(
    predictions.router,
    prefix="/api/v1/predictions",
    tags=["Predictions"]
)

app.include_router(
    statistics.router,
    prefix="/api/v1/statistics",
    tags=["Statistics"]
)

app.include_router(
    users.router,
    prefix="/api/v1/users",
    tags=["Users"]
)

app.include_router(
    hospitals.router,
    prefix="/api/v1/hospitals",
    tags=["Hospitals"]
)

app.include_router(
    models.router,
    prefix="/api/v1/models",
    tags=["Models"]
)


# Get model manager instance
def get_model_manager() -> ModelManager:
    """Dependency to get model manager instance"""
    global model_manager
    if model_manager is None:
        raise RuntimeError("Model manager not initialized")
    return model_manager


# Make model_manager available to routes
app.state.model_manager = get_model_manager


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"🚀 Starting server on {settings.HOST}:{settings.PORT}")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )