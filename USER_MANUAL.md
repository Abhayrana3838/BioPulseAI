# BIOPULSE ELITE - User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Maintenance SOPs Dashboard](#maintenance-sops-dashboard)
4. [ML Models Dashboard](#ml-models-dashboard)
5. [Fleet Logistics Dashboard](#fleet-logistics-dashboard)
6. [API Configuration](#api-configuration)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Getting Started

### System Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Screen Resolution**: Minimum 1920x1080 recommended
- **Internet**: Stable connection for real-time features
- **API Keys**: Google Maps and OpenAI (optional for full functionality)

### Initial Setup
1. **Open Application**: Navigate to `http://localhost:8080`
2. **API Configuration**: Click settings icon to configure API keys
3. **Dashboard Selection**: Choose from three main dashboards

### Navigation
- **Main Menu**: Top navigation bar with dashboard links
- **Settings**: Gear icon for configuration
- **Help**: Question mark icon for assistance
- **Real-time Clock**: Top-right corner shows system time

---

## Dashboard Overview

### Main Features
- **Real-time Data**: Live updates every 5 seconds
- **Interactive Elements**: Click, hover, and drag interactions
- **Cinematic Effects**: Smooth animations and transitions
- **Responsive Design**: Adapts to screen size

### Common UI Elements
- **Glow Buttons**: Primary action buttons with neon effects
- **Status Badges**: Color-coded status indicators
- **Data Cards**: Information display panels
- **Modal Windows**: Pop-up dialogs for detailed views

### Color Scheme
- **Primary Cyan**: `#00F5FF` - Main actions and highlights
- **Purple**: `#9B5CFF` - Secondary actions and AI features
- **Green**: `#00FF88` - Success indicators
- **Orange**: `#FF8C42` - Warnings and delays
- **Red**: `#FF4466` - Critical alerts and errors

---

## Maintenance SOPs Dashboard

### Purpose
The Maintenance SOPs (Standard Operating Procedures) Dashboard provides real-time maintenance guidance based on ML model predictions.

### Main Components

#### 1. Radar Scanner
- **Location**: Left side panel
- **Function**: Visual threat detection system
- **Features**:
  - Rotating radar beam animation
  - Blinking threat indicators
  - Real-time status updates
  - Color-coded alerts (green/yellow/red)

#### 2. SOP Document Viewer
- **Location**: Right side panel
- **Function**: Step-by-step maintenance procedures
- **Features**:
  - 5-step SOP process
  - Dynamic content based on predictions
  - Risk level assessment
  - Action recommendations

#### 3. Data Ticker
- **Location**: Bottom of screen
- **Function**: Streaming data feed
- **Features**:
  - Continuous scroll of recent predictions
  - Machine ID and status information
  - Risk level indicators
  - Timestamp tracking

#### 4. Model Selection
- **Location**: Top control panel
- **Function**: Switch between different ML models
- **Available Models**:
  - Smart Manufacturing ANN
  - IoT Sensor Model
  - TPOT AutoML
  - Bioethanol Regression
  - Bioethanol Classification

### Using the Dashboard

#### Step-by-Step Guide
1. **Select Model**: Choose the appropriate ML model from the dropdown
2. **Monitor Radar**: Watch for threat indicators on the radar
3. **Review SOP**: Follow the 5-step procedure in the document viewer
4. **Check Data Ticker**: Monitor real-time predictions and alerts
5. **Take Action**: Follow recommended actions based on risk level

#### SOP Process Steps
1. **PRE-DIAGNOSIS CHECK**: Initialize diagnostic subsystem
2. **SENSOR CALIBRATION**: Run calibration sweep on sensors
3. **ANOMALY ISOLATION**: Isolate affected equipment if needed
4. **CORRECTIVE ACTION**: Dispatch technician or schedule maintenance
5. **VERIFICATION & SIGN-OFF**: Run final diagnostic and generate report

#### Understanding Indicators
- **Green Blink**: Normal operation, no action needed
- **Yellow Blink**: Caution, monitor closely
- **Red Blink**: Critical, immediate action required
- **No Blink**: System offline or no data

### Advanced Features

#### Auto-refresh
- **Status**: Enabled by default
- **Interval**: Every 5 seconds
- **Control**: Toggle with auto-refresh button

#### Historical Data
- **Storage**: Last 80 predictions kept in memory
- **Visualization**: Sparkline charts show trends
- **Export**: Download data as CSV (future feature)

#### Alert System
- **Types**: Info, Warning, Critical
- **Notifications**: Visual and audio alerts
- **Acknowledgment**: Click to dismiss alerts

---

## ML Models Dashboard

### Purpose
The ML Models Dashboard provides comprehensive monitoring and analysis of all deployed machine learning models.

### Main Components

#### 1. Model Cards Grid
- **Layout**: 3x2 grid of model cards
- **Each Card Shows**:
  - Model name and description
  - Current prediction
  - Confidence score
  - Accuracy metrics
  - Real-time status indicator

#### 2. Performance Metrics
- **Location**: Top panel
- **Metrics Displayed**:
  - Overall accuracy
  - Prediction count
  - Error rate
  - Response time

#### 3. Prediction History
- **Location**: Bottom panel
- **Features**:
  - Timeline view of predictions
  - Filter by model
  - Export capabilities
  - Detailed drill-down

#### 4. Model Comparison
- **Location**: Side panel
- **Features**:
  - Side-by-side model comparison
  - Performance ranking
  - Feature importance
  - Model metadata

### Model Details

#### Smart Manufacturing ANN
- **Type**: Neural Network
- **Accuracy**: 98.39%
- **Features**: 7 sensor inputs
- **Use Case**: Manufacturing equipment monitoring

#### IoT Sensor Model
- **Type**: sklearn Pipeline
- **Accuracy**: ~95%
- **Features**: 9 sensor inputs
- **Use Case**: IoT device monitoring

#### TPOT AutoML
- **Type**: Automated ML
- **Accuracy**: ~92%
- **Features**: 7 sensor inputs
- **Use Case**: Automated failure prediction

#### Bioethanol Regression
- **Type**: Linear Regression
- **R² Score**: 0.847
- **Features**: 8 fermentation parameters
- **Use Case**: Bioethanol yield prediction

#### Bioethanol Classification
- **Type**: Gradient Boosting
- **Accuracy**: 90%
- **Features**: 8 fermentation parameters
- **Use Case**: Growth category prediction

### Using the Dashboard

#### Real-time Monitoring
1. **Observe Model Cards**: Watch for real-time predictions
2. **Check Confidence Levels**: Monitor prediction confidence
3. **Track Performance**: Review accuracy metrics
4. **Identify Anomalies**: Look for unusual patterns

#### Historical Analysis
1. **Select Time Range**: Choose analysis period
2. **Filter Models**: Focus on specific models
3. **Export Data**: Download for external analysis
4. **Generate Reports**: Create performance summaries

---

## Fleet Logistics Dashboard

### Purpose
The Fleet Logistics Dashboard provides comprehensive fleet management with AI-powered optimization and real-time tracking.

### Main Components

#### 1. Interactive Map
- **Location**: Center panel
- **Features**:
  - Real-time vehicle tracking
  - Google Maps integration
  - Traffic layer toggle
  - Route visualization
  - Zoom and pan controls

#### 2. Fleet Status Panel
- **Location**: Left sidebar
- **Information Displayed**:
  - Total vehicles in fleet
  - Active/Delayed/Idle counts
  - Biomass inbound tracking
  - Fuel efficiency metrics

#### 3. Vehicle List
- **Location**: Right sidebar
- **Features**:
  - Sortable vehicle list
  - Status indicators
  - Search functionality
  - Quick actions

#### 4. Route Optimizer
- **Location**: Modal window
- **Features**:
  - AI-powered route optimization
  - ETA calculation
  - Fuel efficiency analysis
  - Alternative route suggestions

### Vehicle Information

#### Status Types
- **EN_ROUTE**: Vehicle actively traveling to destination
- **DELAYED**: Vehicle behind schedule
- **LOADING**: Vehicle at loading facility
- **OFFLINE**: Vehicle not reporting
- **ARRIVED**: Vehicle reached destination

#### Data Points
- **Vehicle ID**: Unique identifier (e.g., BP-902)
- **Driver**: Assigned driver name
- **Destination**: Target location
- **Cargo**: Type and weight of cargo
- **Fuel**: Current fuel level
- **Speed**: Current velocity
- **ETA**: Estimated arrival time

### Using the Dashboard

#### Real-time Tracking
1. **Monitor Map**: Watch vehicle positions in real-time
2. **Check Status**: Review vehicle status indicators
3. **Track Progress**: Monitor route progress
4. **Identify Issues**: Look for delays or offline vehicles

#### Route Optimization
1. **Select Vehicles**: Choose vehicles to optimize
2. **Run AI Analysis**: Click "OPTIMIZE_ALL_ROUTES"
3. **Review Suggestions**: Analyze AI recommendations
4. **Apply Changes**: Implement optimized routes

#### Individual Vehicle Management
1. **Click Vehicle**: Select from vehicle list
2. **View Details**: Open detail drawer
3. **Take Actions**: Contact driver, raise alert, optimize route
4. **Monitor Changes**: Track status updates

### AI Features

#### OpenAI Integration
- **Route Optimization**: GPT-4o powered route analysis
- **Delay Prediction**: AI-based ETA calculations
- **Fleet Intelligence**: Natural language queries
- **Decision Support**: AI recommendations

#### Chat Interface
- **Access**: Click AI chat button
- **Capabilities**:
  - Ask fleet-related questions
  - Request route optimizations
  - Get status summaries
  - Receive maintenance suggestions

---

## API Configuration

### Setting Up API Keys

#### Google Maps API Key
1. **Get API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Enable "Maps JavaScript API" and "Places API"
   - Create credentials → API Key

2. **Configure in Dashboard**:
   - Click settings icon (⚙️)
   - Select "API_CONFIGURATION"
   - Enter Google Maps API key
   - Click "LOAD MAP"

#### OpenAI API Key
1. **Get API Key**:
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Click "Create new secret key"
   - Copy the generated key

2. **Configure in Dashboard**:
   - Click settings icon (⚙️)
   - Select "API_CONFIGURATION"
   - Enter OpenAI API key
   - Click "ACTIVATE AI"

### Environment Variables
For development, you can also set up environment variables:

```bash
# Create .env file in frontend directory
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_OPENAI_API_KEY=your_openai_key
```

### API Usage Limits
- **Google Maps**: 28,000 map loads per month (free tier)
- **OpenAI**: Based on your plan limits
- **Monitoring**: Check usage in respective dashboards

---

## Troubleshooting

### Common Issues

#### Dashboard Not Loading
**Symptoms**: Blank screen or loading spinner
**Solutions**:
1. Check internet connection
2. Clear browser cache
3. Try different browser
4. Check backend status at `http://localhost:5005/api/health`

#### Real-time Updates Not Working
**Symptoms**: Data not refreshing
**Solutions**:
1. Check auto-refresh toggle
2. Verify backend connection
3. Refresh browser page
4. Check browser console for errors

#### Map Not Displaying
**Symptoms**: Blank map area or error message
**Solutions**:
1. Verify Google Maps API key
2. Check API key permissions
3. Ensure Maps JavaScript API is enabled
4. Check browser console for API errors

#### AI Features Not Working
**Symptoms**: Chat not responding or optimization failing
**Solutions**:
1. Verify OpenAI API key
2. Check API key credits
3. Ensure GPT-4o model is available
4. Check network connectivity

#### Model Predictions Failing
**Symptoms**: Error messages or no predictions
**Solutions**:
1. Check backend logs for errors
2. Verify model files exist
3. Check dataset availability
4. Restart backend if needed

### Error Messages

#### Connection Errors
- **"Failed to fetch"**: Backend not running or wrong port
- **"CORS error"**: Backend CORS configuration issue
- **"Network error"**: Network connectivity problem

#### API Errors
- **"Invalid API key"**: Incorrect or expired API key
- **"Rate limit exceeded"**: API usage limit reached
- **"Permission denied"**: API key lacks required permissions

#### Model Errors
- **"Model not found"**: Model file missing or corrupted
- **"Prediction failed"**: Model inference error
- **"Invalid input"**: Feature mismatch or invalid data

### Performance Issues

#### Slow Loading
**Causes**: Large datasets, slow network, browser issues
**Solutions**:
1. Close unnecessary browser tabs
2. Check network speed
3. Clear browser cache
4. Use modern browser

#### High Memory Usage
**Causes**: Too much data cached, memory leaks
**Solutions**:
1. Refresh browser page
2. Close other applications
3. Restart browser
4. Check for memory leaks

---

## Best Practices

### Daily Operations

#### Morning Checklist
1. **System Health**: Check all dashboards load correctly
2. **API Status**: Verify API keys are working
3. **Model Performance**: Review model accuracy metrics
4. **Data Freshness**: Ensure real-time data is updating

#### Monitoring Routine
1. **Real-time Alerts**: Monitor for critical alerts
2. **Performance Metrics**: Track system performance
3. **User Feedback**: Collect and address user issues
4. **System Logs**: Review error logs regularly

### Data Management

#### Data Quality
- **Validation**: Ensure data inputs are valid
- **Consistency**: Maintain consistent data formats
- **Completeness**: Address missing data issues
- **Accuracy**: Verify data accuracy regularly

#### Backup Procedures
- **Configuration**: Back up API keys and settings
- **Data**: Export important data regularly
- **Models**: Keep backup copies of model files
- **Documentation**: Maintain updated documentation

### Security Practices

#### API Key Management
- **Storage**: Store API keys securely
- **Rotation**: Rotate keys regularly
- **Access**: Limit key access to authorized users
- **Monitoring**: Monitor API usage for anomalies

#### Data Protection
- **Encryption**: Use HTTPS for all communications
- **Access Control**: Implement role-based access
- **Audit Trail**: Log all system activities
- **Compliance**: Follow data protection regulations

### Optimization Tips

#### Performance Optimization
- **Browser**: Use modern browsers with latest updates
- **Network**: Ensure stable internet connection
- **Resources**: Close unnecessary applications
- **Cache**: Leverage browser caching effectively

#### User Experience
- **Training**: Provide proper user training
- **Documentation**: Keep documentation updated
- **Support**: Establish support channels
- **Feedback**: Collect and act on user feedback

---

## Advanced Features

### Customization Options

#### Dashboard Layout
- **Panel Resizing**: Drag panel borders to resize
- **Panel Ordering**: Drag and drop to reorder
- **Theme Selection**: Choose color themes (future)
- **Language Selection**: Multiple language support (future)

#### Alert Configuration
- **Threshold Settings**: Customize alert thresholds
- **Notification Methods**: Email, SMS, push notifications
- **Escalation Rules**: Define alert escalation paths
- **Quiet Hours**: Set do-not-disturb periods

### Integration Capabilities

#### Third-party Systems
- **ERP Integration**: Connect to enterprise systems
- **IoT Platforms**: Integrate with IoT devices
- **Weather APIs**: Include weather data
- **Maintenance Systems**: Connect to CMMS

#### Data Export
- **CSV Export**: Download data in CSV format
- **API Access**: RESTful API for external access
- **Webhooks**: Real-time data push to external systems
- **Reporting**: Automated report generation

---

## Frequently Asked Questions

### General Questions
**Q: What browsers are supported?**
A: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

**Q: Is internet required?**
A: Yes, for real-time features and map functionality

**Q: Can I use the system offline?**
A: Limited functionality available offline

### Technical Questions
**Q: What is the update frequency?**
A: Real-time data updates every 5 seconds

**Q: How accurate are the predictions?**
A: Model accuracy ranges from 90-98% depending on the model

**Q: Can I add custom models?**
A: Yes, through the backend configuration

### API Questions
**Q: Are API keys required?**
A: Optional for basic functionality, required for maps and AI features

**Q: How much do API calls cost?**
A: Depends on usage and API provider pricing

**Q: Can I use my own API keys?**
A: Yes, configure in settings or environment variables

---

## Support and Contact

### Getting Help
- **Documentation**: Refer to this manual
- **Online Help**: Click question mark icon in dashboard
- **Error Messages**: Check browser console for details
- **Logs**: Review backend logs for technical issues

### Contact Information
- **Technical Support**: support@biopulse.com
- **Documentation**: docs@biopulse.com
- **Feature Requests**: features@biopulse.com
- **Bug Reports**: bugs@biopulse.com

### Training Resources
- **Video Tutorials**: Available on company portal
- **Webinars**: Monthly training sessions
- **Workshops**: On-site training available
- **Knowledge Base**: Online FAQ and articles

---

## Appendix

### Keyboard Shortcuts
- **Ctrl+R**: Refresh dashboard
- **Ctrl+S**: Save current view
- **Esc**: Close modal windows
- **F11**: Toggle fullscreen mode

### File Formats
- **Configuration**: JSON format
- **Data Export**: CSV format
- **Models**: PKL, JOB, PT formats
- **Logs**: TXT format

### System Requirements
- **Minimum**: 4GB RAM, dual-core processor
- **Recommended**: 8GB RAM, quad-core processor
- **Network**: 10 Mbps+ connection
- **Storage**: 1GB free space

---

*User Manual v1.0.0*  
*Last Updated: May 10, 2026*  
*Maintained by: BIOPULSE ELITE Team*
