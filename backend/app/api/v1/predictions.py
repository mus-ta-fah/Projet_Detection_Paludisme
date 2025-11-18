# ========================================
# API - PREDICTIONS ENDPOINTS
# ========================================

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import os
import uuid
import time
from datetime import datetime

from app.core.config import settings
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.services.ml_service import MLService
from app.schemas.prediction import PredictionResponse, PredictionDetail, BatchPredictionResponse
from app.utils.image_processing import validate_image, save_upload_file

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict_single(
    file: UploadFile = File(...),
    model_id: Optional[str] = Form(None),
    patient_id: Optional[str] = Form(None),
    patient_name: Optional[str] = Form(None),
    patient_age: Optional[int] = Form(None),
    notes: Optional[str] = Form(None),
    request: Request = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Make a prediction on a single image
    
    - **file**: Image file (PNG, JPG, JPEG)
    - **model_id**: Model to use (optional, default: model_3)
    - **patient_id**: Patient ID (optional)
    - **patient_name**: Patient name (optional)
    - **patient_age**: Patient age (optional)
    - **notes**: Additional notes (optional)
    """
    
    # Validate image
    try:
        await validate_image(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Get model manager
    model_manager = request.app.state.model_manager()
    
    # Use default model if not specified
    if model_id is None:
        model_id = settings.DEFAULT_MODEL_ID
    
    # Validate model_id
    if model_id not in model_manager.models:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid model_id. Available: {list(model_manager.models.keys())}"
        )
    
    try:
        # Save uploaded file
        file_path, filename = await save_upload_file(file)
        
        # Preprocess image
        ml_service = MLService()
        processed_image = ml_service.preprocess_image(file_path)
        
        # Make prediction
        start_time = time.time()
        result = model_manager.predict(processed_image, model_id=model_id)
        inference_time = (time.time() - start_time) * 1000  # Convert to ms
        
        # Save prediction to database
        prediction = Prediction(
            user_id=current_user.id,
            image_filename=filename,
            image_path=file_path,
            image_size=os.path.getsize(file_path),
            model_id=result['model_id'],
            model_name=result['model_name'],
            prediction=result['prediction'],
            is_parasitized=result['is_parasitized'],
            confidence=result['confidence'],
            probability_parasitized=result['probability_parasitized'],
            probability_uninfected=result['probability_uninfected'],
            inference_time_ms=inference_time,
            patient_id=patient_id,
            patient_name=patient_name,
            patient_age=patient_age,
            notes=notes
        )
        
        db.add(prediction)
        
        # Update user stats
        current_user.total_predictions += 1
        current_user.last_login = datetime.utcnow()
        
        await db.commit()
        await db.refresh(prediction)
        
        # Prepare response
        response = PredictionResponse(
            success=True,
            prediction_id=prediction.id,
            result=result,
            image_filename=filename,
            inference_time_ms=inference_time,
            created_at=prediction.created_at
        )
        
        return response
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(
    files: List[UploadFile] = File(...),
    model_id: Optional[str] = Form(None),
    request: Request = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Make predictions on multiple images
    
    - **files**: List of image files
    - **model_id**: Model to use (optional)
    """
    
    # Limit number of files
    max_batch_size = 10
    if len(files) > max_batch_size:
        raise HTTPException(
            status_code=400, 
            detail=f"Maximum {max_batch_size} files allowed per batch"
        )
    
    # Get model manager
    model_manager = request.app.state.model_manager()
    ml_service = MLService()
    
    if model_id is None:
        model_id = settings.DEFAULT_MODEL_ID
    
    results = []
    failed = []
    
    for file in files:
        try:
            # Validate and process
            await validate_image(file)
            file_path, filename = await save_upload_file(file)
            processed_image = ml_service.preprocess_image(file_path)
            
            # Predict
            start_time = time.time()
            result = model_manager.predict(processed_image, model_id=model_id)
            inference_time = (time.time() - start_time) * 1000
            
            # Save to DB
            prediction = Prediction(
                user_id=current_user.id,
                image_filename=filename,
                image_path=file_path,
                image_size=os.path.getsize(file_path),
                model_id=result['model_id'],
                model_name=result['model_name'],
                prediction=result['prediction'],
                is_parasitized=result['is_parasitized'],
                confidence=result['confidence'],
                probability_parasitized=result['probability_parasitized'],
                probability_uninfected=result['probability_uninfected'],
                inference_time_ms=inference_time
            )
            
            db.add(prediction)
            await db.flush()
            
            results.append({
                "success": True,
                "filename": filename,
                "prediction_id": prediction.id,
                "result": result,
                "inference_time_ms": inference_time
            })
            
        except Exception as e:
            failed.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    # Update user stats
    current_user.total_predictions += len(results)
    
    await db.commit()
    
    return BatchPredictionResponse(
        success=True,
        total_uploaded=len(files),
        successful=len(results),
        failed=len(failed),
        results=results,
        errors=failed if failed else None
    )


@router.post("/predict/compare", response_model=dict)
async def predict_compare_models(
    file: UploadFile = File(...),
    request: Request = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Compare predictions from all models on a single image
    Useful for model comparison page
    """
    
    try:
        await validate_image(file)
        file_path, filename = await save_upload_file(file)
        
        ml_service = MLService()
        processed_image = ml_service.preprocess_image(file_path)
        
        # Get model manager and compare
        model_manager = request.app.state.model_manager()
        comparison = model_manager.compare_models(processed_image)
        
        # Save best prediction to DB (ensemble or best model)
        best_result = comparison['ensemble']
        
        prediction = Prediction(
            user_id=current_user.id,
            image_filename=filename,
            image_path=file_path,
            image_size=os.path.getsize(file_path),
            model_id="ensemble",
            model_name="Ensemble Model",
            prediction=best_result['prediction'],
            is_parasitized=best_result['is_parasitized'],
            confidence=best_result['confidence'],
            probability_parasitized=best_result['probability_parasitized'],
            probability_uninfected=best_result['probability_uninfected'],
            metadata={"comparison": comparison}
        )
        
        db.add(prediction)
        current_user.total_predictions += 1
        await db.commit()
        await db.refresh(prediction)
        
        return {
            "success": True,
            "prediction_id": prediction.id,
            "comparison": comparison,
            "image_filename": filename
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=dict)
async def get_prediction_history(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get prediction history for current user
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    
    from sqlalchemy import select, func
    
    # Get total count
    count_query = select(func.count(Prediction.id)).where(Prediction.user_id == current_user.id)
    result = await db.execute(count_query)
    total = result.scalar()
    
    # Get predictions
    query = (
        select(Prediction)
        .where(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(query)
    predictions = result.scalars().all()
    
    return {
        "success": True,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit,
        "predictions": [p.to_dict() for p in predictions]
    }


@router.get("/{prediction_id}", response_model=PredictionDetail)
async def get_prediction_detail(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed information about a specific prediction"""
    
    from sqlalchemy import select
    
    query = select(Prediction).where(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id
    )
    
    result = await db.execute(query)
    prediction = result.scalar_one_or_none()
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    return PredictionDetail.from_orm(prediction)


@router.delete("/{prediction_id}")
async def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a prediction"""
    
    from sqlalchemy import select
    
    query = select(Prediction).where(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id
    )
    
    result = await db.execute(query)
    prediction = result.scalar_one_or_none()
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    # Delete image file
    try:
        if os.path.exists(prediction.image_path):
            os.remove(prediction.image_path)
    except Exception as e:
        print(f"Error deleting file: {e}")
    
    # Delete from DB
    await db.delete(prediction)
    current_user.total_predictions -= 1
    await db.commit()
    
    return {"success": True, "message": "Prediction deleted"}