/**
 * BIOPULSE ELITE API Service - FIXED VERSION
 * Handles multiple models with their specific datasets and features
 */

const API_BASE_URL = 'http://localhost:5005/api';

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
    description: 'Predicts failures from IoT vibration, acoustic, and IMF sensors',
    features: ['vibration', 'acoustic', 'temperature', 'current', 'IMF_1', 'IMF_2', 'IMF_3'],
    dataset: 'iot_sensors',
    icon: '📡',
    color: '#00F5FF'
  },
  'tpot_auto_ml': {
    name: 'TPOT AutoML',
    description: 'Automated ML pipeline for failure prediction (IoT sensors)',
    features: ['vibration', 'acoustic', 'temperature', 'current', 'IMF_1', 'IMF_2', 'IMF_3'],
    dataset: 'iot_sensors',
    icon: '🤖',
    color: '#9B5CFF'
  },
  'bioethanol_regression': {
    name: 'Bioethanol Regression',
    description: 'Predicts bioethanol growth rate from fermentation parameters',
    features: ['temperature', 'ph', 'substrate_concentration', 'fermentation_time', 'yeast_concentration', 'oxygen_level', 'nitrogen_source', 'catalyst_type'],
    dataset: 'bioethanol',
    icon: '🧪',
    color: '#00FF88',
    isBioethanol: true
  },
  'bioethanol_classification': {
    name: 'Bioethanol Classifier',
    description: 'Predicts bioethanol growth category (Low/Medium/High)',
    features: ['temperature', 'ph', 'substrate_concentration', 'fermentation_time', 'yeast_concentration', 'oxygen_level', 'nitrogen_source', 'catalyst_type'],
    dataset: 'bioethanol',
    icon: '🧬',
    color: '#FFD700',
    isBioethanol: true
  }
};

/**
 * Check backend health
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

/**
 * Get available models
 */
export async function getModels() {
  try {
    const response = await fetch(`${API_BASE_URL}/models`);
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Make prediction with specific model and correct features
 */
export async function predictWithModel(modelName, features) {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        features
      }),
    });
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Get real-time prediction from specific model
 */
export async function getRealtimePrediction(modelName) {
  try {
    const response = await fetch(`${API_BASE_URL}/realtime/${modelName}`);
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Batch prediction for CSV upload
 */
export async function predictBatch(samples, modelName) {
  try {
    const response = await fetch(`${API_BASE_URL}/predict/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        samples
      }),
    });
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Get dataset sample
 */
export async function getDatasetSample(datasetName) {
  try {
    const response = await fetch(`${API_BASE_URL}/datasets/${datasetName}/sample`);
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Generate mock sensor data for a specific model
 */
export function generateMockDataForModel(modelName) {
  const config = MODEL_CONFIG[modelName];
  if (!config) return {};
  
  const features = {};
  
  if (modelName === 'ann_smart_manufacturing') {
    // Smart Manufacturing features
    features.temperature = 70 + Math.random() * 30;
    features.vibration = 30 + Math.random() * 40;
    features.humidity = 40 + Math.random() * 40;
    features.pressure = 2 + Math.random() * 2;
    features.energy_consumption = 1 + Math.random() * 3;
    features.machine_status = Math.random() > 0.5 ? 1 : 0;
    features.anomaly_flag = Math.random() > 0.85 ? 1 : 0;
    
  } else if (modelName === 'realistic_v3_iot') {
    // IoT Sensor features
    features.vibration = 0.3 + Math.random() * 0.5;
    features.acoustic = 50 + Math.random() * 30;
    features.temperature = 65 + Math.random() * 15;
    features.current = 4 + Math.random() * 2;
    features.IMF_1 = 0.05 + Math.random() * 0.1;
    features.IMF_2 = 0.03 + Math.random() * 0.08;
    features.IMF_3 = 0.02 + Math.random() * 0.06;
    
  } else if (modelName === 'gradient_boosting_iot' || modelName === 'tpot_auto_ml') {
    // Metric features
    features.metric1 = 50000000 + Math.random() * 100000000;
    features.metric2 = 20 + Math.random() * 60;
    features.metric3 = Math.random() * 5;
    features.metric4 = 5 + Math.random() * 25;
    features.metric5 = 4 + Math.random() * 8;
    features.metric6 = 200000 + Math.random() * 200000;
    features.metric7 = Math.random() * 2;
    features.metric8 = Math.random() * 2;
    features.metric9 = Math.random() * 8;
  }
  
  return features;
}
