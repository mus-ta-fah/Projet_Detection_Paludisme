# ========================================
# ML SERVICE
# ========================================

import cv2
import numpy as np
from PIL import Image

from app.core.config import settings


class MLService:
    """Service for ML-related operations"""
    
    def __init__(self):
        self.img_size = settings.IMAGE_SIZE
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Preprocess image for model prediction
        
        Args:
            image_path: Path to image file
        
        Returns:
            Preprocessed image array (1, 64, 64, 3)
        """
        # Read image
        image = cv2.imread(image_path)
        
        if image is None:
            raise ValueError(f"Could not read image: {image_path}")
        
        # Resize
        image = cv2.resize(image, (self.img_size, self.img_size))
        
        # Convert BGR to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Normalize
        image = image.astype('float32') / 255.0
        
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        
        return image
    
    def preprocess_pil_image(self, pil_image: Image.Image) -> np.ndarray:
        """
        Preprocess PIL Image for model prediction
        
        Args:
            pil_image: PIL Image object
        
        Returns:
            Preprocessed image array (1, 64, 64, 3)
        """
        # Convert to RGB if needed
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
        
        # Resize
        pil_image = pil_image.resize((self.img_size, self.img_size))
        
        # Convert to numpy array
        image = np.array(pil_image)
        
        # Normalize
        image = image.astype('float32') / 255.0
        
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        
        return image