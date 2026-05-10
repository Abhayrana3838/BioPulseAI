# 🏢 Company Data ROI Analysis System

## 📋 Overview

The Company Data ROI Analysis System is a comprehensive platform for uploading company data, training machine learning models, and generating AI-powered ROI predictions and insights. This system integrates real-time data visualization, ML model training, and OpenAI API analysis.

## 🚀 Features

### 📊 **Data Management**
- **CSV Upload**: Upload company data in CSV format
- **Data Processing**: Automatic data parsing and validation
- **Real-time Updates**: Live data streaming and visualization
- **Multiple Companies**: Support for analyzing multiple companies simultaneously

### 🤖 **Machine Learning**
- **ROI Prediction**: Train ML models to predict company ROI
- **Multiple Algorithms**: Random Forest, Gradient Boosting, Linear Regression
- **Feature Engineering**: Automatic feature extraction and importance analysis
- **Model Performance**: Real-time accuracy metrics and confidence scores

### 🧠 **AI Analysis**
- **OpenAI Integration**: GPT-4 powered business insights
- **Financial Analysis**: Comprehensive ROI and financial health analysis
- **Risk Assessment**: Automated risk factor identification
- **Actionable Recommendations**: AI-generated business recommendations

### 📈 **Visualization**
- **Interactive Dashboard**: Real-time charts and metrics
- **Company Comparison**: Side-by-side company analysis
- **Performance Tracking**: Historical performance visualization
- **Professional UI**: Modern, responsive interface

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ 
- Python 3.8+
- OpenAI API Key (optional for AI analysis)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install flask flask-cors pandas numpy scikit-learn joblib
python roi_model_server.py
```

## 📁 File Structure

```
├── frontend/
│   ├── CompanyDataROI.jsx          # Main company data analysis component
│   ├── ElitePredictiveROIFinance.jsx # ROI dashboard with view switching
│   ├── sample_company_data.csv     # Sample CSV file for testing
│   └── package.json                # Frontend dependencies
├── backend/
│   └── roi_model_server.py         # Backend ML server
└── ROI_System_README.md            # This documentation
```

## 📊 CSV Data Format

### Required Columns
Your CSV file should include the following columns (case-insensitive):

| Column | Description | Example |
|--------|-------------|---------|
| `company_name` | Company name | "TechCorp International" |
| `industry` | Industry sector | "Technology" |
| `revenue` | Annual revenue | 50000000 |
| `expenses` | Annual expenses | 30000000 |
| `employees` | Number of employees | 500 |
| `market_cap` | Market capitalization | 200000000 |
| `debt_ratio` | Debt-to-equity ratio | 0.3 |
| `profit_margin` | Profit margin (decimal) | 0.4 |
| `growth_rate` | Annual growth rate | 0.25 |
| `year_founded` | Year company was founded | 2010 |
| `location` | Company location | "San Francisco" |
| `sector` | Business sector | "Technology" |

### Sample CSV Format
```csv
company_name,industry,revenue,expenses,employees,market_cap,debt_ratio,profit_margin,growth_rate,year_founded,location,sector
TechCorp International,Technology,50000000,30000000,500,200000000,0.3,0.4,0.25,2010,San Francisco,Technology
DataAnalytics Inc,Technology,30000000,25000000,300,150000000,0.5,0.17,0.15,2015,New York,Technology
```

## 🎯 How to Use

### Step 1: Start the Backend Server
```bash
cd backend
python roi_model_server.py
```
The server will start on `http://localhost:5001`

### Step 2: Start the Frontend
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`

### Step 3: Access Company Data Analysis
1. Open the ROI Finance Dashboard
2. Click the 🏢 button to switch to Company Data Analysis
3. Upload your CSV file using the "Upload CSV" button
4. Wait for model training to complete
5. Explore company data and predictions

### Step 4: AI Analysis (Optional)
1. Enter your OpenAI API key in the provided field
2. Select a company from the list
3. Click "Analyze with OpenAI" for detailed insights

## 🔧 API Endpoints

### Backend Server (Port 5001)

#### Upload CSV Data
```http
POST /api/roi/upload
Content-Type: multipart/form-data
Body: file (CSV file)
```

#### Make ROI Prediction
```http
POST /api/roi/predict
Content-Type: application/json
Body: {
  "company_data": {...},
  "model_type": "random_forest"
}
```

#### Get Available Models
```http
GET /api/roi/models
```

#### AI Analysis
```http
POST /api/roi/analyze
Content-Type: application/json
Body: {
  "company_data": {...},
  "openai_api_key": "sk-..."
}
```

#### Health Check
```http
GET /api/roi/health
```

## 📈 Features Explained

### 🤖 ML Model Training
The system automatically trains three different ML models:
- **Random Forest**: Best for complex relationships
- **Gradient Boosting**: Optimized for accuracy
- **Linear Regression**: Baseline model for comparison

### 📊 Real-time Metrics
- **ROI Prediction**: Predicted annual ROI percentage
- **Confidence Score**: Model confidence in prediction (0-100%)
- **Financial Health Score**: Overall financial health (0-100)
- **Feature Importance**: Key factors affecting ROI

### 🧠 AI-Powered Insights
When you provide an OpenAI API key, the system provides:
- **Executive Summary**: High-level overview
- **ROI Analysis**: Detailed ROI breakdown
- **Risk Assessment**: Risk factors and mitigation
- **Opportunities**: Growth potential analysis
- **Recommendations**: Actionable business advice

### 📱 User Interface
- **Company List**: Browse all uploaded companies
- **Detailed View**: In-depth company analysis
- **Visual Indicators**: Color-coded metrics and status
- **Interactive Charts**: Real-time data visualization

## 🎨 Visual Indicators

### ROI Performance
- 🟢 **>20%**: Excellent performance
- 🟡 **10-20%**: Good performance  
- 🔴 **<10%**: Needs improvement

### Financial Health
- 🟢 **>70**: Healthy financial position
- 🟡 **50-70**: Moderate financial health
- 🔴 **<50**: Financial concerns

### Model Confidence
- 🟢 **>80%**: High confidence prediction
- 🟡 **60-80%**: Moderate confidence
- 🔴 **<60%**: Low confidence

## 🔍 Data Processing

### Automatic Calculations
The system automatically calculates:
- **ROI**: `(Revenue - Expenses) / Expenses * 100`
- **Financial Health Score**: `Profit Margin * 50 + (1 - Debt Ratio) * 30 + Growth Rate * 20`
- **Company Age**: `Current Year - Year Founded`
- **Market Cap per Employee**: `Market Cap / Employees`

### Feature Engineering
- **Categorical Encoding**: Converts text categories to numbers
- **Derived Features**: Creates new features from existing data
- **Data Normalization**: Scales features for ML models
- **Missing Value Handling**: Fills missing data appropriately

## 🚨 Troubleshooting

### Common Issues

#### CSV Upload Fails
- Ensure file is in proper CSV format
- Check column names match required format
- Verify numeric values are valid numbers
- Make sure file size is reasonable (<10MB)

#### Model Training Errors
- Ensure you have at least 3 companies in your data
- Check for missing or invalid values
- Verify revenue and expenses are not zero for all companies

#### AI Analysis Not Working
- Verify OpenAI API key is valid (starts with "sk-")
- Check internet connection
- Ensure API key has sufficient credits

#### Connection Issues
- Make sure backend server is running on port 5001
- Check firewall settings
- Verify both frontend and backend are running

### Error Messages

#### "Error processing file. Please check the format."
- CSV format is invalid
- Required columns are missing
- Data types are incorrect

#### "Model not trained"
- Insufficient data for training
- Training process failed
- Try uploading more company data

#### "Please enter a valid OpenAI API key"
- API key format is incorrect
- Key is expired or invalid
- Check OpenAI account status

## 📚 Advanced Usage

### Custom Model Training
You can modify the backend to:
- Add new ML algorithms
- Customize feature engineering
- Adjust model hyperparameters
- Add validation metrics

### Integration Options
The system can be integrated with:
- Database systems for persistent storage
- Real-time data feeds
- External APIs for additional data
- Custom visualization libraries

### Performance Optimization
- Use larger datasets for better model accuracy
- Implement data caching for faster responses
- Add model versioning for tracking improvements
- Monitor system performance and resource usage

## 📞 Support

For issues or questions:
1. Check this documentation first
2. Review error messages in the console
3. Verify all prerequisites are met
4. Test with the provided sample data

## 🔄 Updates & Maintenance

### Regular Tasks
- Update ML models with new data
- Monitor prediction accuracy
- Refresh AI analysis prompts
- Backup important data and models

### Future Enhancements
- Additional ML algorithms
- More visualization options
- Advanced AI insights
- Integration with more data sources

---

**🎉 Your Company Data ROI Analysis System is ready! Upload your CSV data and start gaining AI-powered insights into your business performance!**
