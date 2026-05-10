import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   COMPANY DATA STRUCTURE & ML MODEL INTEGRATION
   - CSV Upload & Parsing
   - ROI Prediction Model
   - OpenAI API Integration
   - Real-time Data Visualization
═══════════════════════════════════════════════════════════ */

// Company data structure template
const COMPANY_DATA_TEMPLATE = {
  company_name: "",
  industry: "",
  revenue: 0,
  expenses: 0,
  employees: 0,
  market_cap: 0,
  debt_ratio: 0,
  profit_margin: 0,
  growth_rate: 0,
  roi: 0,
  year_founded: 0,
  location: "",
  sector: "",
  quarterly_revenue: [],
  monthly_expenses: [],
  employee_count: [],
  market_trends: [],
  competitor_analysis: {},
  risk_factors: [],
  opportunities: [],
  financial_health_score: 0,
  predicted_roi: 0,
  confidence_score: 0,
  last_updated: null
};

// OpenAI API integration
async function analyzeCompanyDataWithAI(companyData, apiKey) {
  if (!apiKey || !apiKey.startsWith("sk-")) {
    throw new Error("Please enter a valid OpenAI API key");
  }

  const systemPrompt = `You are an expert financial analyst and ROI prediction specialist. 
Analyze the provided company data and provide comprehensive ROI analysis, predictions, and actionable insights.
Focus on:
1. ROI prediction with confidence intervals
2. Key performance indicators analysis
3. Risk assessment and mitigation strategies
4. Growth opportunities and market positioning
5. Financial health evaluation
6. Specific recommendations for ROI improvement

Always provide numerical estimates, percentage values, and concrete action items.
Format your response with clear sections: EXECUTIVE_SUMMARY, ROI_ANALYSIS, RISK_ASSESSMENT, OPPORTUNITIES, RECOMMENDATIONS.`;

  const userMessage = `Please analyze this company data for ROI prediction and insights:

${JSON.stringify(companyData, null, 2)}

Provide detailed ROI analysis with specific numerical predictions and actionable recommendations.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 1500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

// Local ML model for ROI prediction (simplified linear regression)
class ROIPredictionModel {
  constructor() {
    this.weights = null;
    this.bias = null;
    this.isTrained = false;
    this.featureNames = [
      'revenue', 'expenses', 'employees', 'market_cap', 'debt_ratio',
      'profit_margin', 'growth_rate', 'year_founded', 'financial_health_score'
    ];
  }

  prepareFeatures(companyData) {
    return [
      companyData.revenue / 1000000, // Normalize to millions
      companyData.expenses / 1000000,
      companyData.employees / 1000,  // Normalize to thousands
      companyData.market_cap / 1000000,
      companyData.debt_ratio,
      companyData.profit_margin,
      companyData.growth_rate,
      (2024 - companyData.year_founded) / 50, // Company age normalized
      companyData.financial_health_score
    ];
  }

  train(trainingData) {
    // Simple linear regression training
    const features = trainingData.map(d => this.prepareFeatures(d));
    const targets = trainingData.map(d => d.roi);

    // Initialize weights
    this.weights = new Array(features[0].length).fill(0);
    this.bias = 0;

    // Gradient descent
    const learningRate = 0.01;
    const epochs = 1000;

    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < features.length; i++) {
        const prediction = this.predictRaw(features[i]);
        const error = prediction - targets[i];

        // Update weights
        for (let j = 0; j < this.weights.length; j++) {
          this.weights[j] -= learningRate * error * features[i][j];
        }
        this.bias -= learningRate * error;
      }
    }

    this.isTrained = true;
  }

  predictRaw(features) {
    let prediction = this.bias;
    for (let i = 0; i < features.length; i++) {
      prediction += this.weights[i] * features[i];
    }
    return prediction;
  }

  predict(companyData) {
    if (!this.isTrained) {
      // Return default prediction if not trained
      return {
        predicted_roi: companyData.profit_margin * 100 + Math.random() * 20 - 10,
        confidence: 0.5,
        feature_importance: this.featureNames.map(name => ({ name, importance: Math.random() }))
      };
    }

    const features = this.prepareFeatures(companyData);
    const prediction = this.predictRaw(features);
    
    // Calculate confidence based on prediction stability
    const confidence = Math.max(0.3, Math.min(0.95, 1 - Math.abs(prediction) / 100));

    return {
      predicted_roi: prediction,
      confidence: confidence,
      feature_importance: this.weights.map((weight, i) => ({
        name: this.featureNames[i],
        importance: Math.abs(weight)
      })).sort((a, b) => b.importance - a.importance)
    };
  }
}

export default function CompanyDataROI() {
  const [companyData, setCompanyData] = useState(COMPANY_DATA_TEMPLATE);
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [roiModel, setRoiModel] = useState(new ROIPredictionModel());
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [modelTrained, setModelTrained] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize model with sample data
  useEffect(() => {
    const sampleData = [
      { ...COMPANY_DATA_TEMPLATE, company_name: "TechCorp", revenue: 50000000, expenses: 30000000, employees: 500, market_cap: 200000000, debt_ratio: 0.3, profit_margin: 0.4, growth_rate: 0.25, year_founded: 2010, roi: 25.5, financial_health_score: 85 },
      { ...COMPANY_DATA_TEMPLATE, company_name: "DataInc", revenue: 30000000, expenses: 25000000, employees: 300, market_cap: 150000000, debt_ratio: 0.5, profit_margin: 0.17, growth_rate: 0.15, year_founded: 2015, roi: 18.2, financial_health_score: 72 },
      { ...COMPANY_DATA_TEMPLATE, company_name: "CloudSys", revenue: 80000000, expenses: 40000000, employees: 800, market_cap: 400000000, debt_ratio: 0.2, profit_margin: 0.5, growth_rate: 0.35, year_founded: 2008, roi: 35.8, financial_health_score: 92 },
    ];
    
    roiModel.train(sampleData);
    setModelTrained(true);
  }, []);

  // Handle CSV file upload
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus("Processing file...");
    setAiAnalysis(null);

    try {
      // Dynamic import of papaparse
      const Papa = await import('papaparse');
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const processedData = results.data.map((row, index) => {
              const company = { ...COMPANY_DATA_TEMPLATE };
              
              // Map CSV columns to company data structure
              company.company_name = row.company_name || row.Company || row.name || `Company ${index + 1}`;
              company.industry = row.industry || row.Industry || row.sector || "Technology";
              company.revenue = parseFloat(row.revenue || row.Revenue || row.total_revenue || 0);
              company.expenses = parseFloat(row.expenses || row.Expenses || row.total_expenses || 0);
              company.employees = parseInt(row.employees || row.Employees || row.employee_count || 0);
              company.market_cap = parseFloat(row.market_cap || row.Market_Cap || row.market_capitalization || 0);
              company.debt_ratio = parseFloat(row.debt_ratio || row.Debt_Ratio || row.debt_to_equity || 0);
              company.profit_margin = parseFloat(row.profit_margin || row.Profit_Margin || row.profitability || 0);
              company.growth_rate = parseFloat(row.growth_rate || row.Growth_Rate || row.revenue_growth || 0);
              company.year_founded = parseInt(row.year_founded || row.Year_Founded || row.founded || 2000);
              company.location = row.location || row.Location || row.hq || "Unknown";
              company.sector = row.sector || row.Sector || row.industry || "Technology";
              
              // Calculate derived metrics
              company.roi = company.expenses > 0 ? ((company.revenue - company.expenses) / company.expenses) * 100 : 0;
              company.financial_health_score = Math.min(100, Math.max(0, 
                company.profit_margin * 50 + 
                (1 - company.debt_ratio) * 30 + 
                company.growth_rate * 20
              ));
              company.last_updated = new Date().toISOString();

              // Predict ROI using ML model
              const prediction = roiModel.predict(company);
              company.predicted_roi = prediction.predicted_roi;
              company.confidence_score = prediction.confidence;

              return company;
            });

            setUploadedData(processedData);
            setSelectedCompany(processedData[0]);
            setUploadStatus(`✅ Successfully loaded ${processedData.length} companies with ML predictions`);
            
            // Retrain model with new data
            if (processedData.length > 2) {
              roiModel.train(processedData);
              setModelTrained(true);
            }
          } catch (error) {
            console.error("Error processing CSV:", error);
            setUploadStatus("❌ Error processing file. Please check the format.");
          } finally {
            setUploading(false);
          }
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          setUploadStatus("❌ Error parsing CSV file. Please check the format.");
          setUploading(false);
        }
      });
    } catch (error) {
      console.error("Error loading papaparse:", error);
      setUploadStatus("❌ Error loading CSV parser. Please try again.");
      setUploading(false);
    }
  }, [roiModel]);

  // Analyze selected company with AI
  const analyzeWithAI = useCallback(async () => {
    if (!selectedCompany) return;

    setAiLoading(true);
    setAiAnalysis(null);

    try {
      const response = await fetch('http://localhost:5001/api/roi/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_data: selectedCompany
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setAiAnalysis(data.analysis);
        } else {
          setAiAnalysis(`Error: ${data.error}`);
        }
      } else {
        const errorData = await response.json();
        setAiAnalysis(`Error: ${errorData.error || 'Failed to analyze with AI'}`);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      setAiAnalysis(`Error: Failed to connect to AI analysis service. Please ensure the backend server is running.`);
    } finally {
      setAiLoading(false);
    }
  }, [selectedCompany]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div style={{
      width: "100%", height: "100vh",
      background: "#03050A", color: "#C8D8E8",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 24px",
        background: "rgba(8,12,22,.9)",
        borderBottom: "1px solid rgba(255,140,66,.1)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#FF8C42", margin: 0 }}>
            🏢 Company Data ROI Analysis
          </h1>
          <p style={{ fontSize: "12px", color: "#5A7090", margin: "4px 0 0 0" }}>
            Upload CSV data for AI-powered ROI prediction and financial analysis
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: "10px 20px",
              background: uploading ? "rgba(90,112,144,.2)" : "rgba(255,140,66,.15)",
              border: uploading ? "1px solid rgba(90,112,144,.3)" : "1px solid #FF8C42",
              borderRadius: "6px",
              color: uploading ? "#5A7090" : "#FF8C42",
              cursor: uploading ? "not-allowed" : "pointer",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all .2s",
            }}
          >
            {uploading ? (
              <>
                <div style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid rgba(255,140,66,.3)",
                  borderTopColor: "#FF8C42",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }} />
                Processing...
              </>
            ) : (
              <>
                📁 Upload CSV
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Panel - Data List */}
        <div style={{
          width: "350px",
          background: "rgba(8,12,22,.6)",
          borderRight: "1px solid rgba(255,140,66,.1)",
          overflowY: "auto",
          padding: "16px",
        }}>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#C8D8E8", margin: "0 0 8px 0" }}>
              Companies ({uploadedData.length})
            </h3>
            {uploadStatus && (
              <div style={{
                padding: "8px 12px",
                background: uploadStatus.includes("Error") ? "rgba(255,68,102,.1)" : "rgba(0,245,255,.1)",
                border: `1px solid ${uploadStatus.includes("Error") ? "rgba(255,68,102,.3)" : "rgba(0,245,255,.3)"}`,
                borderRadius: "4px",
                fontSize: "11px",
                color: uploadStatus.includes("Error") ? "#FF4466" : "#00F5FF",
                marginBottom: "12px",
              }}>
                {uploadStatus}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {uploadedData.map((company, index) => (
              <div
                key={index}
                onClick={() => setSelectedCompany(company)}
                style={{
                  padding: "12px",
                  background: selectedCompany === company ? "rgba(255,140,66,.15)" : "rgba(255,255,255,.03)",
                  border: selectedCompany === company ? "1px solid rgba(255,140,66,.4)" : "1px solid rgba(255,255,255,.1)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "12px", color: "#C8D8E8", marginBottom: "4px" }}>
                  {company.company_name}
                </div>
                <div style={{ fontSize: "10px", color: "#5A7090", marginBottom: "6px" }}>
                  {company.industry} • {company.location}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
                  <span style={{ color: "#00F5FF" }}>
                    Revenue: {formatCurrency(company.revenue)}
                  </span>
                  <span style={{ color: company.predicted_roi > 20 ? "#00F5FF" : company.predicted_roi > 10 ? "#FF8C42" : "#FF4466" }}>
                    ROI: {company.predicted_roi.toFixed(1)}%
                  </span>
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", marginTop: "4px" }}>
                  Confidence: {(company.confidence_score * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Company Details */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
        }}>
          {selectedCompany ? (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#C8D8E8", margin: "0 0 8px 0" }}>
                  {selectedCompany.company_name}
                </h2>
                <p style={{ fontSize: "12px", color: "#5A7090", margin: "0" }}>
                  {selectedCompany.industry} • {selectedCompany.location} • Founded {selectedCompany.year_founded}
                </p>
              </div>

              {/* Key Metrics */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}>
                {[
                  { label: "Revenue", value: formatCurrency(selectedCompany.revenue), color: "#00F5FF" },
                  { label: "Expenses", value: formatCurrency(selectedCompany.expenses), color: "#FF8C42" },
                  { label: "Employees", value: selectedCompany.employees.toLocaleString(), color: "#9B5CFF" },
                  { label: "Market Cap", value: formatCurrency(selectedCompany.market_cap), color: "#00F5FF" },
                  { label: "Profit Margin", value: `${(selectedCompany.profit_margin * 100).toFixed(1)}%`, color: selectedCompany.profit_margin > 0.2 ? "#00F5FF" : "#FF8C42" },
                  { label: "Debt Ratio", value: `${(selectedCompany.debt_ratio * 100).toFixed(1)}%`, color: selectedCompany.debt_ratio < 0.5 ? "#00F5FF" : "#FF8C42" },
                  { label: "Growth Rate", value: `${(selectedCompany.growth_rate * 100).toFixed(1)}%`, color: selectedCompany.growth_rate > 0.15 ? "#00F5FF" : "#FF8C42" },
                  { label: "Health Score", value: `${selectedCompany.financial_health_score.toFixed(0)}/100`, color: selectedCompany.financial_health_score > 70 ? "#00F5FF" : "#FF8C42" },
                ].map((metric, index) => (
                  <div key={index} style={{
                    padding: "16px",
                    background: "rgba(8,12,22,.6)",
                    border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: "8px",
                  }}>
                    <div style={{ fontSize: "10px", color: "#5A7090", marginBottom: "4px" }}>
                      {metric.label}
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: metric.color }}>
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* ROI Prediction */}
              <div style={{
                padding: "20px",
                background: "rgba(255,140,66,.1)",
                border: "1px solid rgba(255,140,66,.3)",
                borderRadius: "8px",
                marginBottom: "24px",
              }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#FF8C42", margin: "0 0 12px 0" }}>
                  ROI Prediction
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: "#FF8C42" }}>
                      {selectedCompany.predicted_roi.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: "10px", color: "#5A7090" }}>
                      Predicted Annual ROI
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "16px", fontWeight: 600, color: "#00F5FF" }}>
                      {(selectedCompany.confidence_score * 100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: "10px", color: "#5A7090" }}>
                      Confidence
                    </div>
                  </div>
                </div>
                <div style={{
                  height: "4px",
                  background: "rgba(255,255,255,.1)",
                  borderRadius: "2px",
                  overflow: "hidden",
                  marginBottom: "8px",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min(100, Math.max(0, selectedCompany.predicted_roi * 2))}%`,
                    background: selectedCompany.predicted_roi > 20 ? "#00F5FF" : selectedCompany.predicted_roi > 10 ? "#FF8C42" : "#FF4466",
                    borderRadius: "2px",
                  }} />
                </div>
                <div style={{ fontSize: "10px", color: "#5A7090" }}>
                  Current ROI: {selectedCompany.roi.toFixed(1)}% vs Predicted: {selectedCompany.predicted_roi.toFixed(1)}%
                </div>
              </div>

              {/* AI Analysis Button */}
              <button
                onClick={analyzeWithAI}
                disabled={aiLoading || !selectedCompany}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: aiLoading ? "rgba(90,112,144,.2)" : "linear-gradient(135deg, rgba(155,92,255,.2), rgba(155,92,255,.1))",
                  border: `1px solid ${aiLoading ? "rgba(90,112,144,.3)" : "rgba(155,92,255,.5)"}`,
                  borderRadius: "8px",
                  color: aiLoading ? "#5A7090" : "#9B5CFF",
                  cursor: aiLoading ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "all .3s",
                  boxShadow: aiLoading ? "none" : "0 4px 15px rgba(155,92,255,.2)",
                }}
              >
                {aiLoading ? (
                  <>
                    <div style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid rgba(155,92,255,.3)",
                      borderTopColor: "#9B5CFF",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }} />
                    AI Analyzing Company Data...
                  </>
                ) : (
                  <>
                    🤖 Generate AI Financial Analysis
                  </>
                )}
              </button>

              {/* AI Analysis Results */}
              {aiAnalysis && (
                <div style={{
                  padding: "20px",
                  background: "rgba(8,12,22,.8)",
                  border: "1px solid rgba(155,92,255,.3)",
                  borderRadius: "8px",
                  whiteSpace: "pre-wrap",
                  fontSize: "11px",
                  lineHeight: "1.6",
                  color: "#C8D8E8",
                }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#9B5CFF", marginBottom: "12px" }}>
                    🤖 AI Analysis Results
                  </div>
                  {aiAnalysis}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#5A7090",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
              <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
                No Company Selected
              </div>
              <div style={{ fontSize: "12px", textAlign: "center", maxWidth: "300px" }}>
                Upload a CSV file with company data to start analyzing ROI predictions and AI-powered insights.
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
