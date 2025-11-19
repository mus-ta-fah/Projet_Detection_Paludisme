# ========================================
# CONFIGURATION
# ========================================

from pydantic_settings import BaseSettings

from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # API Info
    PROJECT_NAME: str = "Malaria Detection API"
    VERSION: str = "2.0.0"
    DESCRIPTION: str = "Advanced Deep Learning API for Malaria Detection"
    
    # Server
    HOST: str = "http://localhost"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS
    # ALLOWED_ORIGINS: List[str] = []
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://malaria_detection_db_yfm7_user:npelNS2E8luRVcVN2baQyTWq2SxKwVnW@dpg-d4eh2tjgk3sc73bo4n30-a.oregon-postgres.render.com/malaria_detection_db_yfm7"
    DATABASE_ECHO: bool = False
    
    # JWT Authentication
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 16 * 1024 * 1024  # 16 MB
    UPLOAD_DIR: str = "uploads"
    ALLOWED_EXTENSIONS: List[str] = ["png", "jpg", "jpeg"]
    
    # ML Models
    MODELS_DIR: str = "app/ml/models"
    MODEL_CONFIG_PATH: str = "app/ml/model_config.yaml"
    DEFAULT_MODEL_ID: str = "model_2"

    # Hugging Face
    HF_TOKEN: str | None = None
    HF_USERNAME: str | None = None


    
    # Image Processing
    IMAGE_SIZE: int = 64
    
    # Email (for password reset, notifications)
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@malaria-detection.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_TLS: bool = True
    MAIL_SSL: bool = False
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # Rate Limiting
    RATE_LIMIT_PREDICTIONS: int = 100  # per day per user
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/api.log"
    
    # Hospital Integration
    HOSPITAL_API_KEY_LENGTH: int = 32
    
    # PDF Export
    PDF_LOGO_PATH: str = "app/static/logo.png"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()


# Create necessary directories
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs("logs", exist_ok=True)
os.makedirs(settings.MODELS_DIR, exist_ok=True)
os.makedirs("app/static", exist_ok=True)