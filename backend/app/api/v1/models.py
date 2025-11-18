# ========================================
# API - MODELS ENDPOINTS
# ========================================

from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/list")
async def list_models(request: Request):
    """
    Get list of available models with their info
    """
    model_manager = request.app.state.model_manager()
    models_info = model_manager.get_models_info()
    
    return {
        "success": True,
        "total_models": len(models_info),
        "models": models_info
    }


@router.get("/info/{model_id}")
async def get_model_info(model_id: str, request: Request):
    """
    Get detailed information about a specific model
    """
    model_manager = request.app.state.model_manager()
    
    if model_id not in model_manager.models:
        return {
            "success": False,
            "error": f"Model {model_id} not found"
        }
    
    model_info = model_manager.models[model_id]
    
    return {
        "success": True,
        "model": {
            "id": model_id,
            "name": model_info['config']['name'],
            "accuracy": model_info['config']['accuracy'],
            "inference_time_ms": model_info['config'].get('inference_time_ms', 0),
            "parameters": model_info['config'].get('parameters', 'N/A'),
            "use_case": model_info['config'].get('use_case', ''),
            "is_loaded": model_info.get('loaded', False),
            "is_default": model_info['config'].get('is_default', False)
        }
    }


@router.get("/benchmark")
async def benchmark_models(request: Request):
    """
    Get benchmark comparison of all models
    """
    model_manager = request.app.state.model_manager()
    benchmark = model_manager.benchmark_models()
    
    return {
        "success": True,
        "benchmark": benchmark
    }


@router.post("/set-default/{model_id}")
async def set_default_model(model_id: str, request: Request):
    """
    Set the default model for predictions
    """
    model_manager = request.app.state.model_manager()
    
    try:
        model_manager.set_default_model(model_id)
        return {
            "success": True,
            "message": f"Default model set to {model_id}",
            "default_model": model_id
        }
    except ValueError as e:
        return {
            "success": False,
            "error": str(e)
        }