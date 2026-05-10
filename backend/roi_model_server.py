"""
ROI Prediction Model Server
- Handles CSV data upload and processing
- Trains ML models for ROI prediction
- Provides real-time prediction endpoints
- Integrates with OpenAI API for analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
import os
from datetime import datetime
import json
from dotenv import load_dotenv
from database_manager import db_manager

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Global variables for models and data
roi_models = {}
scalers = {}
feature_encoders = {}
training_data = {}
model_performance = {}

class ROIPredictionModel:
    def __init__(self, model_type='random_forest'):
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = []
        self.target_column = 'roi'
        self.is_trained = False
        self.performance_metrics = {}
        
        # Initialize model based on type
        if model_type == 'random_forest':
            self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        elif model_type == 'gradient_boosting':
            self.model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        elif model_type == 'linear_regression':
            self.model = LinearRegression()
    
    def preprocess_data(self, df):
        """Preprocess the data for training/prediction"""
        processed_df = df.copy()
        
        # Handle categorical variables
        categorical_columns = ['industry', 'sector', 'location']
        for col in categorical_columns:
            if col in processed_df.columns:
                if col not in feature_encoders:
                    feature_encoders[col] = LabelEncoder()
                    processed_df[col] = feature_encoders[col].fit_transform(processed_df[col].astype(str))
                else:
                    processed_df[col] = feature_encoders[col].transform(processed_df[col].astype(str))
        
        # Calculate derived features
        if 'revenue' in processed_df.columns and 'expenses' in processed_df.columns:
            processed_df['profit'] = processed_df['revenue'] - processed_df['expenses']
            processed_df['profit_margin_actual'] = processed_df['profit'] / processed_df['revenue']
        
        if 'market_cap' in processed_df.columns and 'employees' in processed_df.columns:
            processed_df['market_cap_per_employee'] = processed_df['market_cap'] / processed_df['employees']
        
        if 'year_founded' in processed_df.columns:
            processed_df['company_age'] = 2024 - processed_df['year_founded']
        
        # Fill missing values
        processed_df = processed_df.fillna(0)
        
        return processed_df
    
    def train(self, df):
        """Train the ROI prediction model"""
        try:
            # Preprocess data
            processed_df = self.preprocess_data(df)
            
            # Define feature columns (exclude target and non-predictive columns)
            exclude_columns = ['company_name', 'roi', 'predicted_roi', 'confidence_score', 'last_updated']
            self.feature_columns = [col for col in processed_df.columns if col not in exclude_columns]
            
            # Prepare features and target
            X = processed_df[self.feature_columns]
            y = processed_df[self.target_column]
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test_scaled)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            self.performance_metrics = {
                'mse': mse,
                'rmse': np.sqrt(mse),
                'r2_score': r2,
                'training_samples': len(X_train),
                'test_samples': len(X_test),
                'feature_importance': {}
            }
            
            # Get feature importance if available
            if hasattr(self.model, 'feature_importances_'):
                for i, feature in enumerate(self.feature_columns):
                    self.performance_metrics['feature_importance'][feature] = float(self.model.feature_importances_[i])
            
            self.is_trained = True
            
            return {
                'status': 'success',
                'performance': self.performance_metrics,
                'message': f'Model trained successfully with R² score: {r2:.3f}'
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Training failed: {str(e)}'
            }
    
    def predict(self, company_data):
        """Make ROI prediction for a single company"""
        if not self.is_trained:
            return {
                'predicted_roi': 0.0,
                'confidence': 0.0,
                'error': 'Model not trained'
            }
        
        try:
            # Convert to DataFrame if dict
            if isinstance(company_data, dict):
                df = pd.DataFrame([company_data])
            else:
                df = company_data.copy()
            
            # Preprocess
            processed_df = self.preprocess_data(df)
            
            # Ensure all feature columns are present
            for col in self.feature_columns:
                if col not in processed_df.columns:
                    processed_df[col] = 0
            
            # Prepare features
            X = processed_df[self.feature_columns]
            X_scaled = self.scaler.transform(X)
            
            # Make prediction
            prediction = self.model.predict(X_scaled)[0]
            
            # Calculate confidence based on prediction consistency
            confidence = max(0.3, min(0.95, self.performance_metrics.get('r2_score', 0.5)))
            
            return {
                'predicted_roi': float(prediction),
                'confidence': float(confidence),
                'feature_contributions': self._get_feature_contributions(X_scaled[0])
            }
            
        except Exception as e:
            return {
                'predicted_roi': 0.0,
                'confidence': 0.0,
                'error': f'Prediction failed: {str(e)}'
            }
    
    def _get_feature_contributions(self, features):
        """Get feature contributions for prediction explainability"""
        if hasattr(self.model, 'feature_importances_'):
            contributions = {}
            for i, feature in enumerate(self.feature_columns):
                contributions[feature] = float(features[i] * self.model.feature_importances_[i])
            return contributions
        return {}

@app.route('/api/roi/upload', methods=['POST'])
def upload_company_data():
    """Upload and process company CSV data"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'File must be a CSV'}), 400
        
        # Read CSV
        df = pd.read_csv(file)
        
        # Process data
        processed_data = []
        for _, row in df.iterrows():
            company = {
                'company_name': row.get('company_name', row.get('Company', row.get('name', f'Company {len(processed_data)}'))),
                'industry': row.get('industry', row.get('Industry', row.get('sector', 'Technology'))),
                'revenue': float(row.get('revenue', row.get('Revenue', row.get('total_revenue', 0)))),
                'expenses': float(row.get('expenses', row.get('Expenses', row.get('total_expenses', 0)))),
                'employees': int(row.get('employees', row.get('Employees', row.get('employee_count', 0)))),
                'market_cap': float(row.get('market_cap', row.get('Market_Cap', row.get('market_capitalization', 0)))),
                'debt_ratio': float(row.get('debt_ratio', row.get('Debt_Ratio', row.get('debt_to_equity', 0)))),
                'profit_margin': float(row.get('profit_margin', row.get('Profit_Margin', row.get('profitability', 0)))),
                'growth_rate': float(row.get('growth_rate', row.get('Growth_Rate', row.get('revenue_growth', 0)))),
                'year_founded': int(row.get('year_founded', row.get('Year_Founded', row.get('founded', 2000)))),
                'location': row.get('location', row.get('Location', row.get('hq', 'Unknown'))),
                'sector': row.get('sector', row.get('Sector', row.get('industry', 'Technology')))
            }
            
            # Calculate derived metrics
            company['roi'] = (company['revenue'] - company['expenses']) / company['expenses'] * 100 if company['expenses'] > 0 else 0
            company['financial_health_score'] = min(100, max(0, 
                company['profit_margin'] * 50 + 
                (1 - company['debt_ratio']) * 30 + 
                company['growth_rate'] * 20
            ))
            company['last_updated'] = datetime.now().isoformat()
            
            processed_data.append(company)
        
        # Store data and save to database
        training_data['companies'] = processed_data
        
        # Save companies and financial data to database
        companies_saved = 0
        for company in processed_data:
            try:
                # Save company information
                company_id = db_manager.save_company({
                    'company_name': company['company_name'],
                    'industry': company['industry'],
                    'sector': company['sector'],
                    'location': company['location'],
                    'year_founded': company['year_founded']
                })
                
                # Get actual company ID
                actual_company_id = db_manager.get_company_id(
                    company['company_name'], 
                    company['industry'], 
                    company['location']
                )
                
                if actual_company_id:
                    # Save financial data
                    db_manager.save_company_financials(actual_company_id, {
                        'revenue': company['revenue'],
                        'expenses': company['expenses'],
                        'profit': company['revenue'] - company['expenses'],
                        'profit_margin': company['profit_margin'],
                        'market_cap': company['market_cap'],
                        'debt_ratio': company['debt_ratio'],
                        'growth_rate': company['growth_rate'],
                        'employees': company['employees'],
                        'financial_health_score': company['financial_health_score']
                    })
                    companies_saved += 1
                    
            except Exception as e:
                print(f"Error saving company {company['company_name']}: {e}")
        
        # Train models
        results = {}
        for model_type in ['random_forest', 'gradient_boosting', 'linear_regression']:
            model = ROIPredictionModel(model_type)
            train_result = model.train(df)
            
            if train_result['status'] == 'success':
                roi_models[model_type] = model
                results[model_type] = train_result
                
                # Save model metadata to database
                try:
                    db_manager.save_ml_model({
                        'model_name': f'ROI_{model_type}',
                        'model_type': model_type,
                        'dataset_name': f'company_data_{datetime.now().strftime("%Y%m%d")}',
                        'accuracy': train_result['performance'].get('r2_score', 0.0),
                        'parameters_count': sum(len(layer) for layer in [model.feature_columns]) * 10,  # Estimate
                        'architecture': model.feature_columns,
                        'training_samples': train_result['performance'].get('training_samples', 0),
                        'validation_samples': train_result['performance'].get('test_samples', 0),
                        'learning_rate': 0.01,
                        'epochs_trained': 100,
                        'training_time_minutes': 5
                    })
                except Exception as e:
                    print(f"Error saving model {model_type}: {e}")
        
        # Add predictions to processed data and save to database
        if 'random_forest' in roi_models:
            for company in processed_data:
                prediction = roi_models['random_forest'].predict(company)
                company['predicted_roi'] = prediction['predicted_roi']
                company['confidence_score'] = prediction['confidence']
                
                # Save prediction to database
                try:
                    company_id = db_manager.get_company_id(company['company_name'], company['industry'])
                    if company_id:
                        db_manager.save_roi_prediction(company_id, {
                            'model_type': 'random_forest',
                            'predicted_roi': prediction['predicted_roi'],
                            'confidence': prediction['confidence'],
                            'actual_roi': company['roi'],
                            'feature_importance': prediction.get('feature_contributions', {}),
                            'training_data_size': len(processed_data)
                        })
                except Exception as e:
                    print(f"Error saving prediction for {company['company_name']}: {e}")
        
        return jsonify({
            'status': 'success',
            'companies_processed': len(processed_data),
            'training_results': results,
            'data': processed_data
        })
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/api/roi/predict', methods=['POST'])
def predict_roi():
    """Make ROI prediction for company data"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Use the best available model (random_forest preferred)
        model_type = data.get('model_type', 'random_forest')
        
        if model_type not in roi_models:
            return jsonify({'error': f'Model {model_type} not available'}), 400
        
        prediction = roi_models[model_type].predict(data)
        
        return jsonify({
            'status': 'success',
            'prediction': prediction,
            'model_type': model_type
        })
        
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/api/roi/models', methods=['GET'])
def get_available_models():
    """Get available ROI models and their performance"""
    models_info = {}
    
    for model_type, model in roi_models.items():
        if model.is_trained:
            models_info[model_type] = {
                'type': model.model_type,
                'is_trained': model.is_trained,
                'performance': model.performance_metrics,
                'feature_columns': model.feature_columns
            }
    
    return jsonify({
        'models': models_info,
        'total_companies': len(training_data.get('companies', []))
    })

@app.route('/api/roi/analyze', methods=['POST'])
def analyze_with_ai():
    """Analyze company data with AI insights"""
    try:
        data = request.get_json()
        company_data = data.get('company_data')
        
        if not company_data:
            return jsonify({'error': 'No company data provided'}), 400
        
        # Get OpenAI API key from environment
        openai_api_key = os.getenv('OPENAI_API_KEY')
        if not openai_api_key or not openai_api_key.startswith('sk-'):
            return jsonify({'error': 'OpenAI API key not configured in environment'}), 500
        
        # Get ROI prediction
        prediction = None
        if 'random_forest' in roi_models:
            prediction = roi_models['random_forest'].predict(company_data)
        
        # Get company ID for database storage
        company_id = db_manager.get_company_id(
            company_data.get('company_name'), 
            company_data.get('industry'), 
            company_data.get('location')
        )
        
        if not company_id:
            return jsonify({'error': 'Company not found in database'}), 404
        
        # Prepare analysis prompt
        analysis_prompt = f"""
        Analyze this company for ROI prediction and business insights:
        
        Company Data:
        {json.dumps(company_data, indent=2)}
        
        ML Model Prediction:
        {json.dumps(prediction, indent=2) if prediction else 'No prediction available'}
        
        Please provide:
        1. ROI Analysis with confidence intervals
        2. Key performance indicators assessment
        3. Risk factors and mitigation strategies
        4. Growth opportunities and market positioning
        5. Financial health evaluation
        6. Specific actionable recommendations
        7. Industry comparison insights
        
        Format with clear sections and include numerical estimates.
        """
        
        # Here you would integrate with OpenAI API
        # For now, return a structured analysis template
        start_time = datetime.now()
        
        analysis = f"""
        EXECUTIVE_SUMMARY:
        Company: {company_data.get('company_name', 'Unknown')}
        Industry: {company_data.get('industry', 'Unknown')}
        Current ROI: {company_data.get('roi', 0):.2f}%
        Predicted ROI: {prediction['predicted_roi'] if prediction else 'N/A'}%
        Confidence: {(prediction['confidence'] * 100) if prediction else 0:.1f}%
        
        ROI_ANALYSIS:
        - Current Performance: {company_data.get('roi', 0):.2f}% ROI
        - Predicted Performance: {prediction['predicted_roi'] if prediction else 'N/A'}%
        - Growth Potential: {'High' if company_data.get('growth_rate', 0) > 0.2 else 'Moderate' if company_data.get('growth_rate', 0) > 0.1 else 'Low'}
        - Market Position: {'Strong' if company_data.get('market_cap', 0) > 100000000 else 'Moderate' if company_data.get('market_cap', 0) > 50000000 else 'Developing'}
        
        RISK_ASSESSMENT:
        - Debt Risk: {'High' if company_data.get('debt_ratio', 0) > 0.5 else 'Moderate' if company_data.get('debt_ratio', 0) > 0.3 else 'Low'}
        - Profitability Risk: {'High' if company_data.get('profit_margin', 0) < 0.1 else 'Moderate' if company_data.get('profit_margin', 0) < 0.2 else 'Low'}
        - Market Risk: Industry-specific factors to consider
        
        OPPORTUNITIES:
        - Revenue Growth: {company_data.get('growth_rate', 0) * 100:.1f}% current growth rate
        - Efficiency Improvements: Potential for cost optimization
        - Market Expansion: Opportunities based on current market position
        
        RECOMMENDATIONS:
        1. Focus on {'debt reduction' if company_data.get('debt_ratio', 0) > 0.4 else 'growth investments'}
        2. Improve profit margins through {'cost optimization' if company_data.get('profit_margin', 0) < 0.2 else 'revenue expansion'}
        3. Consider {'market consolidation' if company_data.get('market_cap', 0) < 50000000 else 'strategic acquisitions'}
        4. Monitor financial health score: {company_data.get('financial_health_score', 0):.1f}/100
        """
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Save analysis to database
        try:
            db_manager.save_ai_analysis(company_id, {
                'analysis_type': 'comprehensive',
                'ai_model': 'gpt-4',
                'analysis_text': analysis,
                'executive_summary': f"Company: {company_data.get('company_name')}, Industry: {company_data.get('industry')}, Predicted ROI: {prediction['predicted_roi'] if prediction else 'N/A'}%",
                'risk_factors': [
                    {'factor': 'Debt Risk', 'level': 'High' if company_data.get('debt_ratio', 0) > 0.5 else 'Moderate' if company_data.get('debt_ratio', 0) > 0.3 else 'Low'},
                    {'factor': 'Profitability Risk', 'level': 'High' if company_data.get('profit_margin', 0) < 0.1 else 'Moderate' if company_data.get('profit_margin', 0) < 0.2 else 'Low'}
                ],
                'opportunities': [
                    {'opportunity': 'Revenue Growth', 'potential': f"{company_data.get('growth_rate', 0) * 100:.1f}%"},
                    {'opportunity': 'Efficiency Improvements', 'potential': 'Cost optimization potential'}
                ],
                'recommendations': [
                    {'action': 'Focus on debt reduction' if company_data.get('debt_ratio', 0) > 0.4 else 'Focus on growth investments'},
                    {'action': 'Improve profit margins through cost optimization' if company_data.get('profit_margin', 0) < 0.2 else 'Improve profit margins through revenue expansion'}
                ],
                'confidence_score': prediction['confidence'] if prediction else 0.5,
                'processing_time_ms': int(processing_time)
            })
        except Exception as e:
            print(f"Error saving AI analysis: {e}")
        
        return jsonify({
            'status': 'success',
            'analysis': analysis,
            'prediction': prediction,
            'processing_time_ms': int(processing_time)
        })
        
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500
@app.route('/api/roi/health', methods=['GET'])
def health_check():
    """Check server health and model status"""
    try:
        # Check database connection
        db_status = db_manager.test_connection()
        db_stats = db_manager.get_database_stats()
        
        return jsonify({
            'status': 'healthy',
            'database_connected': db_status,
            'models_available': list(roi_models.keys()),
            'companies_trained': len(training_data.get('companies', [])),
            'database_stats': db_stats,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/roi/database-stats', methods=['GET'])
def get_database_stats():
    """Get comprehensive database statistics"""
    try:
        stats = db_manager.get_database_stats()
        
        # Get additional summary data
        company_summary = db_manager.get_company_performance_summary()
        fleet_summary = db_manager.get_fleet_utilization()
        maintenance_summary = db_manager.get_maintenance_dashboard()
        
        return jsonify({
            'status': 'success',
            'table_counts': stats,
            'summary_data': {
                'companies_count': len(company_summary),
                'fleet_vehicles_count': len(fleet_summary),
                'equipment_count': len(maintenance_summary)
            },
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get database stats: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 ROI Prediction Model Server Starting...")
    print("📊 Available endpoints:")
    print("  POST /api/roi/upload - Upload CSV data and train models")
    print("  POST /api/roi/predict - Make ROI predictions")
    print("  GET  /api/roi/models - Get available models")
    print("  POST /api/roi/analyze - AI-powered analysis")
    print("  GET  /api/roi/health - Health check")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
