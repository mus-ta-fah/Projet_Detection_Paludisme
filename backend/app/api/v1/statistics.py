# ========================================
# API - STATISTICS ENDPOINTS
# ========================================

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import Integer, cast, select, func
from datetime import datetime, timedelta

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.prediction import Prediction

router = APIRouter()


@router.get("/overview")
async def get_statistics_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get statistics overview for current user
    """
    
    # Total predictions
    total_query = select(func.count(Prediction.id)).where(
        Prediction.user_id == current_user.id
    )
    result = await db.execute(total_query)
    total_predictions = result.scalar() or 0
    
    # Today's predictions
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_query = select(func.count(Prediction.id)).where(
        Prediction.user_id == current_user.id,
        Prediction.created_at >= today_start
    )
    result = await db.execute(today_query)
    today_predictions = result.scalar() or 0
    
    # Parasitized count
    parasitized_query = select(func.count(Prediction.id)).where(
        Prediction.user_id == current_user.id,
        Prediction.is_parasitized == True
    )
    result = await db.execute(parasitized_query)
    parasitized_count = result.scalar() or 0
    
    # Average confidence
    avg_confidence_query = select(func.avg(Prediction.confidence)).where(
        Prediction.user_id == current_user.id
    )
    result = await db.execute(avg_confidence_query)
    avg_confidence = result.scalar() or 0
    
    # Average inference time
    avg_time_query = select(func.avg(Prediction.inference_time_ms)).where(
        Prediction.user_id == current_user.id
    )
    result = await db.execute(avg_time_query)
    avg_inference_time = result.scalar() or 0
    
    return {
        "success": True,
        "statistics": {
            "total_predictions": total_predictions,
            "today_predictions": today_predictions,
            "parasitized_count": parasitized_count,
            "uninfected_count": total_predictions - parasitized_count,
            "parasitized_percentage": (parasitized_count / total_predictions * 100) if total_predictions > 0 else 0,
            "average_confidence": round(avg_confidence, 2),
            "average_inference_time_ms": round(avg_inference_time, 2)
        }
    }


@router.get("/trends")
async def get_prediction_trends(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get prediction trends over the last N days
    """
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get predictions grouped by date
    query = select(
        func.date(Prediction.created_at).label('date'),
        func.count(Prediction.id).label('total'),
        func.sum(cast(Prediction.is_parasitized, Integer)).label('parasitized')
    ).where(
        Prediction.user_id == current_user.id,
        Prediction.created_at >= start_date
    ).group_by(
        func.date(Prediction.created_at)
    ).order_by(
        func.date(Prediction.created_at)
    )
    
    result = await db.execute(query)
    trends = result.all()
    
    # Format data
    trends_data = [
        {
            "date": str(row.date),
            "total": row.total,
            "parasitized": row.parasitized or 0,
            "uninfected": row.total - (row.parasitized or 0)
        }
        for row in trends
    ]
    
    return {
        "success": True,
        "period": f"Last {days} days",
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "trends": trends_data
    }


@router.get("/models-usage")
async def get_models_usage(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get usage statistics for different models
    """
    
    query = select(
        Prediction.model_id,
        Prediction.model_name,
        func.count(Prediction.id).label('count'),
        func.avg(Prediction.confidence).label('avg_confidence'),
        func.avg(Prediction.inference_time_ms).label('avg_time')
    ).where(
        Prediction.user_id == current_user.id
    ).group_by(
        Prediction.model_id,
        Prediction.model_name
    )
    
    result = await db.execute(query)
    models = result.all()
    
    models_data = [
        {
            "model_id": row.model_id,
            "model_name": row.model_name,
            "usage_count": row.count,
            "average_confidence": round(row.avg_confidence, 2),
            "average_inference_time_ms": round(row.avg_time, 2) if row.avg_time else 0
        }
        for row in models
    ]
    
    return {
        "success": True,
        "models": models_data
    }