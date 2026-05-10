"""
BIOPULSE ELITE Backend API - REAL DATA VERSION
Uses actual dataset samples for predictions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import joblib
import pandas as pd
import numpy as np
import os
import torch
import torch.nn as nn
from datetime import datetime
from sklearn.preprocessing import StandardScaler

# Define ANN Model Class (must match the class used during training)
class BinaryClassifierANN(nn.Module):
    def __init__(self, input_dim, hidden_size1=4):
        super(BinaryClassifierANN, self).__init__()
        self.model = nn.Sequential(
            nn.Linear(input_dim, hidden_size1),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_size1, 1),
            nn.Sigmoid(),
        )

    def forward(self, x):
        return self.model(x)

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # Allow all origins for dynamic IP support
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Load all datasets
DATASETS = {}
DATASET_FEATURES = {}

def load_datasets():
    """Load all datasets for real-time predictions"""
    dataset_configs = [
        {
            'name': 'smart_manufacturing',
            'path': '/Users/abhaysinghrana/Desktop/internship project/smart_manufacturing_data.csv',
            'features': ['temperature', 'vibration', 'humidity', 'pressure', 'energy_consumption', 'machine_status', 'anomaly_flag'],
            'target': 'anomaly_flag'
        },
        {
            'name': 'iot_sensors',
            'path': '/Users/abhaysinghrana/Desktop/internship project/predictive_maintenance_dataset (1).csv',
            'features': ['vibration', 'acoustic', 'temperature', 'current', 'IMF_1', 'IMF_2', 'IMF_3'],
            'target': 'label'
        },
        {
            'name': 'metrics',
            'path': '/Users/abhaysinghrana/Desktop/internship project/predictive_maintenance_dataset.csv',
            'features': ['metric1', 'metric2', 'metric3', 'metric4', 'metric5', 'metric6', 'metric7', 'metric8', 'metric9'],
            'target': 'failure'
        },
        {
            'name': 'bioethanol',
            'path': '/Users/abhaysinghrana/Desktop/internship project/bioethanol_ml_deployment/data/sample_data.csv',
            'features': ['temperature', 'ph', 'substrate_concentration', 'fermentation_time', 'yeast_concentration', 'oxygen_level', 'nitrogen_source', 'catalyst_type'],
            'target': 'growth_rate'
        }
    ]
    
    for config in dataset_configs:
        try:
            if os.path.exists(config['path']):
                df = pd.read_csv(config['path'])
                DATASETS[config['name']] = df
                DATASET_FEATURES[config['name']] = {
                    'features': config['features'],
                    'target': config['target']
                }
                print(f"✅ Loaded dataset: {config['name']} ({len(df)} rows)")
            else:
                print(f"⚠️ Dataset not found: {config['path']}")
        except Exception as e:
            print(f"❌ Error loading {config['name']}: {e}")

# Load datasets
load_datasets()

# Model configurations

MODEL_CONFIG = {
    'ann_smart_manufacturing': {
        'path': '/Users/abhaysinghrana/Desktop/internship project/ann_maintenance_model.pkl',
        'dataset': 'smart_manufacturing',
        'type': 'ann',
        'description': 'Smart Manufacturing ANN'
    },
    'realistic_v3_iot': {
        'path': '/Users/abhaysinghrana/Desktop/internship project/realistic_maintenance_model_v3.pkl',
        'dataset': 'iot_sensors',
        'type': 'sklearn_pipeline',
        'description': 'IoT Sensor Model'
    },
    # Note: gradient_boosting model requires 18 features, but we only have 9-feature datasets
    # Skipping gradient_boosting_iot until compatible dataset is available
    # 'gradient_boosting_iot': {
    #     'path': '/Users/abhaysinghrana/Desktop/internship project/best_gradient_boosting_model.pkl',
    #     'dataset': 'metrics',
    #     'type': 'sklearn',
    #     'description': 'Gradient Boosting'
    # },
    'tpot_auto_ml': {
        'path': '/Users/abhaysinghrana/Desktop/internship project/tpot_best_model.pkl',
        'dataset': 'iot_sensors',  # TPOT was trained on IoT features, not metrics
        'type': 'sklearn_pipeline',
        'description': 'TPOT AutoML'
    },
    'bioethanol_regression': {
        'path': '/Users/abhaysinghrana/Desktop/internship project/bioethanol_ml_deployment/models/best_regression_model.pkl',
        'dataset': 'bioethanol',
        'type': 'bioethanol',
        'description': 'Bioethanol Growth Rate Predictor'
    },
    'bioethanol_classification': {
        'path': '/Users/abhaysinghrana/Desktop/internship project/bioethanol_ml_deployment/models/best_classification_model.pkl',
        'dataset': 'bioethanol',
        'type': 'bioethanol',
        'description': 'Bioethanol Growth Category Classifier'
    }
}

# Load models
LOADED_MODELS = {}
MODEL_METADATA = {}

# Bioethanol preprocessors (loaded globally)
BIOETHANOL_ENCODERS = {}
BIOETHANOL_SCALER = None

def load_bioethanol_preprocessors():
    """Load label encoders and scaler for bioethanol models"""
    global BIOETHANOL_ENCODERS, BIOETHANOL_SCALER
    try:
        encoders_path = '/Users/abhaysinghrana/Desktop/internship project/bioethanol_ml_deployment/preprocessors/label_encoders.pkl'
        scaler_path = '/Users/abhaysinghrana/Desktop/internship project/bioethanol_ml_deployment/preprocessors/scaler.pkl'
        
        if os.path.exists(encoders_path):
            BIOETHANOL_ENCODERS = joblib.load(encoders_path)
        if os.path.exists(scaler_path):
            BIOETHANOL_SCALER = joblib.load(scaler_path)
        return True
    except Exception as e:
        print(f"⚠️ Error loading bioethanol preprocessors: {e}")
        return False

def load_models():
    """Load all models"""
    print(f"🔧 Attempting to load {len(MODEL_CONFIG)} models...")
    for name, config in MODEL_CONFIG.items():
        try:
            print(f"  → Loading {name} from {config['path']}...")
            if not os.path.exists(config['path']):
                print(f"    ⚠️ File not found: {config['path']}")
                MODEL_METADATA[name] = {'available': False, 'error': 'File not found'}
                continue
                
            # Use joblib for bioethanol models, torch for ANN, pickle for others
            if 'bioethanol' in name:
                print(f"    🧪 Using joblib for bioethanol model")
                model = joblib.load(config['path'])
            elif 'ann' in name.lower() or config.get('type') == 'ann':
                print(f"    🤖 Loading ANN model (pickle)")
                # ANN models are saved as pickle containing the class
                with open(config['path'], 'rb') as f:
                    model = pickle.load(f)
            else:
                print(f"    📦 Using pickle.load")
                with open(config['path'], 'rb') as f:
                    model = pickle.load(f)
            
            # Store the loaded model
            LOADED_MODELS[name] = {'model': model, 'config': config}
            MODEL_METADATA[name] = {'available': True, 'accuracy': config.get('accuracy', 0)}
            print(f"  ✅ Successfully loaded: {name}")
        except Exception as e:
            print(f"  ❌ ERROR loading {name}: {str(e)[:100]}")
            MODEL_METADATA[name] = {'available': False, 'error': str(e)}
            import traceback
            traceback.print_exc()

load_models()

# Store recent samples for each dataset
RECENT_INDICES = {name: 0 for name in DATASETS.keys()}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'loaded_models': list(LOADED_MODELS.keys()),
        'datasets': {name: len(df) for name, df in DATASETS.items()},
        'model_details': MODEL_METADATA
    })

@app.route('/api/models', methods=['GET'])
def get_models():
    """Get available models"""
    return jsonify({'models': MODEL_METADATA, 'default': 'realistic_v3_iot'})

@app.route('/api/realtime/<model_name>', methods=['GET'])
def realtime_predict(model_name):
    """Get prediction using REAL data from the dataset"""
    try:
        if model_name not in LOADED_MODELS:
            return jsonify({
                'error': f'Model {model_name} not found',
                'available': list(LOADED_MODELS.keys())
            }), 400
        
        config = MODEL_CONFIG[model_name]
        model_data = LOADED_MODELS[model_name]
        dataset_name = config['dataset']
        
        if dataset_name not in DATASETS:
            return jsonify({'error': f'Dataset {dataset_name} not available'}), 400
        
        df = DATASETS[dataset_name]
        features_info = DATASET_FEATURES[dataset_name]
        feature_cols = features_info['features']
        target_col = features_info['target']
        
        # Get next sample from dataset (round-robin)
        idx = RECENT_INDICES[dataset_name] % len(df)
        RECENT_INDICES[dataset_name] += 1
        
        sample = df.iloc[idx]
        
        # Extract features - handle numeric and categorical columns
        features = {}
        categorical_cols = ['nitrogen_source', 'catalyst_type']
        for col in feature_cols:
            if col in sample:
                if col in categorical_cols:
                    features[col] = str(sample[col])  # Keep categorical as string
                else:
                    features[col] = float(sample[col])  # Numeric columns
        
        # Get actual label
        actual_label = None
        if target_col in sample:
            try:
                actual_label = float(sample[target_col])
            except:
                actual_label = str(sample[target_col])
        
        # Create DataFrame for prediction with correct column order
        if model_name == 'realistic_v3_iot':
            # For realistic_v3: vibration, acoustic, temperature, current, IMF_1, IMF_2, IMF_3, random_noise_1, random_noise_2
            input_df = pd.DataFrame({
                'vibration': [features.get('vibration', 0)],
                'acoustic': [features.get('acoustic', 0)],
                'temperature': [features.get('temperature', 0)],
                'current': [features.get('current', 0)],
                'IMF_1': [features.get('IMF_1', 0)],
                'IMF_2': [features.get('IMF_2', 0)],
                'IMF_3': [features.get('IMF_3', 0)],
                'random_noise_1': [np.random.normal(0, 1)],
                'random_noise_2': [np.random.normal(0, 1)]
            })
        elif model_name == 'tpot_auto_ml':
            # For TPOT: only 7 features, no random noise
            input_df = pd.DataFrame({
                'vibration': [features.get('vibration', 0)],
                'acoustic': [features.get('acoustic', 0)],
                'temperature': [features.get('temperature', 0)],
                'current': [features.get('current', 0)],
                'IMF_1': [features.get('IMF_1', 0)],
                'IMF_2': [features.get('IMF_2', 0)],
                'IMF_3': [features.get('IMF_3', 0)]
            })
        else:
            input_df = pd.DataFrame({k: [v] for k, v in features.items()})
        
        # Make prediction
        model_obj = model_data.get('model', model_data) if isinstance(model_data, dict) else model_data
        
        if config['type'] == 'ann':
            # ANN prediction - get scaler from model_data or create new one
            scaler = model_data.get('scaler')
            if scaler is None:
                # Create scaler and fit it on the dataset for proper scaling
                scaler = StandardScaler()
                dataset_df = DATASETS[config['dataset']]
                dataset_features = DATASET_FEATURES[config['dataset']]['features']
                scaler.fit(dataset_df[dataset_features].values)
                # Store it for future use
                model_data['scaler'] = scaler
            # Scale the input
            X_scaled = scaler.transform(input_df.values)
            
            # Extract the actual ANN model from dictionary if needed
            actual_model = model_obj
            if isinstance(model_obj, dict):
                # Try to find the model in the dictionary
                for key, value in model_obj.items():
                    if hasattr(value, 'eval') and hasattr(value, 'forward'):
                        actual_model = value
                        break
                else:
                    # If no model found, use the dict itself (might be the model)
                    actual_model = model_obj
            
            X_tensor = torch.tensor(X_scaled, dtype=torch.float32)
            actual_model.eval()
            with torch.no_grad():
                output = actual_model(X_tensor).squeeze()
                probability = float(output.numpy())
                prediction = 1 if probability > 0.5 else 0
        elif 'bioethanol' in model_name:
            # Bioethanol model - handle categorical encoding
            input_df = pd.DataFrame([features])
            
            # Encode categorical columns and rename to match scaler expectations
            if 'nitrogen_source' in input_df.columns and 'nitrogen_source' in BIOETHANOL_ENCODERS:
                val = input_df['nitrogen_source'].iloc[0]
                if val in BIOETHANOL_ENCODERS['nitrogen_source'].classes_:
                    input_df['nitrogen_source_encoded'] = BIOETHANOL_ENCODERS['nitrogen_source'].transform([val])[0]
                else:
                    input_df['nitrogen_source_encoded'] = 0
                input_df = input_df.drop('nitrogen_source', axis=1)
            
            if 'catalyst_type' in input_df.columns and 'catalyst_type' in BIOETHANOL_ENCODERS:
                val = input_df['catalyst_type'].iloc[0]
                if val in BIOETHANOL_ENCODERS['catalyst_type'].classes_:
                    input_df['catalyst_type_encoded'] = BIOETHANOL_ENCODERS['catalyst_type'].transform([val])[0]
                else:
                    input_df['catalyst_type_encoded'] = 0
                input_df = input_df.drop('catalyst_type', axis=1)
            
            # Scale features
            if BIOETHANOL_SCALER:
                input_scaled = BIOETHANOL_SCALER.transform(input_df)
                prediction = model_obj.predict(input_scaled)[0]
            else:
                prediction = model_obj.predict(input_df)[0]
            
            # For classification, get probability
            probability = None
            if hasattr(model_obj, 'predict_proba'):
                probability = float(model_obj.predict_proba(input_scaled if BIOETHANOL_SCALER else input_df)[0][1])
        else:
            # Sklearn prediction
            prediction = model_obj.predict(input_df)[0]
            probability = None
            if hasattr(model_obj, 'predict_proba'):
                probability = float(model_obj.predict_proba(input_df)[0][1])
        
        # Risk level
        risk_level = 'LOW'
        if prediction == 1:
            risk_level = 'HIGH' if probability and probability > 0.8 else 'MEDIUM'
        
        return jsonify({
            'machine_id': f'MCH-{df.iloc[idx].get("machine_id", idx)}',
            'timestamp': datetime.now().isoformat(),
            'model': model_name,
            'model_description': config['description'],
            'dataset': dataset_name,
            'sample_index': idx,
            'features': features,
            'actual_label': actual_label,
            'prediction': int(prediction),
            'prediction_correct': actual_label is not None and int(prediction) == actual_label,
            'failure_predicted': bool(prediction == 1),
            'probability': round(probability, 4) if probability else None,
            'risk_level': risk_level,
            'recommendation': 'Schedule maintenance' if prediction == 1 else 'Continue monitoring'
        })
        
    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"❌ Error in realtime_predict for {model_name}: {error_msg}")
        print(traceback.format_exc())
        return jsonify({
            'error': error_msg,
            'model': model_name,
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/predict/<model_name>', methods=['POST'])
def predict_with_model(model_name):
    """Make prediction with custom input"""
    try:
        if model_name not in LOADED_MODELS:
            return jsonify({'error': f'Model {model_name} not found'}), 400
        
        data = request.get_json()
        features = data.get('features', {})
        
        config = MODEL_CONFIG[model_name]
        model_data = LOADED_MODELS[model_name]
        dataset_name = config['dataset']
        features_info = DATASET_FEATURES[dataset_name]
        feature_cols = features_info['features']
        
        # Build input DataFrame
        input_data = {}
        for col in feature_cols:
            input_data[col] = [features.get(col, 0.0)]
        
        # Add noise for realistic_v3_iot
        if model_name == 'realistic_v3_iot':
            input_data['random_noise_1'] = [np.random.normal(0, 1)]
            input_data['random_noise_2'] = [np.random.normal(0, 1)]
        
        df = pd.DataFrame(input_data)
        
        # Predict
        model_obj = model_data.get('model', model_data) if isinstance(model_data, dict) else model_data
        
        if config['type'] == 'ann':
            # ANN prediction - get scaler from model_data or create new one
            scaler = model_data.get('scaler')
            if scaler is None:
                # Create scaler and fit it on the dataset for proper scaling
                scaler = StandardScaler()
                dataset_df = DATASETS[config['dataset']]
                scaler.fit(dataset_df[config['features']].values)
                # Store it for future use
                model_data['scaler'] = scaler
            # Scale the input
            X_scaled = scaler.transform(df.values)
            
            # Extract the actual ANN model from dictionary if needed
            actual_model = model_obj
            if isinstance(model_obj, dict):
                # Try to find the model in the dictionary
                for key, value in model_obj.items():
                    if hasattr(value, 'eval') and hasattr(value, 'forward'):
                        actual_model = value
                        break
                else:
                    # If no model found, use the dict itself (might be the model)
                    actual_model = model_obj
            
            X_tensor = torch.tensor(X_scaled, dtype=torch.float32)
            actual_model.eval()
            with torch.no_grad():
                output = actual_model(X_tensor).squeeze()
                probability = float(output.numpy())
                prediction = 1 if probability > 0.5 else 0
        elif config['type'] == 'bioethanol':
            # Handle categorical encoding for bioethanol models
            input_df = pd.DataFrame(input_data)
            
            # Encode categorical columns
            if 'nitrogen_source' in input_df.columns and 'nitrogen_source' in BIOETHANOL_ENCODERS:
                val = input_df['nitrogen_source'].iloc[0]
                if val in BIOETHANOL_ENCODERS['nitrogen_source'].classes_:
                    input_df['nitrogen_source'] = BIOETHANOL_ENCODERS['nitrogen_source'].transform([val])[0]
                else:
                    input_df['nitrogen_source'] = 0
            
            if 'catalyst_type' in input_df.columns and 'catalyst_type' in BIOETHANOL_ENCODERS:
                val = input_df['catalyst_type'].iloc[0]
                if val in BIOETHANOL_ENCODERS['catalyst_type'].classes_:
                    input_df['catalyst_type'] = BIOETHANOL_ENCODERS['catalyst_type'].transform([val])[0]
                else:
                    input_df['catalyst_type'] = 0
            
            # Scale features
            if BIOETHANOL_SCALER:
                input_scaled = BIOETHANOL_SCALER.transform(input_df)
                prediction = model_obj.predict(input_scaled)[0]
            else:
                prediction = model_obj.predict(input_df)[0]
            
            # For classification, get probability
            probability = None
            if hasattr(model_obj, 'predict_proba'):
                probability = float(model_obj.predict_proba(input_scaled if BIOETHANOL_SCALER else input_df)[0][1])
        else:
            prediction = model_obj.predict(df)[0]
            probability = None
            if hasattr(model_obj, 'predict_proba'):
                probability = float(model_obj.predict_proba(df)[0][1])
        
        risk_level = 'LOW'
        if prediction == 1:
            risk_level = 'HIGH' if probability and probability > 0.8 else 'MEDIUM'
        
        return jsonify({
            'model': model_name,
            'features_used': list(features.keys()),
            'prediction': int(prediction),
            'failure_predicted': bool(prediction == 1),
            'probability': probability,
            'risk_level': risk_level,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/datasets/<dataset_name>/random', methods=['GET'])
def get_random_sample(dataset_name):
    """Get a random sample from dataset"""
    try:
        if dataset_name not in DATASETS:
            return jsonify({'error': 'Dataset not found'}), 404
        
        df = DATASETS[dataset_name]
        sample = df.sample(n=1).iloc[0].to_dict()
        
        return jsonify({
            'dataset': dataset_name,
            'sample': sample,
            'total_rows': len(df)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 BIOPULSE ELITE Backend - REAL DATA VERSION")
    
    # Load datasets first
    load_datasets()
    print(f"� Datasets: {list(DATASETS.keys())}")
    
    # Load all models
    load_models()
    print(f"� Loaded models: {list(LOADED_MODELS.keys())}")
    
    # Load bioethanol preprocessors
    if load_bioethanol_preprocessors():
        print("✅ Bioethanol preprocessors loaded successfully")
    
    app.run(host='0.0.0.0', port=5005, debug=True)
