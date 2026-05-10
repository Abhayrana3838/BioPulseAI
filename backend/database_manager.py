"""
Database Manager for BIOPULSE ELITE
Handles all database operations for ROI, Neural Network, Fleet Logistics, and Maintenance data
"""

import mysql.connector
from mysql.connector import Error
from datetime import datetime, timedelta
import json
import os
from typing import List, Dict, Optional, Any
from contextlib import contextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'biopulse_elite'),
            'port': int(os.getenv('DB_PORT', '3306')),
            'autocommit': True,
            'pool_name': 'biopulse_pool',
            'pool_size': 5
        }
        self.connection_pool = None
        self.initialize_pool()

    def initialize_pool(self):
        """Initialize database connection pool"""
        try:
            self.connection_pool = mysql.connector.pooling.MySQLConnectionPool(**self.config)
            logger.info("Database connection pool created successfully")
        except Error as e:
            logger.error(f"Error creating database connection pool: {e}")
            raise

    @contextmanager
    def get_connection(self):
        """Get database connection from pool"""
        connection = None
        try:
            connection = self.connection_pool.get_connection()
            yield connection
        except Error as e:
            logger.error(f"Database connection error: {e}")
            raise
        finally:
            if connection and connection.is_connected():
                connection.close()

    def execute_query(self, query: str, params: tuple = None, fetch: str = 'all') -> Any:
        """Execute a database query"""
        with self.get_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(query, params or ())
                
                if fetch == 'all':
                    result = cursor.fetchall()
                elif fetch == 'one':
                    result = cursor.fetchone()
                elif fetch == 'many':
                    result = cursor.fetchmany()
                else:
                    result = cursor.lastrowid if cursor.lastrowid else cursor.rowcount
                
                return result
            except Error as e:
                logger.error(f"Query execution error: {e}")
                raise
            finally:
                cursor.close()

    def execute_many(self, query: str, params_list: List[tuple]) -> int:
        """Execute multiple queries at once"""
        with self.get_connection() as connection:
            cursor = connection.cursor()
            try:
                cursor.executemany(query, params_list)
                return cursor.rowcount
            except Error as e:
                logger.error(f"Batch execution error: {e}")
                raise
            finally:
                cursor.close()

    # ═══════════════════════════════════════════════════════════
    # COMPANY ROI ANALYSIS METHODS
    #═══════════════════════════════════════════════════════════

    def save_company(self, company_data: Dict) -> int:
        """Save or update company information"""
        query = """
        INSERT INTO companies (company_name, industry, sector, location, year_founded, website, description)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        industry = VALUES(industry),
        sector = VALUES(sector),
        location = VALUES(location),
        year_founded = VALUES(year_founded),
        website = VALUES(website),
        description = VALUES(description),
        updated_at = CURRENT_TIMESTAMP
        """
        params = (
            company_data.get('company_name'),
            company_data.get('industry'),
            company_data.get('sector'),
            company_data.get('location'),
            company_data.get('year_founded'),
            company_data.get('website'),
            company_data.get('description')
        )
        return self.execute_query(query, params)

    def get_company_id(self, company_name: str, industry: str = None, location: str = None) -> Optional[int]:
        """Get company ID by name and optional filters"""
        query = "SELECT id FROM companies WHERE company_name = %s"
        params = [company_name]
        
        if industry:
            query += " AND industry = %s"
            params.append(industry)
        if location:
            query += " AND location = %s"
            params.append(location)
            
        result = self.execute_query(query, tuple(params), fetch='one')
        return result['id'] if result else None

    def save_company_financials(self, company_id: int, financial_data: Dict) -> int:
        """Save company financial data"""
        query = """
        INSERT INTO company_financials 
        (company_id, revenue, expenses, profit, profit_margin, market_cap, debt_ratio, 
         growth_rate, employees, revenue_per_employee, market_cap_per_employee, 
         financial_health_score, data_period, currency)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            company_id,
            financial_data.get('revenue'),
            financial_data.get('expenses'),
            financial_data.get('profit'),
            financial_data.get('profit_margin'),
            financial_data.get('market_cap'),
            financial_data.get('debt_ratio'),
            financial_data.get('growth_rate'),
            financial_data.get('employees'),
            financial_data.get('revenue_per_employee'),
            financial_data.get('market_cap_per_employee'),
            financial_data.get('financial_health_score'),
            financial_data.get('data_period', f"{datetime.now().year}_Q{(datetime.now().month-1)//3 + 1}"),
            financial_data.get('currency', 'USD')
        )
        return self.execute_query(query, params)

    def save_roi_prediction(self, company_id: int, prediction_data: Dict) -> int:
        """Save ROI prediction results"""
        query = """
        INSERT INTO roi_predictions 
        (company_id, model_type, predicted_roi, confidence_score, actual_roi, 
         prediction_error, feature_importance, model_version, training_data_size)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            company_id,
            prediction_data.get('model_type', 'random_forest'),
            prediction_data.get('predicted_roi'),
            prediction_data.get('confidence'),
            prediction_data.get('actual_roi'),
            prediction_data.get('prediction_error'),
            json.dumps(prediction_data.get('feature_importance', {})),
            prediction_data.get('model_version', '1.0'),
            prediction_data.get('training_data_size', 0)
        )
        return self.execute_query(query, params)

    def save_ai_analysis(self, company_id: int, analysis_data: Dict) -> int:
        """Save AI analysis results"""
        query = """
        INSERT INTO ai_analyses 
        (company_id, analysis_type, ai_model, analysis_text, executive_summary,
         risk_factors, opportunities, recommendations, confidence_score, processing_time_ms)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            company_id,
            analysis_data.get('analysis_type', 'comprehensive'),
            analysis_data.get('ai_model', 'gpt-4'),
            analysis_data.get('analysis_text'),
            analysis_data.get('executive_summary'),
            json.dumps(analysis_data.get('risk_factors', [])),
            json.dumps(analysis_data.get('opportunities', [])),
            json.dumps(analysis_data.get('recommendations', [])),
            analysis_data.get('confidence_score', 0.0),
            analysis_data.get('processing_time_ms', 0)
        )
        return self.execute_query(query, params)

    def get_company_performance_summary(self) -> List[Dict]:
        """Get company performance summary with latest data"""
        query = "SELECT * FROM company_performance_summary ORDER BY company_name"
        return self.execute_query(query)

    def get_company_roi_history(self, company_id: int) -> List[Dict]:
        """Get ROI prediction history for a company"""
        query = """
        SELECT DATE_FORMAT(cf.created_at, '%Y-%m') as period,
               cf.revenue, cf.expenses, cf.profit_margin,
               rp.predicted_roi, rp.confidence_score, rp.model_type
        FROM company_financials cf
        LEFT JOIN roi_predictions rp ON cf.company_id = rp.company_id
        WHERE cf.company_id = %s
        ORDER BY cf.created_at DESC
        """
        return self.execute_query(query, (company_id,))

    # ═══════════════════════════════════════════════════════════
    # NEURAL NETWORK MODEL METHODS
    #═══════════════════════════════════════════════════════════

    def save_ml_model(self, model_data: Dict) -> int:
        """Save ML model metadata"""
        query = """
        INSERT INTO ml_models 
        (model_name, model_type, dataset_name, accuracy, train_accuracy, parameters_count,
         architecture, hyperparameters, training_samples, validation_samples, loss_function,
         optimizer, learning_rate, epochs_trained, training_time_minutes, model_file_path)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        accuracy = VALUES(accuracy),
        train_accuracy = VALUES(train_accuracy),
        parameters_count = VALUES(parameters_count),
        architecture = VALUES(architecture),
        hyperparameters = VALUES(hyperparameters),
        training_samples = VALUES(training_samples),
        validation_samples = VALUES(validation_samples),
        loss_function = VALUES(loss_function),
        optimizer = VALUES(optimizer),
        learning_rate = VALUES(learning_rate),
        epochs_trained = VALUES(epochs_trained),
        training_time_minutes = VALUES(training_time_minutes),
        model_file_path = VALUES(model_file_path),
        updated_at = CURRENT_TIMESTAMP
        """
        params = (
            model_data.get('model_name'),
            model_data.get('model_type'),
            model_data.get('dataset_name'),
            model_data.get('accuracy'),
            model_data.get('train_accuracy'),
            model_data.get('parameters_count'),
            json.dumps(model_data.get('architecture', [])),
            json.dumps(model_data.get('hyperparameters', {})),
            model_data.get('training_samples', 0),
            model_data.get('validation_samples', 0),
            model_data.get('loss_function'),
            model_data.get('optimizer'),
            model_data.get('learning_rate'),
            model_data.get('epochs_trained', 0),
            model_data.get('training_time_minutes', 0),
            model_data.get('model_file_path')
        )
        return self.execute_query(query, params)

    def get_model_id(self, model_name: str, model_type: str) -> Optional[int]:
        """Get model ID by name and type"""
        query = "SELECT id FROM ml_models WHERE model_name = %s AND model_type = %s"
        result = self.execute_query(query, (model_name, model_type), fetch='one')
        return result['id'] if result else None

    def save_training_history(self, model_id: int, epoch_data: Dict) -> int:
        """Save training history for a model"""
        query = """
        INSERT INTO training_history 
        (model_id, epoch, train_loss, val_loss, train_accuracy, val_accuracy,
         learning_rate, batch_size)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            model_id,
            epoch_data.get('epoch'),
            epoch_data.get('train_loss'),
            epoch_data.get('val_loss'),
            epoch_data.get('train_accuracy'),
            epoch_data.get('val_accuracy'),
            epoch_data.get('learning_rate'),
            epoch_data.get('batch_size', 32)
        )
        return self.execute_query(query, params)

    def save_neural_prediction(self, model_id: int, prediction_data: Dict) -> int:
        """Save neural network prediction"""
        query = """
        INSERT INTO neural_network_predictions 
        (model_id, input_data, prediction_result, confidence_score, prediction_class,
         probability_values, processing_time_ms, sample_id, actual_label, is_correct)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            model_id,
            json.dumps(prediction_data.get('input_data', {})),
            json.dumps(prediction_data.get('prediction_result', {})),
            prediction_data.get('confidence_score', 0.0),
            prediction_data.get('prediction_class'),
            json.dumps(prediction_data.get('probability_values', {})),
            prediction_data.get('processing_time_ms', 0),
            prediction_data.get('sample_id'),
            prediction_data.get('actual_label'),
            prediction_data.get('is_correct')
        )
        return self.execute_query(query, params)

    def get_model_predictions(self, model_id: int, limit: int = 100) -> List[Dict]:
        """Get recent predictions for a model"""
        query = """
        SELECT * FROM neural_network_predictions 
        WHERE model_id = %s 
        ORDER BY created_at DESC 
        LIMIT %s
        """
        return self.execute_query(query, (model_id, limit))

    # ═══════════════════════════════════════════════════════════
    # FLEET LOGISTICS METHODS
    #═══════════════════════════════════════════════════════════

    def save_fleet_vehicle(self, vehicle_data: Dict) -> int:
        """Save fleet vehicle information"""
        query = """
        INSERT INTO fleet_vehicles 
        (vehicle_id, vehicle_type, make, model, year, license_plate, driver_name,
         driver_contact, capacity_kg, fuel_type, status, current_location_lat,
         current_location_lng, last_maintenance_date, next_maintenance_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        make = VALUES(make),
        model = VALUES(model),
        year = VALUES(year),
        license_plate = VALUES(license_plate),
        driver_name = VALUES(driver_name),
        driver_contact = VALUES(driver_contact),
        capacity_kg = VALUES(capacity_kg),
        fuel_type = VALUES(fuel_type),
        status = VALUES(status),
        current_location_lat = VALUES(current_location_lat),
        current_location_lng = VALUES(current_location_lng),
        last_maintenance_date = VALUES(last_maintenance_date),
        next_maintenance_date = VALUES(next_maintenance_date),
        updated_at = CURRENT_TIMESTAMP
        """
        params = (
            vehicle_data.get('vehicle_id'),
            vehicle_data.get('vehicle_type'),
            vehicle_data.get('make'),
            vehicle_data.get('model'),
            vehicle_data.get('year'),
            vehicle_data.get('license_plate'),
            vehicle_data.get('driver_name'),
            vehicle_data.get('driver_contact'),
            vehicle_data.get('capacity_kg'),
            vehicle_data.get('fuel_type', 'diesel'),
            vehicle_data.get('status', 'active'),
            vehicle_data.get('current_location_lat'),
            vehicle_data.get('current_location_lng'),
            vehicle_data.get('last_maintenance_date'),
            vehicle_data.get('next_maintenance_date')
        )
        return self.execute_query(query, params)

    def save_location(self, location_data: Dict) -> int:
        """Save location information"""
        query = """
        INSERT INTO locations 
        (location_name, location_type, address, latitude, longitude, contact_person,
         contact_phone, operating_hours)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        address = VALUES(address),
        latitude = VALUES(latitude),
        longitude = VALUES(longitude),
        contact_person = VALUES(contact_person),
        contact_phone = VALUES(contact_phone),
        operating_hours = VALUES(operating_hours)
        """
        params = (
            location_data.get('location_name'),
            location_data.get('location_type', 'plant'),
            location_data.get('address'),
            location_data.get('latitude'),
            location_data.get('longitude'),
            location_data.get('contact_person'),
            location_data.get('contact_phone'),
            json.dumps(location_data.get('operating_hours', {}))
        )
        return self.execute_query(query, params)

    def save_weather_data(self, location_id: int, weather_data: Dict) -> int:
        """Save weather data for a location"""
        query = """
        INSERT INTO weather_data 
        (location_id, temperature_celsius, humidity_percent, wind_speed_kmh,
         pressure_hpa, visibility_km, weather_condition, precipitation_mm,
         uv_index, air_quality_index, data_source)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            location_id,
            weather_data.get('temperature_celsius'),
            weather_data.get('humidity_percent'),
            weather_data.get('wind_speed_kmh'),
            weather_data.get('pressure_hpa'),
            weather_data.get('visibility_km'),
            weather_data.get('weather_condition'),
            weather_data.get('precipitation_mm'),
            weather_data.get('uv_index'),
            weather_data.get('air_quality_index'),
            weather_data.get('data_source', 'google_weather')
        )
        return self.execute_query(query, params)

    def save_fleet_trip(self, trip_data: Dict) -> int:
        """Save fleet trip information"""
        query = """
        INSERT INTO fleet_trips 
        (vehicle_id, origin_location_id, destination_location_id, route_name,
         distance_km, estimated_duration_minutes, actual_duration_minutes,
         start_time, end_time, status, driver_name, cargo_description,
         cargo_weight_kg, fuel_consumed_liters, cost, weather_conditions,
         route_optimization_score)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            trip_data.get('vehicle_id'),
            trip_data.get('origin_location_id'),
            trip_data.get('destination_location_id'),
            trip_data.get('route_name'),
            trip_data.get('distance_km'),
            trip_data.get('estimated_duration_minutes'),
            trip_data.get('actual_duration_minutes'),
            trip_data.get('start_time'),
            trip_data.get('end_time'),
            trip_data.get('status', 'planned'),
            trip_data.get('driver_name'),
            trip_data.get('cargo_description'),
            trip_data.get('cargo_weight_kg'),
            trip_data.get('fuel_consumed_liters'),
            trip_data.get('cost'),
            json.dumps(trip_data.get('weather_conditions', {})),
            trip_data.get('route_optimization_score')
        )
        return self.execute_query(query, params)

    def get_fleet_utilization(self, start_date: str = None, end_date: str = None) -> List[Dict]:
        """Get fleet utilization report"""
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
            
        query = "SELECT * FROM fleet_utilization"
        return self.execute_query(query)

    # ═══════════════════════════════════════════════════════════
    # MAINTENANCE PREDICTION METHODS
    #═══════════════════════════════════════════════════════════

    def save_equipment(self, equipment_data: Dict) -> int:
        """Save equipment information"""
        query = """
        INSERT INTO equipment 
        (equipment_id, equipment_name, equipment_type, manufacturer, model,
         serial_number, installation_date, location_id, criticality,
         expected_lifespan_years, warranty_expiry, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        equipment_name = VALUES(equipment_name),
        manufacturer = VALUES(manufacturer),
        model = VALUES(model),
        serial_number = VALUES(serial_number),
        installation_date = VALUES(installation_date),
        location_id = VALUES(location_id),
        criticality = VALUES(criticality),
        expected_lifespan_years = VALUES(expected_lifespan_years),
        warranty_expiry = VALUES(warranty_expiry),
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
        """
        params = (
            equipment_data.get('equipment_id'),
            equipment_data.get('equipment_name'),
            equipment_data.get('equipment_type'),
            equipment_data.get('manufacturer'),
            equipment_data.get('model'),
            equipment_data.get('serial_number'),
            equipment_data.get('installation_date'),
            equipment_data.get('location_id'),
            equipment_data.get('criticality', 'standard'),
            equipment_data.get('expected_lifespan_years'),
            equipment_data.get('warranty_expiry'),
            equipment_data.get('status', 'operational')
        )
        return self.execute_query(query, params)

    def save_sensor_reading(self, sensor_data: Dict) -> int:
        """Save sensor reading for equipment"""
        query = """
        INSERT INTO sensor_readings 
        (equipment_id, sensor_type, reading_value, unit, threshold_min,
         threshold_max, is_anomaly, anomaly_score, reading_quality)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            sensor_data.get('equipment_id'),
            sensor_data.get('sensor_type'),
            sensor_data.get('reading_value'),
            sensor_data.get('unit'),
            sensor_data.get('threshold_min'),
            sensor_data.get('threshold_max'),
            sensor_data.get('is_anomaly', False),
            sensor_data.get('anomaly_score', 0.0),
            sensor_data.get('reading_quality', 'good')
        )
        return self.execute_query(query, params)

    def save_maintenance_prediction(self, prediction_data: Dict) -> int:
        """Save maintenance prediction results"""
        query = """
        INSERT INTO maintenance_predictions 
        (equipment_id, model_type, prediction_type, prediction_value,
         confidence_score, risk_level, predicted_failure_date,
         days_until_maintenance, recommended_action, feature_importance,
         model_version)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            prediction_data.get('equipment_id'),
            prediction_data.get('model_type'),
            prediction_data.get('prediction_type'),
            prediction_data.get('prediction_value'),
            prediction_data.get('confidence_score', 0.0),
            prediction_data.get('risk_level', 'low'),
            prediction_data.get('predicted_failure_date'),
            prediction_data.get('days_until_maintenance'),
            prediction_data.get('recommended_action'),
            json.dumps(prediction_data.get('feature_importance', {})),
            prediction_data.get('model_version', '1.0')
        )
        return self.execute_query(query, params)

    def save_maintenance_work_order(self, work_order_data: Dict) -> int:
        """Save maintenance work order"""
        query = """
        INSERT INTO maintenance_work_orders 
        (equipment_id, work_order_number, work_order_type, priority,
         description, estimated_duration_hours, actual_duration_hours,
         assigned_technician, technician_contact, parts_used, labor_cost,
         parts_cost, total_cost, status, scheduled_date, completed_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            work_order_data.get('equipment_id'),
            work_order_data.get('work_order_number'),
            work_order_data.get('work_order_type'),
            work_order_data.get('priority', 'medium'),
            work_order_data.get('description'),
            work_order_data.get('estimated_duration_hours'),
            work_order_data.get('actual_duration_hours'),
            work_order_data.get('assigned_technician'),
            work_order_data.get('technician_contact'),
            json.dumps(work_order_data.get('parts_used', [])),
            work_order_data.get('labor_cost', 0.0),
            work_order_data.get('parts_cost', 0.0),
            work_order_data.get('total_cost', 0.0),
            work_order_data.get('status', 'open'),
            work_order_data.get('scheduled_date'),
            work_order_data.get('completed_at')
        )
        return self.execute_query(query, params)

    def get_maintenance_dashboard(self) -> List[Dict]:
        """Get maintenance dashboard data"""
        query = "SELECT * FROM maintenance_dashboard"
        return self.execute_query(query)

    def get_maintenance_schedule(self, days_ahead: int = 30) -> List[Dict]:
        """Get upcoming maintenance schedule"""
        query = """
        SELECT e.equipment_id, e.equipment_name, e.equipment_type,
               mp.risk_level, mp.predicted_failure_date, mp.days_until_maintenance,
               mp.recommended_action, mwo.work_order_number, mwo.priority,
               mwo.scheduled_date
        FROM equipment e
        LEFT JOIN maintenance_predictions mp ON e.equipment_id = mp.equipment_id
            AND mp.created_at = (
                SELECT MAX(created_at) FROM maintenance_predictions mp2 
                WHERE mp2.equipment_id = e.equipment_id
            )
        LEFT JOIN maintenance_work_orders mwo ON e.equipment_id = mwo.equipment_id 
            AND mwo.status IN ('open', 'in_progress')
        WHERE mp.days_until_maintenance <= %s
            OR mwo.scheduled_date <= DATE_ADD(CURDATE(), INTERVAL %s DAY)
        ORDER BY mp.risk_level DESC, mp.days_until_maintenance ASC
        """
        return self.execute_query(query, (days_ahead, days_ahead))

    # ═══════════════════════════════════════════════════════════
    # SYSTEM LOGS AND AUDIT METHODS
    #═══════════════════════════════════════════════════════════

    def log_system_event(self, level: str, module: str, message: str, details: Dict = None, user_id: int = None):
        """Log system events"""
        query = """
        INSERT INTO system_logs (log_level, module, message, details, user_id)
        VALUES (%s, %s, %s, %s, %s)
        """
        params = (level, module, message, json.dumps(details or {}), user_id)
        self.execute_query(query, params)

    def log_data_transfer(self, transfer_type: str, data_source: str, file_name: str, 
                         records_processed: int, records_success: int, records_failed: int,
                         error_details: str = None, user_id: int = None):
        """Log data import/export operations"""
        query = """
        INSERT INTO data_transfer_logs 
        (transfer_type, data_source, file_name, records_processed, records_success,
         records_failed, error_details, user_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            transfer_type, data_source, file_name, records_processed,
            records_success, records_failed, error_details, user_id
        )
        self.execute_query(query, params)

    # ═══════════════════════════════════════════════════════════
    # UTILITY METHODS
    #═══════════════════════════════════════════════════════════

    def test_connection(self) -> bool:
        """Test database connection"""
        try:
            with self.get_connection() as connection:
                return connection.is_connected()
        except Error:
            return False

    def get_database_stats(self) -> Dict:
        """Get database statistics"""
        stats = {}
        tables = [
            'companies', 'company_financials', 'roi_predictions', 'ai_analyses',
            'ml_models', 'training_history', 'neural_network_predictions',
            'fleet_vehicles', 'locations', 'weather_data', 'fleet_trips',
            'equipment', 'sensor_readings', 'maintenance_predictions',
            'maintenance_work_orders', 'system_logs'
        ]
        
        for table in tables:
            try:
                count = self.execute_query(f"SELECT COUNT(*) as count FROM {table}", fetch='one')
                stats[table] = count['count']
            except Error:
                stats[table] = 0
                
        return stats

    def close_pool(self):
        """Close database connection pool"""
        if self.connection_pool:
            self.connection_pool.closeall()
            logger.info("Database connection pool closed")

# Global database manager instance
db_manager = DatabaseManager()
