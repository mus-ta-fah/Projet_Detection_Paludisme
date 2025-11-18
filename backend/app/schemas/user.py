# ========================================
# PYDANTIC SCHEMAS - User
# ========================================

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None
    hospital_name: Optional[str] = None
    department: Optional[str] = None


class UserCreate(UserBase):
    """Schema for user creation"""
    password: str = Field(..., min_length=8)
    role: Optional[UserRole] = UserRole.LAB_TECHNICIAN


class UserResponse(UserBase):
    """Schema for user response"""
    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    is_superuser: bool
    total_predictions: int
    created_at: datetime
    last_login: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    """Schema for user update"""
    full_name: Optional[str] = None
    hospital_name: Optional[str] = None
    department: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)


class Token(BaseModel):
    """Schema for authentication token"""
    access_token: str
    token_type: str
    user: UserResponse