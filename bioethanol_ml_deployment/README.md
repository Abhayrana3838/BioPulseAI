# Bioethanol Growth Prediction - ML Deployment Package

## Overview
This package contains trained machine learning models for bioethanol growth prediction.

## Best Models
- **Regression**: Linear Regression
- **Classification**: Gradient Boosting

## Package Contents
```
bioethanol_ml_deployment/
├── models/                    # Trained models
│   ├── best_regression_model.pkl
│   └── best_classification_model.pkl
├── preprocessors/             # Data preprocessing objects
│   ├── scaler.pkl
│   └── label_encoders.pkl
├── data/                      # Data information
│   ├── data_info.json
│   └── sample_data.csv
├── results/                   # Performance results
│   ├── regression_results.csv
│   └── classification_results.csv
├── predict.py                 # Prediction script
└── README.md                 # This file
```

## Usage

### 1. Load the deployment package
```python
from predict import predict_bioethanol_growth
import pandas as pd

# Load your new data
new_data = pd.read_csv('your_new_data.csv')

# Make predictions
results = predict_bioethanol_growth(new_data)
```

### 2. Prediction Results
The prediction function returns a dictionary with:
- `growth_rate_prediction`: Continuous growth rate values
- `growth_category_prediction`: Binary classification (0=Low, 1=High)
- `growth_category_probabilities`: Class probabilities (if available)

### 3. Required Features
The model expects the following features:
- temperature
- ph
- substrate_concentration
- fermentation_time
- yeast_concentration
- oxygen_level
- nitrogen_source_encoded
- catalyst_type_encoded

## Performance
Check the `results/` directory for detailed performance metrics.

## Created
2026-05-10 16:31:09
