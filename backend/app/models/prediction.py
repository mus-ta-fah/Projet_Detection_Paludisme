# ========================================
# DATABASE MODELS - Prediction
# ========================================

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base


class Prediction(Base):
    """Prediction model - stores all predictions made by users"""
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User reference
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Image info
    image_filename = Column(String(255), nullable=False)
    image_path = Column(String(500), nullable=False)
    image_size = Column(Integer, nullable=True)  # in bytes
    
    # Model used
    model_id = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)
    
    # Prediction results
    prediction = Column(String(50), nullable=False)  # "Parasitée" or "Non infectée"
    is_parasitized = Column(Boolean, nullable=False)
    confidence = Column(Float, nullable=False)
    probability_parasitized = Column(Float, nullable=False)
    probability_uninfected = Column(Float, nullable=False)
    
    # Additional info
    inference_time_ms = Column(Float, nullable=True)
    
    # Optional: Patient info (if provided)
    patient_id = Column(String(100), nullable=True)
    patient_name = Column(String(255), nullable=True)
    patient_age = Column(Integer, nullable=True)
    
    # Metadata
    notes = Column(Text, nullable=True)
    custom_metadata = Column(JSON, nullable=True)  # For additional custom data
    
    # Verification (by doctor/expert)
    is_verified = Column(Boolean, default=False)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_result = Column(String(50), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="predictions", foreign_keys=[user_id])
    verifier = relationship("User", foreign_keys=[verified_by])
    
    def __repr__(self):
        return f"<Prediction {self.id} - {self.prediction} ({self.confidence:.2f}%)>"
    
    @property
    def is_correct(self) -> bool | None:
        """Check if prediction is correct (if verified)"""
        if self.is_verified and self.verified_result:
            return self.prediction == self.verified_result
        return None
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "image_filename": self.image_filename,
            "model_id": self.model_id,
            "model_name": self.model_name,
            "prediction": self.prediction,
            "is_parasitized": self.is_parasitized,
            "confidence": self.confidence,
            "probability_parasitized": self.probability_parasitized,
            "probability_uninfected": self.probability_uninfected,
            "inference_time_ms": self.inference_time_ms,
            "patient_id": self.patient_id,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }