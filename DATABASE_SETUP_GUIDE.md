# 🗄️ Database Setup Guide for BIOPULSE ELITE

## 📋 Overview

This guide covers setting up the MySQL database for storing all dashboard data including ROI analysis, neural network predictions, fleet logistics, and maintenance predictions.

## 🚀 Quick Setup

### Prerequisites
- MySQL Server 8.0+ installed and running
- Python 3.8+ with required packages
- Administrative access to MySQL

### Step 1: Install Python Dependencies
```bash
cd backend
pip3 install mysql-connector-python python-dotenv flask flask-cors pandas numpy scikit-learn
```

### Step 2: Configure Database Connection
Edit `/backend/.env` file with your MySQL credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=biopulse_elite
DB_PORT=3306
```

### Step 3: Create Database and Tables
```bash
# Connect to MySQL
mysql -u root -p

# Run the database schema
mysql> source /path/to/backend/database_schema.sql
```

### Step 4: Verify Setup
```bash
# Test database connection
python3 -c "from database_manager import db_manager; print('Connected:', db_manager.test_connection())"
```

## 📊 Database Schema Overview

### Core Tables

#### **Company ROI Analysis**
- `companies` - Company master data
- `company_financials` - Financial metrics and KPIs
- `roi_predictions` - ML model predictions
- `ai_analyses` - OpenAI analysis results

#### **Neural Network Models**
- `ml_models` - Model metadata and configurations
- `training_history` - Training metrics over time
- `neural_network_predictions` - Real-time predictions
- `model_weights` - Model architecture data

#### **Fleet Logistics**
- `fleet_vehicles` - Vehicle information and status
- `locations` - Plants, warehouses, and sites
- `weather_data` - Weather information for locations
- `fleet_trips` - Trip and route data

#### **Maintenance Predictions**
- `equipment` - Machinery and equipment data
- `sensor_readings` - IoT sensor data
- `maintenance_predictions` - Predictive maintenance results
- `maintenance_work_orders` - Maintenance tasks

#### **System Management**
- `users` - User authentication and roles
- `system_logs` - Application logs and audit trail
- `data_transfer_logs` - Import/export tracking

## 🔧 Configuration

### Environment Variables
```env
# Database Configuration
DB_HOST=localhost          # MySQL server host
DB_USER=root              # MySQL username
DB_PASSWORD=your_password # MySQL password
DB_NAME=biopulse_elite    # Database name
DB_PORT=3306              # MySQL port

# OpenAI Configuration
OPENAI_API_KEY=sk-...     # Your OpenAI API key
```

### Connection Pool Settings
The database manager uses connection pooling for optimal performance:
- **Pool Size**: 5 connections
- **Auto-reconnect**: Enabled
- **Timeout**: Default MySQL settings

## 📈 Data Flow

### ROI Analysis Pipeline
1. **CSV Upload** → Parse and validate data
2. **Company Creation** → Save to `companies` table
3. **Financial Data** → Store in `company_financials`
4. **ML Training** → Save model metadata to `ml_models`
5. **Predictions** → Store in `roi_predictions`
6. **AI Analysis** → Save results in `ai_analyses`

### Neural Network Pipeline
1. **Model Training** → Save to `ml_models`
2. **Training History** → Store epochs in `training_history`
3. **Real-time Predictions** → Store in `neural_network_predictions`
4. **Model Weights** → Save architecture in `model_weights`

### Fleet Logistics Pipeline
1. **Vehicle Data** → Store in `fleet_vehicles`
2. **Location Data** → Save in `locations`
3. **Weather Updates** → Store in `weather_data`
4. **Trip Records** → Save in `fleet_trips`

### Maintenance Pipeline
1. **Equipment Registration** → Store in `equipment`
2. **Sensor Data** → Store in `sensor_readings`
3. **Predictions** → Store in `maintenance_predictions`
4. **Work Orders** → Store in `maintenance_work_orders`

## 🎯 API Endpoints

### Database Management
- **GET** `/api/roi/health` - Health check with database status
- **GET** `/api/roi/database-stats` - Comprehensive database statistics

### Data Operations
- **POST** `/api/roi/upload` - Upload CSV and save to database
- **POST** `/api/roi/analyze` - AI analysis with database storage
- **POST** `/api/roi/predict` - Save predictions to database

### Data Retrieval
- **GET** `/api/roi/models` - Get model metadata from database
- Company performance summaries
- Fleet utilization reports
- Maintenance schedules

## 🔍 Database Views

### Pre-defined Views for Common Queries

#### **Company Performance Summary**
```sql
SELECT * FROM company_performance_summary;
```
Shows latest financial data and ROI predictions for all companies.

#### **Fleet Utilization**
```sql
SELECT * FROM fleet_utilization;
```
Provides fleet vehicle statistics and trip summaries.

#### **Maintenance Dashboard**
```sql
SELECT * FROM maintenance_dashboard;
```
Displays equipment status and maintenance requirements.

## 📊 Database Statistics

### Monitoring Table Sizes
```python
from database_manager import db_manager
stats = db_manager.get_database_stats()
print(stats)
```

### Sample Output
```json
{
  "companies": 15,
  "company_financials": 45,
  "roi_predictions": 135,
  "ai_analyses": 28,
  "ml_models": 12,
  "training_history": 1200,
  "neural_network_predictions": 5000,
  "fleet_vehicles": 25,
  "locations": 8,
  "weather_data": 2000,
  "fleet_trips": 150,
  "equipment": 40,
  "sensor_readings": 10000,
  "maintenance_predictions": 200,
  "maintenance_work_orders": 75
}
```

## 🛠️ Maintenance

### Backup Database
```bash
mysqldump -u root -p biopulse_elite > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
mysql -u root -p biopulse_elite < backup_20240101.sql
```

### Optimize Tables
```sql
OPTIMIZE TABLE companies, company_financials, roi_predictions;
```

### Clear Old Data
```sql
-- Delete sensor readings older than 90 days
DELETE FROM sensor_readings WHERE recorded_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Delete old weather data
DELETE FROM weather_data WHERE recorded_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## 🔒 Security

### Database Security Best Practices
1. **Strong Passwords**: Use complex passwords for database users
2. **Limited Privileges**: Create specific users with limited permissions
3. **Regular Backups**: Schedule automated backups
4. **Access Control**: Limit database access to application servers only

### User Creation
```sql
-- Create application user
CREATE USER 'biopulse_app'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON biopulse_elite.* TO 'biopulse_app'@'localhost';
FLUSH PRIVILEGES;
```

## 🚨 Troubleshooting

### Common Issues

#### **Connection Failed**
```bash
# Check MySQL service
sudo systemctl status mysql

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Test connection manually
mysql -h localhost -u root -p biopulse_elite
```

#### **Permission Denied**
```sql
-- Check user permissions
SHOW GRANTS FOR 'biopulse_app'@'localhost';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON biopulse_elite.* TO 'biopulse_app'@'localhost';
```

#### **Table Not Found**
```sql
-- Verify tables exist
USE biopulse_elite;
SHOW TABLES;

-- Recreate if missing
SOURCE database_schema.sql;
```

### Performance Optimization

#### **Index Analysis**
```sql
-- Check index usage
SHOW INDEX FROM companies;
SHOW INDEX FROM sensor_readings;

-- Analyze slow queries
SHOW PROCESSLIST;
```

#### **Query Optimization**
```sql
-- Use EXPLAIN for query analysis
EXPLAIN SELECT * FROM company_financials WHERE company_id = 1;
```

## 📈 Scaling Considerations

### Database Scaling
1. **Read Replicas**: For read-heavy operations
2. **Partitioning**: For large tables (sensor_readings, weather_data)
3. **Archiving**: Move old data to archive tables
4. **Caching**: Implement Redis caching for frequent queries

### Monitoring
- Monitor connection pool usage
- Track query performance
- Set up alerts for disk space
- Monitor backup completion

## ✅ Verification Checklist

### Database Setup
- [ ] MySQL server installed and running
- [ ] Database `biopulse_elite` created
- [ ] All tables created successfully
- [ ] Sample data inserted
- [ ] Views created correctly

### Application Integration
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Connection pool active
- [ ] API endpoints responding
- [ ] Data saving correctly

### Testing
- [ ] CSV upload saves to database
- [ ] ROI predictions stored
- [ ] AI analysis saved
- [ ] Fleet data persisted
- [ ] Maintenance predictions stored

---

**🎉 Your BIOPULSE ELITE database is now ready to store all dashboard data with comprehensive SQL integration!**
