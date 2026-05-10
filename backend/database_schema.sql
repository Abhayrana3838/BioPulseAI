-- ═══════════════════════════════════════════════════════════
-- BIOPULSE ELITE - COMPREHENSIVE DATABASE SCHEMA
-- Stores data from all dashboards: ROI, Neural Network, Fleet Logistics, Maintenance
--═══════════════════════════════════════════════════════════

-- Create database
CREATE DATABASE IF NOT EXISTS biopulse_elite;
USE biopulse_elite;

-- ═══════════════════════════════════════════════════════════
-- CORE TABLES
--═══════════════════════════════════════════════════════════

-- Users table for authentication and user management
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'analyst', 'viewer') DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- ═══════════════════════════════════════════════════════════
-- COMPANY ROI ANALYSIS TABLES
--═══════════════════════════════════════════════════════════

-- Companies master table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    industry VARCHAR(100),
    sector VARCHAR(100),
    location VARCHAR(200),
    year_founded INT,
    website VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_company (company_name, industry, location)
);

-- Company financial data
CREATE TABLE IF NOT EXISTS company_financials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    revenue DECIMAL(15,2),
    expenses DECIMAL(15,2),
    profit DECIMAL(15,2),
    profit_margin DECIMAL(5,4),
    market_cap DECIMAL(15,2),
    debt_ratio DECIMAL(5,4),
    growth_rate DECIMAL(5,4),
    employees INT,
    revenue_per_employee DECIMAL(10,2),
    market_cap_per_employee DECIMAL(10,2),
    financial_health_score DECIMAL(5,2),
    data_period VARCHAR(50), -- e.g., '2023_Q4', '2023 Annual'
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_period (company_id, data_period)
);

-- ROI predictions and ML model results
CREATE TABLE IF NOT EXISTS roi_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    model_type ENUM('random_forest', 'gradient_boosting', 'linear_regression', 'ensemble') NOT NULL,
    predicted_roi DECIMAL(8,2),
    confidence_score DECIMAL(5,4),
    actual_roi DECIMAL(8,2),
    prediction_error DECIMAL(8,2),
    feature_importance JSON,
    model_version VARCHAR(50),
    training_data_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_model (company_id, model_type),
    INDEX idx_prediction_date (created_at)
);

-- AI analysis results
CREATE TABLE IF NOT EXISTS ai_analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    analysis_type ENUM('roi_analysis', 'risk_assessment', 'market_analysis', 'comprehensive') DEFAULT 'comprehensive',
    ai_model VARCHAR(50) DEFAULT 'gpt-4',
    analysis_text LONGTEXT,
    executive_summary TEXT,
    risk_factors JSON,
    opportunities JSON,
    recommendations JSON,
    confidence_score DECIMAL(5,4),
    processing_time_ms INT,
    api_cost DECIMAL(10,6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_analysis (company_id, analysis_type)
);

-- ═══════════════════════════════════════════════════════════
-- NEURAL NETWORK MODEL TABLES
--═══════════════════════════════════════════════════════════

-- ML models metadata
CREATE TABLE IF NOT EXISTS ml_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_type ENUM('ANN', 'LSTM', 'XGBoost', 'RandomForest', 'SVM') NOT NULL,
    dataset_name VARCHAR(100),
    accuracy DECIMAL(5,4),
    train_accuracy DECIMAL(5,4),
    parameters_count INT,
    architecture JSON,
    hyperparameters JSON,
    training_samples INT,
    validation_samples INT,
    loss_function VARCHAR(100),
    optimizer VARCHAR(100),
    learning_rate DECIMAL(8,6),
    epochs_trained INT,
    training_time_minutes INT,
    model_file_path VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_model (model_name, model_type)
);

-- Training history and metrics
CREATE TABLE IF NOT EXISTS training_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_id INT NOT NULL,
    epoch INT NOT NULL,
    train_loss DECIMAL(10,6),
    val_loss DECIMAL(10,6),
    train_accuracy DECIMAL(5,4),
    val_accuracy DECIMAL(5,4),
    learning_rate DECIMAL(8,6),
    batch_size INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES ml_models(id) ON DELETE CASCADE,
    INDEX idx_model_epoch (model_id, epoch)
);

-- Real-time predictions
CREATE TABLE IF NOT EXISTS neural_network_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_id INT NOT NULL,
    input_data JSON,
    prediction_result JSON,
    confidence_score DECIMAL(5,4),
    prediction_class VARCHAR(100),
    probability_values JSON,
    processing_time_ms INT,
    sample_id VARCHAR(100),
    actual_label VARCHAR(100),
    is_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES ml_models(id) ON DELETE CASCADE,
    INDEX idx_model_predictions (model_id, created_at),
    INDEX idx_sample_id (sample_id)
);

-- Model weights and activations (for visualization)
CREATE TABLE IF NOT EXISTS model_weights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_id INT NOT NULL,
    layer_name VARCHAR(100),
    layer_index INT,
    weights JSON,
    biases JSON,
    activation_function VARCHAR(50),
    input_shape JSON,
    output_shape JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES ml_models(id) ON DELETE CASCADE,
    INDEX idx_model_layer (model_id, layer_index)
);

-- ═══════════════════════════════════════════════════════════
-- FLEET LOGISTICS TABLES
--═══════════════════════════════════════════════════════════

-- Fleet vehicles
CREATE TABLE IF NOT EXISTS fleet_vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type ENUM('truck', 'van', 'car', 'motorcycle', 'drone') NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    year INT,
    license_plate VARCHAR(20),
    driver_name VARCHAR(100),
    driver_contact VARCHAR(20),
    capacity_kg DECIMAL(8,2),
    fuel_type ENUM('diesel', 'petrol', 'electric', 'hybrid') DEFAULT 'diesel',
    status ENUM('active', 'maintenance', 'inactive', 'retired') DEFAULT 'active',
    current_location_lat DECIMAL(10,8),
    current_location_lng DECIMAL(11,8),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Locations and plants
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(200) NOT NULL,
    location_type ENUM('plant', 'warehouse', 'office', 'customer', 'supplier') DEFAULT 'plant',
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    operating_hours JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_location_coords (latitude, longitude)
);

-- Weather data for locations
CREATE TABLE IF NOT EXISTS weather_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    temperature_celsius DECIMAL(5,2),
    humidity_percent DECIMAL(5,2),
    wind_speed_kmh DECIMAL(5,2),
    pressure_hpa DECIMAL(7,2),
    visibility_km DECIMAL(5,2),
    weather_condition VARCHAR(100),
    precipitation_mm DECIMAL(5,2),
    uv_index DECIMAL(3,1),
    air_quality_index INT,
    data_source VARCHAR(100) DEFAULT 'google_weather',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_location_time (location_id, recorded_at)
);

-- Fleet trips and routes
CREATE TABLE IF NOT EXISTS fleet_trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    origin_location_id INT,
    destination_location_id INT,
    route_name VARCHAR(200),
    distance_km DECIMAL(8,2),
    estimated_duration_minutes INT,
    actual_duration_minutes INT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
    driver_name VARCHAR(100),
    cargo_description TEXT,
    cargo_weight_kg DECIMAL(8,2),
    fuel_consumed_liters DECIMAL(6,2),
    cost DECIMAL(10,2),
    weather_conditions JSON,
    route_optimization_score DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES fleet_vehicles(vehicle_id),
    FOREIGN KEY (origin_location_id) REFERENCES locations(id),
    FOREIGN KEY (destination_location_id) REFERENCES locations(id),
    INDEX idx_vehicle_trips (vehicle_id, start_time),
    INDEX idx_trip_status (status, start_time)
);

-- ═══════════════════════════════════════════════════════════
-- MAINTENANCE PREDICTION TABLES
--═══════════════════════════════════════════════════════════

-- Equipment and machinery
CREATE TABLE IF NOT EXISTS equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id VARCHAR(50) UNIQUE NOT NULL,
    equipment_name VARCHAR(200),
    equipment_type ENUM('pump', 'motor', 'compressor', 'conveyor', 'generator', 'sensor', 'valve') NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    installation_date DATE,
    location_id INT,
    criticality ENUM('critical', 'important', 'standard') DEFAULT 'standard',
    expected_lifespan_years INT,
    warranty_expiry DATE,
    status ENUM('operational', 'maintenance', 'failed', 'retired') DEFAULT 'operational',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id),
    INDEX idx_equipment_type (equipment_type, status)
);

-- Sensor data for predictive maintenance
CREATE TABLE IF NOT EXISTS sensor_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id VARCHAR(50) NOT NULL,
    sensor_type ENUM('vibration', 'temperature', 'pressure', 'flow', 'current', 'voltage', 'acoustic') NOT NULL,
    reading_value DECIMAL(15,6),
    unit VARCHAR(20),
    threshold_min DECIMAL(15,6),
    threshold_max DECIMAL(15,6),
    is_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_score DECIMAL(5,4),
    reading_quality ENUM('good', 'fair', 'poor') DEFAULT 'good',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
    INDEX idx_equipment_sensor_time (equipment_id, sensor_type, recorded_at),
    INDEX idx_anomaly_readings (is_anomaly, recorded_at)
);

-- Maintenance predictions
CREATE TABLE IF NOT EXISTS maintenance_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id VARCHAR(50) NOT NULL,
    model_type ENUM('lstm', 'random_forest', 'xgboost', 'isolation_forest') NOT NULL,
    prediction_type ENUM('failure_probability', 'remaining_useful_life', 'anomaly_detection') NOT NULL,
    prediction_value DECIMAL(8,4),
    confidence_score DECIMAL(5,4),
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    predicted_failure_date DATE,
    days_until_maintenance INT,
    recommended_action TEXT,
    feature_importance JSON,
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
    INDEX idx_equipment_predictions (equipment_id, prediction_type, created_at),
    INDEX idx_risk_level (risk_level, predicted_failure_date)
);

-- Maintenance work orders
CREATE TABLE IF NOT EXISTS maintenance_work_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id VARCHAR(50) NOT NULL,
    work_order_number VARCHAR(50) UNIQUE NOT NULL,
    work_order_type ENUM('preventive', 'corrective', 'predictive', 'emergency') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    description TEXT,
    estimated_duration_hours DECIMAL(5,2),
    actual_duration_hours DECIMAL(5,2),
    assigned_technician VARCHAR(100),
    technician_contact VARCHAR(20),
    parts_used JSON,
    labor_cost DECIMAL(10,2),
    parts_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_date DATE,
    completed_at TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
    INDEX idx_equipment_work_orders (equipment_id, status),
    INDEX idx_work_order_priority (priority, status)
);

-- ═══════════════════════════════════════════════════════════
-- SYSTEM LOGS AND AUDIT TABLES
--═══════════════════════════════════════════════════════════

-- System logs
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_level ENUM('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL') NOT NULL,
    module VARCHAR(100),
    message TEXT,
    details JSON,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_log_level_time (log_level, created_at),
    INDEX idx_module_time (module, created_at)
);

-- Data import/export logs
CREATE TABLE IF NOT EXISTS data_transfer_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transfer_type ENUM('import', 'export') NOT NULL,
    data_source VARCHAR(100),
    file_name VARCHAR(255),
    records_processed INT,
    records_success INT,
    records_failed INT,
    error_details TEXT,
    file_size_bytes INT,
    processing_time_seconds INT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_transfer_type_time (transfer_type, created_at)
);

-- ═══════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE OPTIMIZATION
--═══════════════════════════════════════════════════════════

-- Composite indexes for common queries
CREATE INDEX idx_company_financials_composite ON company_financials(company_id, data_period, created_at);
CREATE INDEX idx_roi_predictions_composite ON roi_predictions(company_id, model_type, predicted_roi);
CREATE INDEX idx_predictions_time_confidence ON neural_network_predictions(created_at, confidence_score);
CREATE INDEX idx_fleet_trips_composite ON fleet_trips(vehicle_id, status, start_time);
CREATE INDEX idx_sensor_anomalies ON sensor_readings(equipment_id, is_anomaly, recorded_at);
CREATE INDEX idx_maintenance_urgent ON maintenance_predictions(risk_level, predicted_failure_date);

-- ═══════════════════════════════════════════════════════════
-- VIEWS FOR COMMON QUERIES
--═══════════════════════════════════════════════════════════

-- Company performance summary view
CREATE VIEW company_performance_summary AS
SELECT 
    c.id,
    c.company_name,
    c.industry,
    c.location,
    cf.revenue,
    cf.expenses,
    cf.profit_margin,
    cf.financial_health_score,
    rp.predicted_roi,
    rp.confidence_score,
    aa.analysis_type,
    aa.created_at as last_analysis_date
FROM companies c
LEFT JOIN company_financials cf ON c.id = cf.company_id
LEFT JOIN roi_predictions rp ON c.id = rp.company_id
LEFT JOIN ai_analyses aa ON c.id = aa.company_id
WHERE cf.data_period = (SELECT MAX(data_period) FROM company_financials WHERE company_id = c.id);

-- Fleet utilization view
CREATE VIEW fleet_utilization AS
SELECT 
    fv.vehicle_id,
    fv.vehicle_type,
    fv.driver_name,
    fv.status,
    COUNT(ft.id) as total_trips,
    SUM(CASE WHEN ft.status = 'completed' THEN 1 ELSE 0 END) as completed_trips,
    SUM(ft.distance_km) as total_distance,
    AVG(ft.estimated_duration_minutes) as avg_trip_duration,
    MAX(ft.end_time) as last_trip_date
FROM fleet_vehicles fv
LEFT JOIN fleet_trips ft ON fv.vehicle_id = ft.vehicle_id
GROUP BY fv.vehicle_id, fv.vehicle_type, fv.driver_name, fv.status;

-- Maintenance dashboard view
CREATE VIEW maintenance_dashboard AS
SELECT 
    e.equipment_id,
    e.equipment_name,
    e.equipment_type,
    e.status as equipment_status,
    mp.prediction_type,
    mp.risk_level,
    mp.predicted_failure_date,
    mp.days_until_maintenance,
    mwo.work_order_number,
    mwo.priority,
    mwo.status as work_order_status
FROM equipment e
LEFT JOIN maintenance_predictions mp ON e.equipment_id = mp.equipment_id
LEFT JOIN maintenance_work_orders mwo ON e.equipment_id = mwo.equipment_id AND mwo.status IN ('open', 'in_progress')
WHERE mp.created_at = (
    SELECT MAX(created_at) 
    FROM maintenance_predictions mp2 
    WHERE mp2.equipment_id = e.equipment_id 
    AND mp2.prediction_type = 'failure_probability'
);

-- ═══════════════════════════════════════════════════════════
-- SAMPLE DATA INSERTION
--═══════════════════════════════════════════════════════════

-- Insert sample companies
INSERT IGNORE INTO companies (company_name, industry, sector, location, year_founded) VALUES
('TechCorp International', 'Technology', 'Software', 'San Francisco, CA', 2010),
('DataAnalytics Inc', 'Technology', 'Data Analytics', 'New York, NY', 2015),
('CloudSystems Pro', 'Technology', 'Cloud Computing', 'Seattle, WA', 2008),
('BioMedical Solutions', 'Healthcare', 'Medical Devices', 'Boston, MA', 2012),
('GreenEnergy Co', 'Energy', 'Renewable Energy', 'Austin, TX', 2010);

-- Insert sample locations
INSERT IGNORE INTO locations (location_name, location_type, address, latitude, longitude) VALUES
('Pan Carbo Green Fuel', 'plant', 'Bathinda, Punjab, India', 30.2097, 74.9374),
('Mumbai Distribution Center', 'warehouse', 'Mumbai, Maharashtra, India', 19.0760, 72.8777),
('Delhi Regional Office', 'office', 'New Delhi, India', 28.6139, 77.2090),
('Chennai Manufacturing Plant', 'plant', 'Chennai, Tamil Nadu, India', 13.0827, 80.2707),
('Kolkata Logistics Hub', 'warehouse', 'Kolkata, West Bengal, India', 22.5726, 88.3639);

-- Insert sample fleet vehicles
INSERT IGNORE INTO fleet_vehicles (vehicle_id, vehicle_type, make, model, year, license_plate, driver_name, capacity_kg) VALUES
('TRK001', 'truck', 'Tata', 'LPT 1613', 2022, 'MH01AB1234', 'Rajesh Kumar', 5000),
('TRK002', 'truck', 'Ashok Leyland', '1616', 2021, 'DL02CD5678', 'Amit Singh', 4500),
('VAN001', 'van', 'Mahindra', 'Supro', 2023, 'KA03EF9012', 'Priya Sharma', 1500),
('VAN002', 'van', 'Tata', 'Ace', 2022, 'TN04GH3456', 'Suresh Kumar', 1000);

-- Insert sample equipment
INSERT IGNORE INTO equipment (equipment_id, equipment_name, equipment_type, manufacturer, model, location_id) VALUES
('EQP001', 'Main Water Pump', 'pump', 'Kirloskar', 'KP-1500', 1),
('EQP002', 'Conveyor Belt A', 'conveyor', 'Flexco', 'XB-250', 1),
('EQP003', 'Air Compressor', 'compressor', 'Atlas Copco', 'GA-30', 2),
('EQP004', 'Generator Set', 'generator', 'Cummins', 'DG-500', 3);

-- ═══════════════════════════════════════════════════════════
-- STORED PROCEDURES FOR COMMON OPERATIONS
--═══════════════════════════════════════════════════════════

DELIMITER //

-- Procedure to get company ROI history
CREATE PROCEDURE GetCompanyROIHistory(IN company_id_param INT)
BEGIN
    SELECT 
        DATE_FORMAT(cf.created_at, '%Y-%m') as period,
        cf.revenue,
        cf.expenses,
        cf.profit_margin,
        rp.predicted_roi,
        rp.confidence_score,
        rp.model_type
    FROM company_financials cf
    LEFT JOIN roi_predictions rp ON cf.company_id = rp.company_id
    WHERE cf.company_id = company_id_param
    ORDER BY cf.created_at DESC;
END //

-- Procedure to get fleet utilization report
CREATE PROCEDURE GetFleetUtilizationReport(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        fv.vehicle_id,
        fv.vehicle_type,
        fv.driver_name,
        COUNT(ft.id) as total_trips,
        SUM(CASE WHEN ft.status = 'completed' THEN 1 ELSE 0 END) as completed_trips,
        SUM(ft.distance_km) as total_distance,
        AVG(ft.estimated_duration_minutes) as avg_duration,
        SUM(ft.cost) as total_cost
    FROM fleet_vehicles fv
    LEFT JOIN fleet_trips ft ON fv.vehicle_id = ft.vehicle_id
        AND ft.start_time BETWEEN start_date AND CONCAT(end_date, ' 23:59:59')
    GROUP BY fv.vehicle_id, fv.vehicle_type, fv.driver_name
    ORDER BY total_distance DESC;
END //

-- Procedure to get maintenance schedule
CREATE PROCEDURE GetMaintenanceSchedule(IN days_ahead INT)
BEGIN
    SELECT 
        e.equipment_id,
        e.equipment_name,
        e.equipment_type,
        mp.risk_level,
        mp.predicted_failure_date,
        mp.days_until_maintenance,
        mp.recommended_action,
        mwo.work_order_number,
        mwo.priority,
        mwo.scheduled_date
    FROM equipment e
    LEFT JOIN maintenance_predictions mp ON e.equipment_id = mp.equipment_id
        AND mp.created_at = (
            SELECT MAX(created_at) FROM maintenance_predictions mp2 
            WHERE mp2.equipment_id = e.equipment_id
        )
    LEFT JOIN maintenance_work_orders mwo ON e.equipment_id = mwo.equipment_id 
        AND mwo.status IN ('open', 'in_progress')
    WHERE mp.days_until_maintenance <= days_ahead
        OR mwo.scheduled_date <= DATE_ADD(CURDATE(), INTERVAL days_ahead DAY)
    ORDER BY mp.risk_level DESC, mp.days_until_maintenance ASC;
END //

DELIMITER ;

-- ═══════════════════════════════════════════════════════════
-- TRIGGERS FOR DATA INTEGRITY
--═══════════════════════════════════════════════════════════

-- Trigger to update financial health score
DELIMITER //
CREATE TRIGGER update_financial_health_score
BEFORE INSERT ON company_financials
FOR EACH ROW
BEGIN
    SET NEW.financial_health_score = (
        LEAST(100, GREATEST(0, 
            NEW.profit_margin * 50 + 
            (1 - NEW.debt_ratio) * 30 + 
            NEW.growth_rate * 20
        ))
    );
    
    SET NEW.profit = NEW.revenue - NEW.expenses;
    SET NEW.revenue_per_employee = CASE WHEN NEW.employees > 0 THEN NEW.revenue / NEW.employees ELSE 0 END;
    SET NEW.market_cap_per_employee = CASE WHEN NEW.employees > 0 THEN NEW.market_cap / NEW.employees ELSE 0 END;
END //
DELIMITER ;

-- Trigger to log system events
DELIMITER //
CREATE TRIGGER log_company_creation
AFTER INSERT ON companies
FOR EACH ROW
BEGIN
    INSERT INTO system_logs (log_level, module, message, details)
    VALUES ('INFO', 'COMPANY', CONCAT('New company created: ', NEW.company_name), 
            JSON_OBJECT('company_id', NEW.id, 'industry', NEW.industry));
END //
DELIMITER ;

-- ═══════════════════════════════════════════════════════════
-- DATABASE SETUP COMPLETE
--═══════════════════════════════════════════════════════════

-- Show summary of created tables
SELECT 
    TABLE_NAME as 'Created Tables',
    TABLE_ROWS as 'Rows',
    DATA_LENGTH as 'Size (Bytes)'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'biopulse_elite'
ORDER BY TABLE_NAME;
