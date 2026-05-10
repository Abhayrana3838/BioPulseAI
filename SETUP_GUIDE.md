# 🚀 ROI Analysis System Setup Guide

## 📋 Quick Setup

### Step 1: Configure OpenAI API Key
1. Open `/backend/.env` file
2. Replace `your_openai_api_key_here` with your actual OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

### Step 2: Start Backend Server
```bash
cd backend
python3 roi_model_server.py
```
*Server will start on http://localhost:5001*

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
```
*Application will be available at http://localhost:5173*

### Step 4: Access ROI Analysis
1. Open the application
2. Go to ROI Finance Dashboard
3. Click the 🏢 button to access Company Data Analysis

## 🎯 How to Use

### Upload CSV Data
1. Click "📁 Upload CSV" button
2. Select your CSV file with company financial data
3. Wait for processing and ML model training
4. View company list with ROI predictions

### AI Analysis
1. Select any company from the list
2. Click "🤖 Generate AI Financial Analysis"
3. Wait for AI-powered insights and recommendations

## 📊 CSV Format Requirements

Your CSV file should include these columns:
- `company_name` - Company name
- `industry` - Industry sector
- `revenue` - Annual revenue (numbers only)
- `expenses` - Annual expenses (numbers only)
- `employees` - Number of employees
- `market_cap` - Market capitalization
- `debt_ratio` - Debt-to-equity ratio (0-1)
- `profit_margin` - Profit margin (0-1)
- `growth_rate` - Annual growth rate (0-1)
- `year_founded` - Year company was founded
- `location` - Company location
- `sector` - Business sector

## ✅ Features Available

- ✅ CSV file upload and parsing
- ✅ ML model training for ROI prediction
- ✅ Real-time company financial analysis
- ✅ AI-powered insights (OpenAI integrated)
- ✅ Professional data visualization
- ✅ No API key required in frontend
- ✅ Secure environment variable configuration

## 🔧 Troubleshooting

### Backend Issues
- Ensure Python 3.8+ is installed
- Install required packages: `pip3 install flask flask-cors pandas numpy scikit-learn python-dotenv`
- Check that OpenAI API key is correctly set in `.env` file

### Frontend Issues
- Ensure Node.js 16+ is installed
- Run `npm install` to install dependencies
- Check that backend server is running on port 5001

### CSV Upload Issues
- Verify CSV format matches requirements
- Check for missing columns
- Ensure numeric values are valid numbers

## 🎉 Ready to Use!

Your ROI Analysis system is now ready with:
- Secure API key management
- Professional UI with loading states
- Real-time ML predictions
- AI-powered financial analysis
