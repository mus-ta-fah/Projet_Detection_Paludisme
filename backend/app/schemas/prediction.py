# ========================================
# PYDANTIC SCHEMAS - Prediction
# ========================================

from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


class PredictionResult(BaseModel):
    """Schema for prediction result"""
    model_config = ConfigDict(protected_namespaces=())
    
    model_id: str
    model_name: str
    prediction: str
    is_parasitized: bool
    confidence: float
    probability_parasitized: float
    probability_uninfected: float
    inference_time_ms: Optional[float] = None
    accuracy: Optional[float] = None


class PredictionResponse(BaseModel):
    """Schema for prediction response"""
    success: bool
    prediction_id: int
    result: PredictionResult
    image_filename: str
    inference_time_ms: float
    created_at: datetime


class BatchPredictionResponse(BaseModel):
    """Schema for batch prediction response"""
    success: bool
    total_uploaded: int
    successful: int
    failed: int
    results: List[Dict[str, Any]]
    errors: Optional[List[Dict[str, str]]] = None


class PredictionDetail(BaseModel):
    """Schema for detailed prediction info"""
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    
    id: int
    user_id: int
    image_filename: str
    model_id: str
    model_name: str
    prediction: str
    is_parasitized: bool
    confidence: float
    probability_parasitized: float
    probability_uninfected: float
    inference_time_ms: Optional[float]
    patient_id: Optional[str]
    patient_name: Optional[str]
    patient_age: Optional[int]
    notes: Optional[str]
    is_verified: bool
    verified_result: Optional[str]
    created_at: datetime