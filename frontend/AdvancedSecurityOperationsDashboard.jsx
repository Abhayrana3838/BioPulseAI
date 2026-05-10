import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
   ADVANCED SECURITY OPERATIONS DASHBOARD - 2000+ LINES
   - Groundbreaking Security Features
   - RAG-Implemented Chatbot with OpenAI
   - Real-time Threat Detection & Response
   - Advanced Security Analytics
   - AI-Powered Security Intelligence
═══════════════════════════════════════════════════════════ */

// Advanced Security Data Generator
class SecurityDataGenerator {
  constructor() {
    this.threatTypes = [
      'MALWARE', 'PHISHING', 'DDoS', 'INTRUSION', 'DATA_BREACH', 
      'INSIDER_THREAT', 'ZERO_DAY', 'RANSOMWARE', 'APT_ATTACK', 'SOCIAL_ENGINEERING'
    ];
    
    this.severityLevels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
    
    this.attackVectors = [
      'NETWORK', 'EMAIL', 'WEB', 'MOBILE', 'CLOUD', 'IOT', 'API', 'SOCIAL'
    ];
    
    this.securityTools = [
      'SIEM', 'IDS/IPS', 'EDR', 'Firewall', 'Proxy', 'WAF', 'CASB', 'DLP'
    ];
    
    this.mitigationStatus = ['PENDING', 'IN_PROGRESS', 'MITIGATED', 'ESCALATED'];
  }

  generateThreatIntelligence() {
    const threats = [];
    for (let i = 0; i < 50; i++) {
      threats.push({
        id: `THRT-${10000 + i}`,
        type: this.threatTypes[Math.floor(Math.random() * this.threatTypes.length)],
        severity: this.severityLevels[Math.floor(Math.random() * this.severityLevels.length)],
        source: this.generateIP(),
        destination: this.generateIP(),
        attackVector: this.attackVectors[Math.floor(Math.random() * this.attackVectors.length)],
        confidence: Math.random() * 100,
        firstSeen: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        status: Math.random() > 0.7 ? 'ACTIVE' : 'RESOLVED',
        affectedAssets: Math.floor(Math.random() * 20) + 1,
        riskScore: Math.floor(Math.random() * 100) + 1,
        indicators: this.generateIndicators(),
        mitigationActions: this.generateMitigationActions(),
        assignedAnalyst: this.generateAnalystName(),
        escalationLevel: Math.floor(Math.random() * 5),
        isFalsePositive: Math.random() > 0.9,
        investigationNotes: this.generateInvestigationNotes()
      });
    }
    return threats;
  }

  generateVulnerabilityData() {
    const vulnerabilities = [];
    const cvssScores = [9.8, 8.5, 7.2, 6.1, 4.3, 3.8, 2.1];
    
    for (let i = 0; i < 30; i++) {
      vulnerabilities.push({
        id: `VULN-${20000 + i}`,
        cveId: `CVE-2024-${String(10000 + i).padStart(5, '0')}`,
        title: this.generateVulnerabilityTitle(),
        severity: this.getCVSSSeverity(cvssScores[Math.floor(Math.random() * cvssScores.length)]),
        cvssScore: cvssScores[Math.floor(Math.random() * cvssScores.length)],
        affectedSystem: this.generateSystemName(),
        discoveredDate: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
        patched: Math.random() > 0.6,
        patchDate: Math.random() > 0.6 ? new Date(Date.now() - Math.random() * 86400000 * 7).toISOString() : null,
        exploitAvailable: Math.random() > 0.8,
        activeExploits: Math.random() > 0.9,
        affectedAssets: Math.floor(Math.random() * 50) + 1,
        businessImpact: this.generateBusinessImpact(),
        remediationPriority: this.calculateRemediationPriority(),
        vendor: this.generateVendorName(),
        description: this.generateVulnerabilityDescription(),
        mitigation: this.generateMitigationSteps()
      });
    }
    return vulnerabilities;
  }

  generateSecurityMetrics() {
    return {
      totalThreats: Math.floor(Math.random() * 1000) + 500,
      activeThreats: Math.floor(Math.random() * 100) + 20,
      blockedAttacks: Math.floor(Math.random() * 5000) + 2000,
      securityScore: Math.floor(Math.random() * 30) + 70,
      riskLevel: this.calculateOverallRisk(),
      complianceScore: Math.floor(Math.random() * 20) + 80,
      meanTimeToDetect: Math.floor(Math.random() * 60) + 10,
      meanTimeToRespond: Math.floor(Math.random() * 120) + 30,
      falsePositiveRate: (Math.random() * 10 + 2).toFixed(1),
      incidentsThisWeek: Math.floor(Math.random() * 50) + 10,
      incidentsThisMonth: Math.floor(Math.random() * 200) + 50,
      criticalAssets: Math.floor(Math.random() * 100) + 50,
      protectedAssets: Math.floor(Math.random() * 80) + 40,
      securityToolsActive: this.securityTools.length,
      alertsProcessed: Math.floor(Math.random() * 10000) + 5000,
      automatedResponses: Math.floor(Math.random() * 1000) + 500
    };
  }

  generateIncidentResponse() {
    const incidents = [];
    for (let i = 0; i < 20; i++) {
      incidents.push({
        id: `INC-${30000 + i}`,
        title: this.generateIncidentTitle(),
        severity: this.severityLevels[Math.floor(Math.random() * this.severityLevels.length)],
        status: ['NEW', 'INVESTIGATING', 'CONTAINED', 'ERADICATED', 'RECOVERED'][Math.floor(Math.random() * 5)],
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
        assignedTo: this.generateAnalystName(),
        affectedSystems: Math.floor(Math.random() * 10) + 1,
        estimatedDamage: Math.floor(Math.random() * 100000) + 10000,
        containmentTime: Math.floor(Math.random() * 240) + 30,
        resolutionTime: Math.floor(Math.random() * 720) + 120,
        rootCause: this.generateRootCause(),
        lessonsLearned: this.generateLessonsLearned(),
        preventable: Math.random() > 0.7,
        complianceImpact: Math.random() > 0.8,
        customerImpact: Math.random() > 0.6,
        financialImpact: Math.floor(Math.random() * 500000) + 50000
      });
    }
    return incidents;
  }

  generateComplianceData() {
    return {
      frameworks: ['SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI-DSS', 'NIST'],
      overallCompliance: Math.floor(Math.random() * 20) + 80,
      lastAudit: new Date(Date.now() - Math.random() * 86400000 * 90).toISOString(),
      nextAudit: new Date(Date.now() + Math.random() * 86400000 * 180).toISOString(),
      criticalFindings: Math.floor(Math.random() * 10),
      highFindings: Math.floor(Math.random() * 20) + 5,
      mediumFindings: Math.floor(Math.random() * 30) + 10,
      lowFindings: Math.floor(Math.random() * 40) + 20,
      remediationTasks: Math.floor(Math.random() * 50) + 20,
      completedTasks: Math.floor(Math.random() * 30) + 10
    };
  }

  // Helper methods
  generateIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  generateIndicators() {
    return {
      ips: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => this.generateIP()),
      domains: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => `malicious${Math.random().toString(36).substring(7)}.com`),
      hashes: Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => Math.random().toString(36).substring(2, 18)),
      urls: Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => `http://suspicious${Math.random().toString(36).substring(7)}.com/payload`)
    };
  }

  generateMitigationActions() {
    const actions = [
      'Block IP address at firewall',
      'Isolate affected system',
      'Update antivirus signatures',
      'Patch vulnerable software',
      'Disable compromised accounts',
      'Enhance monitoring',
      'Implement additional controls',
      'Conduct forensic analysis'
    ];
    return Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => actions[Math.floor(Math.random() * actions.length)]);
  }

  generateAnalystName() {
    const names = ['Alex Chen', 'Sarah Johnson', 'Mike Williams', 'Emily Davis', 'David Brown', 'Lisa Anderson'];
    return names[Math.floor(Math.random() * names.length)];
  }

  generateInvestigationNotes() {
    const notes = [
      'Initial analysis indicates sophisticated attack pattern',
      'Multiple attack vectors identified',
      'Lateral movement detected',
      'Data exfiltration attempted',
      'Persistence mechanisms established',
      'Command and control communication observed'
    ];
    return notes[Math.floor(Math.random() * notes.length)];
  }

  generateVulnerabilityTitle() {
    const titles = [
      'Remote Code Execution in Web Application',
      'SQL Injection in Database Layer',
      'Buffer Overflow in Network Service',
      'Privilege Escalation in Operating System',
      'Cross-Site Scripting in User Interface',
      'Denial of Service in Network Protocol',
      'Information Disclosure in API',
      'Authentication Bypass in Login System'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  getCVSSSeverity(score) {
    if (score >= 9.0) return 'CRITICAL';
    if (score >= 7.0) return 'HIGH';
    if (score >= 4.0) return 'MEDIUM';
    return 'LOW';
  }

  generateSystemName() {
    const systems = ['Web Server', 'Database Server', 'Application Server', 'File Server', 'Mail Server', 'Proxy Server', 'VPN Gateway', 'Firewall'];
    const prefixes = ['PROD-', 'DEV-', 'TEST-', 'STAGING-'];
    return prefixes[Math.floor(Math.random() * prefixes.length)] + systems[Math.floor(Math.random() * systems.length)] + '-' + Math.floor(Math.random() * 100);
  }

  generateBusinessImpact() {
    const impacts = ['HIGH', 'MEDIUM', 'LOW'];
    const descriptions = {
      'HIGH': 'Critical business operations affected',
      'MEDIUM': 'Some business disruption expected',
      'LOW': 'Minimal business impact'
    };
    return {
      level: impacts[Math.floor(Math.random() * impacts.length)],
      description: descriptions[impacts[Math.floor(Math.random() * impacts.length)]]
    };
  }

  calculateRemediationPriority() {
    return Math.floor(Math.random() * 10) + 1;
  }

  generateVendorName() {
    const vendors = ['Microsoft', 'Oracle', 'Apache', 'Cisco', 'VMware', 'Red Hat', 'Ubuntu', 'Apple'];
    return vendors[Math.floor(Math.random() * vendors.length)];
  }

  generateVulnerabilityDescription() {
    return `A security vulnerability has been identified that could allow an attacker to compromise system integrity and confidentiality. Immediate remediation is recommended to prevent potential exploitation.`;
  }

  generateMitigationSteps() {
    return [
      'Apply vendor-provided security patch',
      'Implement temporary workaround',
      'Enhance monitoring and logging',
      'Review access controls',
      'Update security configurations'
    ];
  }

  calculateOverallRisk() {
    const risks = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    return risks[Math.floor(Math.random() * risks.length)];
  }

  generateIncidentTitle() {
    const titles = [
      'Suspicious Network Activity Detected',
      'Malware Infection on Workstation',
      'Unauthorized Access Attempt',
      'Data Exfiltration Incident',
      'DDoS Attack on Web Services',
      'Phishing Campaign Targeting Users',
      'Ransomware Incident',
      'Insider Threat Investigation'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  generateRootCause() {
    const causes = [
      'Unpatched software vulnerability',
      'Weak authentication mechanism',
      'Lack of employee training',
      'Insufficient network segmentation',
      'Outdated security controls',
      'Third-party vendor compromise'
    ];
    return causes[Math.floor(Math.random() * causes.length)];
  }

  generateLessonsLearned() {
    return [
      'Need for improved monitoring',
      'Importance of regular patching',
      'Enhanced security awareness required',
      'Better incident response procedures needed',
      'Additional security controls recommended'
    ];
  }
}

// RAG Chatbot Implementation
class SecurityRAGChatbot {
  constructor(openaiApiKey) {
    this.apiKey = openaiApiKey;
    this.knowledgeBase = new Map();
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
    this.securityContext = this.initializeSecurityContext();
  }

  initializeSecurityContext() {
    return {
      domain: 'cybersecurity',
      scope: 'security operations, threat intelligence, incident response, vulnerability management',
      constraints: [
        'Only answer security-related questions',
        'Do not provide hacking instructions',
        'Focus on defensive security measures',
        'Maintain professional and helpful tone',
        'Provide actionable security advice'
      ],
      trustedSources: [
        'NIST Cybersecurity Framework',
        'MITRE ATT&CK Framework',
        'CIS Controls',
        'OWASP Top 10',
        'Security best practices'
      ]
    };
  }

  addToKnowledgeBase(data) {
    // Add various security data to knowledge base
    data.threats?.forEach(threat => {
      const key = `threat_${threat.id}`;
      this.knowledgeBase.set(key, {
        type: 'threat',
        content: threat,
        embedding: this.generateEmbedding(JSON.stringify(threat))
      });
    });

    data.vulnerabilities?.forEach(vuln => {
      const key = `vulnerability_${vuln.id}`;
      this.knowledgeBase.set(key, {
        type: 'vulnerability',
        content: vuln,
        embedding: this.generateEmbedding(JSON.stringify(vuln))
      });
    });

    data.incidents?.forEach(incident => {
      const key = `incident_${incident.id}`;
      this.knowledgeBase.set(key, {
        type: 'incident',
        content: incident,
        embedding: this.generateEmbedding(JSON.stringify(incident))
      });
    });
  }

  generateEmbedding(text) {
    // Simplified embedding generation (in production, use actual embedding model)
    return text.toLowerCase().split(' ').filter(word => word.length > 2);
  }

  retrieveRelevantContext(query, topK = 5) {
    const queryEmbedding = this.generateEmbedding(query);
    const similarities = [];

    this.knowledgeBase.forEach((value, key) => {
      const similarity = this.calculateSimilarity(queryEmbedding, value.embedding);
      similarities.push({ key, similarity, data: value.content });
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(item => item.data);
  }

  calculateSimilarity(embedding1, embedding2) {
    const set1 = new Set(embedding1);
    const set2 = new Set(embedding2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size; // Jaccard similarity
  }

  async generateResponse(query) {
    // Retrieve relevant context
    const relevantContext = this.retrieveRelevantContext(query);
    
    // Check if query is security-related
    if (!this.isSecurityRelatedQuery(query)) {
      return "I can only help with security-related questions. Please ask about cybersecurity, threat intelligence, incident response, or vulnerability management.";
    }

    // Construct prompt with context
    const contextText = relevantContext.map(item => 
      `${item.type.toUpperCase()}: ${JSON.stringify(item, null, 2)}`
    ).join('\n\n');

    const systemPrompt = `You are an expert cybersecurity analyst and security operations specialist. 
You have access to real-time security data including threats, vulnerabilities, and incidents.

CONTEXT:
${contextText}

SECURITY GUIDELINES:
- Only provide defensive security advice
- Do not share sensitive operational details
- Focus on prevention, detection, and response
- Maintain professional and helpful tone
- Provide actionable recommendations
- Reference industry frameworks when appropriate

RESPONSE CONSTRAINTS:
- Be concise but thorough
- Provide specific, actionable advice
- Include risk levels and priorities
- Suggest concrete next steps
- Never provide hacking or offensive security instructions`;

    const userPrompt = `Security Question: ${query}

Please provide a comprehensive security analysis and recommendations based on the available context.`;

    try {
      const response = await this.callOpenAI(systemPrompt, userPrompt);
      
      // Add to conversation history
      this.conversationHistory.push({
        query,
        response,
        timestamp: new Date().toISOString(),
        contextUsed: relevantContext.length
      });

      // Maintain history length
      if (this.conversationHistory.length > this.maxHistoryLength) {
        this.conversationHistory.shift();
      }

      return response;
    } catch (error) {
      console.error('RAG Chatbot Error:', error);
      return "I apologize, but I'm unable to process your request at the moment. Please try again or contact the security team.";
    }
  }

  isSecurityRelatedQuery(query) {
    const securityKeywords = [
      'security', 'threat', 'vulnerability', 'attack', 'malware', 'phishing',
      'incident', 'breach', 'risk', 'compliance', 'firewall', 'antivirus',
      'intrusion', 'detection', 'prevention', 'cyber', 'hacking', 'network',
      'data', 'privacy', 'authentication', 'authorization', 'encryption'
    ];

    const lowerQuery = query.toLowerCase();
    return securityKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  async callOpenAI(systemPrompt, userPrompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.5
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  clearConversation() {
    this.conversationHistory = [];
  }
}

// Advanced Security Dashboard Component
export default function AdvancedSecurityOperationsDashboard() {
  const [securityData, setSecurityData] = useState({
    threats: [],
    vulnerabilities: [],
    incidents: [],
    metrics: {},
    compliance: {}
  });
  
  const [selectedView, setSelectedView] = useState('overview');
  const [chatbot, setChatbot] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [securityScore, setSecurityScore] = useState(85);
  const [threatFeed, setThreatFeed] = useState([]);
  
  const dataGenerator = useRef(new SecurityDataGenerator());
  const chatEndRef = useRef(null);
  const alertIntervalRef = useRef(null);

  // Initialize data and chatbot
  useEffect(() => {
    initializeSecurityData();
    initializeChatbot();
    startRealTimeUpdates();
    
    return () => {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
      }
    };
  }, []);

  const initializeSecurityData = () => {
    const generator = dataGenerator.current;
    const data = {
      threats: generator.generateThreatIntelligence(),
      vulnerabilities: generator.generateVulnerabilityData(),
      incidents: generator.generateIncidentResponse(),
      metrics: generator.generateSecurityMetrics(),
      compliance: generator.generateComplianceData()
    };
    
    setSecurityData(data);
    setSecurityScore(data.metrics.securityScore);
  };

  const initializeChatbot = () => {
    // Initialize with OpenAI API key from environment or user input
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY || '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';
    const bot = new SecurityRAGChatbot(apiKey);
    
    // Add security data to knowledge base
    bot.addToKnowledgeBase({
      threats: dataGenerator.current.generateThreatIntelligence(),
      vulnerabilities: dataGenerator.current.generateVulnerabilityData(),
      incidents: dataGenerator.current.generateIncidentResponse()
    });
    
    setChatbot(bot);
  };

  const startRealTimeUpdates = () => {
    // Generate real-time security alerts
    alertIntervalRef.current = setInterval(() => {
      const newAlert = generateRealTimeAlert();
      setRealTimeAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
      
      // Update security score based on new alerts
      updateSecurityScore(newAlert);
    }, 5000);
  };

  const generateRealTimeAlert = () => {
    const alertTypes = ['THREAT_DETECTED', 'VULNERABILITY_FOUND', 'SECURITY_BREACH', 'ANOMALY_DETECTED'];
    const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    
    return {
      id: `ALERT-${Date.now()}`,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      message: generateAlertMessage(),
      timestamp: new Date().toISOString(),
      source: dataGenerator.current.generateIP(),
      requiresAction: Math.random() > 0.7
    };
  };

  const generateAlertMessage = () => {
    const messages = [
      'Suspicious network traffic detected from unknown source',
      'Multiple failed login attempts detected on critical system',
      'Unusual data access patterns identified',
      'Potential malware signature detected in network traffic',
      'Security policy violation detected',
      'Anomalous user behavior flagged by behavioral analytics',
      'Critical vulnerability discovered in production system',
      'Unauthorized access attempt blocked by firewall'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const updateSecurityScore = (alert) => {
    setSecurityScore(prev => {
      let newScore = prev;
      
      switch (alert.severity) {
        case 'CRITICAL':
          newScore = Math.max(0, prev - 5);
          break;
        case 'HIGH':
          newScore = Math.max(0, prev - 3);
          break;
        case 'MEDIUM':
          newScore = Math.max(0, prev - 1);
          break;
        case 'LOW':
          newScore = Math.min(100, prev + 0.5);
          break;
      }
      
      return Math.round(newScore * 10) / 10;
    });
  };

  const handleChatbotQuery = async () => {
    if (!currentQuery.trim() || !chatbot) return;
    
    setIsChatbotLoading(true);
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentQuery,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await chatbot.generateResponse(currentQuery);
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, botMessage]);
      setCurrentQuery('');
    } catch (error) {
      console.error('Chatbot error:', error);
    } finally {
      setIsChatbotLoading(false);
    }
  };

  const scrollToChatBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToChatBottom();
  }, [chatMessages]);

  // Calculate advanced security metrics
  const advancedMetrics = useMemo(() => {
    const threats = securityData.threats || [];
    const vulnerabilities = securityData.vulnerabilities || [];
    const incidents = securityData.incidents || [];
    
    return {
      threatTrend: calculateThreatTrend(threats),
      vulnerabilityRisk: calculateVulnerabilityRisk(vulnerabilities),
      incidentResponseTime: calculateIncidentResponseTime(incidents),
      securityPosture: calculateSecurityPosture(),
      riskDistribution: calculateRiskDistribution(),
      complianceGaps: calculateComplianceGaps()
    };
  }, [securityData]);

  const calculateThreatTrend = (threats) => {
    const last24h = threats.filter(t => 
      new Date(t.lastSeen) > new Date(Date.now() - 86400000)
    ).length;
    
    const last7d = threats.filter(t => 
      new Date(t.lastSeen) > new Date(Date.now() - 86400000 * 7)
    ).length;
    
    return {
      last24h,
      last7d,
      trend: last24h > last7d / 7 ? 'INCREASING' : 'DECREASING',
      percentage: ((last24h / (last7d / 7) - 1) * 100).toFixed(1)
    };
  };

  const calculateVulnerabilityRisk = (vulnerabilities) => {
    const critical = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const high = vulnerabilities.filter(v => v.severity === 'HIGH').length;
    const total = vulnerabilities.length;
    
    return {
      critical,
      high,
      total,
      riskScore: ((critical * 10 + high * 5) / total * 10).toFixed(1),
      unpatchedCritical: vulnerabilities.filter(v => v.severity === 'CRITICAL' && !v.patched).length
    };
  };

  const calculateIncidentResponseTime = (incidents) => {
    const resolvedIncidents = incidents.filter(i => i.status === 'RECOVERED');
    const avgResponseTime = resolvedIncidents.length > 0 
      ? resolvedIncidents.reduce((sum, i) => sum + i.containmentTime, 0) / resolvedIncidents.length
      : 0;
    
    return {
      average: Math.round(avgResponseTime),
      median: calculateMedian(resolvedIncidents.map(i => i.containmentTime)),
      slaCompliance: (resolvedIncidents.filter(i => i.containmentTime <= 60).length / resolvedIncidents.length * 100).toFixed(1)
    };
  };

  const calculateMedian = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  };

  const calculateSecurityPosture = () => {
    const metrics = securityData.metrics || {};
    
    return {
      overall: securityScore,
      networkSecurity: Math.random() * 20 + 80,
      endpointSecurity: Math.random() * 15 + 85,
      dataSecurity: Math.random() * 25 + 75,
      applicationSecurity: Math.random() * 20 + 80,
      cloudSecurity: Math.random() * 15 + 85,
      identitySecurity: Math.random() * 10 + 90
    };
  };

  const calculateRiskDistribution = () => {
    const threats = securityData.threats || [];
    
    const distribution = {
      CRITICAL: threats.filter(t => t.severity === 'CRITICAL').length,
      HIGH: threats.filter(t => t.severity === 'HIGH').length,
      MEDIUM: threats.filter(t => t.severity === 'MEDIUM').length,
      LOW: threats.filter(t => t.severity === 'LOW').length,
      INFO: threats.filter(t => t.severity === 'INFO').length
    };
    
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    return Object.keys(distribution).reduce((acc, key) => {
      acc[key] = {
        count: distribution[key],
        percentage: ((distribution[key] / total) * 100).toFixed(1)
      };
      return acc;
    }, {});
  };

  const calculateComplianceGaps = () => {
    const compliance = securityData.compliance || {};
    
    return {
      overallGap: 100 - compliance.overallCompliance,
      criticalGaps: compliance.criticalFindings,
      highGaps: compliance.highFindings,
      remediationProgress: (compliance.completedTasks / compliance.remediationTasks * 100).toFixed(1)
    };
  };

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: '#FF4757',
      HIGH: '#FF6B6B',
      MEDIUM: '#FFA502',
      LOW: '#FFD93D',
      INFO: '#6BCF7F'
    };
    return colors[severity] || '#6C5CE7';
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 90) return '#00D2D3';
    if (score >= 80) return '#55EFC4';
    if (score >= 70) return '#FFA502';
    if (score >= 60) return '#FF6B6B';
    return '#FF4757';
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0F0F1E 0%, #1A1A2E 50%, #16213E 100%)',
      color: '#E8E8E8',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Animated Background Grid */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 212, 211, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 211, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <header style={{
        height: '70px',
        background: 'rgba(15, 15, 30, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 212, 211, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 30px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #00D2D3, #55EFC4)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🛡️
          </div>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
              background: 'linear-gradient(135deg, #00D2D3, #55EFC4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Advanced Security Operations
            </h1>
            <p style={{
              fontSize: '12px',
              color: '#8892B0',
              margin: '2px 0 0 0'
            }}>
              Real-time Threat Intelligence & Response
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Security Score Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 20px',
            background: 'rgba(0, 212, 211, 0.1)',
            border: `1px solid ${getSecurityScoreColor(securityScore)}`,
            borderRadius: '25px'
          }}>
            <span style={{ fontSize: '12px', color: '#8892B0' }}>SECURITY SCORE</span>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: getSecurityScoreColor(securityScore)
            }}>
              {securityScore}
            </span>
          </div>

          {/* Real-time Alerts Indicator */}
          <div style={{
            position: 'relative',
            padding: '8px 16px',
            background: 'rgba(255, 71, 87, 0.1)',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#FF4757'
          }}>
            🔴 {realTimeAlerts.filter(a => a.severity === 'CRITICAL').length} Critical Alerts
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={{
        height: '50px',
        background: 'rgba(22, 33, 62, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 212, 211, 0.1)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 30px',
        gap: '30px'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'threats', label: 'Threat Intelligence', icon: '⚠️' },
          { id: 'vulnerabilities', label: 'Vulnerabilities', icon: '🔍' },
          { id: 'incidents', label: 'Incident Response', icon: '🚨' },
          { id: 'compliance', label: 'Compliance', icon: '📋' },
          { id: 'analytics', label: 'Analytics', icon: '📈' },
          { id: 'chatbot', label: 'AI Assistant', icon: '🤖' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id)}
            style={{
              padding: '8px 16px',
              background: selectedView === tab.id 
                ? 'linear-gradient(135deg, rgba(0, 212, 211, 0.2), rgba(85, 239, 196, 0.2))'
                : 'transparent',
              border: selectedView === tab.id 
                ? '1px solid rgba(0, 212, 211, 0.5)'
                : '1px solid transparent',
              borderRadius: '8px',
              color: selectedView === tab.id ? '#00D2D3' : '#8892B0',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Left Panel - Real-time Alerts Feed */}
        <div style={{
          width: '320px',
          background: 'rgba(15, 15, 30, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(0, 212, 211, 0.1)',
          overflowY: 'auto',
          padding: '20px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#00D2D3',
            margin: '0 0 15px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🔴</span>
            Live Security Feed
          </h3>
          
          <AnimatePresence>
            {realTimeAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  padding: '12px',
                  marginBottom: '10px',
                  background: 'rgba(0, 212, 211, 0.05)',
                  border: `1px solid ${getSeverityColor(alert.severity)}40`,
                  borderRadius: '8px',
                  borderLeft: `3px solid ${getSeverityColor(alert.severity)}`
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '5px'
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: getSeverityColor(alert.severity)
                  }}>
                    {alert.severity}
                  </span>
                  <span style={{
                    fontSize: '9px',
                    color: '#8892B0'
                  }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#E8E8E8',
                  lineHeight: '1.4',
                  marginBottom: '5px'
                }}>
                  {alert.message}
                </div>
                <div style={{
                  fontSize: '9px',
                  color: '#8892B0',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Source: {alert.source}</span>
                  {alert.requiresAction && (
                    <span style={{ color: '#FFA502' }}>⚡ Action Required</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}>
          {selectedView === 'overview' && <OverviewView data={securityData} metrics={advancedMetrics} />}
          {selectedView === 'threats' && (
            <ThreatsView 
              threats={securityData.threats} 
              onSelectThreat={setSelectedThreat}
              selectedThreat={selectedThreat}
            />
          )}
          {selectedView === 'vulnerabilities' && (
            <VulnerabilitiesView 
              vulnerabilities={securityData.vulnerabilities}
              onSelectVulnerability={setSelectedVulnerability}
              selectedVulnerability={selectedVulnerability}
            />
          )}
          {selectedView === 'incidents' && (
            <IncidentsView 
              incidents={securityData.incidents}
              onSelectIncident={setSelectedIncident}
              selectedIncident={selectedIncident}
            />
          )}
          {selectedView === 'compliance' && <ComplianceView data={securityData.compliance} />}
          {selectedView === 'analytics' && <AnalyticsView metrics={advancedMetrics} data={securityData} />}
          {selectedView === 'chatbot' && (
            <ChatbotView 
              chatbot={chatbot}
              messages={chatMessages}
              currentQuery={currentQuery}
              setCurrentQuery={setCurrentQuery}
              onSendMessage={handleChatbotQuery}
              isLoading={isChatbotLoading}
              chatEndRef={chatEndRef}
            />
          )}
        </div>

        {/* Right Panel - Quick Actions */}
        <div style={{
          width: '280px',
          background: 'rgba(15, 15, 30, 0.95)',
          backdropFilter: 'blur(10px)',
          borderLeft: '1px solid rgba(0, 212, 211, 0.1)',
          padding: '20px',
          overflowY: 'auto'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#00D2D3',
            margin: '0 0 15px 0'
          }}>
            Quick Actions
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={{
              padding: '12px',
              background: 'linear-gradient(135deg, rgba(255, 71, 87, 0.2), rgba(255, 107, 107, 0.2))',
              border: '1px solid rgba(255, 71, 87, 0.3)',
              borderRadius: '8px',
              color: '#FF4757',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              🚨 Trigger Incident Response
            </button>
            
            <button style={{
              padding: '12px',
              background: 'linear-gradient(135deg, rgba(255, 165, 2, 0.2), rgba(255, 193, 7, 0.2))',
              border: '1px solid rgba(255, 165, 2, 0.3)',
              borderRadius: '8px',
              color: '#FFA502',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              🔍 Scan for Vulnerabilities
            </button>
            
            <button style={{
              padding: '12px',
              background: 'linear-gradient(135deg, rgba(0, 212, 211, 0.2), rgba(85, 239, 196, 0.2))',
              border: '1px solid rgba(0, 212, 211, 0.3)',
              borderRadius: '8px',
              color: '#00D2D3',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              🛡️ Update Security Policies
            </button>
            
            <button style={{
              padding: '12px',
              background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.2), rgba(139, 92, 246, 0.2))',
              border: '1px solid rgba(108, 92, 231, 0.3)',
              borderRadius: '8px',
              color: '#6C5CE7',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              📊 Generate Security Report
            </button>
          </div>
          
          {/* Security Posture Summary */}
          <div style={{
            marginTop: '30px',
            padding: '15px',
            background: 'rgba(0, 212, 211, 0.05)',
            border: '1px solid rgba(0, 212, 211, 0.2)',
            borderRadius: '10px'
          }}>
            <h4 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#00D2D3',
              margin: '0 0 10px 0'
            }}>
              Security Posture
            </h4>
            
            {Object.entries(advancedMetrics.securityPosture || {}).map(([key, value]) => (
              <div key={key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '10px',
                  color: '#8892B0',
                  textTransform: 'capitalize'
                }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div style={{
                  width: '60px',
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${value}%`,
                    height: '100%',
                    background: getSecurityScoreColor(value),
                    borderRadius: '2px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 212, 211, 0.3) transparent;
        }
        
        *::-webkit-scrollbar {
          width: 6px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 211, 0.3);
          border-radius: 3px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 211, 0.5);
        }
      `}</style>
    </div>
  );
}

// Overview View Component
function OverviewView({ data, metrics }) {
  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#E8E8E8',
        margin: '0 0 20px 0'
      }}>
        Security Operations Overview
      </h2>
      
      {/* Key Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { label: 'Active Threats', value: data.metrics?.activeThreats || 0, icon: '⚠️', color: '#FF4757' },
          { label: 'Security Score', value: `${data.metrics?.securityScore || 0}%`, icon: '🛡️', color: '#00D2D3' },
          { label: 'Blocked Attacks', value: data.metrics?.blockedAttacks || 0, icon: '🚫', color: '#55EFC4' },
          { label: 'Compliance Score', value: `${data.metrics?.complianceScore || 0}%`, icon: '📋', color: '#6C5CE7' },
          { label: 'MTTD (min)', value: data.metrics?.meanTimeToDetect || 0, icon: '⏱️', color: '#FFA502' },
          { label: 'MTTR (min)', value: data.metrics?.meanTimeToRespond || 0, icon: '🔧', color: '#FF6B6B' }
        ].map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              padding: '20px',
              background: 'rgba(15, 15, 30, 0.8)',
              border: '1px solid rgba(0, 212, 211, 0.1)',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              fontSize: '24px',
              opacity: 0.3
            }}>
              {metric.icon}
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: metric.color,
              marginBottom: '5px'
            }}>
              {metric.value.toLocaleString()}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#8892B0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {metric.label}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Threat Trends and Risk Distribution */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          padding: '20px',
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#00D2D3',
            margin: '0 0 15px 0'
          }}>
            Threat Trends
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: '#8892B0' }}>Last 24h:</span>
            <span style={{ fontSize: '12px', color: '#E8E8E8', fontWeight: '600' }}>
              {metrics.threatTrend?.last24h || 0}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: '#8892B0' }}>Last 7d:</span>
            <span style={{ fontSize: '12px', color: '#E8E8E8', fontWeight: '600' }}>
              {metrics.threatTrend?.last7d || 0}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#8892B0' }}>Trend:</span>
            <span style={{
              fontSize: '12px',
              color: metrics.threatTrend?.trend === 'INCREASING' ? '#FF4757' : '#55EFC4',
              fontWeight: '600'
            }}>
              {metrics.threatTrend?.trend || 'STABLE'} ({metrics.threatTrend?.percentage || 0}%)
            </span>
          </div>
        </div>
        
        <div style={{
          padding: '20px',
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#00D2D3',
            margin: '0 0 15px 0'
          }}>
            Risk Distribution
          </h3>
          {Object.entries(metrics.riskDistribution || {}).map(([level, data]) => (
            <div key={level} style={{ marginBottom: '10px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '5px'
              }}>
                <span style={{
                  fontSize: '11px',
                  color: getSeverityColor(level),
                  fontWeight: '600'
                }}>
                  {level}
                </span>
                <span style={{ fontSize: '11px', color: '#E8E8E8' }}>
                  {data.count} ({data.percentage}%)
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${data.percentage}%`,
                  height: '100%',
                  background: getSeverityColor(level),
                  borderRadius: '3px'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Threats View Component
function ThreatsView({ threats, onSelectThreat, selectedThreat }) {
  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#E8E8E8',
        margin: '0 0 20px 0'
      }}>
        Threat Intelligence
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        height: 'calc(100vh - 250px)'
      }}>
        {/* Threats List */}
        <div style={{
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px',
          overflowY: 'auto',
          padding: '15px'
        }}>
          {threats.map(threat => (
            <div
              key={threat.id}
              onClick={() => onSelectThreat(threat)}
              style={{
                padding: '15px',
                marginBottom: '10px',
                background: selectedThreat?.id === threat.id 
                  ? 'rgba(0, 212, 211, 0.1)' 
                  : 'rgba(255, 255, 255, 0.02)',
                border: selectedThreat?.id === threat.id 
                  ? '1px solid rgba(0, 212, 211, 0.3)' 
                  : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#E8E8E8'
                }}>
                  {threat.type}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: getSeverityColor(threat.severity),
                  fontWeight: '600'
                }}>
                  {threat.severity}
                </span>
              </div>
              <div style={{
                fontSize: '11px',
                color: '#8892B0',
                marginBottom: '5px'
              }}>
                {threat.attackVector} • Confidence: {threat.confidence.toFixed(1)}%
              </div>
              <div style={{
                fontSize: '10px',
                color: '#8892B0'
              }}>
                Risk Score: {threat.riskScore} • Assets: {threat.affectedAssets}
              </div>
            </div>
          ))}
        </div>
        
        {/* Threat Details */}
        <div style={{
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          overflowY: 'auto'
        }}>
          {selectedThreat ? (
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#00D2D3',
                margin: '0 0 15px 0'
              }}>
                {selectedThreat.type} - {selectedThreat.id}
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12px', color: '#8892B0' }}>Severity:</span>
                  <span style={{
                    fontSize: '12px',
                    color: getSeverityColor(selectedThreat.severity),
                    fontWeight: '600'
                  }}>
                    {selectedThreat.severity}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12px', color: '#8892B0' }}>Risk Score:</span>
                  <span style={{ fontSize: '12px', color: '#E8E8E8' }}>
                    {selectedThreat.riskScore}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12px', color: '#8892B0' }}>Status:</span>
                  <span style={{
                    fontSize: '12px',
                    color: selectedThreat.status === 'ACTIVE' ? '#FF4757' : '#55EFC4'
                  }}>
                    {selectedThreat.status}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12px', color: '#8892B0' }}>Assigned Analyst:</span>
                  <span style={{ fontSize: '12px', color: '#E8E8E8' }}>
                    {selectedThreat.assignedAnalyst}
                  </span>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#00D2D3',
                  margin: '0 0 10px 0'
                }}>
                  Indicators of Compromise
                </h4>
                <div style={{ fontSize: '11px', color: '#E8E8E8' }}>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>IPs:</strong> {selectedThreat.indicators.ips.join(', ')}
                  </div>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>Domains:</strong> {selectedThreat.indicators.domains.join(', ')}
                  </div>
                  <div>
                    <strong>Hashes:</strong> {selectedThreat.indicators.hashes.join(', ')}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#00D2D3',
                  margin: '0 0 10px 0'
                }}>
                  Mitigation Actions
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {selectedThreat.mitigationActions.map((action, index) => (
                    <li key={index} style={{
                      fontSize: '11px',
                      color: '#E8E8E8',
                      marginBottom: '5px'
                    }}>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#8892B0',
              fontSize: '14px'
            }}>
              Select a threat to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Vulnerabilities View Component
function VulnerabilitiesView({ vulnerabilities, onSelectVulnerability, selectedVulnerability }) {
  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#E8E8E8',
        margin: '0 0 20px 0'
      }}>
        Vulnerability Management
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        height: 'calc(100vh - 250px)'
      }}>
        {/* Vulnerabilities List */}
        <div style={{
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px',
          overflowY: 'auto',
          padding: '15px'
        }}>
          {vulnerabilities.map(vuln => (
            <div
              key={vuln.id}
              onClick={() => onSelectVulnerability(vuln)}
              style={{
                padding: '15px',
                marginBottom: '10px',
                background: selectedVulnerability?.id === vuln.id 
                  ? 'rgba(0, 212, 211, 0.1)' 
                  : 'rgba(255, 255, 255, 0.02)',
                border: selectedVulnerability?.id === vuln.id 
                  ? '1px solid rgba(0, 212, 211, 0.3)' 
                  : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#E8E8E8'
                }}>
                  {vuln.cveId}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: getSeverityColor(vuln.severity),
                  fontWeight: '600'
                }}>
                  {vuln.severity}
                </span>
              </div>
              <div style={{
                fontSize: '11px',
                color: '#8892B0',
                marginBottom: '5px',
                lineHeight: '1.3'
              }}>
                {vuln.title}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#8892B0'
              }}>
                CVSS: {vuln.cvssScore} • {vuln.patched ? '✅ Patched' : '⚠️ Unpatched'}
              </div>
            </div>
          ))}
        </div>
        
        {/* Vulnerability Details */}
        <div style={{
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          overflowY: 'auto'
        }}>
          {selectedVulnerability ? (
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#00D2D3',
                margin: '0 0 15px 0'
              }}>
                {selectedVulnerability.cveId}
              </h3>
              
              <div style={{
                fontSize: '13px',
                color: '#E8E8E8',
                marginBottom: '15px',
                lineHeight: '1.4'
              }}>
                {selectedVulnerability.title}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12px', color: '#8892B0' }}>CVSS Score:</span>
                  <span style={{
                    fontSize: '12px',
                    color: getSeverityColor(selectedVulnerability.severity),
                    fontWeight: '600'
                  }}>
                    {selectedVulnerability.cvssScore}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12px', color: '#8892B0' }}>Affected System:</span>
                  <span style={{ fontSize: '12px', color: '#E8E8E8' }}>
                    {selectedVulnerability.affectedSystem}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12px', color: '#8892B0' }}>Vendor:</span>
                  <span style={{ fontSize: '12px', color: '#E8E8E8' }}>
                    {selectedVulnerability.vendor}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12px', color: '#8892B0' }}>Status:</span>
                  <span style={{
                    fontSize: '12px',
                    color: selectedVulnerability.patched ? '#55EFC4' : '#FFA502'
                  }}>
                    {selectedVulnerability.patched ? 'Patched' : 'Unpatched'}
                  </span>
                </div>
                
                {selectedVulnerability.exploitAvailable && (
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(255, 71, 87, 0.1)',
                    border: '1px solid rgba(255, 71, 87, 0.3)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#FF4757',
                    marginBottom: '10px'
                  }}>
                    ⚠️ Exploit Available
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#00D2D3',
                  margin: '0 0 10px 0'
                }}>
                  Business Impact
                </h4>
                <div style={{ fontSize: '11px', color: '#E8E8E8' }}>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>Level:</strong> {selectedVulnerability.businessImpact.level}
                  </div>
                  <div>
                    {selectedVulnerability.businessImpact.description}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#00D2D3',
                  margin: '0 0 10px 0'
                }}>
                  Mitigation Steps
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {selectedVulnerability.mitigation.map((step, index) => (
                    <li key={index} style={{
                      fontSize: '11px',
                      color: '#E8E8E8',
                      marginBottom: '5px'
                    }}>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#8892B0',
              fontSize: '14px'
            }}>
              Select a vulnerability to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Incidents View Component
function IncidentsView({ incidents, onSelectIncident, selectedIncident }) {
  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#E8E8E8',
        margin: '0 0 20px 0'
      }}>
        Incident Response
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        height: 'calc(100vh - 250px)'
      }}>
        {/* Incidents List */}
        <div style={{
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px',
          overflowY: 'auto',
          padding: '15px'
        }}>
          {incidents.map(incident => (
            <div
              key={incident.id}
              onClick={() => onSelectIncident(incident)}
              style={{
                padding: '15px',
                marginBottom: '10px',
                background: selectedIncident?.id === incident.id 
                  ? 'rgba(0, 212, 211, 0.1)' 
                  : 'rgba(255, 255, 255, 0.02)',
                border: selectedIncident?.id === incident.id 
                  ? '1px solid rgba(0, 212, 211, 0.3)' 
                  : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#E8E8E8'
                }}>
                  {incident.id}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: getSeverityColor(incident.severity),
                  fontWeight: '600'
                }}>
                  {incident.severity}
                </span>
              </div>
              <div style={{
                fontSize: '11px',
                color: '#8892B0',
                marginBottom: '5px',
                lineHeight: '1.3'
              }}>
                {incident.title}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#8892B0'
              }}>
                {incident.status} • {incident.assignedTo}
              </div>
            </div>
          ))}
        </div>
        
        {/* Incident Details */}
        <div style={{
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          overflowY: 'auto'
        }}>
          {selectedIncident ? (
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#00D2D3',
                margin: '0 0 15px 0'
              }}>
                {selectedIncident.id}
              </h3>
              
              <div style={{
                fontSize: '13px',
                color: '#E8E8E8',
                marginBottom: '15px',
                lineHeight: '1.4'
              }}>
                {selectedIncident.title}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12px', color: '#8892B0' }}>Severity:</span>
                  <span style={{
                    fontSize: '12px',
                    color: getSeverityColor(selectedIncident.severity),
                    fontWeight: '600'
                  }}>
                    {selectedIncident.severity}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12px', color: '#8892B0' }}>Status:</span>
                  <span style={{ fontSize: '12px', color: '#E8E8E8' }}>
                    {selectedIncident.status}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12px', color: '#8892B0' }}>Assigned To:</span>
                  <span style={{ fontSize: '12px', color: '#E8E8E8' }}>
                    {selectedIncident.assignedTo}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12px', color: '#8892B0' }}>Affected Systems:</span>
                  <span style={{ fontSize: '12px', color: '#E8E8E8' }}>
                    {selectedIncident.affectedSystems}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '12px', color: '#8892B0' }}>Financial Impact:</span>
                  <span style={{ fontSize: '12px', color: '#FF4757' }}>
                    ${selectedIncident.financialImpact.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#00D2D3',
                  margin: '0 0 10px 0'
                }}>
                  Root Cause Analysis
                </h4>
                <div style={{ fontSize: '11px', color: '#E8E8E8' }}>
                  {selectedIncident.rootCause}
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#00D2D3',
                  margin: '0 0 10px 0'
                }}>
                  Response Metrics
                </h4>
                <div style={{ fontSize: '11px', color: '#E8E8E8' }}>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>Containment Time:</strong> {selectedIncident.containmentTime} minutes
                  </div>
                  <div style={{ marginBottom: '5px' }}>
                    <strong>Resolution Time:</strong> {selectedIncident.resolutionTime} minutes
                  </div>
                  <div>
                    <strong>Preventable:</strong> {selectedIncident.preventable ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#00D2D3',
                  margin: '0 0 10px 0'
                }}>
                  Lessons Learned
                </h4>
                <div style={{ fontSize: '11px', color: '#E8E8E8' }}>
                  {selectedIncident.lessonsLearned}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#8892B0',
              fontSize: '14px'
            }}>
              Select an incident to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compliance View Component
function ComplianceView({ data }) {
  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#E8E8E8',
        margin: '0 0 20px 0'
      }}>
        Compliance Management
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          padding: '20px',
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#00D2D3',
            margin: '0 0 15px 0'
          }}>
            Overall Compliance
          </h3>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: data.overallCompliance >= 90 ? '#55EFC4' : data.overallCompliance >= 80 ? '#FFA502' : '#FF4757',
            marginBottom: '10px'
          }}>
            {data.overallCompliance}%
          </div>
          <div style={{ fontSize: '12px', color: '#8892B0' }}>
            Last Audit: {new Date(data.lastAudit).toLocaleDateString()}
          </div>
        </div>
        
        <div style={{
          padding: '20px',
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#00D2D3',
            margin: '0 0 15px 0'
          }}>
            Findings Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#FF4757' }}>Critical:</span>
              <span style={{ fontSize: '11px', color: '#E8E8E8' }}>{data.criticalFindings}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#FF6B6B' }}>High:</span>
              <span style={{ fontSize: '11px', color: '#E8E8E8' }}>{data.highFindings}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#FFA502' }}>Medium:</span>
              <span style={{ fontSize: '11px', color: '#E8E8E8' }}>{data.mediumFindings}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#55EFC4' }}>Low:</span>
              <span style={{ fontSize: '11px', color: '#E8E8E8' }}>{data.lowFindings}</span>
            </div>
          </div>
        </div>
        
        <div style={{
          padding: '20px',
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#00D2D3',
            margin: '0 0 15px 0'
          }}>
            Remediation Progress
          </h3>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#6C5CE7',
            marginBottom: '10px'
          }}>
            {data.remediationProgress}%
          </div>
          <div style={{ fontSize: '12px', color: '#8892B0' }}>
            {data.completedTasks} / {data.remediationTasks} tasks completed
          </div>
        </div>
      </div>
      
      <div style={{
        padding: '20px',
        background: 'rgba(15, 15, 30, 0.8)',
        border: '1px solid rgba(0, 212, 211, 0.1)',
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#00D2D3',
          margin: '0 0 15px 0'
        }}>
          Compliance Frameworks
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {data.frameworks?.map(framework => (
            <div key={framework} style={{
              padding: '15px',
              background: 'rgba(0, 212, 211, 0.05)',
              border: '1px solid rgba(0, 212, 211, 0.2)',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#00D2D3',
                marginBottom: '5px'
              }}>
                {framework}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#8892B0'
              }}>
                Status: Compliant
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Analytics View Component
function AnalyticsView({ metrics, data }) {
  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#E8E8E8',
        margin: '0 0 20px 0'
      }}>
        Security Analytics
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          padding: '20px',
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#00D2D3',
            margin: '0 0 15px 0'
          }}>
            Incident Response Analytics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#8892B0' }}>Avg Response Time:</span>
              <span style={{ fontSize: '11px', color: '#E8E8E8' }}>
                {metrics.incidentResponseTime?.average || 0} min
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#8892B0' }}>Median Response Time:</span>
              <span style={{ fontSize: '11px', color: '#E8E8E8' }}>
                {metrics.incidentResponseTime?.median || 0} min
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#8892B0' }}>SLA Compliance:</span>
              <span style={{ fontSize: '11px', color: '#55EFC4' }}>
                {metrics.incidentResponseTime?.slaCompliance || 0}%
              </span>
            </div>
          </div>
        </div>
        
        <div style={{
          padding: '20px',
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#00D2D3',
            margin: '0 0 15px 0'
          }}>
            Vulnerability Risk Assessment
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#8892B0' }}>Critical Vulnerabilities:</span>
              <span style={{ fontSize: '11px', color: '#FF4757' }}>
                {metrics.vulnerabilityRisk?.critical || 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#8892B0' }}>High Vulnerabilities:</span>
              <span style={{ fontSize: '11px', color: '#FF6B6B' }}>
                {metrics.vulnerabilityRisk?.high || 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#8892B0' }}>Risk Score:</span>
              <span style={{ fontSize: '11px', color: '#FFA502' }}>
                {metrics.vulnerabilityRisk?.riskScore || 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#8892B0' }}>Unpatched Critical:</span>
              <span style={{ fontSize: '11px', color: '#FF4757' }}>
                {metrics.vulnerabilityRisk?.unpatchedCritical || 0}
              </span>
            </div>
          </div>
        </div>
        
        <div style={{
          padding: '20px',
          background: 'rgba(15, 15, 30, 0.8)',
          border: '1px solid rgba(0, 212, 211, 0.1)',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#00D2D3',
            margin: '0 0 15px 0'
          }}>
            Compliance Gaps Analysis
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#8892B0' }}>Overall Gap:</span>
              <span style={{ fontSize: '11px', color: '#FFA502' }}>
                {metrics.complianceGaps?.overallGap || 0}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#8892B0' }}>Critical Gaps:</span>
              <span style={{ fontSize: '11px', color: '#FF4757' }}>
                {metrics.complianceGaps?.criticalGaps || 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#8892B0' }}>Remediation Progress:</span>
              <span style={{ fontSize: '11px', color: '#55EFC4' }}>
                {metrics.complianceGaps?.remediationProgress || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Chatbot View Component
function ChatbotView({ chatbot, messages, currentQuery, setCurrentQuery, onSendMessage, isLoading, chatEndRef }) {
  return (
    <div style={{
      height: 'calc(100vh - 200px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '20px',
        background: 'rgba(15, 15, 30, 0.8)',
        border: '1px solid rgba(0, 212, 211, 0.1)',
        borderRadius: '12px 12px 0 0',
        borderBottom: '1px solid rgba(0, 212, 211, 0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#E8E8E8',
          margin: '0 0 10px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🤖 AI Security Assistant
        </h2>
        <p style={{
          fontSize: '12px',
          color: '#8892B0',
          margin: 0
        }}>
          RAG-powered security intelligence chatbot. Ask me about threats, vulnerabilities, incidents, or security best practices.
        </p>
      </div>
      
      <div style={{
        flex: 1,
        background: 'rgba(15, 15, 30, 0.6)',
        padding: '20px',
        overflowY: 'auto'
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#8892B0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
              AI Security Assistant
            </div>
            <div style={{ fontSize: '12px', maxWidth: '300px' }}>
              I'm here to help with security-related questions. Ask me about threat intelligence, vulnerability management, incident response, or security best practices.
            </div>
            
            <div style={{ marginTop: '30px', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#00D2D3', marginBottom: '10px' }}>
                Example Questions:
              </div>
              <div style={{ fontSize: '11px', color: '#8892B0', lineHeight: '1.6' }}>
                • What are the current critical threats?<br/>
                • How should I respond to a ransomware incident?<br/>
                • What's the best way to patch critical vulnerabilities?<br/>
                • What security metrics should I track?<br/>
                • How can I improve our security posture?
              </div>
            </div>
          </div>
        ) : (
          <div>
            {messages.map(message => (
              <div
                key={message.id}
                style={{
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: message.type === 'user' 
                    ? 'linear-gradient(135deg, rgba(0, 212, 211, 0.2), rgba(85, 239, 196, 0.2))'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: message.type === 'user' 
                    ? '1px solid rgba(0, 212, 211, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#E8E8E8',
                  fontSize: '13px',
                  lineHeight: '1.5'
                }}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#8892B0' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(0, 212, 211, 0.3)',
                  borderTopColor: '#00D2D3',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ fontSize: '12px' }}>Analyzing security data...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>
      
      <div style={{
        padding: '20px',
        background: 'rgba(15, 15, 30, 0.8)',
        border: '1px solid rgba(0, 212, 211, 0.1)',
        borderRadius: '0 0 12px 12px',
        borderTop: '1px solid rgba(0, 212, 211, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Ask about security threats, vulnerabilities, incidents..."
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 212, 211, 0.2)',
              borderRadius: '8px',
              color: '#E8E8E8',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            onClick={onSendMessage}
            disabled={!currentQuery.trim() || isLoading}
            style={{
              padding: '12px 24px',
              background: isLoading 
                ? 'rgba(136, 146, 176, 0.2)' 
                : 'linear-gradient(135deg, rgba(0, 212, 211, 0.2), rgba(85, 239, 196, 0.2))',
              border: isLoading 
                ? '1px solid rgba(136, 146, 176, 0.3)' 
                : '1px solid rgba(0, 212, 211, 0.3)',
              borderRadius: '8px',
              color: isLoading ? '#8892B0' : '#00D2D3',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to get severity color
function getSeverityColor(severity) {
  const colors = {
    CRITICAL: '#FF4757',
    HIGH: '#FF6B6B',
    MEDIUM: '#FFA502',
    LOW: '#FFD93D',
    INFO: '#6BCF7F'
  };
  return colors[severity] || '#6C5CE7';
}
