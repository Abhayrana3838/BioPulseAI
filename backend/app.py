"""
BIOPULSE ELITE Backend API
Connects ML models to the frontend dashboard
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load models
MODELS = {}
MODEL_PATHS = {
    'gradient_boosting': '/Users/abhaysinghrana/Desktop/internship project/best_gradient_boosting_model.pkl',
    'realistic_v3': '/Users/abhaysinghrana/Desktop/internship project/realistic_maintenance_model_v3.pkl',
    'ann': '/Users/abhaysinghrana/Desktop/internship project/ann_maintenance_model.pkl',
    'tpot': '/Users/abhaysinghrana/Desktop/internship project/tpot_best_model.pkl'
}

def load_models():
    """Load all available models"""
    for name, path in MODEL_PATHS.items():
        try:
            if os.path.exists(path):
                with open(path, 'rb') as f:
                    MODELS[name] = pickle.load(f)
                print(f"✅ Loaded model: {name}")
            else:
                print(f"⚠️ Model file not found: {path}")
        except Exception as e:
            print(f"❌ Error loading {name}: {e}")

# Load models on startup
load_models()

# Default model to use
DEFAULT_MODEL = 'realistic_v3'

# Feature columns for predictions
FEATURE_COLS = ['vibration', 'acoustic', 'temperature', 'current', 'IMF_1', 'IMF_2', 'IMF_3']

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'loaded_models': list(MODELS.keys())
    })

@app.route('/api/models', methods=['GET'])
def get_models():
    """Get list of available models"""
    model_info = {}
    for name, model in MODELS.items():
        model_info[name] = {
            'type': type(model).__name__,
            'available': True
        }
    return jsonify({
        'models': model_info,
        'default': DEFAULT_MODEL
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Make prediction on input data"""
    try:
        data = request.get_json()
        
        # Get model name (optional, defaults to realistic_v3)
        model_name = data.get('model', DEFAULT_MODEL)
        
        if model_name not in MODELS:
            return jsonify({
                'error': f'Model {model_name} not found. Available: {list(MODELS.keys())}'
            }), 400
        
        model = MODELS[model_name]
        
        # Get input features
        features = data.get('features', {})
        
        # Create DataFrame with expected columns
        input_data = {}
        for col in FEATURE_COLS:
            input_data[col] = [features.get(col, 0.0)]
        
        # Add random features for realistic_v3 model
        if model_name == 'realistic_v3':
            input_data['random_noise_1'] = [np.random.normal(0, 1)]
            input_data['random_noise_2'] = [np.random.normal(0, 1)]
        
        df = pd.DataFrame(input_data)
        
        # Make prediction
        prediction = model.predict(df)[0]
        
        # Get probability if available
        probability = None
        if hasattr(model, 'predict_proba'):
            probability = float(model.predict_proba(df)[0][1])
        
        # Determine risk level
        risk_level = 'LOW'
        if prediction == 1:
            risk_level = 'HIGH' if probability and probability > 0.8 else 'MEDIUM'
        
        return jsonify({
            'prediction': int(prediction),
            'failure_predicted': bool(prediction == 1),
            'probability': probability,
            'risk_level': risk_level,
            'model_used': model_name,
            'timestamp': datetime.now().isoformat(),
            'input_features': {k: float(v[0]) for k, v in input_data.items() if not k.startswith('random')}
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/predict/batch', methods=['POST'])
def predict_batch():
    """Make predictions on multiple samples"""
    try:
        data = request.get_json()
        model_name = data.get('model', DEFAULT_MODEL)
        
        if model_name not in MODELS:
            return jsonify({
                'error': f'Model {model_name} not found'
            }), 400
        
        model = MODELS[model_name]
        samples = data.get('samples', [])
        
        if not samples:
            return jsonify({'error': 'No samples provided'}), 400
        
        results = []
        for sample in samples:
            # Create input DataFrame
            input_data = {}
            for col in FEATURE_COLS:
                input_data[col] = [sample.get(col, 0.0)]
            
            if model_name == 'realistic_v3':
                input_data['random_noise_1'] = [np.random.normal(0, 1)]
                input_data['random_noise_2'] = [np.random.normal(0, 1)]
            
            df = pd.DataFrame(input_data)
            
            prediction = model.predict(df)[0]
            probability = None
            if hasattr(model, 'predict_proba'):
                probability = float(model.predict_proba(df)[0][1])
            
            risk_level = 'LOW'
            if prediction == 1:
                risk_level = 'HIGH' if probability and probability > 0.8 else 'MEDIUM'
            
            results.append({
                'prediction': int(prediction),
                'failure_predicted': bool(prediction == 1),
                'probability': probability,
                'risk_level': risk_level
            })
        
        return jsonify({
            'results': results,
            'model_used': model_name,
            'timestamp': datetime.now().isoformat(),
            'total_samples': len(samples),
            'predicted_failures': sum(1 for r in results if r['failure_predicted'])
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get statistics for dashboard display"""
    try:
        # Load dataset for statistics
        dataset_path = '/Users/abhaysinghrana/Desktop/internship project/predictive_maintenance_dataset (1).csv'
        
        if not os.path.exists(dataset_path):
            return jsonify({
                'error': 'Dataset not found'
            }), 404
        
        df = pd.read_csv(dataset_path)
        
        # Calculate statistics
        total_machines = len(df)
        failures = df['label'].sum()
        failure_rate = (failures / total_machines) * 100
        
        # Feature statistics
        feature_stats = {}
        for col in FEATURE_COLS:
            if col in df.columns:
                feature_stats[col] = {
                    'mean': float(df[col].mean()),
                    'std': float(df[col].std()),
                    'min': float(df[col].min()),
                    'max': float(df[col].max())
                }
        
        return jsonify({
            'total_machines': total_machines,
            'predicted_failures': int(failures),
            'failure_rate': round(failure_rate, 2),
            'healthy_machines': int(total_machines - failures),
            'feature_statistics': feature_stats,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/realtime/predict', methods=['GET'])
def realtime_predict():
    """Generate real-time prediction with random sensor data"""
    try:
        model_name = request.args.get('model', DEFAULT_MODEL)
        
        if model_name not in MODELS:
            return jsonify({'error': f'Model not found: {model_name}'}), 400
        
        model = MODELS[model_name]
        
        # Generate realistic sensor readings
        np.random.seed()
        
        # Normal ranges for sensors
        vibration = np.random.normal(0.5, 0.2)
        acoustic = np.random.normal(60, 15)
        temperature = np.random.normal(70, 10)
        current = np.random.normal(5, 1.5)
        imf_1 = np.random.normal(0.1, 0.05)
        imf_2 = np.random.normal(0.08, 0.04)
        imf_3 = np.random.normal(0.06, 0.03)
        
        # Occasionally create anomalous readings (potential failure)
        if np.random.random() < 0.15:  # 15% chance of anomaly
            vibration += np.random.uniform(0.5, 1.5)
            acoustic += np.random.uniform(20, 40)
            temperature += np.random.uniform(15, 30)
        
        features = {
            'vibration': max(0, vibration),
            'acoustic': max(0, acoustic),
            'temperature': max(0, temperature),
            'current': max(0, current),
            'IMF_1': max(0, imf_1),
            'IMF_2': max(0, imf_2),
            'IMF_3': max(0, imf_3)
        }
        
        # Create input DataFrame
        input_data = {col: [features[col]] for col in FEATURE_COLS}
        
        if model_name == 'realistic_v3':
            input_data['random_noise_1'] = [np.random.normal(0, 1)]
            input_data['random_noise_2'] = [np.random.normal(0, 1)]
        
        df = pd.DataFrame(input_data)
        
        # Predict
        prediction = model.predict(df)[0]
        probability = None
        if hasattr(model, 'predict_proba'):
            probability = float(model.predict_proba(df)[0][1])
        
        risk_level = 'LOW'
        if prediction == 1:
            risk_level = 'HIGH' if probability and probability > 0.8 else 'MEDIUM'
        
        return jsonify({
            'machine_id': f'MCH-{np.random.randint(1000, 9999)}',
            'timestamp': datetime.now().isoformat(),
            'sensors': {k: round(v, 4) for k, v in features.items()},
            'prediction': int(prediction),
            'failure_predicted': bool(prediction == 1),
            'probability': round(probability, 4) if probability else None,
            'risk_level': risk_level,
            'model_used': model_name,
            'recommendation': 'Schedule maintenance' if prediction == 1 else 'Continue monitoring'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    print("🚀 Starting BIOPULSE ELITE Backend...")
    print(f"📊 Loaded models: {list(MODELS.keys())}")
    app.run(host='0.0.0.0', port=5001, debug=True)
