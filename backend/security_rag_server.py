"""
Advanced Security Operations RAG Server
- RAG-implemented chatbot with OpenAI integration
- Security data generation and storage
- Real-time threat intelligence
- Advanced security analytics
- Database integration for all security data
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime, timedelta
import json
import hashlib
import random
import string
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'biopulse_elite'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'autocommit': True
}

# OpenAI API key
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

class SecurityDataGenerator:
    """Advanced security data generator for comprehensive security operations"""
    
    def __init__(self):
        self.threat_types = [
            'MALWARE', 'PHISHING', 'DDoS', 'INTRUSION', 'DATA_BREACH', 
            'INSIDER_THREAT', 'ZERO_DAY', 'RANSOMWARE', 'APT_ATTACK', 'SOCIAL_ENGINEERING',
            'BOTNET', 'ADVANCED_PERSISTENT_THREAT', 'SUPPLY_CHAIN_ATTACK', 'CLOUD_SECURITY_BREACH'
        ]
        
        self.severity_levels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']
        
        self.attack_vectors = [
            'NETWORK', 'EMAIL', 'WEB', 'MOBILE', 'CLOUD', 'IOT', 'API', 'SOCIAL', 'PHYSICAL'
        ]
        
        self.mitigation_techniques = [
            'NETWORK_SEGMENTATION', 'ENDPOINT_PROTECTION', 'THREAT_HUNTING', 
            'BEHAVIORAL_ANALYSIS', 'ZERO_TRUST', 'ENCRYPTION', 'MULTI_FACTOR_AUTHENTICATION',
            'INTRUSION_PREVENTION', 'DATA_LOSS_PREVENTION', 'SECURITY_AWARENESS_TRAINING'
        ]

    def generate_comprehensive_threat_data(self, count=100):
        """Generate comprehensive threat intelligence data"""
        threats = []
        
        for i in range(count):
            threat = {
                'id': f'THRT-{10000 + i}',
                'type': random.choice(self.threat_types),
                'severity': random.choice(self.severity_levels),
                'source_ip': self.generate_ip(),
                'destination_ip': self.generate_ip(),
                'attack_vector': random.choice(self.attack_vectors),
                'confidence': round(random.uniform(0.3, 1.0), 2),
                'first_seen': (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
                'last_seen': (datetime.now() - timedelta(minutes=random.randint(1, 1440))).isoformat(),
                'status': random.choice(['ACTIVE', 'MONITORING', 'MITIGATED', 'FALSE_POSITIVE']),
                'affected_assets': random.randint(1, 50),
                'risk_score': random.randint(1, 100),
                'mitigation_status': random.choice(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED']),
                'assigned_analyst': self.generate_analyst_name(),
                'escalation_level': random.randint(0, 5),
                'is_false_positive': random.random() > 0.9,
                'investigation_priority': random.randint(1, 10),
                'business_impact': random.choice(['HIGH', 'MEDIUM', 'LOW']),
                'compliance_impact': random.choice(['GDPR', 'HIPAA', 'PCI_DSS', 'SOX', 'NONE']),
                'external_references': self.generate_external_references(),
                'mitigation_actions': self.generate_mitigation_actions(),
                'threat_actors': self.generate_threat_actors(),
                'ttps': self.generate_ttps(), # Tactics, Techniques, Procedures
                'indicators': self.generate_indicators(),
                'contextual_data': self.generate_contextual_data()
            }
            threats.append(threat)
        
        return threats

    def generate_vulnerability_data(self, count=50):
        """Generate comprehensive vulnerability data"""
        vulnerabilities = []
        
        for i in range(count):
            cvss_score = round(random.uniform(2.0, 10.0), 1)
            vulnerability = {
                'id': f'VULN-{20000 + i}',
                'cve_id': f'CVE-2024-{str(10000 + i).zfill(5)}',
                'title': self.generate_vulnerability_title(),
                'severity': self.get_cvss_severity(cvss_score),
                'cvss_score': cvss_score,
                'cvss_vector': self.generate_cvss_vector(),
                'affected_system': self.generate_system_name(),
                'discovered_date': (datetime.now() - timedelta(days=random.randint(1, 90))).isoformat(),
                'patched': random.random() > 0.6,
                'patch_date': (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat() if random.random() > 0.6 else None,
                'exploit_available': random.random() > 0.8,
                'active_exploits': random.random() > 0.95,
                'affected_assets': random.randint(1, 100),
                'business_impact': {
                    'level': random.choice(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
                    'description': self.generate_impact_description(),
                    'estimated_cost': random.randint(10000, 1000000)
                },
                'remediation_priority': random.randint(1, 10),
                'vendor': self.generate_vendor_name(),
                'product': self.generate_product_name(),
                'version': self.generate_version(),
                'description': self.generate_vulnerability_description(),
                'mitigation': self.generate_mitigation_steps(),
                'references': self.generate_vulnerability_references(),
                'affected_components': self.generate_affected_components()
            }
            vulnerabilities.append(vulnerability)
        
        return vulnerabilities

    def generate_incident_data(self, count=30):
        """Generate comprehensive incident response data"""
        incidents = []
        
        for i in range(count):
            incident = {
                'id': f'INC-{30000 + i}',
                'title': self.generate_incident_title(),
                'severity': random.choice(self.severity_levels),
                'status': random.choice(['NEW', 'INVESTIGATING', 'CONTAINED', 'ERADICATED', 'RECOVERED', 'CLOSED']),
                'created_at': (datetime.now() - timedelta(days=random.randint(1, 60))).isoformat(),
                'assigned_to': self.generate_analyst_name(),
                'affected_systems': random.randint(1, 20),
                'estimated_damage': random.randint(10000, 500000),
                'containment_time': random.randint(15, 480),
                'resolution_time': random.randint(60, 1440),
                'root_cause': self.generate_root_cause(),
                'lessons_learned': self.generate_lessons_learned(),
                'preventable': random.random() > 0.7,
                'compliance_impact': random.random() > 0.8,
                'customer_impact': random.random() > 0.6,
                'financial_impact': random.randint(50000, 2000000),
                'reputation_impact': random.choice(['HIGH', 'MEDIUM', 'LOW', 'NONE']),
                'legal_implications': random.random() > 0.9,
                'regulatory_fines': random.randint(0, 100000) if random.random() > 0.8 else 0,
                'response_team': self.generate_response_team(),
                'communication_plan': self.generate_communication_plan(),
                'business_continuity': random.random() > 0.7,
                'forensic_evidence': self.generate_forensic_evidence(),
                'remediation_actions': self.generate_remediation_actions()
            }
            incidents.append(incident)
        
        return incidents

    def generate_security_metrics(self):
        """Generate comprehensive security metrics"""
        return {
            'total_threats': random.randint(500, 2000),
            'active_threats': random.randint(50, 200),
            'blocked_attacks': random.randint(5000, 20000),
            'security_score': random.randint(60, 95),
            'risk_level': random.choice(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
            'compliance_score': random.randint(70, 98),
            'mean_time_to_detect': random.randint(5, 120),
            'mean_time_to_respond': random.randint(30, 300),
            'mean_time_to_contain': random.randint(15, 180),
            'mean_time_to_recover': random.randint(60, 720),
            'false_positive_rate': round(random.uniform(2, 15), 1),
            'incidents_this_week': random.randint(10, 50),
            'incidents_this_month': random.randint(50, 200),
            'critical_assets': random.randint(100, 500),
            'protected_assets': random.randint(80, 450),
            'security_tools_active': random.randint(15, 30),
            'alerts_processed': random.randint(10000, 50000),
            'automated_responses': random.randint(1000, 10000),
            'threat_hunting_hours': random.randint(40, 160),
            'security_awareness_score': random.randint(60, 95),
            'patch_coverage': round(random.uniform(70, 98), 1),
            'vulnerability_backlog': random.randint(50, 500),
            'security_budget_utilization': round(random.uniform(60, 95), 1),
            'third_party_risk_score': random.randint(1, 100),
            'cloud_security_posture': random.randint(65, 92),
            'iot_security_risk': random.randint(1, 100),
            'supply_chain_risk': random.randint(1, 100)
        }

    # Helper methods
    def generate_ip(self):
        return f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"

    def generate_analyst_name(self):
        names = ['Alex Chen', 'Sarah Johnson', 'Mike Williams', 'Emily Davis', 'David Brown', 
                'Lisa Anderson', 'James Wilson', 'Maria Garcia', 'Robert Taylor', 'Jennifer Martinez']
        return random.choice(names)

    def generate_external_references(self):
        return {
            'mitre_attck': f"T{random.randint(1000, 9999)}",
            'cwe_id': f"CWE-{random.randint(100, 2000)}",
            'capec_id': f"CAPEC-{random.randint(100, 500)}",
            'security_blogs': [f"https://blog.example.com/threat-{random.randint(1000, 9999)}"],
            'threat_intelligence_feeds': [f"feed-{random.randint(100, 999)}"]
        }

    def generate_mitigation_actions(self):
        actions = [
            'Block IP address at perimeter firewall',
            'Isolate affected systems from network',
            'Update antivirus and anti-malware signatures',
            'Apply security patches to vulnerable systems',
            'Disable compromised user accounts',
            'Enhance monitoring and logging',
            'Implement additional security controls',
            'Conduct forensic analysis',
            'Review and update access controls',
            'Deploy threat hunting activities'
        ]
        return random.sample(actions, random.randint(2, 5))

    def generate_threat_actors(self):
        actors = [
            'APT28', 'APT29', 'Lazarus Group', 'Fancy Bear', 'Cozy Bear',
            'State-sponsored actors', 'Cybercrime syndicates', 'Hacktivists',
            'Insider threats', 'Supply chain attackers'
        ]
        return random.sample(actors, random.randint(1, 3))

    def generate_ttps(self):
        return {
            'initial_access': random.choice(['Phishing', 'Exploit public-facing application', 'Valid accounts']),
            'execution': random.choice(['Command and scripting interpreter', 'User execution', 'System services']),
            'persistence': random.choice(['Create account', 'Modify existing service', 'Scheduled task']),
            'privilege_escalation': random.choice(['Exploitation for privilege escalation', 'Valid accounts']),
            'defense_evasion': random.choice(['Obfuscated files or information', 'Disable or modify tools']),
            'credential_access': random.choice(['Brute force', 'Credential dumping', 'Man-in-the-middle']),
            'discovery': random.choice(['System information discovery', 'Network service discovery']),
            'lateral_movement': random.choice(['Remote services', 'Remote execution', 'Pass-the-hash']),
            'collection': random.choice(['Data from information repositories', 'Data from local system']),
            'exfiltration': random.choice(['Exfiltration over web service', 'Exfiltration over C2 channel']),
            'impact': random.choice(['Data destruction', 'Service stop', 'Resource hijacking'])
        }

    def generate_indicators(self):
        return {
            'ips': [self.generate_ip() for _ in range(random.randint(1, 5))],
            'domains': [f"malicious{random.choice(['', '-', '_'])}{random.choice(['bot', 'c2', 'phish', 'malware'])}{random.randint(100, 999)}.com" for _ in range(random.randint(1, 3))],
            'hashes': [hashlib.md5(f"malware_{random.randint(1000, 9999)}".encode()).hexdigest() for _ in range(random.randint(1, 2))],
            'urls': [f"http://suspicious{random.randint(100, 999)}.com/payload" for _ in range(random.randint(1, 2))],
            'email_addresses': [f"attacker{random.randint(100, 999)}@suspicious.com" for _ in range(random.randint(1, 2))]
        }

    def generate_contextual_data(self):
        return {
            'geolocation': {
                'country': random.choice(['Russia', 'China', 'North Korea', 'Iran', 'United States', 'Unknown']),
                'region': random.choice(['Unknown', 'APAC', 'EMEA', 'Americas']),
                'city': random.choice(['Unknown', 'Moscow', 'Beijing', 'Pyongyang', 'Tehran'])
            },
            'infrastructure': {
                'asn': f"AS{random.randint(10000, 99999)}",
                'isp': random.choice(['Unknown ISP', 'Cloud Provider', 'Hosting Company']),
                'organization': random.choice(['Unknown Org', 'Tech Company', 'Government Entity'])
            },
            'temporal_context': {
                'time_of_day': random.choice(['Business hours', 'After hours', 'Weekend']),
                'seasonal_pattern': random.choice(['Normal', 'Holiday season', 'Quarter end']),
                'campaign_related': random.random() > 0.7
            }
        }

    def generate_vulnerability_title(self):
        titles = [
            'Remote Code Execution in Web Application Framework',
            'SQL Injection in Database Management System',
            'Buffer Overflow in Network Service Daemon',
            'Privilege Escalation in Operating System Kernel',
            'Cross-Site Scripting in Enterprise Web Portal',
            'Denial of Service in Critical Network Protocol',
            'Information Disclosure in Financial API',
            'Authentication Bypass in Identity Management System',
            'Deserialization Vulnerability in Application Server',
            'Path Traversal in File Management System'
        ]
        return random.choice(titles)

    def get_cvss_severity(self, score):
        if score >= 9.0:
            return 'CRITICAL'
        elif score >= 7.0:
            return 'HIGH'
        elif score >= 4.0:
            return 'MEDIUM'
        else:
            return 'LOW'

    def generate_cvss_vector(self):
        return f"CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H/E:{random.choice(['U', 'F', 'P'])}/RL:{random.choice(['U', 'W', 'T'])}/RC:{random.choice(['U', 'R', 'C'])}"

    def generate_system_name(self):
        prefixes = ['PROD', 'DEV', 'TEST', 'STAGING', 'QA']
        systems = ['WebServer', 'Database', 'AppServer', 'FileServer', 'MailServer', 'Proxy', 'VPN', 'Firewall']
        return f"{random.choice(prefixes)}-{random.choice(systems)}-{random.randint(1, 100)}"

    def generate_impact_description(self):
        descriptions = [
            'Critical business operations could be severely impacted',
            'Moderate disruption to business services expected',
            'Minimal impact on business continuity',
            'Potential data breach with regulatory implications',
            'Significant financial losses possible',
            'Reputational damage and customer trust issues'
        ]
        return random.choice(descriptions)

    def generate_vendor_name(self):
        vendors = ['Microsoft', 'Oracle', 'Apache', 'Cisco', 'VMware', 'Red Hat', 'Ubuntu', 'Apple', 'Google', 'Amazon']
        return random.choice(vendors)

    def generate_product_name(self):
        products = ['Web Server', 'Database Server', 'Application Framework', 'Operating System', 'Security Software']
        return random.choice(products)

    def generate_version(self):
        return f"{random.randint(1, 10)}.{random.randint(0, 20)}.{random.randint(0, 50)}"

    def generate_vulnerability_description(self):
        return f"A security vulnerability has been identified in the software that could allow an attacker to compromise system integrity, confidentiality, or availability. The vulnerability stems from improper input validation and could lead to remote code execution."

    def generate_mitigation_steps(self):
        steps = [
            'Apply vendor-provided security patch immediately',
            'Implement network segmentation to limit lateral movement',
            'Enhance monitoring and logging for affected systems',
            'Review and update access controls',
            'Conduct security awareness training for relevant staff',
            'Implement additional security controls as temporary workaround'
        ]
        return random.sample(steps, random.randint(3, 5))

    def generate_vulnerability_references(self):
        return {
            'vendor_advisory': f"https://vendor.com/advisory/{random.randint(10000, 99999)}",
            'nist_nvd': f"https://nvd.nist.gov/vuln/detail/CVE-2024-{random.randint(10000, 99999)}",
            'security_bulletins': [f"https://security.com/bulletin/{random.randint(1000, 9999)}"]
        }

    def generate_affected_components(self):
        components = ['Authentication Module', 'Database Layer', 'Web Interface', 'API Gateway', 'File System']
        return random.sample(components, random.randint(1, 3))

    def generate_incident_title(self):
        titles = [
            'Sophisticated Phishing Campaign Targeting Executive Team',
            'Ransomware Attack on Critical Production Systems',
            'Data Exfiltration from Customer Database',
            'DDoS Attack on Public-Facing Web Services',
            'Insider Threat Investigation - Unauthorized Data Access',
            'Supply Chain Attack through Third-Party Vendor',
            'Zero-Day Exploit in Enterprise Software',
            'Advanced Persistent Threat Detection',
            'Cloud Security Breach in SaaS Platform',
            'IoT Device Compromise in Operational Technology'
        ]
        return random.choice(titles)

    def generate_root_cause(self):
        causes = [
            'Unpatched software vulnerability in critical system',
            'Weak authentication mechanisms and access controls',
            'Lack of employee security awareness training',
            'Insufficient network segmentation and monitoring',
            'Third-party vendor security compromise',
            'Inadequate security controls in cloud configuration',
            'Failure to implement multi-factor authentication',
            'Outdated security policies and procedures'
        ]
        return random.choice(causes)

    def generate_lessons_learned(self):
        lessons = [
            'Need for improved vulnerability management program',
            'Importance of regular security awareness training',
            'Enhanced monitoring and detection capabilities required',
            'Better incident response procedures needed',
            'Additional security controls recommended',
            'Third-party risk management improvements needed',
            'Cloud security posture must be strengthened',
            'Security metrics and KPI tracking essential'
        ]
        return random.sample(lessons, random.randint(2, 4))

    def generate_response_team(self):
        return {
            'incident_commander': self.generate_analyst_name(),
            'technical_lead': self.generate_analyst_name(),
            'communications_lead': self.generate_analyst_name(),
            'legal_advisor': self.generate_analyst_name(),
            'hr_representative': self.generate_analyst_name(),
            'external_consultants': [self.generate_analyst_name() for _ in range(random.randint(0, 2))]
        }

    def generate_communication_plan(self):
        return {
            'internal_stakeholders': random.choice(['All staff', 'IT department only', 'Leadership team']),
            'external_parties': random.choice(['Customers', 'Regulators', 'Law enforcement', 'None']),
            'communication_frequency': random.choice(['Hourly', 'Daily updates', 'As needed']),
            'spokesperson': self.generate_analyst_name()
        }

    def generate_forensic_evidence(self):
        return {
            'logs_collected': random.choice(['System logs', 'Network logs', 'Application logs', 'All of the above']),
            'memory_dumps': random.choice(['Yes', 'No']),
            'disk_images': random.choice(['Yes', 'No']),
            'network_pcap': random.choice(['Yes', 'No']),
            'evidence_preserved': random.choice(['Yes', 'No', 'Partially'])
        }

    def generate_remediation_actions(self):
        actions = [
            'Isolate affected systems from network',
            'Deploy security patches to vulnerable systems',
            'Reset all compromised credentials',
            'Enhance monitoring and alerting',
            'Review and update security policies',
            'Conduct security awareness training',
            'Implement additional security controls',
            'Perform penetration testing'
        ]
        return random.sample(actions, random.randint(3, 6))

class SecurityRAGSystem:
    """Advanced RAG system for security intelligence"""
    
    def __init__(self, openai_api_key):
        self.openai_api_key = openai_api_key
        self.knowledge_base = {}
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.document_embeddings = None
        self.documents = []
        self.conversation_history = []
        self.max_history_length = 10
        
    def add_security_data(self, threats, vulnerabilities, incidents):
        """Add security data to knowledge base"""
        self.documents = []
        
        # Add threat intelligence
        for threat in threats:
            doc = {
                'id': threat['id'],
                'type': 'threat',
                'content': self.create_threat_document(threat),
                'metadata': threat
            }
            self.documents.append(doc)
        
        # Add vulnerability data
        for vuln in vulnerabilities:
            doc = {
                'id': vuln['id'],
                'type': 'vulnerability',
                'content': self.create_vulnerability_document(vuln),
                'metadata': vuln
            }
            self.documents.append(doc)
        
        # Add incident data
        for incident in incidents:
            doc = {
                'id': incident['id'],
                'type': 'incident',
                'content': self.create_incident_document(incident),
                'metadata': incident
            }
            self.documents.append(doc)
        
        # Create embeddings
        if self.documents:
            texts = [doc['content'] for doc in self.documents]
            self.document_embeddings = self.vectorizer.fit_transform(texts)
            logger.info(f"Created embeddings for {len(self.documents)} security documents")

    def create_threat_document(self, threat):
        """Create searchable document from threat data"""
        return f"""
        Threat Type: {threat['type']}
        Severity: {threat['severity']}
        Attack Vector: {threat['attack_vector']}
        Risk Score: {threat['risk_score']}
        Status: {threat['status']}
        Business Impact: {threat['business_impact']}
        Compliance Impact: {threat['compliance_impact']}
        Affected Assets: {threat['affected_assets']}
        Mitigation Actions: {', '.join(threat['mitigation_actions'])}
        Threat Actors: {', '.join(threat['threat_actors'])}
        Investigation Notes: {threat.get('investigation_notes', 'No notes available')}
        """

    def create_vulnerability_document(self, vuln):
        """Create searchable document from vulnerability data"""
        return f"""
        CVE ID: {vuln['cve_id']}
        Title: {vuln['title']}
        Severity: {vuln['severity']}
        CVSS Score: {vuln['cvss_score']}
        Affected System: {vuln['affected_system']}
        Vendor: {vuln['vendor']}
        Product: {vuln['product']}
        Version: {vuln['version']}
        Patched: {vuln['patched']}
        Exploit Available: {vuln['exploit_available']}
        Business Impact Level: {vuln['business_impact']['level']}
        Remediation Priority: {vuln['remediation_priority']}
        Description: {vuln['description']}
        Mitigation: {', '.join(vuln['mitigation'])}
        """

    def create_incident_document(self, incident):
        """Create searchable document from incident data"""
        return f"""
        Incident ID: {incident['id']}
        Title: {incident['title']}
        Severity: {incident['severity']}
        Status: {incident['status']}
        Root Cause: {incident['root_cause']}
        Affected Systems: {incident['affected_systems']}
        Financial Impact: {incident['financial_impact']}
        Reputation Impact: {incident['reputation_impact']}
        Preventable: {incident['preventable']}
        Compliance Impact: {incident['compliance_impact']}
        Customer Impact: {incident['customer_impact']}
        Lessons Learned: {incident['lessons_learned']}
        Remediation Actions: {', '.join(incident['remediation_actions'])}
        """

    def retrieve_relevant_documents(self, query, top_k=5):
        """Retrieve most relevant documents for query"""
        if not self.document_embeddings is not None:
            return []
        
        # Transform query
        query_embedding = self.vectorizer.transform([query])
        
        # Calculate similarities
        similarities = cosine_similarity(query_embedding, self.document_embeddings).flatten()
        
        # Get top-k most similar documents
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        relevant_docs = []
        for idx in top_indices:
            if similarities[idx] > 0.1:  # Threshold for relevance
                relevant_docs.append({
                    'document': self.documents[idx],
                    'similarity': similarities[idx]
                })
        
        return relevant_docs

    def is_security_related_query(self, query):
        """Check if query is security-related"""
        security_keywords = [
            'security', 'threat', 'vulnerability', 'attack', 'malware', 'phishing',
            'incident', 'breach', 'risk', 'compliance', 'firewall', 'antivirus',
            'intrusion', 'detection', 'prevention', 'cyber', 'hacking', 'network',
            'data', 'privacy', 'authentication', 'authorization', 'encryption',
            'ransomware', 'ddos', 'apt', 'zero-day', 'patch', 'siem', 'soar'
        ]
        
        query_lower = query.lower()
        return any(keyword in query_lower for keyword in security_keywords)

    async def generate_response(self, query):
        """Generate RAG-enhanced response"""
        # Check if query is security-related
        if not self.is_security_related_query(query):
            return "I can only help with security-related questions. Please ask about cybersecurity, threat intelligence, vulnerability management, incident response, or security compliance."

        try:
            # Retrieve relevant documents
            relevant_docs = self.retrieve_relevant_documents(query)
            
            # Construct context
            context_text = ""
            if relevant_docs:
                context_text = "\n\n".join([
                    f"[{doc['document']['type'].upper()} {doc['document']['id']}]: {doc['document']['content']}"
                    for doc in relevant_docs
                ])
            
            # Create system prompt
            system_prompt = """You are an expert cybersecurity analyst and security operations specialist with access to real-time security intelligence data.

Your role is to provide accurate, actionable security advice and analysis based on the provided context.

SECURITY GUIDELINES:
- Only provide defensive security advice
- Do not share sensitive operational details or exploit techniques
- Focus on prevention, detection, and response strategies
- Maintain professional and helpful tone
- Provide specific, actionable recommendations
- Reference industry frameworks (NIST, MITRE ATT&CK, CIS Controls) when appropriate
- Prioritize risk-based approaches

RESPONSE REQUIREMENTS:
- Be concise but comprehensive
- Provide specific, actionable advice
- Include risk levels and priorities
- Suggest concrete next steps with timelines
- Reference relevant security frameworks and standards
- Consider business impact and compliance implications
- Never provide instructions for offensive security activities

CONTEXT FROM SECURITY DATABASE:
""" + (context_text if context_text else "No specific security data found in the database.") + """

Please provide a thorough security analysis and recommendations based on the available context and your expertise."""

            # Create user prompt
            user_prompt = f"Security Question: {query}\n\nPlease provide a comprehensive security analysis including:\n1. Immediate actions required\n2. Risk assessment and prioritization\n3. Recommended security controls\n4. Compliance considerations\n5. Long-term prevention strategies"

            # Call OpenAI API
            response = await self.call_openai_api(system_prompt, user_prompt)
            
            # Add to conversation history
            self.conversation_history.append({
                'query': query,
                'response': response,
                'timestamp': datetime.now().isoformat(),
                'context_used': len(relevant_docs)
            })
            
            # Maintain history length
            if len(self.conversation_history) > self.max_history_length:
                self.conversation_history.pop(0)
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating RAG response: {e}")
            return "I apologize, but I'm unable to process your security query at the moment. Please try again or contact the security team for immediate assistance."

    async def call_openai_api(self, system_prompt, user_prompt):
        """Call OpenAI API for response generation"""
        import aiohttp
        
        headers = {
            'Authorization': f'Bearer {self.openai_api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': 'gpt-4',
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            'max_tokens': 1500,
            'temperature': 0.3,
            'top_p': 0.9,
            'frequency_penalty': 0.5,
            'presence_penalty': 0.5
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                'https://api.openai.com/v1/chat/completions',
                headers=headers,
                json=data
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return result['choices'][0]['message']['content']
                else:
                    error_text = await response.text()
                    raise Exception(f"OpenAI API error: {response.status} - {error_text}")

    def get_conversation_history(self):
        """Get conversation history"""
        return self.conversation_history

    def clear_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []

# Global instances
security_generator = SecurityDataGenerator()
rag_system = SecurityRAGSystem(OPENAI_API_KEY)

# Database connection
def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        logger.error(f"Database connection error: {e}")
        return None

# Initialize security tables
def initialize_security_tables():
    """Initialize security-specific database tables"""
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Create security threats table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS security_threats (
                id VARCHAR(50) PRIMARY KEY,
                type VARCHAR(100),
                severity VARCHAR(20),
                source_ip VARCHAR(45),
                destination_ip VARCHAR(45),
                attack_vector VARCHAR(50),
                confidence DECIMAL(3,2),
                first_seen TIMESTAMP,
                last_seen TIMESTAMP,
                status VARCHAR(20),
                affected_assets INT,
                risk_score INT,
                mitigation_status VARCHAR(20),
                assigned_analyst VARCHAR(100),
                escalation_level INT,
                is_false_positive BOOLEAN,
                investigation_priority INT,
                business_impact VARCHAR(20),
                compliance_impact VARCHAR(50),
                external_references JSON,
                mitigation_actions JSON,
                threat_actors JSON,
                ttps JSON,
                indicators JSON,
                contextual_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # Create security vulnerabilities table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS security_vulnerabilities (
                id VARCHAR(50) PRIMARY KEY,
                cve_id VARCHAR(20),
                title TEXT,
                severity VARCHAR(20),
                cvss_score DECIMAL(3,1),
                cvss_vector VARCHAR(100),
                affected_system VARCHAR(200),
                discovered_date TIMESTAMP,
                patched BOOLEAN,
                patch_date TIMESTAMP,
                exploit_available BOOLEAN,
                active_exploits BOOLEAN,
                affected_assets INT,
                business_impact JSON,
                remediation_priority INT,
                vendor VARCHAR(100),
                product VARCHAR(100),
                version VARCHAR(50),
                description TEXT,
                mitigation JSON,
                references JSON,
                affected_components JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # Create security incidents table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS security_incidents (
                id VARCHAR(50) PRIMARY KEY,
                title TEXT,
                severity VARCHAR(20),
                status VARCHAR(20),
                created_at TIMESTAMP,
                assigned_to VARCHAR(100),
                affected_systems INT,
                estimated_damage DECIMAL(10,2),
                containment_time INT,
                resolution_time INT,
                root_cause TEXT,
                lessons_learned TEXT,
                preventable BOOLEAN,
                compliance_impact BOOLEAN,
                customer_impact BOOLEAN,
                financial_impact DECIMAL(10,2),
                reputation_impact VARCHAR(20),
                legal_implications BOOLEAN,
                regulatory_fines DECIMAL(10,2),
                response_team JSON,
                communication_plan JSON,
                business_continuity BOOLEAN,
                forensic_evidence JSON,
                remediation_actions JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # Create security metrics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS security_metrics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                total_threats INT,
                active_threats INT,
                blocked_attacks INT,
                security_score INT,
                risk_level VARCHAR(20),
                compliance_score INT,
                mean_time_to_detect INT,
                mean_time_to_respond INT,
                mean_time_to_contain INT,
                mean_time_to_recover INT,
                false_positive_rate DECIMAL(5,2),
                incidents_this_week INT,
                incidents_this_month INT,
                critical_assets INT,
                protected_assets INT,
                security_tools_active INT,
                alerts_processed INT,
                automated_responses INT,
                threat_hunting_hours INT,
                security_awareness_score INT,
                patch_coverage DECIMAL(5,2),
                vulnerability_backlog INT,
                security_budget_utilization DECIMAL(5,2),
                third_party_risk_score INT,
                cloud_security_posture INT,
                iot_security_risk INT,
                supply_chain_risk INT,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create indexes for performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_threats_severity ON security_threats(severity)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_threats_status ON security_threats(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_vulns_severity ON security_vulnerabilities(severity)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_vulns_patched ON security_vulnerabilities(patched)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_incidents_severity ON security_incidents(severity)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_incidents_status ON security_incidents(status)")
        
        connection.commit()
        cursor.close()
        connection.close()
        
        logger.info("Security database tables initialized successfully")
        return True
        
    except Error as e:
        logger.error(f"Error initializing security tables: {e}")
        return False

# API Endpoints
@app.route('/api/security/generate-data', methods=['POST'])
def generate_security_data():
    """Generate comprehensive security data"""
    try:
        data = request.get_json()
        threat_count = data.get('threat_count', 100)
        vuln_count = data.get('vulnerability_count', 50)
        incident_count = data.get('incident_count', 30)
        
        # Generate data
        threats = security_generator.generate_comprehensive_threat_data(threat_count)
        vulnerabilities = security_generator.generate_vulnerability_data(vuln_count)
        incidents = security_generator.generate_incident_data(incident_count)
        metrics = security_generator.generate_security_metrics()
        
        # Save to database
        connection = get_db_connection()
        if connection:
            try:
                cursor = connection.cursor()
                
                # Save threats
                for threat in threats:
                    cursor.execute("""
                        INSERT INTO security_threats 
                        (id, type, severity, source_ip, destination_ip, attack_vector,
                         confidence, first_seen, last_seen, status, affected_assets,
                         risk_score, mitigation_status, assigned_analyst, escalation_level,
                         is_false_positive, investigation_priority, business_impact,
                         compliance_impact, external_references, mitigation_actions,
                         threat_actors, ttps, indicators, contextual_data)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                        type = VALUES(type), severity = VALUES(severity),
                        status = VALUES(status), updated_at = CURRENT_TIMESTAMP
                    """, (
                        threat['id'], threat['type'], threat['severity'],
                        threat['source_ip'], threat['destination_ip'], threat['attack_vector'],
                        threat['confidence'], threat['first_seen'], threat['last_seen'],
                        threat['status'], threat['affected_assets'], threat['risk_score'],
                        threat['mitigation_status'], threat['assigned_analyst'],
                        threat['escalation_level'], threat['is_false_positive'],
                        threat['investigation_priority'], threat['business_impact'],
                        threat['compliance_impact'], json.dumps(threat['external_references']),
                        json.dumps(threat['mitigation_actions']), json.dumps(threat['threat_actors']),
                        json.dumps(threat['ttps']), json.dumps(threat['indicators']),
                        json.dumps(threat['contextual_data'])
                    ))
                
                # Save vulnerabilities
                for vuln in vulnerabilities:
                    cursor.execute("""
                        INSERT INTO security_vulnerabilities 
                        (id, cve_id, title, severity, cvss_score, cvss_vector,
                         affected_system, discovered_date, patched, patch_date,
                         exploit_available, active_exploits, affected_assets,
                         business_impact, remediation_priority, vendor, product,
                         version, description, mitigation, references, affected_components)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                        title = VALUES(title), severity = VALUES(severity),
                        patched = VALUES(patched), updated_at = CURRENT_TIMESTAMP
                    """, (
                        vuln['id'], vuln['cve_id'], vuln['title'], vuln['severity'],
                        vuln['cvss_score'], vuln['cvss_vector'], vuln['affected_system'],
                        vuln['discovered_date'], vuln['patched'], vuln['patch_date'],
                        vuln['exploit_available'], vuln['active_exploits'],
                        vuln['affected_assets'], json.dumps(vuln['business_impact']),
                        vuln['remediation_priority'], vuln['vendor'], vuln['product'],
                        vuln['version'], vuln['description'], json.dumps(vuln['mitigation']),
                        json.dumps(vuln['references']), json.dumps(vuln['affected_components'])
                    ))
                
                # Save incidents
                for incident in incidents:
                    cursor.execute("""
                        INSERT INTO security_incidents 
                        (id, title, severity, status, created_at, assigned_to,
                         affected_systems, estimated_damage, containment_time,
                         resolution_time, root_cause, lessons_learned, preventable,
                         compliance_impact, customer_impact, financial_impact,
                         reputation_impact, legal_implications, regulatory_fines,
                         response_team, communication_plan, business_continuity,
                         forensic_evidence, remediation_actions)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                        title = VALUES(title), severity = VALUES(severity),
                        status = VALUES(status), updated_at = CURRENT_TIMESTAMP
                    """, (
                        incident['id'], incident['title'], incident['severity'],
                        incident['status'], incident['created_at'], incident['assigned_to'],
                        incident['affected_systems'], incident['estimated_damage'],
                        incident['containment_time'], incident['resolution_time'],
                        incident['root_cause'], incident['lessons_learned'],
                        incident['preventable'], incident['compliance_impact'],
                        incident['customer_impact'], incident['financial_impact'],
                        incident['reputation_impact'], incident['legal_implications'],
                        incident['regulatory_fines'], json.dumps(incident['response_team']),
                        json.dumps(incident['communication_plan']), incident['business_continuity'],
                        json.dumps(incident['forensic_evidence']), json.dumps(incident['remediation_actions'])
                    ))
                
                # Save metrics
                cursor.execute("""
                    INSERT INTO security_metrics 
                    (total_threats, active_threats, blocked_attacks, security_score,
                     risk_level, compliance_score, mean_time_to_detect,
                     mean_time_to_respond, mean_time_to_contain, mean_time_to_recover,
                     false_positive_rate, incidents_this_week, incidents_this_month,
                     critical_assets, protected_assets, security_tools_active,
                     alerts_processed, automated_responses, threat_hunting_hours,
                     security_awareness_score, patch_coverage, vulnerability_backlog,
                     security_budget_utilization, third_party_risk_score,
                     cloud_security_posture, iot_security_risk, supply_chain_risk)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    metrics['total_threats'], metrics['active_threats'],
                    metrics['blocked_attacks'], metrics['security_score'],
                    metrics['risk_level'], metrics['compliance_score'],
                    metrics['mean_time_to_detect'], metrics['mean_time_to_respond'],
                    metrics['mean_time_to_contain'], metrics['mean_time_to_recover'],
                    metrics['false_positive_rate'], metrics['incidents_this_week'],
                    metrics['incidents_this_month'], metrics['critical_assets'],
                    metrics['protected_assets'], metrics['security_tools_active'],
                    metrics['alerts_processed'], metrics['automated_responses'],
                    metrics['threat_hunting_hours'], metrics['security_awareness_score'],
                    metrics['patch_coverage'], metrics['vulnerability_backlog'],
                    metrics['security_budget_utilization'], metrics['third_party_risk_score'],
                    metrics['cloud_security_posture'], metrics['iot_security_risk'],
                    metrics['supply_chain_risk']
                ))
                
                connection.commit()
                cursor.close()
                
                # Update RAG system
                rag_system.add_security_data(threats, vulnerabilities, incidents)
                
                logger.info(f"Generated and saved {len(threats)} threats, {len(vulnerabilities)} vulnerabilities, {len(incidents)} incidents")
                
            except Error as e:
                logger.error(f"Error saving security data: {e}")
            finally:
                connection.close()
        
        return jsonify({
            'status': 'success',
            'threats': len(threats),
            'vulnerabilities': len(vulnerabilities),
            'incidents': len(incidents),
            'metrics': metrics
        })
        
    except Exception as e:
        logger.error(f"Error generating security data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/security/threats', methods=['GET'])
def get_threats():
    """Get security threats with filtering"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get query parameters
        severity = request.args.get('severity')
        status = request.args.get('status')
        limit = int(request.args.get('limit', 50))
        
        # Build query
        query = "SELECT * FROM security_threats WHERE 1=1"
        params = []
        
        if severity:
            query += " AND severity = %s"
            params.append(severity)
        
        if status:
            query += " AND status = %s"
            params.append(status)
        
        query += " ORDER BY created_at DESC LIMIT %s"
        params.append(limit)
        
        cursor.execute(query, params)
        threats = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'threats': threats,
            'count': len(threats)
        })
        
    except Exception as e:
        logger.error(f"Error getting threats: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/security/vulnerabilities', methods=['GET'])
def get_vulnerabilities():
    """Get security vulnerabilities with filtering"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get query parameters
        severity = request.args.get('severity')
        patched = request.args.get('patched')
        limit = int(request.args.get('limit', 50))
        
        # Build query
        query = "SELECT * FROM security_vulnerabilities WHERE 1=1"
        params = []
        
        if severity:
            query += " AND severity = %s"
            params.append(severity)
        
        if patched is not None:
            query += " AND patched = %s"
            params.append(patched.lower() == 'true')
        
        query += " ORDER BY cvss_score DESC LIMIT %s"
        params.append(limit)
        
        cursor.execute(query, params)
        vulnerabilities = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'vulnerabilities': vulnerabilities,
            'count': len(vulnerabilities)
        })
        
    except Exception as e:
        logger.error(f"Error getting vulnerabilities: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/security/incidents', methods=['GET'])
def get_incidents():
    """Get security incidents with filtering"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get query parameters
        severity = request.args.get('severity')
        status = request.args.get('status')
        limit = int(request.args.get('limit', 50))
        
        # Build query
        query = "SELECT * FROM security_incidents WHERE 1=1"
        params = []
        
        if severity:
            query += " AND severity = %s"
            params.append(severity)
        
        if status:
            query += " AND status = %s"
            params.append(status)
        
        query += " ORDER BY created_at DESC LIMIT %s"
        params.append(limit)
        
        cursor.execute(query, params)
        incidents = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'incidents': incidents,
            'count': len(incidents)
        })
        
    except Exception as e:
        logger.error(f"Error getting incidents: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/security/metrics', methods=['GET'])
def get_security_metrics():
    """Get security metrics"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get latest metrics
        cursor.execute("""
            SELECT * FROM security_metrics 
            ORDER BY recorded_at DESC 
            LIMIT 1
        """)
        metrics = cursor.fetchone()
        
        # Get summary statistics
        cursor.execute("SELECT COUNT(*) as total FROM security_threats")
        threat_count = cursor.fetchone()
        
        cursor.execute("SELECT COUNT(*) as total FROM security_vulnerabilities WHERE patched = FALSE")
        unpatched_vulns = cursor.fetchone()
        
        cursor.execute("SELECT COUNT(*) as total FROM security_incidents WHERE status != 'CLOSED'")
        active_incidents = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'status': 'success',
            'metrics': metrics,
            'summary': {
                'total_threats': threat_count['total'],
                'unpatched_vulnerabilities': unpatched_vulns['total'],
                'active_incidents': active_incidents['total']
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting security metrics: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/security/chatbot', methods=['POST'])
async def chatbot_query():
    """RAG chatbot endpoint"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query.strip():
            return jsonify({'error': 'Query cannot be empty'}), 400
        
        # Generate response
        response = await rag_system.generate_response(query)
        
        return jsonify({
            'status': 'success',
            'response': response,
            'query': query,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in chatbot query: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/security/chatbot/history', methods=['GET'])
def get_chatbot_history():
    """Get chatbot conversation history"""
    try:
        history = rag_system.get_conversation_history()
        
        return jsonify({
            'status': 'success',
            'history': history,
            'count': len(history)
        })
        
    except Exception as e:
        logger.error(f"Error getting chatbot history: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/security/chatbot/clear', methods=['POST'])
def clear_chatbot_history():
    """Clear chatbot conversation history"""
    try:
        rag_system.clear_conversation()
        
        return jsonify({
            'status': 'success',
            'message': 'Conversation history cleared'
        })
        
    except Exception as e:
        logger.error(f"Error clearing chatbot history: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/security/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        connection = get_db_connection()
        db_status = connection is not None
        if connection:
            connection.close()
        
        # Check RAG system
        rag_status = len(rag_system.documents) > 0
        
        return jsonify({
            'status': 'healthy',
            'database_connected': db_status,
            'rag_system_loaded': rag_status,
            'documents_in_rag': len(rag_system.documents),
            'openai_configured': bool(OPENAI_API_KEY),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in health check: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Initialize on startup
if __name__ == '__main__':
    print("🚀 Advanced Security Operations RAG Server Starting...")
    print("🤖 RAG-powered Security Intelligence System")
    print("📊 Features:")
    print("  - Comprehensive threat intelligence")
    print("  - Vulnerability management")
    print("  - Incident response tracking")
    print("  - RAG-implemented chatbot")
    print("  - Real-time security analytics")
    print("  - Database integration")
    
    # Initialize database tables
    if initialize_security_tables():
        print("✅ Security database tables initialized")
    else:
        print("❌ Failed to initialize security database tables")
    
    # Generate initial data
    initial_threats = security_generator.generate_comprehensive_threat_data(50)
    initial_vulns = security_generator.generate_vulnerability_data(25)
    initial_incidents = security_generator.generate_incident_data(15)
    
    # Add to RAG system
    rag_system.add_security_data(initial_threats, initial_vulns, initial_incidents)
    
    print(f"📚 RAG system loaded with {len(rag_system.documents)} security documents")
    
    print("\n🔗 Available endpoints:")
    print("  POST /api/security/generate-data - Generate security data")
    print("  GET  /api/security/threats - Get threat intelligence")
    print("  GET  /api/security/vulnerabilities - Get vulnerabilities")
    print("  GET  /api/security/incidents - Get incidents")
    print("  GET  /api/security/metrics - Get security metrics")
    print("  POST /api/security/chatbot - RAG chatbot query")
    print("  GET  /api/security/chatbot/history - Get conversation history")
    print("  POST /api/security/chatbot/clear - Clear conversation history")
    print("  GET  /api/security/health - Health check")
    
    app.run(host='0.0.0.0', port=5002, debug=True)
