from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import uuid
from datetime import datetime, timedelta
import random
import hashlib
from typing import Dict, List, Any

app = Flask(__name__)
CORS(app)

# Database initialization
def init_database():
    conn = sqlite3.connect('security_operations.db')
    cursor = conn.cursor()
    
    # Incidents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            severity TEXT NOT NULL,
            status TEXT NOT NULL,
            priority TEXT NOT NULL,
            reported_date TEXT NOT NULL,
            detection_time TEXT NOT NULL,
            containment_time TEXT,
            eradication_time TEXT,
            recovery_time TEXT,
            assigned_team TEXT NOT NULL,
            affected_assets INTEGER NOT NULL,
            root_cause TEXT,
            lessons_learned TEXT,
            business_impact TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Vulnerabilities table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vulnerabilities (
            id TEXT PRIMARY KEY,
            cve_id TEXT NOT NULL,
            severity TEXT NOT NULL,
            cvss_score REAL NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            affected_systems TEXT NOT NULL,
            discovered_date TEXT NOT NULL,
            patched BOOLEAN NOT NULL,
            patch_available BOOLEAN NOT NULL,
            exploitability TEXT NOT NULL,
            scope TEXT NOT NULL,
            remediation_complexity TEXT NOT NULL,
            business_impact TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Security Policies table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS security_policies (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL,
            version TEXT NOT NULL,
            last_updated TEXT NOT NULL,
            next_review_date TEXT NOT NULL,
            compliance_framework TEXT NOT NULL,
            enforcement_level TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Security Reports table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS security_reports (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            report_type TEXT NOT NULL,
            content TEXT NOT NULL,
            metrics TEXT NOT NULL,
            generated_date TEXT NOT NULL,
            generated_by TEXT NOT NULL,
            status TEXT NOT NULL,
            file_path TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Action Logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS action_logs (
            id TEXT PRIMARY KEY,
            action_type TEXT NOT NULL,
            action_details TEXT NOT NULL,
            user_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            status TEXT NOT NULL,
            result TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# Data generators
class SecurityDataGenerator:
    @staticmethod
    def generate_incident_data():
        return {
            'id': f'INC-{uuid.uuid4().hex[:8].upper()}',
            'title': random.choice([
                'Malware Detection on Endpoint',
                'Suspicious Network Activity',
                'Data Exfiltration Attempt',
                'Unauthorized Access Attempt',
                'Phishing Campaign Detected',
                'Ransomware Incident',
                'DDoS Attack on Services',
                'Insider Threat Investigation'
            ]),
            'severity': random.choice(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
            'status': 'NEW',
            'priority': random.choice(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
            'assigned_team': random.choice(['SOC Team', 'Incident Response', 'Threat Intelligence', 'Digital Forensics', 'Security Engineering']),
            'affected_assets': random.randint(1, 50),
            'root_cause': random.choice([
                'Unpatched Software Vulnerability',
                'Weak Authentication Mechanism',
                'Human Error - Misconfiguration',
                'Third-Party Software Flaw',
                'Social Engineering Attack',
                'Insufficient Access Controls'
            ])
        }
    
    @staticmethod
    def generate_vulnerability_data():
        return {
            'id': f'VULN-{uuid.uuid4().hex[:8].upper()}',
            'cve_id': f'CVE-2024-{random.randint(100000, 999999)}',
            'severity': random.choice(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
            'cvss_score': round(random.uniform(1.0, 10.0), 1),
            'title': random.choice([
                'SQL Injection in Web Application',
                'Cross-Site Scripting (XSS) Vulnerability',
                'Buffer Overflow in System Service',
                'Privilege Escalation in OS Component',
                'Denial of Service in Network Service',
                'Information Disclosure in API'
            ]),
            'affected_systems': ','.join(random.choice(['Web Server', 'Database Server', 'Application Server', 'API Gateway']) for _ in range(random.randint(1, 3))),
            'patched': False,
            'patch_available': random.choice([True, False]),
            'exploitability': random.choice(['HIGH', 'LOW']),
            'scope': random.choice(['NETWORK', 'SYSTEM', 'APPLICATION', 'DATA']),
            'remediation_complexity': random.choice(['LOW', 'MEDIUM', 'HIGH'])
        }
    
    @staticmethod
    def generate_policy_data():
        return {
            'id': f'POL-{uuid.uuid4().hex[:8].upper()}',
            'name': random.choice([
                'Password Policy',
                'Access Control Policy',
                'Data Classification Policy',
                'Incident Response Policy',
                'Acceptable Use Policy',
                'Encryption Policy',
                'Remote Access Policy',
                'Backup and Recovery Policy'
            ]),
            'category': random.choice(['Access Control', 'Data Protection', 'Incident Management', 'Compliance', 'Technical Controls']),
            'status': 'ACTIVE',
            'version': f'v{random.randint(1, 5)}.{random.randint(0, 9)}',
            'compliance_framework': random.choice(['SOC 2', 'ISO 27001', 'GDPR', 'HIPAA', 'PCI DSS']),
            'enforcement_level': random.choice(['MANDATORY', 'RECOMMENDED', 'ADVISORY'])
        }

# API Endpoints

@app.route('/api/trigger-incident-response', methods=['POST'])
def trigger_incident_response():
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id', 'system')
        
        # Generate incident data
        incident_data = SecurityDataGenerator.generate_incident_data()
        current_time = datetime.now().isoformat()
        
        # Save to database
        conn = sqlite3.connect('security_operations.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO incidents 
            (id, title, severity, status, priority, reported_date, detection_time, 
             assigned_team, affected_assets, root_cause, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            incident_data['id'],
            incident_data['title'],
            incident_data['severity'],
            incident_data['status'],
            incident_data['priority'],
            current_time,
            current_time,
            incident_data['assigned_team'],
            incident_data['affected_assets'],
            incident_data['root_cause'],
            current_time
        ))
        
        # Log action
        cursor.execute('''
            INSERT INTO action_logs 
            (id, action_type, action_details, user_id, timestamp, status, result)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            'TRIGGER_INCIDENT_RESPONSE',
            json.dumps(incident_data),
            user_id,
            current_time,
            'SUCCESS',
            f'Incident {incident_data["id"]} created successfully'
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Incident response triggered successfully',
            'incident': incident_data,
            'timestamp': current_time
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to trigger incident response: {str(e)}'
        }), 500

@app.route('/api/scan-vulnerabilities', methods=['POST'])
def scan_vulnerabilities():
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id', 'system')
        
        # Simulate vulnerability scan
        vulnerabilities_found = []
        num_vulnerabilities = random.randint(5, 15)
        
        for _ in range(num_vulnerabilities):
            vuln_data = SecurityDataGenerator.generate_vulnerability_data()
            vulnerabilities_found.append(vuln_data)
        
        current_time = datetime.now().isoformat()
        
        # Save to database
        conn = sqlite3.connect('security_operations.db')
        cursor = conn.cursor()
        
        for vuln in vulnerabilities_found:
            cursor.execute('''
                INSERT INTO vulnerabilities 
                (id, cve_id, severity, cvss_score, title, description, affected_systems,
                 discovered_date, patched, patch_available, exploitability, scope,
                 remediation_complexity, business_impact, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                vuln['id'],
                vuln['cve_id'],
                vuln['severity'],
                vuln['cvss_score'],
                vuln['title'],
                'A security vulnerability has been identified that could potentially allow unauthorized access.',
                vuln['affected_systems'],
                current_time,
                vuln['patched'],
                vuln['patch_available'],
                vuln['exploitability'],
                vuln['scope'],
                vuln['remediation_complexity'],
                json.dumps({'level': vuln['severity'], 'affected_users': random.randint(100, 10000)}),
                current_time
            ))
        
        # Log action
        cursor.execute('''
            INSERT INTO action_logs 
            (id, action_type, action_details, user_id, timestamp, status, result)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            'SCAN_VULNERABILITIES',
            json.dumps({'vulnerabilities_found': len(vulnerabilities_found)}),
            user_id,
            current_time,
            'SUCCESS',
            f'Scanned and found {len(vulnerabilities_found)} vulnerabilities'
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Vulnerability scan completed. Found {len(vulnerabilities_found)} vulnerabilities',
            'vulnerabilities': vulnerabilities_found,
            'scan_summary': {
                'total_found': len(vulnerabilities_found),
                'critical': len([v for v in vulnerabilities_found if v['severity'] == 'CRITICAL']),
                'high': len([v for v in vulnerabilities_found if v['severity'] == 'HIGH']),
                'medium': len([v for v in vulnerabilities_found if v['severity'] == 'MEDIUM']),
                'low': len([v for v in vulnerabilities_found if v['severity'] == 'LOW'])
            },
            'timestamp': current_time
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to scan vulnerabilities: {str(e)}'
        }), 500

@app.route('/api/update-security-policies', methods=['POST'])
def update_security_policies():
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id', 'system')
        
        # Generate policy updates
        policies_updated = []
        num_policies = random.randint(3, 8)
        
        for _ in range(num_policies):
            policy_data = SecurityDataGenerator.generate_policy_data()
            policies_updated.append(policy_data)
        
        current_time = datetime.now().isoformat()
        next_review = (datetime.now() + timedelta(days=90)).isoformat()
        
        # Save to database
        conn = sqlite3.connect('security_operations.db')
        cursor = conn.cursor()
        
        for policy in policies_updated:
            cursor.execute('''
                INSERT INTO security_policies 
                (id, name, category, description, status, version, last_updated,
                 next_review_date, compliance_framework, enforcement_level, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                policy['id'],
                policy['name'],
                policy['category'],
                f'Updated {policy["name"]} to enhance security posture and compliance alignment.',
                policy['status'],
                policy['version'],
                current_time,
                next_review,
                policy['compliance_framework'],
                policy['enforcement_level'],
                current_time
            ))
        
        # Log action
        cursor.execute('''
            INSERT INTO action_logs 
            (id, action_type, action_details, user_id, timestamp, status, result)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            'UPDATE_SECURITY_POLICIES',
            json.dumps({'policies_updated': len(policies_updated)}),
            user_id,
            current_time,
            'SUCCESS',
            f'Updated {len(policies_updated)} security policies successfully'
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Security policies updated successfully. {len(policies_updated)} policies modified',
            'policies': policies_updated,
            'update_summary': {
                'total_updated': len(policies_updated),
                'frameworks': list(set(p['compliance_framework'] for p in policies_updated)),
                'categories': list(set(p['category'] for p in policies_updated)),
                'next_review_date': next_review
            },
            'timestamp': current_time
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to update security policies: {str(e)}'
        }), 500

@app.route('/api/generate-security-report', methods=['POST'])
def generate_security_report():
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id', 'system')
        report_type = data.get('report_type', 'comprehensive')
        
        # Generate report data
        current_time = datetime.now().isoformat()
        report_id = f'RPT-{uuid.uuid4().hex[:8].upper()}'
        
        # Get real data from database
        conn = sqlite3.connect('security_operations.db')
        cursor = conn.cursor()
        
        # Get incident statistics
        cursor.execute('SELECT severity, COUNT(*) FROM incidents GROUP BY severity')
        incident_stats = dict(cursor.fetchall())
        
        # Get vulnerability statistics
        cursor.execute('SELECT severity, COUNT(*) FROM vulnerabilities GROUP BY severity')
        vuln_stats = dict(cursor.fetchall())
        
        # Get policy statistics
        cursor.execute('SELECT status, COUNT(*) FROM security_policies GROUP BY status')
        policy_stats = dict(cursor.fetchall())
        
        conn.close()
        
        # Generate report content
        report_content = {
            'executive_summary': {
                'security_score': round(random.uniform(70, 95), 1),
                'overall_posture': random.choice(['EXCELLENT', 'GOOD', 'NEEDS_IMPROVEMENT']),
                'critical_issues': incident_stats.get('CRITICAL', 0) + vuln_stats.get('CRITICAL', 0),
                'recommendations': random.randint(5, 15)
            },
            'incident_metrics': {
                'total_incidents': sum(incident_stats.values()),
                'by_severity': incident_stats,
                'mean_time_to_detect': random.randint(5, 60),
                'mean_time_to_resolve': random.randint(30, 240)
            },
            'vulnerability_metrics': {
                'total_vulnerabilities': sum(vuln_stats.values()),
                'by_severity': vuln_stats,
                'patched_vulnerabilities': random.randint(20, 80),
                'unpatched_critical': vuln_stats.get('CRITICAL', 0)
            },
            'compliance_metrics': {
                'total_policies': sum(policy_stats.values()),
                'by_status': policy_stats,
                'compliance_score': round(random.uniform(75, 95), 1),
                'frameworks_covered': ['SOC 2', 'ISO 27001', 'GDPR', 'PCI DSS']
            },
            'risk_assessment': {
                'high_risk_assets': random.randint(5, 25),
                'medium_risk_assets': random.randint(20, 50),
                'low_risk_assets': random.randint(50, 100),
                'risk_trend': random.choice(['IMPROVING', 'STABLE', 'DEGRADING'])
            }
        }
        
        # Save report to database
        conn = sqlite3.connect('security_operations.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO security_reports 
            (id, title, report_type, content, metrics, generated_date, generated_by, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            report_id,
            f'Security Report - {report_type.title()} - {datetime.now().strftime("%Y-%m-%d")}',
            report_type,
            json.dumps(report_content),
            json.dumps({
                'security_score': report_content['executive_summary']['security_score'],
                'total_incidents': report_content['incident_metrics']['total_incidents'],
                'total_vulnerabilities': report_content['vulnerability_metrics']['total_vulnerabilities'],
                'compliance_score': report_content['compliance_metrics']['compliance_score']
            }),
            current_time,
            user_id,
            'COMPLETED',
            current_time
        ))
        
        # Log action
        cursor.execute('''
            INSERT INTO action_logs 
            (id, action_type, action_details, user_id, timestamp, status, result)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            'GENERATE_SECURITY_REPORT',
            json.dumps({'report_id': report_id, 'report_type': report_type}),
            user_id,
            current_time,
            'SUCCESS',
            f'Security report {report_id} generated successfully'
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Security report generated successfully',
            'report': {
                'id': report_id,
                'title': f'Security Report - {report_type.title()} - {datetime.now().strftime("%Y-%m-%d")}',
                'type': report_type,
                'content': report_content,
                'generated_date': current_time,
                'generated_by': user_id
            },
            'timestamp': current_time
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to generate security report: {str(e)}'
        }), 500

@app.route('/api/get-action-history', methods=['GET'])
def get_action_history():
    try:
        conn = sqlite3.connect('security_operations.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT action_type, action_details, user_id, timestamp, status, result
            FROM action_logs 
            ORDER BY timestamp DESC 
            LIMIT 50
        ''')
        
        actions = []
        for row in cursor.fetchall():
            actions.append({
                'action_type': row[0],
                'action_details': json.loads(row[1]) if row[1] else {},
                'user_id': row[2],
                'timestamp': row[3],
                'status': row[4],
                'result': row[5]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'actions': actions
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get action history: {str(e)}'
        }), 500

@app.route('/api/get-dashboard-data', methods=['GET'])
def get_dashboard_data():
    try:
        conn = sqlite3.connect('security_operations.db')
        cursor = conn.cursor()
        
        # Get counts
        cursor.execute('SELECT COUNT(*) FROM incidents WHERE status != "RESOLVED"')
        active_incidents = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM vulnerabilities WHERE patched = 0')
        open_vulnerabilities = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM security_policies WHERE status = "ACTIVE"')
        active_policies = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM security_reports WHERE generated_date >= date("now", "-7 days")')
        recent_reports = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'dashboard_data': {
                'active_incidents': active_incidents,
                'open_vulnerabilities': open_vulnerabilities,
                'active_policies': active_policies,
                'recent_reports': recent_reports,
                'security_score': round(random.uniform(70, 95), 1)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Failed to get dashboard data: {str(e)}'
        }), 500

if __name__ == '__main__':
    init_database()
    app.run(host='0.0.0.0', port=5003, debug=True)
