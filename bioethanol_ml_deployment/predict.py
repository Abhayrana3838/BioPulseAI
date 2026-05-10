#!/usr/bin/env python3
"""
Bioethanol Growth Prediction - Deployment Script
"""

import joblib
import pandas as pd
import numpy as np
import json
import warnings
warnings.filterwarnings('ignore')

def load_deployment_package(deployment_dir='bioethanol_ml_deployment'):
    """Load all deployment components"""
    
    # Load models
    reg_model = joblib.load(f'{deployment_dir}/models/best_regression_model.pkl')
    clf_model = joblib.load(f'{deployment_dir}/models/best_classification_model.pkl')
    
    # Load preprocessors
    scaler = joblib.load(f'{deployment_dir}/preprocessors/scaler.pkl')
    label_encoders = joblib.load(f'{deployment_dir}/preprocessors/label_encoders.pkl')
    
    # Load data info
    with open(f'{deployment_dir}/data/data_info.json', 'r') as f:
        data_info = json.load(f)
    
    return {
        'reg_model': reg_model,
        'clf_model': clf_model,
        'scaler': scaler,
        'label_encoders': label_encoders,
        'data_info': data_info
    }

def preprocess_new_data(new_data, components):
    """Preprocess new data for prediction"""
    
    data = new_data.copy()
    label_encoders = components['label_encoders']
    scaler = components['scaler']
    
    # Encode categorical variables
    for col, le in label_encoders.items():
        if col in data.columns:
            # Handle unseen categories
            unique_values = set(data[col].unique()) - set(le.classes_)
            if unique_values:
                print(f"Warning: Unseen categories in {col}: {unique_values}")
                # Map unseen to most frequent or a default value
                data[col] = data[col].apply(lambda x: x if x in le.classes_ else le.classes_[0])
            
            data[col + '_encoded'] = le.transform(data[col])
    
    # Drop original categorical columns
    categorical_cols = list(label_encoders.keys())
    data = data.drop(columns=categorical_cols, errors='ignore')
    
    # Ensure all required columns are present
    required_cols = components['data_info']['feature_columns']
    for col in required_cols:
        if col not in data.columns:
            data[col] = 0  # Default value for missing columns
    
    # Scale features
    data[required_cols] = scaler.transform(data[required_cols])
    
    return data[required_cols]

def predict_bioethanol_growth(new_data, deployment_dir='bioethanol_ml_deployment'):
    """Make predictions on new data"""
    
    # Load components
    components = load_deployment_package(deployment_dir)
    
    # Preprocess data
    X_processed = preprocess_new_data(new_data, components)
    
    # Make predictions
    regression_pred = components['reg_model'].predict(X_processed)
    classification_pred = components['clf_model'].predict(X_processed)
    
    # Get classification probabilities if available
    if hasattr(components['clf_model'], 'predict_proba'):
        classification_proba = components['clf_model'].predict_proba(X_processed)
    else:
        classification_proba = None
    
    return {
        'growth_rate_prediction': regression_pred,
        'growth_category_prediction': classification_pred,
        'growth_category_probabilities': classification_proba,
        'best_regression_model': components['data_info']['best_regression_model'],
        'best_classification_model': components['data_info']['best_classification_model']
    }

if __name__ == "__main__":
    # Example usage
    print("Bioethanol Growth Prediction - Deployment Script")
    print("Load your data and call predict_bioethanol_growth() function")
    print("
Example:")
    print("import pandas as pd")
    print("new_data = pd.read_csv('your_new_data.csv')")
    print("results = predict_bioethanol_growth(new_data)")
    print("print(results)")
