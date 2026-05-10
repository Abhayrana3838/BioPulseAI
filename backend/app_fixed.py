"""
BIOPULSE ELITE Backend API - FIXED VERSION
Handles multiple ML models with their specific datasets and features
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os
import torch
import torch.nn as nn
from datetime import datetime
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
CORS(app)

# Model configurations with their specific datasets and features
MODEL_CONFIG = {
    'ann_smart_manufacturing': {
        'path': '/Users/abhaysinghrana/Desktop/internship project/ann_maintenance_model.pkl',
        'dataset': 'smart_manufacturing_data.csv',
        'features': ['temperature', 'vibration', 'humidity', 'pressure', 'energy_consumption', 'machine_status', 'anomaly_flag'],
        'target': 'maintenance_required',
        'type': 'ann',
        'description': 'Smart Manufacturing ANN - Predicts maintenance_required'
    },
    'realistic_v3_iot': {
        'path': '/Users/abhaysinghrana/Desktop/internship project/realistic_maintenance_model_v3.pkl',
        'dataset': 'predictive_maintenance_dataset (1).csv',
        'features': ['vibration', 'acoustic', 'temperature', 'current', 'IMF_1', 'IMF_2', 'IMF_3'],
        'target': 'label',
        'type': 'sklearn_pipeline',
        'description': 'IoT Sensor Model - Predicts machine failure from vibration/acoustic/IMF data'
    },
    'gradient_boosting_iot': {
        'path': '/Users/abhaysinghrana/Desktop/internship project/best_gradient_boosting_model.pkl',
        'dataset': 'predictive_maintenance_dataset.csv',
        'features': ['metric1', 'metric2', 'metric3', 'metric4', 'metric5', 'metric6', 'metric7', 'metric8', 'metric9'],
        'target': 'failure',
        'type': 'sklearn',
        'description': 'Gradient Boosting - Predicts failure from metric1-9 features'
    },
    'tpot_auto_ml': {
        'path': '/Users/abhaysinghrana/Desktop/internship project/tpot_best_model.pkl',
        'dataset': 'predictive_maintenance_dataset.csv',
        'features': ['metric1', 'metric2', 'metric3', 'metric4', 'metric5', 'metric6', 'metric7', 'metric8', 'metric9'],
        'target': 'failure',
        'type': 'sklearn_pipeline',
        'description': 'TPOT AutoML - Automated pipeline for failure prediction'
    }
}

# Load models
LOADED_MODELS = {}
MODEL_METADATA = {}

def load_models():
    """Load all available models with their metadata"""
    for name, config in MODEL_CONFIG.items():
        try:
            if os.path.exists(config['path']):
                with open(config['path'], 'rb') as f:
                    model = pickle.load(f)
                    
                    # Handle models saved as dictionaries (model + scaler/metadata)
                    if isinstance(model, dict):
                        if 'model' in model:
                            LOADED_MODELS[name] = model
                        else:
                            # Try to find the model object in the dict
                            for key, val in model.items():
                                if hasattr(val, 'predict'):
                                    LOADED_MODELS[name] = {'model': val, 'scaler': model.get('scaler', StandardScaler())}
                                    break
                            else:
                                LOADED_MODELS[name] = model
                    else:
                        # Direct model object
                        LOADED_MODELS[name] = {'model': model, 'scaler': StandardScaler()}
                    
                    MODEL_METADATA[name] = {
                        'type': config['type'],
                        'features': config['features'],
                        'target': config['target'],
                        'description': config['description'],
                        'available': True
                    }
                    print(f"✅ Loaded: {name}")
            else:
                print(f"⚠️ Not found: {config['path']}")
                MODEL_METADATA[name] = {'available': False, 'error': 'File not found'}
        except Exception as e:
            print(f"❌ Error loading {name}: {e}")
            MODEL_METADATA[name] = {'available': False, 'error': str(e)}

# Load on startup
load_models()

# Load datasets for generating realistic mock data
DATASETS = {}

def load_datasets():
    """Load sample data from each dataset for realistic mock data generation"""
    dataset_paths = {
        'smart_manufacturing': '/Users/abhaysinghrana/Desktop/internship project/smart_manufacturing_data.csv',
        'iot_sensors': '/Users/abhaysinghrana/Desktop/internship project/predictive_maintenance_dataset (1).csv',
        'metrics': '/Users/abhaysinghrana/Desktop/internship project/predictive_maintenance_dataset.csv'
    }
    
    for name, path in dataset_paths.items():
        try:
            if os.path.exists(path):
                DATASETS[name] = pd.read_csv(path)
                print(f"✅ Dataset loaded: {name}")
            else:
                print(f"⚠️ Dataset not found: {path}")
        except Exception as e:
            print(f"❌ Error loading dataset {name}: {e}")

load_datasets()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'loaded_models': list(LOADED_MODELS.keys()),
        'model_details': MODEL_METADATA
    })

@app.route('/api/models', methods=['GET'])
def get_models():
    """Get detailed model information"""
    return jsonify({
        'models': MODEL_METADATA,
        'default': 'realistic_v3_iot'
    })

@app.route('/api/predict/<model_name>', methods=['POST'])
def predict_with_model(model_name):
    """Make prediction using specific model with correct features"""
    try:
        if model_name not in LOADED_MODELS:
            return jsonify({
                'error': f'Model {model_name} not found',
                'available_models': list(LOADED_MODELS.keys())
            }), 400
        
        model = LOADED_MODELS[model_name]
        config = MODEL_CONFIG[model_name]
        data = request.get_json()
        
        # Get input features from request
        features = data.get('features', {})
        
        # Create DataFrame with correct features for this model
        input_data = {}
        for col in config['features']:
            input_data[col] = [features.get(col, 0.0)]
        
        # Add random noise features for realistic_v3_iot model
        if model_name == 'realistic_v3_iot':
            input_data['random_noise_1'] = [np.random.normal(0, 1)]
            input_data['random_noise_2'] = [np.random.normal(0, 1)]
        
        df = pd.DataFrame(input_data)
        
        # Make prediction based on model type
        if config['type'] == 'ann':
            # ANN model prediction
            if isinstance(model, dict) and 'model' in model:
                ann_model = model['model']
                scaler = model.get('scaler', StandardScaler())
                
                # Scale input
                X_scaled = scaler.transform(df.values)
                X_tensor = torch.tensor(X_scaled, dtype=torch.float32)
                
                # Predict
                ann_model.eval()
                with torch.no_grad():
                    output = ann_model(X_tensor).squeeze()
                    probability = float(output.numpy())
                    prediction = 1 if probability > 0.5 else 0
            else:
                # Fallback for simple pickled models
                prediction = model.predict(df)[0]
                probability = None
        else:
            # Sklearn models (pipeline or direct)
            actual_model = model.get('model', model) if isinstance(model, dict) else model
            prediction = actual_model.predict(df)[0]
            probability = None
            if hasattr(actual_model, 'predict_proba'):
                probability = float(actual_model.predict_proba(df)[0][1])
        
        # Determine risk level
        risk_level = 'LOW'
        if prediction == 1:
            risk_level = 'HIGH' if probability and probability > 0.8 else 'MEDIUM'
        
        return jsonify({
            'model': model_name,
            'model_type': config['type'],
            'model_description': config['description'],
            'features_used': config['features'],
            'prediction': int(prediction),
            'prediction_label': config['target'],
            'failure_predicted': bool(prediction == 1),
            'probability': probability,
            'risk_level': risk_level,
            'input_features': {k: float(v[0]) for k, v in input_data.items()},
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc(),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/realtime/<model_name>', methods=['GET'])
def realtime_predict(model_name):
    """Generate real-time prediction with model-specific mock data"""
    try:
        if model_name not in LOADED_MODELS:
            return jsonify({
                'error': f'Model {model_name} not found',
                'available_models': list(LOADED_MODELS.keys())
            }), 400
        
        config = MODEL_CONFIG[model_name]
        model = LOADED_MODELS[model_name]
        
        # Generate model-specific mock data
        features = {}
        
        if model_name == 'ann_smart_manufacturing':
            # Smart Manufacturing features
            features = {
                'temperature': np.random.normal(80, 15),
                'vibration': np.random.normal(40, 15),
                'humidity': np.random.normal(60, 20),
                'pressure': np.random.normal(3, 1),
                'energy_consumption': np.random.normal(3, 1.5),
                'machine_status': np.random.choice([0, 1]),
                'anomaly_flag': np.random.choice([0, 1], p=[0.85, 0.15])
            }
            # Occasionally create maintenance issue
            if np.random.random() < 0.2:
                features['temperature'] += 20
                features['vibration'] += 30
                features['anomaly_flag'] = 1
                
        elif model_name in ['realistic_v3_iot']:
            # IoT Sensor features
            features = {
                'vibration': np.random.normal(0.5, 0.2),
                'acoustic': np.random.normal(60, 15),
                'temperature': np.random.normal(70, 10),
                'current': np.random.normal(5, 1.5),
                'IMF_1': np.random.normal(0.1, 0.05),
                'IMF_2': np.random.normal(0.08, 0.04),
                'IMF_3': np.random.normal(0.06, 0.03)
            }
            # Occasionally create anomaly
            if np.random.random() < 0.15:
                features['vibration'] += np.random.uniform(0.5, 1.5)
                features['acoustic'] += np.random.uniform(20, 40)
                features['temperature'] += np.random.uniform(15, 30)
                
        elif model_name in ['gradient_boosting_iot', 'tpot_auto_ml']:
            # Metric-based features
            features = {
                'metric1': np.random.normal(100000000, 50000000),
                'metric2': np.random.normal(50, 30),
                'metric3': np.random.normal(2, 3),
                'metric4': np.random.normal(20, 15),
                'metric5': np.random.normal(8, 4),
                'metric6': np.random.normal(350000, 100000),
                'metric7': np.random.normal(0.5, 1),
                'metric8': np.random.normal(0.5, 1),
                'metric9': np.random.normal(3, 4)
            }
            # Occasionally create failure condition
            if np.random.random() < 0.15:
                features['metric2'] += 40  # High metric2
                features['metric6'] -= 100000  # Low metric6
        
        # Ensure all values are positive
        features = {k: max(0, v) for k, v in features.items()}
        
        # Create DataFrame and predict
        input_data = {k: [v] for k, v in features.items()}
        
        # Add random noise features for realistic_v3_iot model
        if model_name == 'realistic_v3_iot':
            input_data['random_noise_1'] = [np.random.normal(0, 1)]
            input_data['random_noise_2'] = [np.random.normal(0, 1)]
        
        df = pd.DataFrame(input_data)
        
        # Make prediction based on model type
        if config['type'] == 'ann':
            if isinstance(model, dict) and 'model' in model:
                ann_model = model['model']
                scaler = model.get('scaler', StandardScaler())
                X_scaled = scaler.transform(df.values)
                X_tensor = torch.tensor(X_scaled, dtype=torch.float32)
                ann_model.eval()
                with torch.no_grad():
                    output = ann_model(X_tensor).squeeze()
                    probability = float(output.numpy())
                    prediction = 1 if probability > 0.5 else 0
            else:
                prediction = model.predict(df)[0]
                probability = None
        else:
            # Sklearn models (pipeline or direct)
            actual_model = model.get('model', model) if isinstance(model, dict) else model
            prediction = actual_model.predict(df)[0]
            probability = None
            if hasattr(actual_model, 'predict_proba'):
                probability = float(actual_model.predict_proba(df)[0][1])
        
        # Determine risk level and recommendation
        risk_level = 'LOW'
        if prediction == 1:
            risk_level = 'HIGH' if probability and probability > 0.8 else 'MEDIUM'
        
        recommendations = {
            'ann_smart_manufacturing': 'Schedule maintenance check' if prediction == 1 else 'Continue normal monitoring',
            'realistic_v3_iot': 'Inspect vibration/acoustic sensors' if prediction == 1 else 'IoT sensors normal',
            'gradient_boosting_iot': 'Check metric thresholds' if prediction == 1 else 'All metrics within range',
            'tpot_auto_ml': 'AutoML recommends inspection' if prediction == 1 else 'AutoML: No action needed'
        }
        
        return jsonify({
            'machine_id': f'MCH-{np.random.randint(1000, 9999)}',
            'timestamp': datetime.now().isoformat(),
            'model': model_name,
            'model_description': config['description'],
            'features': {k: round(v, 4) for k, v in features.items()},
            'prediction': int(prediction),
            'prediction_label': config['target'],
            'failure_predicted': bool(prediction == 1),
            'probability': round(probability, 4) if probability else None,
            'risk_level': risk_level,
            'recommendation': recommendations.get(model_name, 'Monitor'),
            'feature_count': len(config['features'])
        })
        
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc(),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/datasets/<dataset_name>/sample', methods=['GET'])
def get_dataset_sample(dataset_name):
    """Get sample data from a specific dataset"""
    try:
        if dataset_name not in DATASETS:
            return jsonify({'error': f'Dataset {dataset_name} not found'}), 404
        
        df = DATASETS[dataset_name]
        sample_size = min(5, len(df))
        sample = df.sample(n=sample_size).to_dict('records')
        
        return jsonify({
            'dataset': dataset_name,
            'columns': list(df.columns),
            'sample_size': len(df),
            'sample': sample
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 BIOPULSE ELITE Backend - FIXED VERSION")
    print(f"📊 Loaded models: {list(LOADED_MODELS.keys())}")
    print(f"📁 Datasets available: {list(DATASETS.keys())}")
    app.run(host='0.0.0.0', port=5002, debug=True)
