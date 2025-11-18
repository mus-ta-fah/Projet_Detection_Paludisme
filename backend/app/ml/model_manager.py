# backend/app/ml/model_manager.py
# ========================================
# MODEL MANAGER - Gestion des Modèles ML
# ========================================

import os
import yaml
import numpy as np
from typing import Dict, List, Optional
from app.ml.model_loader import load_model as remote_load_model, download_model_if_needed
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class ModelManager:
    """
    Gestionnaire centralisé pour tous les modèles ML
    Permet de charger, changer et comparer les modèles
    """
    
    def __init__(self, config_path: str = "app/ml/model_config.yaml"):
        self.config_path = config_path
        self.models: Dict[str, any] = {}
        self.config: Dict = {}
        self.current_model_id: str = "model_2"  # Défaut
        
        self._load_config()
        self._load_models()
    
    def _load_config(self):
        """Charge la configuration des modèles"""
        try:
            with open(self.config_path, 'r') as f:
                self.config = yaml.safe_load(f)
            logger.info(f"✅ Configuration chargée: {len(self.config['models'])} modèles")
        except Exception as e:
            logger.error(f"❌ Erreur chargement config: {e}")
            raise
    
    def _load_models(self):
        """Charge tous les modèles en lazy loading"""
        for model_config in self.config['models']:
            model_id = model_config['id']
            local_path = model_config['local_path']

            self.models[model_id] = {
                'path': local_path,
                'loaded': False,
                'model': None,
                'config': model_config
            }

            logger.info(f"📁 Modèle {model_id} enregistré (lazy loading)")
    
    def load_model(self, model_id: str):
        if model_id not in self.models:
            raise ValueError(f"Modèle {model_id} non trouvé")
        
        model_info = self.models[model_id]

        if not model_info['loaded']:
            try:
                # Téléchargement si nécessaire + chargement
                local_path = download_model_if_needed(model_info['config'])
                model_info['model'] = remote_load_model(model_info['config'])
                model_info['loaded'] = True
                logger.info(f"✅ Modèle {model_id} chargé depuis {local_path}")
            
            except Exception as e:
                logger.error(f"❌ Erreur chargement modèle {model_id}: {e}")
                raise

        return model_info['model']

    
    def predict(self, 
                image: np.ndarray, 
                model_id: Optional[str] = None,
                return_all: bool = False) -> Dict:
        """
        Fait une prédiction avec le modèle spécifié
        
        Args:
            image: Image prétraitée (64x64x3)
            model_id: ID du modèle à utiliser (None = défaut)
            return_all: Si True, retourne prédictions de tous les modèles
        
        Returns:
            Dict avec résultats de prédiction
        """
        if return_all:
            return self._predict_all_models(image)
        
        # Utiliser le modèle spécifié ou le modèle par défaut
        model_id = model_id or self.current_model_id
        model = self.load_model(model_id)
        model_config = self.models[model_id]['config']
        
        # Prédiction
        prediction_proba = model.predict(image, verbose=0)[0][0]
        
        is_parasitized = prediction_proba > 0.5
        confidence = prediction_proba if is_parasitized else (1 - prediction_proba)
        
        return {
            'model_id': model_id,
            'model_name': model_config['name'],
            'prediction': 'Parasitée' if is_parasitized else 'Non infectée',
            'confidence': float(confidence * 100),
            'probability_parasitized': float(prediction_proba * 100),
            'probability_uninfected': float((1 - prediction_proba) * 100),
            'is_parasitized': bool(is_parasitized),
            'inference_time_ms': model_config.get('inference_time_ms', 0),
            'accuracy': model_config.get('accuracy', 0)
        }
    
    def _predict_all_models(self, image: np.ndarray) -> Dict:
        """Fait une prédiction avec tous les modèles"""
        results = {
            'predictions': [],
            'ensemble_result': None
        }
        
        probas = []
        
        for model_id in self.models.keys():
            try:
                result = self.predict(image, model_id=model_id)
                results['predictions'].append(result)
                probas.append(result['probability_parasitized'] / 100)
            except Exception as e:
                logger.error(f"Erreur prédiction {model_id}: {e}")
        
        # Calcul ensemble (moyenne pondérée)
        if probas:
            # Pondération selon l'accuracy
            weights = [m['config']['accuracy'] for m in self.models.values()]
            total_weight = sum(weights)
            weights = [w / total_weight for w in weights]
            
            ensemble_proba = sum(p * w for p, w in zip(probas, weights))
            is_parasitized = ensemble_proba > 0.5
            confidence = ensemble_proba if is_parasitized else (1 - ensemble_proba)
            
            results['ensemble_result'] = {
                'model_id': 'ensemble',
                'model_name': 'Ensemble (Weighted Average)',
                'prediction': 'Parasitée' if is_parasitized else 'Non infectée',
                'confidence': float(confidence * 100),
                'probability_parasitized': float(ensemble_proba * 100),
                'probability_uninfected': float((1 - ensemble_proba) * 100),
                'is_parasitized': bool(is_parasitized),
                'weights': weights
            }
        
        return results
    
    def get_models_info(self) -> List[Dict]:
        """Retourne les infos de tous les modèles"""
        return [
            {
                'id': model_id,
                'name': info['config']['name'],
                'accuracy': info['config']['accuracy'],
                'inference_time_ms': info['config'].get('inference_time_ms', 0),
                'parameters': info['config'].get('parameters', 'N/A'),
                'use_case': info['config'].get('use_case', ''),
                'is_default': info['config'].get('is_default', False),
                'loaded': info.get('loaded', False)
            }
            for model_id, info in self.models.items()
        ]
    
    def set_default_model(self, model_id: str):
        """Définit le modèle par défaut"""
        if model_id not in self.models:
            raise ValueError(f"Modèle {model_id} non trouvé")
        
        self.current_model_id = model_id
        logger.info(f"✅ Modèle par défaut: {model_id}")
    
    def compare_models(self, image: np.ndarray) -> Dict:
        """
        Compare les performances de tous les modèles sur une image
        Utile pour la page de comparaison
        """
        results = self._predict_all_models(image)
        
        comparison = {
            'image_analyzed': True,
            'models_compared': len(results['predictions']),
            'predictions': results['predictions'],
            'ensemble': results['ensemble_result'],
            'consensus': self._calculate_consensus(results['predictions']),
            'disagreements': self._find_disagreements(results['predictions'])
        }
        
        return comparison
    
    def _calculate_consensus(self, predictions: List[Dict]) -> Dict:
        """Calcule le consensus entre les modèles"""
        parasitized_count = sum(1 for p in predictions if p['is_parasitized'])
        total = len(predictions)
        
        return {
            'majority_vote': 'Parasitée' if parasitized_count > total / 2 else 'Non infectée',
            'agreement_percentage': (max(parasitized_count, total - parasitized_count) / total) * 100,
            'unanimous': parasitized_count == 0 or parasitized_count == total
        }
    
    def _find_disagreements(self, predictions: List[Dict]) -> List[Dict]:
        """Trouve les désaccords entre modèles"""
        disagreements = []
        
        for i, pred1 in enumerate(predictions):
            for pred2 in predictions[i+1:]:
                if pred1['is_parasitized'] != pred2['is_parasitized']:
                    disagreements.append({
                        'model_1': pred1['model_name'],
                        'model_2': pred2['model_name'],
                        'difference': abs(pred1['confidence'] - pred2['confidence'])
                    })
        
        return disagreements
    
    def benchmark_models(self) -> Dict:
        """
        Benchmark de tous les modèles
        (À utiliser avec un dataset de test)
        """
        return {
            'models': self.get_models_info(),
            'recommendation': self._get_recommendation()
        }
    
    def _get_recommendation(self) -> Dict:
        """Recommande le meilleur modèle selon le cas d'usage"""
        return {
            'speed': 'model_1',  # Le plus rapide
            'balanced': 'model_3',  # Le plus précis
            'accuracy': 'model_2',  # Équilibré
            'production': 'model_2',  # Recommandé pour production
            'ensemble': 'ensemble'  # Maximum de précision
        }


# ========================================
# EXEMPLE D'UTILISATION
# ========================================

if __name__ == "__main__":
    # Initialiser le gestionnaire
    manager = ModelManager()
    
    # Obtenir infos sur tous les modèles
    print("📊 Modèles disponibles:")
    for model in manager.get_models_info():
        print(f"  - {model['name']}: {model['accuracy']*100:.2f}% accuracy")
    
    # Exemple de prédiction (avec image fictive)
    # image = np.random.rand(1, 64, 64, 3)
    
    # Prédiction avec modèle par défaut
    # result = manager.predict(image)
    
    # Prédiction avec modèle spécifique
    # result = manager.predict(image, model_id='model_1')
    
    # Prédiction avec tous les modèles
    # results = manager.predict(image, return_all=True)
    
    # Comparaison des modèles
    # comparison = manager.compare_models(image)