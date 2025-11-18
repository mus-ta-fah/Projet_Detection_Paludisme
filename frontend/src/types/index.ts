// ========================================
// TYPESCRIPT TYPES
// ========================================

export interface User {
    id: number;
    email: string;
    username: string;
    full_name?: string;
    role: 'admin' | 'doctor' | 'lab_technician' | 'researcher';
    hospital_name?: string;
    department?: string;
    is_active: boolean;
    is_verified: boolean;
    is_superuser: boolean;
    total_predictions: number;
    created_at: string;
    last_login?: string;
  }
  
  export interface PredictionResult {
    model_id: string;
    model_name: string;
    prediction: string;
    is_parasitized: boolean;
    confidence: number;
    probability_parasitized: number;
    probability_uninfected: number;
    inference_time_ms?: number;
    accuracy?: number;
  }
  
  export interface Prediction {
    id: number;
    user_id: number;
    image_filename: string;
    model_id: string;
    model_name: string;
    prediction: string;
    is_parasitized: boolean;
    confidence: number;
    probability_parasitized: number;
    probability_uninfected: number;
    inference_time_ms?: number;
    patient_id?: string;
    patient_name?: string;
    patient_age?: number;
    notes?: string;
    is_verified: boolean;
    verified_result?: string;
    created_at: string;
  }
  
  export interface PredictionResponse {
    success: boolean;
    prediction_id: number;
    result: PredictionResult;
    image_filename: string;
    inference_time_ms: number;
    created_at: string;
  }
  
  export interface Statistics {
    total_predictions: number;
    today_predictions: number;
    parasitized_count: number;
    uninfected_count: number;
    parasitized_percentage: number;
    average_confidence: number;
    average_inference_time_ms: number;
  }
  
  export interface TrendData {
    date: string;
    total: number;
    parasitized: number;
    uninfected: number;
  }
  
  export interface ModelInfo {
    id: string;
    name: string;
    accuracy: number;
    inference_time_ms: number;
    parameters: string;
    use_case: string;
    is_default: boolean;
    loaded: boolean;
  }
  
  export interface ModelComparison {
    image_analyzed: boolean;
    models_compared: number;
    predictions: PredictionResult[];
    ensemble: PredictionResult;
    consensus: {
      majority_vote: string;
      agreement_percentage: number;
      unanimous: boolean;
    };
    disagreements: Array<{
      model_1: string;
      model_2: string;
      difference: number;
    }>;
  }
  
  export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
  }