# ========================================
# IMAGE PROCESSING UTILITIES
# ========================================

from fastapi import UploadFile, HTTPException
from pathlib import Path
import uuid
import os

from app.core.config import settings


async def validate_image(file: UploadFile) -> None:
    """
    Validate uploaded image file
    
    Args:
        file: Uploaded file
    
    Raises:
        ValueError: If file is invalid
    """
    # Check if file exists
    if not file:
        raise ValueError("No file uploaded")
    
    # Check filename
    if not file.filename:
        raise ValueError("Invalid filename")
    
    # Check file extension
    ext = file.filename.split('.')[-1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Invalid file type. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()  # Get position (size)
    file.file.seek(0)  # Reset to start
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        size_mb = settings.MAX_UPLOAD_SIZE / (1024 * 1024)
        raise ValueError(f"File too large. Maximum size: {size_mb}MB")
    
    if file_size == 0:
        raise ValueError("File is empty")


async def save_upload_file(file: UploadFile) -> tuple[str, str]:
    """
    Save uploaded file to disk
    
    Args:
        file: Uploaded file
    
    Returns:
        Tuple of (file_path, filename)
    """
    # Generate unique filename
    ext = file.filename.split('.')[-1].lower()
    unique_filename = f"{uuid.uuid4()}.{ext}"
    
    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Full file path
    file_path = upload_dir / unique_filename
    
    # Save file
    try:
        contents = await file.read()
        with open(file_path, 'wb') as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
    finally:
        await file.close()
    
    return str(file_path), unique_filename


def delete_file(file_path: str) -> bool:
    """
    Delete a file from disk
    
    Args:
        file_path: Path to file
    
    Returns:
        True if deleted, False otherwise
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")
        return False