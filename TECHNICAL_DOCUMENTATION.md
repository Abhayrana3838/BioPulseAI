# Technical Documentation - BIOPULSE ELITE

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Machine Learning Models](#machine-learning-models)
3. [API Reference](#api-reference)
4. [Database Schema](#database-schema)
5. [Deployment Guide](#deployment-guide)
6. [Security Configuration](#security-configuration)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## System Architecture

### Overview
BIOPULSE ELITE follows a microservices-inspired architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   ML Models     │
│   (React)       │◄──►│   (Flask)       │◄──►│   (PyTorch/     │
│                 │    │                 │    │    sklearn)     │
│ • Dashboard UI  │    │ • REST Endpoints│    │                 │
│ • Real-time     │    │ • Model Loading │    │ • ANN           │
│ • Visualizations│    │ • Data Processing│    │ • sklearn       │
│ • API Integration│    │ • CORS Support  │    │ • Bioethanol    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Details

#### Frontend Architecture
- **Framework**: React 18 with functional components
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Styling**: CSS-in-JS with dynamic styles
- **API Communication**: Fetch API with error handling
- **Real-time Updates**: Polling every 5 seconds

#### Backend Architecture
- **Framework**: Flask with Flask-CORS
- **Model Loading**: Lazy loading with caching
- **Data Processing**: Pandas for data manipulation
- **Serialization**: Joblib for sklearn, Pickle for PyTorch
- **Error Handling**: Comprehensive exception handling

---

## Machine Learning Models

### Model Loading System

#### Configuration Structure
```python
MODEL_CONFIG = {
    'model_name': {
        'path': '/path/to/model/file',
        'dataset': 'dataset_name',
        'type': 'model_type',  # 'ann', 'sklearn', 'bioethanol'
        'description': 'Human readable description'
    }
}
```

#### Loading Implementation
```python
def load_models():
    """Load all models with appropriate methods"""
    for name, config in MODEL_CONFIG.items():
        try:
            if 'bioethanol' in name:
                model = joblib.load(config['path'])
            elif 'ann' in name.lower():
                with open(config['path'], 'rb') as f:
                    model = pickle.load(f)
            else:
                with open(config['path'], 'rb') as f:
                    model = pickle.load(f)
            
            LOADED_MODELS[name] = {'model': model, 'config': config}
            print(f"✅ Loaded: {name}")
        except Exception as e:
            print(f"❌ Error loading {name}: {e}")
```

### Model-Specific Details

#### 1. Smart Manufacturing ANN
```python
# Model Architecture
class BinaryClassifierANN(nn.Module):
    def __init__(self, input_dim=7, hidden_size=4):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_size)
        self.fc2 = nn.Linear(hidden_size, 1)
        self.dropout = nn.Dropout(0.2)
    
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.dropout(x)
        x = torch.sigmoid(self.fc2(x))
        return x

# Feature Scaling
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)
```

#### 2. Bioethanol Models
```python
# Categorical Encoding
from sklearn.preprocessing import LabelEncoder

le_nitrogen = LabelEncoder()
le_catalyst = LabelEncoder()

X['nitrogen_source_encoded'] = le_nitrogen.fit_transform(X['nitrogen_source'])
X['catalyst_type_encoded'] = le_catalyst.fit_transform(X['catalyst_type'])
```

---

## API Reference

### Authentication
Currently no authentication required (development mode).

### Base URL
```
http://localhost:5005/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-05-10T20:25:58.141917",
  "models_loaded": 5,
  "datasets_loaded": 4
}
```

#### Model Information
```http
GET /api/models
```

**Response:**
```json
{
  "models": {
    "ann_smart_manufacturing": {
      "available": true,
      "type": "ann",
      "description": "Smart Manufacturing ANN",
      "accuracy": 0.9839
    }
  }
}
```

#### Real-time Prediction
```http
GET /api/realtime/{model_name}
```

**Parameters:**
- `model_name`: ann_smart_manufacturing, realistic_v3_iot, tpot_auto_ml, bioethanol_regression, bioethanol_classification

**Response:**
```json
{
  "model": "ann_smart_manufacturing",
  "prediction": 0,
  "probability": 0.0934,
  "failure_predicted": false,
  "actual_label": 0.0,
  "features": {
    "temperature": 78.61,
    "vibration": 28.65,
    "humidity": 79.96,
    "pressure": 3.73,
    "energy_consumption": 2.16,
    "machine_status": 1.0,
    "anomaly_flag": 0.0
  },
  "machine_id": "MCH-40",
  "timestamp": "2026-05-10T20:25:58.141917"
}
```

#### Dataset Sample
```http
GET /api/datasets/{dataset_name}/sample
```

**Parameters:**
- `dataset_name`: smart_manufacturing, iot_sensors, metrics, bioethanol

**Response:**
```json
{
  "dataset": "smart_manufacturing",
  "sample_size": 5,
  "columns": ["temperature", "vibration", ...],
  "data": [...]
}
```

#### Batch Prediction
```http
POST /api/predict/batch
```

**Request Body:**
```json
{
  "model": "ann_smart_manufacturing",
  "samples": [
    {"temperature": 78.61, "vibration": 28.65, ...},
    {"temperature": 68.19, "vibration": 57.28, ...}
  ]
}
```

**Response:**
```json
{
  "predictions": [
    {"prediction": 0, "probability": 0.0934},
    {"prediction": 1, "probability": 0.8456}
  ]
}
```

---

## Database Schema

### Current Data Structure
Currently using in-memory data storage with CSV files.

### Dataset Schemas

#### Smart Manufacturing Dataset
```sql
CREATE TABLE smart_manufacturing (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME,
    machine_id VARCHAR(50),
    temperature FLOAT,
    vibration FLOAT,
    humidity FLOAT,
    pressure FLOAT,
    energy_consumption FLOAT,
    machine_status INTEGER,
    anomaly_flag INTEGER,
    predicted_remaining_life INTEGER,
    failure_type VARCHAR(50),
    downtime_risk FLOAT,
    maintenance_required INTEGER
);
```

#### IoT Sensors Dataset
```sql
CREATE TABLE iot_sensors (
    id INTEGER PRIMARY KEY,
    vibration FLOAT,
    acoustic FLOAT,
    temperature FLOAT,
    current FLOAT,
    IMF_1 FLOAT,
    IMF_2 FLOAT,
    IMF_3 FLOAT,
    label INTEGER
);
```

#### Bioethanol Dataset
```sql
CREATE TABLE bioethanol (
    id INTEGER PRIMARY KEY,
    temperature FLOAT,
    ph FLOAT,
    substrate_concentration FLOAT,
    fermentation_time FLOAT,
    yeast_concentration FLOAT,
    oxygen_level FLOAT,
    nitrogen_source VARCHAR(50),
    catalyst_type VARCHAR(50),
    growth_rate FLOAT
);
```

### Future Database Integration
```python
# PostgreSQL Integration Example
import psycopg2
from psycopg2.extras import RealDictCursor

class DatabaseManager:
    def __init__(self, db_url):
        self.db_url = db_url
    
    def get_connection(self):
        return psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)
    
    def load_dataset(self, table_name):
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT * FROM {table_name}")
                return pd.DataFrame(cur.fetchall())
```

---

## Deployment Guide

### Local Development

#### Prerequisites
```bash
# Python 3.9+
python3 --version

# Node.js 14+
node --version

# npm
npm --version
```

#### Backend Setup
```bash
# Clone repository
git clone <repository-url>
cd internship-project/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install specific versions
pip install scikit-learn==1.6.1
pip install torch torchvision
pip install flask flask-cors pandas numpy joblib

# Run backend
python3 app_real_data.py
```

#### Frontend Setup
```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run frontend
npm run dev
```

### Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 5005

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5005/api/health || exit 1

# Start application
CMD ["python", "app_real_data.py"]
```

#### Frontend Dockerfile
```dockerfile
# Build stage
FROM node:14-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build application
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
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
      - PYTHONPATH=/app
    volumes:
      - ./models:/app/models:ro
      - ./data:/app/data:ro
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5005/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

### Cloud Deployment

#### AWS Deployment
```yaml
# ECS Task Definition
{
  "family": "biopulse-elite",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/biopulse-backend:latest",
      "portMappings": [
        {
          "containerPort": 5005,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "FLASK_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/biopulse-elite",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Kubernetes Deployment
```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: biopulse-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: biopulse-backend
  template:
    metadata:
      labels:
        app: biopulse-backend
    spec:
      containers:
      - name: backend
        image: biopulse/backend:latest
        ports:
        - containerPort: 5005
        env:
        - name: FLASK_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5005
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5005
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: biopulse-backend-service
spec:
  selector:
    app: biopulse-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5005
  type: LoadBalancer
```

---

## Security Configuration

### Environment Variables
```bash
# .env file
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_OPENAI_API_KEY=your_openai_api_key

# Backend environment
FLASK_ENV=production
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://user:password@localhost/biopulse
```

### CORS Configuration
```python
from flask_cors import CORS

# Production CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://yourdomain.com"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
```

### API Security
```python
from functools import wraps
import jwt

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(*args, **kwargs)
    return decorated

@app.route('/api/secure-endpoint')
@require_auth
def secure_endpoint():
    return jsonify({'message': 'Access granted'})
```

### Input Validation
```python
from marshmallow import Schema, fields, validate

class PredictionSchema(Schema):
    model = fields.Str(required=True, validate=validate.OneOf(MODEL_CONFIG.keys()))
    features = fields.Dict(required=True)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = PredictionSchema().load(request.json)
        # Process prediction
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
```

---

## Performance Optimization

### Caching Strategy
```python
from functools import lru_cache
import redis

# Redis caching
redis_client = redis.Redis(host='localhost', port=6379, db=0)

@lru_cache(maxsize=128)
def get_model_prediction(model_name, features_hash):
    # Cache model predictions
    cache_key = f"prediction:{model_name}:{features_hash}"
    cached_result = redis_client.get(cache_key)
    
    if cached_result:
        return json.loads(cached_result)
    
    # Make prediction
    result = make_prediction(model_name, features)
    
    # Cache result for 5 minutes
    redis_client.setex(cache_key, 300, json.dumps(result))
    return result
```

### Database Optimization
```python
# Connection pooling
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600
)

# Query optimization
def get_dataset_sample(dataset_name, limit=100):
    query = """
    SELECT * FROM {} 
    TABLESAMPLE SYSTEM(1)
    LIMIT %s
    """.format(dataset_name)
    
    with engine.connect() as conn:
        result = conn.execute(query, (limit,))
        return result.fetchall()
```

### Frontend Optimization
```javascript
// React.memo for component optimization
const ModelCard = React.memo(({ model, prediction }) => {
  return (
    <div className="model-card">
      {/* Component content */}
    </div>
  );
});

// useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// useCallback for function optimization
const handleClick = useCallback((id) => {
  setSelectedId(id);
}, []);
```

### Bundle Optimization
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
    }),
  ],
};
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Model Loading Errors
**Problem**: `No module named '_loss'` or sklearn version errors
```bash
# Solution: Upgrade scikit-learn
pip install --upgrade scikit-learn==1.6.1

# Verify installation
python -c "import sklearn; print(sklearn.__version__)"
```

#### 2. Frontend Connection Issues
**Problem**: 400 Bad Request or CORS errors
```javascript
// Check API_BASE_URL in api_fixed.js
const API_BASE_URL = 'http://localhost:5005/api';

// Verify backend is running
curl http://localhost:5005/api/health
```

#### 3. ANN Model Prediction Errors
**Problem**: `'dict' object has no attribute 'eval'`
```python
# Solution: Extract actual model from dictionary
actual_model = model_obj
if isinstance(model_obj, dict):
    for key, value in model_obj.items():
        if hasattr(value, 'eval') and hasattr(value, 'forward'):
            actual_model = value
            break
```

#### 4. Environment Variables Not Loading
**Problem**: API keys not working
```bash
# Restart frontend after updating .env
cd frontend
npm run dev

# Verify variables are loaded
console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
```

#### 5. Port Conflicts
**Problem**: Address already in use
```bash
# Kill processes using ports
lsof -ti:5005 | xargs kill -9  # Backend port
lsof -ti:8080 | xargs kill -9  # Frontend port

# Or use different ports
# Backend: python3 app_real_data.py --port 5006
# Frontend: npm run dev -- --port 8081
```

### Debug Mode

#### Backend Debugging
```python
# Enable debug mode
if __name__ == '__main__':
    app.run(debug=True, port=5005)

# Add logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Debug model loading
def load_models():
    for name, config in MODEL_CONFIG.items():
        print(f"Loading {name}...")
        try:
            # Loading code
            print(f"✅ Successfully loaded {name}")
        except Exception as e:
            print(f"❌ Error loading {name}: {e}")
            import traceback
            traceback.print_exc()
```

#### Frontend Debugging
```javascript
// Add console logging
const getRealtimePrediction = async (modelName) => {
  console.log(`Fetching prediction for ${modelName}`);
  try {
    const response = await fetch(`${API_BASE_URL}/realtime/${modelName}`);
    const data = await response.json();
    console.log('Prediction data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching prediction:', error);
    return { error: error.message };
  }
};

// React DevTools
// Install React Developer Tools browser extension
```

### Performance Monitoring

#### Backend Monitoring
```python
import time
from functools import wraps

def timing_decorator(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        result = f(*args, **kwargs)
        end_time = time.time()
        print(f"{f.__name__} took {end_time - start_time:.4f} seconds")
        return result
    return decorated_function

@app.route('/api/realtime/<model_name>')
@timing_decorator
def realtime_predict(model_name):
    # Prediction logic
    pass
```

#### Frontend Monitoring
```javascript
// Performance monitoring
const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

// Monitor API calls
const monitoredFetch = async (url, options) => {
  return measurePerformance(`API call to ${url}`, async () => {
    const response = await fetch(url, options);
    return response.json();
  });
};
```

---

*Technical Documentation v1.0.0*  
*Last Updated: May 10, 2026*  
*Maintained by: BIOPULSE ELITE Development Team*
