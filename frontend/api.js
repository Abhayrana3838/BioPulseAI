/**
 * BIOPULSE ELITE API Service
 * Connects frontend to backend ML models
 */

const API_BASE_URL = 'http://localhost:5001/api';

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
 * Make prediction on sensor data
 */
export async function predict(features, model = 'realistic_v3') {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        features
      }),
    });
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Make batch predictions
 */
export async function predictBatch(samples, model = 'realistic_v3') {
  try {
    const response = await fetch(`${API_BASE_URL}/predict/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        samples
      }),
    });
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Get real-time prediction with random sensor data
 */
export async function getRealtimePrediction(model = 'realistic_v3') {
  try {
    const response = await fetch(`${API_BASE_URL}/realtime/predict?model=${model}`);
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Generate mock sensor data for testing
 */
export function generateMockSensors(anomaly = false) {
  const base = {
    vibration: 0.5 + Math.random() * 0.2,
    acoustic: 60 + Math.random() * 15,
    temperature: 70 + Math.random() * 10,
    current: 5 + Math.random() * 1.5,
    IMF_1: 0.1 + Math.random() * 0.05,
    IMF_2: 0.08 + Math.random() * 0.04,
    IMF_3: 0.06 + Math.random() * 0.03,
  };
  
  if (anomaly) {
    base.vibration += 0.5 + Math.random() * 1.0;
    base.acoustic += 20 + Math.random() * 20;
    base.temperature += 15 + Math.random() * 15;
  }
  
  return base;
}
