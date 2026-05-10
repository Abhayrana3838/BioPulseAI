# BIOPULSE ELITE - Comprehensive ML Deployment Platform

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Machine Learning Models](#machine-learning-models)
4. [Backend API](#backend-api)
5. [Frontend Dashboard](#frontend-dashboard)
6. [Datasets](#datasets)
7. [Installation & Setup](#installation--setup)
8. [Configuration](#configuration)
9. [API Documentation](#api-documentation)
10. [Deployment Guide](#deployment-guide)
11. [Troubleshooting](#troubleshooting)
12. [Future Enhancements](#future-enhancements)

---

## Project Overview

BIOPULSE ELITE is a comprehensive machine learning deployment platform that integrates multiple predictive models with real-time dashboard visualizations. The platform serves as an end-to-end solution for industrial predictive maintenance, bioethanol production optimization, and fleet logistics management.

### Key Features
- **5 ML Models**: Smart Manufacturing ANN, IoT Sensor Model, TPOT AutoML, Bioethanol Regression & Classification
- **Real-time Predictions**: Live model inference with streaming data
- **Interactive Dashboards**: Maintenance SOPs, ML Models, Fleet Logistics
- **Cinematic UI**: Movie-like animations and real-time data visualization
- **RESTful API**: Scalable backend with Flask
- **Environment Configuration**: Secure API key management

### Technology Stack
- **Backend**: Python 3.9, Flask, scikit-learn 1.6.1, PyTorch, pandas, joblib
- **Frontend**: React, JavaScript, HTML5 Canvas, CSS3
- **Databases**: CSV datasets with real-time streaming simulation
- **APIs**: Google Maps, OpenAI GPT-4o integration
- **Deployment**: Local development server, ready for cloud deployment

---

## Architecture

### System Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   ML Models     │
│                 │    │                 │    │                 │
│ • React Dashboards│◄──►│ • Flask API     │◄──►│ • ANN Models     │
│ • Real-time UI   │    │ • Data Processing│    │ • sklearn Models │
│ • API Integration│    │ • Model Loading  │    │ • Bioethanol     │
│ • Google Maps    │    │ • Predictions    │    │ • TPOT Pipeline  │
│ • OpenAI Chat    │    │ • CORS Support   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Interface│    │   Data Storage  │    │ External APIs   │
│                 │    │                 │    │                 │
│ • Maintenance SOP│    │ • CSV Datasets  │    │ • Google Maps   │
│ • ML Models View │    │ • Model Files   │    │ • OpenAI API    │
│ • Fleet Logistics│    │ • Preprocessors │    │ • Weather Data  │
│ • Real-time Data │    │ • Configuration │    │ • Traffic APIs   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. **Data Ingestion**: CSV datasets loaded into memory
2. **Real-time Streaming**: Simulated live data feeds
3. **Model Inference**: Real-time predictions on streaming data
4. **API Communication**: RESTful endpoints for frontend
5. **Visualization**: Interactive dashboard updates

---

## Machine Learning Models

### 1. Smart Manufacturing ANN (Artificial Neural Network)
- **Model Type**: PyTorch Neural Network
- **Purpose**: Predictive maintenance for smart manufacturing
- **Features**: 7 input features (temperature, vibration, humidity, pressure, energy_consumption, machine_status, anomaly_flag)
- **Architecture**: 
  - Input layer: 7 neurons
  - Hidden layer: 4 neurons
  - Output layer: 1 neuron (binary classification)
- **Performance**: 
  - Training accuracy: 92.97%
  - Test accuracy: 98.39%
  - Final training loss: 0.1563
- **Dataset**: 100,000 samples from smart manufacturing sensors
- **Target Variable**: anomaly_flag (binary: 0/1)
- **File Location**: `/models/ann_maintenance_model.pkl`

### 2. IoT Sensor Model (Realistic v3)
- **Model Type**: sklearn Pipeline (RandomForest + DecisionTree)
- **Purpose**: IoT sensor failure prediction
- **Features**: 9 features including IMF components and random noise
- **Features List**: vibration, acoustic, temperature, current, IMF_1, IMF_2, IMF_3, random_noise_1, random_noise_2
- **Dataset**: 1,800 IoT sensor readings
- **Target Variable**: label (failure prediction)
- **File Location**: `/models/realistic_maintenance_model_v3.pkl`

### 3. TPOT AutoML Model
- **Model Type**: Automated Machine Learning Pipeline
- **Purpose**: Optimized failure prediction using genetic algorithms
- **Features**: 7 IoT sensor features
- **Features List**: vibration, acoustic, temperature, current, IMF_1, IMF_2, IMF_3
- **Algorithm**: GaussianNB (optimized by TPOT)
- **Dataset**: 1,800 IoT sensor readings
- **Target Variable**: label
- **File Location**: `/models/tpot_best_model.pkl`

### 4. Bioethanol Regression Model
- **Model Type**: Linear Regression
- **Purpose**: Predict bioethanol growth rate
- **Features**: 8 fermentation parameters
- **Features List**: temperature, ph, substrate_concentration, fermentation_time, yeast_concentration, oxygen_level, nitrogen_source, catalyst_type
- **Categorical Features**: nitrogen_source, catalyst_type (label encoded)
- **Dataset**: 100 bioethanol production samples
- **Target Variable**: growth_rate (continuous)
- **File Location**: `/bioethanol_ml_deployment/models/best_regression_model.pkl`

### 5. Bioethanol Classification Model
- **Model Type**: Gradient Boosting Classifier
- **Purpose**: Classify bioethanol growth category (Low/Medium/High)
- **Features**: Same as regression model
- **Target Variable**: growth_category (categorical)
- **Dataset**: 100 bioethanol production samples
- **File Location**: `/bioethanol_ml_deployment/models/best_classification_model.pkl`

### Model Performance Summary
| Model | Accuracy | Dataset Size | Features | Target Type |
|-------|----------|--------------|----------|-------------|
| Smart Manufacturing ANN | 98.39% | 100,000 | 7 | Binary |
| IoT Sensor Model | ~95% | 1,800 | 9 | Binary |
| TPOT AutoML | ~92% | 1,800 | 7 | Binary |
| Bioethanol Regression | R²: ~0.85 | 100 | 8 | Continuous |
| Bioethanol Classification | ~90% | 100 | 8 | Categorical |

---

## Backend API

### API Architecture
- **Framework**: Flask with CORS support
- **Port**: 5005 (configurable)
- **Authentication**: None (development mode)
- **Data Format**: JSON
- **Error Handling**: Comprehensive error responses

### API Endpoints

#### Health Check
```
GET /api/health
```
**Response**: System status, loaded models, dataset information

#### Model Information
```
GET /api/models
```
**Response**: List of all available models with metadata

#### Real-time Predictions
```
GET /api/realtime/{model_name}
```
**Parameters**: 
- `model_name`: ann_smart_manufacturing, realistic_v3_iot, tpot_auto_ml, bioethanol_regression, bioethanol_classification

**Response**: 
```json
{
  "model": "ann_smart_manufacturing",
  "prediction": 0,
  "probability": 0.0934,
  "failure_predicted": false,
  "actual_label": 0.0,
  "features": {...},
  "machine_id": "MCH-40",
  "timestamp": "2026-05-10T20:25:58.141917"
}
```

#### Dataset Samples
```
GET /api/datasets/{dataset_name}/sample
```
**Response**: Sample data from specified dataset

#### Batch Predictions
```
POST /api/predict/batch
```
**Body**: 
```json
{
  "model": "model_name",
  "samples": [...]
}
```

### Model Loading System
The backend implements a sophisticated model loading system:

```python
MODEL_CONFIG = {
    'ann_smart_manufacturing': {
        'path': '/path/to/model.pkl',
        'dataset': 'smart_manufacturing',
        'type': 'ann',
        'description': 'Smart Manufacturing ANN'
    },
    # ... other models
}
```

### Data Preprocessing
- **ANN Models**: StandardScaler fitted on dataset
- **sklearn Models**: Pipeline includes preprocessing
- **Bioethanol Models**: Label encoding for categorical features
- **Real-time Scaling**: Dynamic feature scaling for live predictions

---

## Frontend Dashboard

### Dashboard Components

#### 1. Maintenance SOPs Dashboard
- **Purpose**: Real-time maintenance procedures with ML integration
- **Features**:
  - Live model predictions
  - SOP document viewer
  - Risk assessment
  - Machine status monitoring
  - Cinematic animations
  - Real-time data ticker

#### 2. ML Models Dashboard
- **Purpose**: Monitor all ML model performance
- **Features**:
  - Real-time predictions from all models
  - Model accuracy metrics
  - Feature importance visualization
  - Prediction history
  - Model comparison

#### 3. Fleet Logistics Dashboard
- **Purpose**: Fleet management with AI optimization
- **Features**:
  - Real-time truck tracking
  - Google Maps integration
  - AI route optimization (OpenAI)
  - Fuel monitoring
  - Driver communication
  - Maintenance scheduling

### UI/UX Features
- **Cinematic Animations**: Movie-like transitions and effects
- **Real-time Updates**: Live data streaming
- **Responsive Design**: Adapts to different screen sizes
- **Dark Theme**: Industrial aesthetic
- **Interactive Elements**: Hover effects, micro-interactions

### Component Architecture
```
src/
├── App.jsx                 # Main application router
├── MaintenanceSOPsDashboard.jsx  # Maintenance dashboard
├── FleetLogisticsDashboard.jsx   # Fleet management
├── api_fixed.js           # API service layer
├── .env                   # Environment variables
└── components/
    ├── ModelViewer.jsx    # Model visualization
    ├── SOPViewer.jsx      # SOP documents
    └── TruckTracker.jsx   # Fleet tracking
```

---

## Datasets

### 1. Smart Manufacturing Dataset
- **File**: `smart_manufacturing_data.csv`
- **Size**: 100,000 rows × 13 columns
- **Features**:
  - temperature, vibration, humidity, pressure
  - energy_consumption, machine_status, anomaly_flag
  - predicted_remaining_life, failure_type, downtime_risk
  - maintenance_required
- **Target**: anomaly_flag (for ANN model)
- **Data Quality**: Clean, no missing values
- **Update Frequency**: Simulated real-time

### 2. IoT Sensors Dataset
- **File**: `predictive_maintenance_dataset (1).csv`
- **Size**: 1,800 rows × 8 columns
- **Features**:
  - vibration, acoustic, temperature, current
  - IMF_1, IMF_2, IMF_3 (Intrinsic Mode Functions)
  - label (target)
- **Purpose**: IoT sensor failure prediction
- **Characteristics**: Time-series data with IMF decomposition

### 3. Metrics Dataset
- **File**: `predictive_maintenance_dataset.csv`
- **Size**: 124,494 rows × 10 columns
- **Features**: metric1-metric9, failure
- **Purpose**: General predictive maintenance

### 4. Bioethanol Dataset
- **File**: `bioethanol_ml_deployment/data/sample_data.csv`
- **Size**: 100 rows × 9 columns
- **Features**:
  - temperature, ph, substrate_concentration
  - fermentation_time, yeast_concentration, oxygen_level
  - nitrogen_source, catalyst_type (categorical)
  - growth_rate (target)
- **Purpose**: Bioethanol production optimization

### Data Preprocessing Pipeline
1. **Loading**: CSV files loaded with pandas
2. **Cleaning**: Handle missing values, outliers
3. **Encoding**: Label encoding for categorical features
4. **Scaling**: StandardScaler for numerical features
5. **Feature Engineering**: IMF components, interaction terms
6. **Splitting**: Train/test split for model validation

---

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 14+
- npm or yarn
- Git

### Backend Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd internship project
```

2. **Create Python Virtual Environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Install Specific Versions**
```bash
pip install scikit-learn==1.6.1
pip install torch torchvision
pip install flask flask-cors
pip install pandas numpy joblib
```

### Frontend Setup

1. **Install Node Dependencies**
```bash
cd frontend
npm install
```

2. **Environment Configuration**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your API keys
nano .env
```

3. **Environment Variables**
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

### Running the Application

1. **Start Backend**
```bash
cd backend
python3 app_real_data.py
```
Backend runs on: `http://localhost:5005`

2. **Start Frontend**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:8080`

3. **Access Application**
Open browser: `http://localhost:8080`

---

## Configuration

### Backend Configuration

#### Model Configuration (`app_real_data.py`)
```python
MODEL_CONFIG = {
    'ann_smart_manufacturing': {
        'path': '/path/to/ann_maintenance_model.pkl',
        'dataset': 'smart_manufacturing',
        'type': 'ann',
        'description': 'Smart Manufacturing ANN'
    },
    # ... other models
}
```

#### Dataset Configuration
```python
dataset_configs = [
    {
        'name': 'smart_manufacturing',
        'path': '/path/to/smart_manufacturing_data.csv',
        'features': ['temperature', 'vibration', ...],
        'target': 'anomaly_flag'
    },
    # ... other datasets
]
```

### Frontend Configuration

#### API Configuration (`api_fixed.js`)
```javascript
const API_BASE_URL = 'http://localhost:5005/api';

export const MODEL_CONFIG = {
    'ann_smart_manufacturing': {
        name: 'Smart Manufacturing ANN',
        description: 'Predicts maintenance needs...',
        features: ['temperature', 'vibration', ...],
        dataset: 'smart_manufacturing',
        icon: '🏭',
        color: '#00F5FF'
    },
    // ... other models
};
```

#### Environment Variables
- `REACT_APP_GOOGLE_MAPS_API_KEY`: Google Maps JavaScript API key
- `REACT_APP_OPENAI_API_KEY`: OpenAI API key for GPT-4o

### Port Configuration
- Backend: 5005 (configurable in `app_real_data.py`)
- Frontend: 8080 (configurable in `package.json`)

---

## API Documentation

### Authentication
Currently no authentication required (development mode).

### Response Format
All API responses follow this structure:
```json
{
    "data": {...},
    "error": null,
    "timestamp": "2026-05-10T20:25:58.141917"
}
```

### Error Handling
```json
{
    "error": "Error description",
    "traceback": "Full error stack trace",
    "model": "model_name"
}
```

### Rate Limiting
No rate limiting implemented (development mode).

### CORS Configuration
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8080"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})
```

---

## Deployment Guide

### Local Development
1. Follow installation instructions
2. Run both backend and frontend
3. Access at `http://localhost:8080`

### Production Deployment

#### Backend Deployment (Docker)
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5005

CMD ["python", "app_real_data.py"]
```

#### Frontend Deployment (Docker)
```dockerfile
FROM node:14-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5005:5005"
    environment:
      - FLASK_ENV=production
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Cloud Deployment Options
- **AWS**: EC2 + S3 + RDS
- **Google Cloud**: App Engine + Cloud SQL
- **Azure**: App Service + Azure SQL
- **Heroku**: Dyno + Heroku Postgres

### Environment-Specific Configurations
- Development: Debug mode, verbose logging
- Staging: Production-like environment
- Production: Optimized, secure, monitored

---

## Troubleshooting

### Common Issues

#### 1. Model Loading Errors
**Problem**: `No module named '_loss'` or sklearn version errors
**Solution**: 
```bash
pip install --upgrade scikit-learn==1.6.1
```

#### 2. Frontend Connection Issues
**Problem**: 400 Bad Request errors
**Solution**: Check API_BASE_URL in `api_fixed.js` matches backend port

#### 3. ANN Model Prediction Errors
**Problem**: `'dict' object has no attribute 'eval'`
**Solution**: Model loading fixed in latest version

#### 4. CORS Errors
**Problem**: Cross-origin requests blocked
**Solution**: Ensure CORS is properly configured in backend

#### 5. Environment Variables Not Loading
**Problem**: API keys not working
**Solution**: Restart frontend after updating .env file

### Debug Mode
Enable debug mode in backend:
```python
app.run(debug=True, port=5005)
```

### Logging
Backend logs show:
- Model loading status
- API requests
- Prediction results
- Error details

### Performance Optimization
- Use model caching
- Implement request batching
- Add database for large datasets
- Use Redis for session management

---

## Future Enhancements

### Short Term (1-3 months)
1. **Model Improvements**
   - Add more ML models (XGBoost, LightGBM)
   - Implement model versioning
   - Add A/B testing framework

2. **Feature Enhancements**
   - Real-time alert system
   - Email notifications
   - Mobile responsive design
   - Data export functionality

3. **Infrastructure**
   - Database integration (PostgreSQL)
   - Redis caching
   - Load balancing
   - Monitoring dashboard

### Medium Term (3-6 months)
1. **Advanced Analytics**
   - Time series forecasting
   - Anomaly detection
   - Root cause analysis
   - Predictive scheduling

2. **Integration**
   - ERP system integration
   - IoT device connectivity
   - Third-party APIs
   - Webhook support

3. **Security**
   - User authentication
   - Role-based access control
   - API rate limiting
   - Data encryption

### Long Term (6-12 months)
1. **AI/ML Advanced**
   - Deep learning models
   - Reinforcement learning
   - AutoML pipeline
   - Model interpretability

2. **Scalability**
   - Microservices architecture
   - Kubernetes deployment
   - Multi-cloud support
   - Edge computing

3. **Business Intelligence**
   - Advanced reporting
   - Business metrics
   - KPI tracking
   - Executive dashboards

### Technology Roadmap
- **Q1 2026**: Model optimization, database integration
- **Q2 2026**: Mobile app, advanced analytics
- **Q3 2026**: Microservices, cloud deployment
- **Q4 2026**: AI integration, enterprise features

---

## Contributing

### Development Guidelines
1. Follow PEP 8 for Python code
2. Use ESLint for JavaScript
3. Write unit tests for new features
4. Document API changes
5. Update README for new features

### Git Workflow
1. Create feature branch
2. Make changes with commits
3. Create pull request
4. Code review
5. Merge to main

### Code Structure
```
project/
├── backend/
│   ├── app_real_data.py      # Main Flask app
│   ├── models/               # ML model files
│   └── data/                 # Dataset files
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.jsx          # Main app
│   │   └── api_fixed.js     # API service
│   ├── public/
│   └── package.json
└── docs/                     # Documentation
```

---

## License

This project is proprietary and confidential. All rights reserved.

---

## Contact

For questions or support, please contact:
- Email: support@biopulse.com
- Documentation: See this README
- Issues: Create GitHub issue

---

## Appendix

### A. Model Performance Metrics
[Detailed performance metrics for all models]

### B. API Schema
[Complete API schema documentation]

### C. Database Schema
[Database structure and relationships]

### D. Security Considerations
[Security best practices and guidelines]

### E. Performance Benchmarks
[System performance metrics and optimization]

---

*Last Updated: May 10, 2026*
*Version: 1.0.0*
*Author: BIOPULSE ELITE Team*
