# ========================================
# DATABASE MODELS - User
# ========================================

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.session import Base


class UserRole(str, enum.Enum):
    """User roles"""
    ADMIN = "admin"
    DOCTOR = "doctor"
    LAB_TECHNICIAN = "lab_technician"
    RESEARCHER = "researcher"


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile
    full_name = Column(String(255), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.LAB_TECHNICIAN)
    hospital_name = Column(String(255), nullable=True)
    department = Column(String(100), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Statistics
    total_predictions = Column(Integer, default=0)
    
    # Relationships
    predictions = relationship(
        "Prediction", 
        back_populates="user", 
        primaryjoin="User.id == Prediction.user_id",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<User {self.email}>"