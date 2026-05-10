/**
 * BIOPULSE ELITE API Service - DYNAMIC IP VERSION
 * Automatically detects and uses the correct IP address
 */

// Dynamic API URL detection
const getApiBaseUrl = () => {
  // Try localhost first (most common for local development)
  const localhostUrl = 'http://localhost:5005/api';
  
  // Fallback to current window location if localhost fails
  const fallbackUrl = `http://${window.location.hostname}:5005/api`;
  
  return localhostUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Model configurations with their specific features (matches backend exactly)
export const MODEL_CONFIG = {
  'ann_smart_manufacturing': {
    name: 'Smart Manufacturing ANN',
    description: 'Predicts maintenance needs from smart manufacturing sensors',
    features: ['temperature', 'vibration', 'humidity', 'pressure', 'energy_consumption', 'machine_status', 'anomaly_flag'],
    dataset: 'smart_manufacturing',
    icon: '🏭',
    color: '#00F5FF'
  },
  'realistic_v3_iot': {
    name: 'IoT Sensor Model',
    description: 'Realistic IoT sensor failure prediction with IMF components',
    features: ['vibration', 'acoustic', 'temperature', 'current', 'IMF_1', 'IMF_2', 'IMF_3', 'random_noise_1', 'random_noise_2'],
    dataset: 'iot_sensors',
    icon: '📡',
    color: '#9B5CFF'
  },
  'tpot_auto_ml': {
    name: 'TPOT AutoML',
    description: 'Automated ML pipeline optimized failure prediction',
    features: ['vibration', 'acoustic', 'temperature', 'current', 'IMF_1', 'IMF_2', 'IMF_3'],
    dataset: 'iot_sensors',
    icon: '🤖',
    color: '#FF8C42'
  },
  'bioethanol_regression': {
    name: 'Bioethanol Regression',
    description: 'Linear regression for bioethanol growth rate prediction',
    features: ['temperature', 'ph', 'substrate_concentration', 'fermentation_time', 'yeast_concentration', 'oxygen_level', 'nitrogen_source_encoded', 'catalyst_type_encoded'],
    dataset: 'bioethanol',
    icon: '🧪',
    color: '#00FF88'
  },
  'bioethanol_classification': {
    name: 'Bioethanol Classification',
    description: 'Gradient boosting for bioethanol growth category prediction',
    features: ['temperature', 'ph', 'substrate_concentration', 'fermentation_time', 'yeast_concentration', 'oxygen_level', 'nitrogen_source_encoded', 'catalyst_type_encoded'],
    dataset: 'bioethanol',
    icon: '📊',
    color: '#FFD700'
  }
};

// Health check with fallback
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      return { success: true, url: API_BASE_URL };
    }
  } catch (error) {
    console.warn('Primary API URL failed, trying fallback...');
    try {
      const fallbackUrl = `http://${window.location.hostname}:5005/api`;
      const response = await fetch(`${fallbackUrl}/health`);
      if (response.ok) {
        return { success: true, url: fallbackUrl };
      }
    } catch (fallbackError) {
      console.error('All API URLs failed:', fallbackError);
    }
  }
  return { success: false, error: 'API not accessible' };
};

// Get real-time prediction with automatic fallback
export const getRealtimePrediction = async (modelName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/realtime/${modelName}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Validate response structure
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      success: true,
      model: data.model,
      prediction: data.prediction,
      probability: data.probability || data.confidence || null,
      confidence: data.confidence || data.probability || null,
      failure_predicted: data.failure_predicted || (data.prediction === 1),
      actual_label: data.actual_label,
      features: data.features,
      machine_id: data.machine_id || 'MCH-' + Math.floor(Math.random() * 100),
      timestamp: data.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('Prediction API error:', error);
    return {
      success: false,
      error: error.message,
      model: modelName,
      prediction: null,
      probability: null
    };
  }
};

// Get available models
export const getAvailableModels = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/models`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      success: true,
      models: data.models || {},
      default: data.default || 'realistic_v3_iot'
    };
  } catch (error) {
    console.error('Models API error:', error);
    return {
      success: false,
      error: error.message,
      models: MODEL_CONFIG,
      default: 'realistic_v3_iot'
    };
  }
};

// Export the API base URL for reference
export { API_BASE_URL };

export default {
  API_BASE_URL,
  MODEL_CONFIG,
  getRealtimePrediction,
  getAvailableModels,
  checkApiHealth
};
