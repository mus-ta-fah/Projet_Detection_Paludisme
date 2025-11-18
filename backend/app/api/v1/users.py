
# ========================================
# API - USERS ENDPOINTS
# app/api/v1/users.py
# ========================================

from fastapi import APIRouter

router = APIRouter()

@router.get("/profile")
async def get_user_profile():
    """Get user profile (implemented in auth.py as /me)"""
    return {"message": "Use /api/v1/auth/me instead"}

