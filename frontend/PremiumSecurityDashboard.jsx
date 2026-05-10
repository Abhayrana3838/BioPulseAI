import { useState, useEffect, useRef, useMemo } from "react";

// Premium Security Data Generator with Enhanced Features
class PremiumSecurityDataGenerator {
  constructor() {
    this.threatTypes = ['MALWARE', 'PHISHING', 'DDoS', 'INTRUSION', 'DATA_BREACH', 'INSIDER_THREAT', 'ZERO_DAY', 'RANSOMWARE', 'APT_ATTACK', 'SOCIAL_ENGINEERING'];
    this.severityLevels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
    this.attackVectors = ['NETWORK', 'EMAIL', 'WEB', 'MOBILE', 'CLOUD', 'IOT', 'API', 'SOCIAL'];
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
        assignedAnalyst: this.generateAnalyst(),
        escalationLevel: Math.floor(Math.random() * 5) + 1,
        estimatedImpact: this.generateImpact()
      });
    }
    return threats;
  }

  generateVulnerabilityData() {
    const vulnerabilities = [];
    for (let i = 0; i < 75; i++) {
      vulnerabilities.push({
        id: `VULN-${20000 + i}`,
        cveId: `CVE-2024-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
        severity: this.severityLevels[Math.floor(Math.random() * this.severityLevels.length)],
        cvssScore: (Math.random() * 10).toFixed(1),
        title: this.generateVulnerabilityTitle(),
        description: this.generateDescription(),
        affectedSystems: this.generateAffectedSystems(),
        discoveredDate: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
        patched: Math.random() > 0.6,
        patchAvailable: Math.random() > 0.3,
        exploitability: Math.random() > 0.5 ? 'HIGH' : 'LOW',
        scope: this.generateScope(),
        remediationComplexity: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
        businessImpact: this.generateBusinessImpact()
      });
    }
    return vulnerabilities;
  }

  generateIncidentResponse() {
    const incidents = [];
    for (let i = 0; i < 25; i++) {
      const status = ['NEW', 'INVESTIGATING', 'CONTAINED', 'ERADICATED', 'RECOVERED'][Math.floor(Math.random() * 5)];
      incidents.push({
        id: `INC-${30000 + i}`,
        title: this.generateIncidentTitle(),
        severity: this.severityLevels[Math.floor(Math.random() * this.severityLevels.length)],
        status: status,
        priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
        reportedDate: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
        detectionTime: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
        containmentTime: status !== 'NEW' ? new Date(Date.now() - Math.random() * 86400000).toISOString() : null,
        eradicationTime: ['RECOVERED', 'ERADICATED'].includes(status) ? new Date(Date.now() - Math.random() * 432000).toISOString() : null,
        recoveryTime: status === 'RECOVERED' ? new Date(Date.now() - Math.random() * 216000).toISOString() : null,
        assignedTeam: this.generateTeam(),
        affectedAssets: Math.floor(Math.random() * 50) + 1,
        rootCause: this.generateRootCause(),
        lessonsLearned: status === 'RECOVERED' ? this.generateLessonsLearned() : null,
        businessImpact: this.generateBusinessImpact()
      });
    }
    return incidents;
  }

  generateSecurityMetrics() {
    return {
      securityScore: Math.floor(Math.random() * 30) + 70,
      activeThreats: Math.floor(Math.random() * 50) + 10,
      blockedAttacks: Math.floor(Math.random() * 1000) + 500,
      meanTimeToDetect: Math.floor(Math.random() * 60) + 5,
      meanTimeToRespond: Math.floor(Math.random() * 120) + 30,
      meanTimeToRecover: Math.floor(Math.random() * 240) + 60,
      complianceScore: Math.floor(Math.random() * 20) + 80,
      riskScore: (Math.random() * 50 + 25).toFixed(1),
      incidentsThisMonth: Math.floor(Math.random() * 20) + 5,
      vulnerabilitiesPatched: Math.floor(Math.random() * 100) + 50,
      securityPosture: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'][Math.floor(Math.random() * 4)],
      threatHuntingSuccess: (Math.random() * 30 + 70).toFixed(1),
      falsePositiveRate: (Math.random() * 15 + 5).toFixed(1)
    };
  }

  generateComplianceData() {
    return {
      overallCompliance: Math.floor(Math.random() * 20) + 80,
      frameworks: [
        { name: 'SOC 2', score: Math.floor(Math.random() * 20) + 80 },
        { name: 'ISO 27001', score: Math.floor(Math.random() * 20) + 80 },
        { name: 'GDPR', score: Math.floor(Math.random() * 20) + 80 },
        { name: 'HIPAA', score: Math.floor(Math.random() * 20) + 80 },
        { name: 'PCI DSS', score: Math.floor(Math.random() * 20) + 80 }
      ],
      criticalFindings: Math.floor(Math.random() * 10),
      highFindings: Math.floor(Math.random() * 20) + 5,
      mediumFindings: Math.floor(Math.random() * 50) + 20,
      lowFindings: Math.floor(Math.random() * 100) + 50,
      remediationTasks: Math.floor(Math.random() * 100) + 50,
      completedTasks: Math.floor(Math.random() * 80) + 20,
      overdueTasks: Math.floor(Math.random() * 20),
      upcomingAudits: this.generateUpcomingAudits()
    };
  }

  // Helper methods
  generateIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  generateIndicators() {
    return {
      ips: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => this.generateIP()),
      domains: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => `malicious${Math.floor(Math.random() * 1000)}.com`),
      hashes: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => this.generateHash()),
      urls: Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => `http://malicious${Math.floor(Math.random() * 1000)}.com/payload`)
    };
  }

  generateHash() {
    return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  generateMitigationActions() {
    const actions = [
      'Block IP addresses at firewall',
      'Update antivirus signatures',
      'Isolate affected systems',
      'Implement network segmentation',
      'Deploy additional monitoring',
      'Conduct forensic analysis',
      'Update security policies',
      'Enhance employee training'
    ];
    return actions.slice(0, Math.floor(Math.random() * 4) + 2);
  }

  generateAnalyst() {
    const analysts = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown', 'Frank Miller'];
    return analysts[Math.floor(Math.random() * analysts.length)];
  }

  generateImpact() {
    const impacts = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    return impacts[Math.floor(Math.random() * impacts.length)];
  }

  generateVulnerabilityTitle() {
    const titles = [
      'SQL Injection in Web Application',
      'Cross-Site Scripting (XSS) Vulnerability',
      'Buffer Overflow in System Service',
      'Privilege Escalation in OS Component',
      'Denial of Service in Network Service',
      'Information Disclosure in API',
      'Authentication Bypass in Login System',
      'Remote Code Execution in Application'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  generateDescription() {
    return 'A security vulnerability has been identified that could potentially allow unauthorized access or system compromise. Immediate remediation is recommended.';
  }

  generateAffectedSystems() {
    const systems = ['Web Server', 'Database Server', 'Application Server', 'API Gateway', 'Load Balancer', 'Firewall'];
    return systems.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  generateScope() {
    const scopes = ['NETWORK', 'SYSTEM', 'APPLICATION', 'DATA'];
    return scopes[Math.floor(Math.random() * scopes.length)];
  }

  generateBusinessImpact() {
    const impacts = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    return {
      level: impacts[Math.floor(Math.random() * impacts.length)],
      affectedUsers: Math.floor(Math.random() * 10000) + 100,
      financialImpact: `$${(Math.random() * 1000000 + 10000).toFixed(0)}`,
      operationalImpact: ['MINIMAL', 'MODERATE', 'SIGNIFICANT', 'SEVERE'][Math.floor(Math.random() * 4)]
    };
  }

  generateIncidentTitle() {
    const titles = [
      'Malware Detection on Endpoint',
      'Suspicious Network Activity',
      'Data Exfiltration Attempt',
      'Unauthorized Access Attempt',
      'Phishing Campaign Detected',
      'Ransomware Incident',
      'DDoS Attack on Services',
      'Insider Threat Investigation'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  generateTeam() {
    const teams = ['SOC Team', 'Incident Response', 'Threat Intelligence', 'Digital Forensics', 'Security Engineering'];
    return teams[Math.floor(Math.random() * teams.length)];
  }

  generateRootCause() {
    const causes = [
      'Unpatched Software Vulnerability',
      'Weak Authentication Mechanism',
      'Human Error - Misconfiguration',
      'Third-Party Software Flaw',
      'Social Engineering Attack',
      'Insufficient Access Controls',
      'Lack of Security Monitoring',
      'Outdated Security Policies'
    ];
    return causes[Math.floor(Math.random() * causes.length)];
  }

  generateLessonsLearned() {
    return 'Incident analysis revealed gaps in security controls. Recommendations include enhanced monitoring, updated incident response procedures, and additional security training.';
  }

  generateUpcomingAudits() {
    return [
      { name: 'SOC 2 Type II', date: new Date(Date.now() + Math.random() * 86400000 * 90).toISOString().split('T')[0] },
      { name: 'PCI DSS Assessment', date: new Date(Date.now() + Math.random() * 86400000 * 120).toISOString().split('T')[0] },
      { name: 'ISO 27001 Surveillance', date: new Date(Date.now() + Math.random() * 86400000 * 60).toISOString().split('T')[0] }
    ];
  }
}

// Enhanced RAG Chatbot with Better Tuning
class PremiumSecurityRAGChatbot {
  constructor(openaiApiKey) {
    this.apiKey = openaiApiKey;
    this.knowledgeBase = [];
    this.conversationHistory = [];
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
  }

  addToKnowledgeBase(securityData) {
    this.knowledgeBase = [
      ...this.knowledgeBase,
      ...securityData.threats.map(threat => ({
        type: 'threat',
        content: `Threat ${threat.id}: ${threat.type} - ${threat.severity} severity. Attack vector: ${threat.attackVector}. Risk score: ${threat.riskScore}. Status: ${threat.status}.`,
        metadata: threat
      })),
      ...securityData.vulnerabilities.map(vuln => ({
        type: 'vulnerability',
        content: `Vulnerability ${vuln.cveId}: ${vuln.title} - ${vuln.severity} severity. CVSS score: ${vuln.cvssScore}. Patched: ${vuln.patched}.`,
        metadata: vuln
      })),
      ...securityData.incidents.map(incident => ({
        type: 'incident',
        content: `Incident ${incident.id}: ${incident.title} - ${incident.severity} severity. Status: ${incident.status}. Priority: ${incident.priority}.`,
        metadata: incident
      }))
    ];
  }

  async generateResponse(query) {
    try {
      // Handle basic greetings and conversational queries
      if (this.isGreeting(query)) {
        return this.getGreetingResponse();
      }
      
      // For non-security queries, provide helpful response
      if (!this.isSecurityRelated(query)) {
        return "I'm your cybersecurity assistant! I can help you with:\n\n🔒 **Security Topics:**\n• Threat intelligence and analysis\n• Vulnerability management\n• Incident response procedures\n• Security policies and compliance\n• Risk assessment\n• Security best practices\n• Network security\n• Data protection\n\nTry asking me about your system security, specific threats, or how to improve your security posture!";
      }

      const relevantInfo = this.searchKnowledgeBase(query);
      const context = this.buildContext(relevantInfo, query);
      const response = await this.callOpenAI(context, query);
      
      this.conversationHistory.push({
        query: query,
        response: response,
        timestamp: new Date().toISOString()
      });
      
      return response;
    } catch (error) {
      console.error('RAG Chatbot Error:', error);
      return "I apologize, but I encountered an error. Let me help you with what I can do:\n\nI'm your cybersecurity assistant and can help you with:\n• Analyzing security threats\n• Reviewing vulnerabilities\n• Incident response guidance\n• Security best practices\n• Compliance requirements\n\nPlease try asking me about a specific security topic, or check your internet connection if the issue persists.";
    }
  }

  isGreeting(query) {
    const greetings = [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
      'how are you', 'what\'s up', 'greetings', 'yo', 'thanks', 'thank you',
      'help', 'what can you do', 'who are you', 'introduce yourself'
    ];
    
    const lowerQuery = query.toLowerCase().trim();
    return greetings.some(greeting => lowerQuery.includes(greeting) || lowerQuery === greeting);
  }

  getGreetingResponse() {
    const responses = [
      "Hello! I'm your cybersecurity assistant. I can help you analyze threats, manage vulnerabilities, respond to incidents, and improve your security posture. What security topic would you like to discuss?",
      "Hi there! I'm here to help with all your cybersecurity needs. Ask me about your system security, threat intelligence, or any security concerns you have!",
      "Greetings! I'm your expert cybersecurity assistant. I have access to your security data and can provide insights on threats, vulnerabilities, and security best practices. How can I help secure your systems today?",
      "Hello! I'm ready to assist with cybersecurity. I can analyze your security data, provide threat intelligence, and help with incident response. What would you like to know about your security posture?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  isSecurityRelated(query) {
    const securityKeywords = [
      'threat', 'vulnerability', 'incident', 'security', 'attack', 'malware', 'phishing',
      'ransomware', 'firewall', 'antivirus', 'intrusion', 'breach', 'cyber', 'hack',
      'patch', 'cve', 'risk', 'compliance', 'audit', 'soc', 'siem', 'endpoint',
      'network', 'data', 'privacy', 'authentication', 'authorization', 'encryption',
      'system', 'protect', 'monitor', 'alert', 'defense', 'secure', 'safety',
      'policy', 'procedure', 'guideline', 'framework', 'standard', 'regulation',
      'access', 'login', 'password', 'user', 'admin', 'privilege', 'permission',
      'malicious', 'suspicious', 'anomaly', 'detection', 'prevention', 'response',
      'backup', 'recovery', 'disaster', 'business continuity', 'resilience'
    ];
    
    const lowerQuery = query.toLowerCase();
    return securityKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  searchKnowledgeBase(query) {
    const lowerQuery = query.toLowerCase();
    const relevantDocs = [];
    
    this.knowledgeBase.forEach(doc => {
      const content = doc.content.toLowerCase();
      if (content.includes(lowerQuery) || this.partialMatch(lowerQuery, content)) {
        relevantDocs.push(doc);
      }
    });
    
    return relevantDocs.slice(0, 5);
  }

  partialMatch(query, content) {
    const queryWords = query.split(' ');
    let matchCount = 0;
    
    queryWords.forEach(word => {
      if (content.includes(word) && word.length > 3) {
        matchCount++;
      }
    });
    
    return matchCount >= 2;
  }

  buildContext(relevantInfo, query) {
    const lowerQuery = query.toLowerCase();
    
    // Handle system security overview questions
    if (lowerQuery.includes('system security') || lowerQuery.includes('security status') || 
        lowerQuery.includes('overall security') || lowerQuery.includes('security posture')) {
      return this.buildSystemSecurityContext();
    }
    
    if (relevantInfo.length === 0) {
      return "No specific security data found for this query. Provide general security guidance based on cybersecurity best practices.";
    }
    
    let context = "Based on current security data from your systems:\n\n";
    
    relevantInfo.forEach((doc, index) => {
      context += `${index + 1}. ${doc.content}\n`;
    });
    
    // Add summary statistics for better context
    if (this.knowledgeBase.length > 0) {
      const threatCount = this.knowledgeBase.filter(doc => doc.type === 'threat').length;
      const vulnCount = this.knowledgeBase.filter(doc => doc.type === 'vulnerability').length;
      const incidentCount = this.knowledgeBase.filter(doc => doc.type === 'incident').length;
      
      context += `\n\nCurrent Security Summary:\n`;
      context += `• Active Threats: ${threatCount}\n`;
      context += `• Known Vulnerabilities: ${vulnCount}\n`;
      context += `• Incidents: ${incidentCount}\n`;
    }
    
    context += `\nUser Question: ${query}`;
    
    return context;
  }

  buildSystemSecurityContext() {
    const threatCount = this.knowledgeBase.filter(doc => doc.type === 'threat').length;
    const vulnCount = this.knowledgeBase.filter(doc => doc.type === 'vulnerability').length;
    const incidentCount = this.knowledgeBase.filter(doc => doc.type === 'incident').length;
    
    const criticalThreats = this.knowledgeBase.filter(doc => 
      doc.type === 'threat' && doc.content.includes('CRITICAL')
    ).length;
    
    const criticalVulns = this.knowledgeBase.filter(doc => 
      doc.type === 'vulnerability' && doc.content.includes('CRITICAL')
    ).length;
    
    let context = "SYSTEM SECURITY OVERVIEW:\n\n";
    context += `Current Security Status Summary:\n`;
    context += `• Total Active Threats: ${threatCount} (Critical: ${criticalThreats})\n`;
    context += `• Total Vulnerabilities: ${vulnCount} (Critical: ${criticalVulns})\n`;
    context += `• Total Incidents: ${incidentCount}\n`;
    context += `• Security Operations: Active monitoring and response procedures in place\n`;
    context += `• Compliance: Security policies and frameworks implemented\n\n`;
    
    if (criticalThreats > 0 || criticalVulns > 0) {
      context += "⚠️ ATTENTION NEEDED: Critical security issues detected that require immediate attention.\n\n";
    } else {
      context += "✅ SECURITY STATUS: System security posture is stable with no critical issues.\n\n";
    }
    
    context += "User is asking about the overall system security status and recommendations.";
    
    return context;
  }

  async callOpenAI(context, query) {
    const prompt = `You are an expert cybersecurity analyst and SOC specialist with deep expertise in threat intelligence, vulnerability management, incident response, and security operations.

Context: ${context}

Instructions:
- Provide specific, actionable recommendations
- Reference security frameworks and best practices
- Consider severity and urgency
- Suggest immediate actions and long-term improvements
- Maintain professional, expert tone
- Include specific steps when possible

User Question: ${query}

Your Response:`;

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert cybersecurity analyst with deep knowledge of threat intelligence, vulnerability management, incident response, and security operations. Provide professional, accurate, and actionable security advice with specific recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.6
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  clearConversation() {
    this.conversationHistory = [];
  }
}

// Main Premium Security Dashboard Component
export default function PremiumSecurityDashboard() {
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
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [securityScore, setSecurityScore] = useState(85);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const dataGenerator = useRef(new PremiumSecurityDataGenerator());
  const chatEndRef = useRef(null);
  const alertIntervalRef = useRef(null);

  useEffect(() => {
    initializeSecurityData();
    initializeChatbot();
    startRealTimeUpdates();
    triggerAnimations();
    
    return () => {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
      }
    };
  }, []);

  // Update chatbot knowledge when security data changes
  useEffect(() => {
    if (chatbot && securityData) {
      chatbot.addToKnowledgeBase(securityData);
    }
  }, [securityData, chatbot]);

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
    const apiKey = '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';
    const bot = new PremiumSecurityRAGChatbot(apiKey);
    
    // Initialize with current security data
    if (securityData) {
      bot.addToKnowledgeBase(securityData);
    } else {
      // Fallback to generated data if securityData not available yet
      bot.addToKnowledgeBase({
        threats: dataGenerator.current.generateThreatIntelligence(),
        vulnerabilities: dataGenerator.current.generateVulnerabilityData(),
        incidents: dataGenerator.current.generateIncidentResponse()
      });
    }
    
    setChatbot(bot);
  };

  // Update chatbot knowledge base when security data changes
  const updateChatbotKnowledge = () => {
    if (chatbot && securityData) {
      chatbot.addToKnowledgeBase(securityData);
    }
  };

  const startRealTimeUpdates = () => {
    alertIntervalRef.current = setInterval(() => {
      const newAlert = generateRealTimeAlert();
      setRealTimeAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
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
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentQuery,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await chatbot.generateResponse(currentQuery);
      
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

  // Quick Actions Handlers
  const handleTriggerIncidentResponse = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/trigger-incident-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'security_analyst'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Add success notification
        const newAlert = {
          id: `ALERT-${Date.now()}`,
          type: 'INCIDENT_CREATED',
          severity: result.incident.severity,
          message: `Incident ${result.incident.id} triggered: ${result.incident.title}`,
          timestamp: new Date().toISOString(),
          source: 'Incident Response System',
          requiresAction: true
        };
        
        setRealTimeAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
        
        // Show success message
        alert(`✅ Incident Response Triggered Successfully!\n\nIncident ID: ${result.incident.id}\nTitle: ${result.incident.title}\nSeverity: ${result.incident.severity}\nAssigned Team: ${result.incident.assigned_team}`);
      } else {
        alert(`❌ Failed to trigger incident response: ${result.message}`);
      }
    } catch (error) {
      console.error('Incident response error:', error);
      alert(`❌ Error: Failed to connect to incident response system`);
    }
  };

  const handleScanVulnerabilities = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/scan-vulnerabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'security_analyst'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Add scan notification
        const newAlert = {
          id: `ALERT-${Date.now()}`,
          type: 'VULNERABILITY_SCAN',
          severity: result.scan_summary.critical > 0 ? 'CRITICAL' : 'MEDIUM',
          message: `Vulnerability scan completed: ${result.scan_summary.total_found} vulnerabilities found`,
          timestamp: new Date().toISOString(),
          source: 'Vulnerability Scanner',
          requiresAction: result.scan_summary.critical > 0 || result.scan_summary.high > 0
        };
        
        setRealTimeAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
        
        // Show detailed results
        const message = `🔍 Vulnerability Scan Complete!\n\n` +
          `Total Vulnerabilities: ${result.scan_summary.total_found}\n` +
          `🔴 Critical: ${result.scan_summary.critical}\n` +
          `🟠 High: ${result.scan_summary.high}\n` +
          `🟡 Medium: ${result.scan_summary.medium}\n` +
          `🟢 Low: ${result.scan_summary.low}\n\n` +
          `Top Critical Issues:\n` +
          result.vulnerabilities
            .filter(v => v.severity === 'CRITICAL')
            .slice(0, 3)
            .map(v => `• ${v.cve_id}: ${v.title}`)
            .join('\n');
        
        alert(message);
      } else {
        alert(`❌ Failed to scan vulnerabilities: ${result.message}`);
      }
    } catch (error) {
      console.error('Vulnerability scan error:', error);
      alert(`❌ Error: Failed to connect to vulnerability scanner`);
    }
  };

  const handleUpdateSecurityPolicies = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/update-security-policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'security_analyst'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Add policy update notification
        const newAlert = {
          id: `ALERT-${Date.now()}`,
          type: 'POLICY_UPDATE',
          severity: 'INFO',
          message: `Security policies updated: ${result.update_summary.total_updated} policies modified`,
          timestamp: new Date().toISOString(),
          source: 'Policy Management System',
          requiresAction: false
        };
        
        setRealTimeAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
        
        // Show detailed results
        const message = `🛡️ Security Policies Updated!\n\n` +
          `Total Policies Updated: ${result.update_summary.total_updated}\n` +
          `Compliance Frameworks: ${result.update_summary.frameworks.join(', ')}\n` +
          `Policy Categories: ${result.update_summary.categories.join(', ')}\n` +
          `Next Review Date: ${new Date(result.update_summary.next_review_date).toLocaleDateString()}\n\n` +
          `Updated Policies:\n` +
          result.policies
            .slice(0, 5)
            .map(p => `• ${p.name} (${p.compliance_framework})`)
            .join('\n');
        
        alert(message);
      } else {
        alert(`❌ Failed to update security policies: ${result.message}`);
      }
    } catch (error) {
      console.error('Policy update error:', error);
      alert(`❌ Error: Failed to connect to policy management system`);
    }
  };

  const handleGenerateSecurityReport = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/generate-security-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'security_analyst',
          report_type: 'comprehensive'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Add report generation notification
        const newAlert = {
          id: `ALERT-${Date.now()}`,
          type: 'REPORT_GENERATED',
          severity: 'INFO',
          message: `Security report generated: ${result.report.title}`,
          timestamp: new Date().toISOString(),
          source: 'Report Generator',
          requiresAction: false
        };
        
        setRealTimeAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
        
        // Show detailed results
        const content = result.report.content;
        const message = `📊 Security Report Generated!\n\n` +
          `Report ID: ${result.report.id}\n` +
          `Title: ${result.report.title}\n` +
          `Generated: ${new Date(result.report.generated_date).toLocaleString()}\n\n` +
          `🎯 Executive Summary:\n` +
          `• Security Score: ${content.executive_summary.security_score}%\n` +
          `• Overall Posture: ${content.executive_summary.overall_posture}\n` +
          `• Critical Issues: ${content.executive_summary.critical_issues}\n` +
          `• Recommendations: ${content.executive_summary.recommendations}\n\n` +
          `📈 Key Metrics:\n` +
          `• Total Incidents: ${content.incident_metrics.total_incidents}\n` +
          `• Total Vulnerabilities: ${content.vulnerability_metrics.total_vulnerabilities}\n` +
          `• Compliance Score: ${content.compliance_metrics.compliance_score}%\n` +
          `• High Risk Assets: ${content.risk_assessment.high_risk_assets}`;
        
        alert(message);
      } else {
        alert(`❌ Failed to generate security report: ${result.message}`);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      alert(`❌ Error: Failed to connect to report generator`);
    }
  };

  const triggerAnimations = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
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
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Premium Animated Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 50%, rgba(0, 212, 211, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(85, 239, 196, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 20%, rgba(108, 92, 231, 0.1) 0%, transparent 50%)
        `,
        animation: 'backgroundShift 20s ease-in-out infinite'
      }} />
      
      {/* Animated Grid Overlay */}
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
        animation: 'gridMove 10s linear infinite',
        pointerEvents: 'none'
      }} />

      {/* Premium Header */}
      <header style={{
        height: '80px',
        background: 'rgba(15, 15, 30, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '2px solid rgba(0, 212, 211, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 4px 30px rgba(0, 212, 211, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #00D2D3, #55EFC4)',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            animation: 'pulse 2s ease-in-out infinite',
            boxShadow: '0 0 30px rgba(0, 212, 211, 0.5)'
          }}>
            🛡️
          </div>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              margin: 0,
              background: 'linear-gradient(135deg, #00D2D3, #55EFC4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(0, 212, 211, 0.5)'
            }}>
              Premium Security Operations
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#8892B0',
              margin: '2px 0 0 0'
            }}>
              Advanced Threat Intelligence & AI-Powered Defense
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          {/* Premium Security Score Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            padding: '15px 25px',
            background: 'rgba(0, 212, 211, 0.1)',
            border: `2px solid ${getSecurityScoreColor(securityScore)}`,
            borderRadius: '30px',
            animation: 'glow 3s ease-in-out infinite',
            boxShadow: `0 0 20px ${getSecurityScoreColor(securityScore)}40`
          }}>
            <span style={{ fontSize: '14px', color: '#8892B0', fontWeight: '600' }}>SECURITY SCORE</span>
            <span style={{
              fontSize: '22px',
              fontWeight: '800',
              color: getSecurityScoreColor(securityScore),
              textShadow: `0 0 10px ${getSecurityScoreColor(securityScore)}`
            }}>
              {securityScore}
            </span>
          </div>

          {/* Critical Alerts Indicator */}
          <div style={{
            position: 'relative',
            padding: '12px 20px',
            background: 'rgba(255, 71, 87, 0.15)',
            border: '2px solid rgba(255, 71, 87, 0.4)',
            borderRadius: '25px',
            fontSize: '14px',
            color: '#FF4757',
            fontWeight: '600',
            animation: 'alertPulse 2s ease-in-out infinite'
          }}>
            🔴 {realTimeAlerts.filter(a => a.severity === 'CRITICAL').length} Critical Alerts
          </div>
        </div>
      </header>

      {/* Premium Navigation Tabs */}
      <div style={{
        height: '60px',
        background: 'rgba(22, 33, 62, 0.95)',
        backdropFilter: 'blur(15px)',
        borderBottom: '1px solid rgba(0, 212, 211, 0.2)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        gap: '35px'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'threats', label: 'Threat Intelligence', icon: '⚠️' },
          { id: 'vulnerabilities', label: 'Vulnerabilities', icon: '🔍' },
          { id: 'incidents', label: 'Incident Response', icon: '🚨' },
          { id: 'compliance', label: 'Compliance', icon: '📋' },
          { id: 'analytics', label: 'Analytics', icon: '📈' },
          { id: 'chatbot', label: 'AI Assistant', icon: '🤖' }
        ].map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedView(tab.id);
              triggerAnimations();
            }}
            style={{
              padding: '12px 20px',
              background: selectedView === tab.id 
                ? 'linear-gradient(135deg, rgba(0, 212, 211, 0.25), rgba(85, 239, 196, 0.25))'
                : 'transparent',
              border: selectedView === tab.id 
                ? '2px solid rgba(0, 212, 211, 0.6)'
                : '1px solid transparent',
              borderRadius: '12px',
              color: selectedView === tab.id ? '#00D2D3' : '#8892B0',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
              boxShadow: selectedView === tab.id ? '0 4px 20px rgba(0, 212, 211, 0.3)' : 'none'
            }}
          >
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
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
        {/* Left Panel - Premium Real-time Alerts Feed */}
        <div style={{
          width: '350px',
          background: 'rgba(15, 15, 30, 0.95)',
          backdropFilter: 'blur(15px)',
          borderRight: '1px solid rgba(0, 212, 211, 0.2)',
          overflowY: 'auto',
          padding: '25px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#00D2D3',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textShadow: '0 0 10px rgba(0, 212, 211, 0.5)'
          }}>
            <span style={{ fontSize: '20px', animation: 'pulse 2s ease-in-out infinite' }}>🔴</span>
            Live Security Feed
          </h3>
          
          {realTimeAlerts.map((alert, index) => (
            <div
              key={alert.id}
              style={{
                padding: '15px',
                marginBottom: '12px',
                background: 'rgba(0, 212, 211, 0.08)',
                border: `1px solid ${getSeverityColor(alert.severity)}60`,
                borderRadius: '12px',
                borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                animation: `slideInLeft 0.6s ease-out ${index * 0.1}s both`,
                transition: 'all 0.3s ease',
                boxShadow: `0 2px 10px ${getSeverityColor(alert.severity)}20`
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
                  fontWeight: '700',
                  color: getSeverityColor(alert.severity),
                  textTransform: 'uppercase'
                }}>
                  {alert.severity}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: '#8892B0'
                }}>
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div style={{
                fontSize: '12px',
                color: '#E8E8E8',
                lineHeight: '1.5',
                marginBottom: '8px'
              }}>
                {alert.message}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#8892B0',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Source: {alert.source}</span>
                {alert.requiresAction && (
                  <span style={{ color: '#FFA502', fontWeight: '600' }}>⚡ Action Required</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '25px'
        }}>
          {selectedView === 'overview' && <PremiumOverviewView data={securityData} />}
          {selectedView === 'threats' && <PremiumThreatsView threats={securityData.threats} />}
          {selectedView === 'vulnerabilities' && <PremiumVulnerabilitiesView vulnerabilities={securityData.vulnerabilities} />}
          {selectedView === 'incidents' && <PremiumIncidentsView incidents={securityData.incidents} />}
          {selectedView === 'compliance' && <PremiumComplianceView data={securityData.compliance} />}
          {selectedView === 'analytics' && <PremiumAnalyticsView data={securityData} />}
          {selectedView === 'chatbot' && (
            <PremiumChatbotView 
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

        {/* Right Panel - Premium Quick Actions */}
        <div style={{
          width: '300px',
          background: 'rgba(15, 15, 30, 0.95)',
          backdropFilter: 'blur(15px)',
          borderLeft: '1px solid rgba(0, 212, 211, 0.2)',
          padding: '25px',
          overflowY: 'auto'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#00D2D3',
            margin: '0 0 20px 0',
            textShadow: '0 0 10px rgba(0, 212, 211, 0.5)'
          }}>
            Quick Actions
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: '🚨 Trigger Incident Response', color: '#FF4757', handler: handleTriggerIncidentResponse },
              { label: '🔍 Scan for Vulnerabilities', color: '#FFA502', handler: handleScanVulnerabilities },
              { label: '🛡️ Update Security Policies', color: '#00D2D3', handler: handleUpdateSecurityPolicies },
              { label: '📊 Generate Security Report', color: '#6C5CE7', handler: handleGenerateSecurityReport }
            ].map((action, index) => (
              <button
                key={index}
                onClick={action.handler}
                style={{
                  padding: '15px',
                  background: `linear-gradient(135deg, ${action.color}20, ${action.color}10)`,
                  border: `2px solid ${action.color}40`,
                  borderRadius: '12px',
                  color: action.color,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Global Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes backgroundShift {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(-20px) translateY(-10px); }
          50% { transform: translateX(10px) translateY(-20px); }
          75% { transform: translateX(-10px) translateY(10px); }
        }
        
        @keyframes gridMove {
          from { transform: translate(0, 0); }
          to { transform: translate(50px, 50px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px var(--glow-color); }
          50% { box-shadow: 0 0 30px var(--glow-color), 0 0 40px var(--glow-color); }
        }
        
        @keyframes alertPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 212, 211, 0.4) transparent;
        }
        
        *::-webkit-scrollbar {
          width: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgba(0, 212, 211, 0.4), rgba(85, 239, 196, 0.4));
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgba(0, 212, 211, 0.6), rgba(85, 239, 196, 0.6));
        }
      `}</style>
    </div>
  );
}

// Premium View Components
function PremiumOverviewView({ data }) {
  const metrics = data.metrics || {};
  
  return (
    <div style={{ animation: 'fadeInUp 0.8s ease-out' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '800',
        color: '#E8E8E8',
        margin: '0 0 30px 0',
        textShadow: '0 0 20px rgba(0, 212, 211, 0.3)'
      }}>
        Security Operations Overview
      </h2>
      
      {/* Premium Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        marginBottom: '40px'
      }}>
        {[
          { label: 'Active Threats', value: metrics.activeThreats || 0, icon: '⚠️', color: '#FF4757' },
          { label: 'Security Score', value: `${metrics.securityScore || 0}%`, icon: '🛡️', color: '#00D2D3' },
          { label: 'Blocked Attacks', value: metrics.blockedAttacks || 0, icon: '🚫', color: '#55EFC4' },
          { label: 'Compliance Score', value: `${metrics.complianceScore || 0}%`, icon: '📋', color: '#6C5CE7' },
          { label: 'MTTD (min)', value: metrics.meanTimeToDetect || 0, icon: '⏱️', color: '#FFA502' },
          { label: 'MTTR (min)', value: metrics.meanTimeToRespond || 0, icon: '🔧', color: '#FF6B6B' }
        ].map((metric, index) => (
          <div
            key={index}
            style={{
              padding: '25px',
              background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.9), rgba(22, 33, 62, 0.9))',
              border: '1px solid rgba(0, 212, 211, 0.2)',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              fontSize: '28px',
              opacity: 0.3,
              animation: 'pulse 3s ease-in-out infinite'
            }}>
              {metric.icon}
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: '800',
              color: metric.color,
              marginBottom: '8px',
              textShadow: `0 0 15px ${metric.color}50`
            }}>
              {metric.value.toLocaleString()}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#8892B0',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '600'
            }}>
              {metric.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PremiumChatbotView({ chatbot, messages, currentQuery, setCurrentQuery, onSendMessage, isLoading, chatEndRef }) {
  return (
    <div style={{
      height: 'calc(100vh - 250px)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'fadeInUp 0.8s ease-out'
    }}>
      <div style={{
        padding: '25px',
        background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.95), rgba(22, 33, 62, 0.95))',
        border: '1px solid rgba(0, 212, 211, 0.2)',
        borderRadius: '16px 16px 0 0',
        borderBottom: '1px solid rgba(0, 212, 211, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '800',
          color: '#E8E8E8',
          margin: '0 0 10px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textShadow: '0 0 20px rgba(0, 212, 211, 0.3)'
        }}>
          🤖 AI Security Assistant
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#8892B0',
          margin: 0
        }}>
          Premium RAG-powered security intelligence. Ask me anything about cybersecurity.
        </p>
      </div>
      
      <div style={{
        flex: 1,
        background: 'rgba(15, 15, 30, 0.8)',
        padding: '25px',
        overflowY: 'auto',
        borderRadius: '0 0 16px 16px'
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
            <div style={{ fontSize: '64px', marginBottom: '25px', animation: 'pulse 2s ease-in-out infinite' }}>🤖</div>
            <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px' }}>
              AI Security Assistant
            </div>
            <div style={{ fontSize: '14px', maxWidth: '400px', lineHeight: '1.6' }}>
              I'm your advanced cybersecurity assistant. Ask me about threat intelligence, vulnerability management, incident response, or security best practices.
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
                  maxWidth: '75%',
                  padding: '15px 20px',
                  borderRadius: '16px',
                  background: message.type === 'user' 
                    ? 'linear-gradient(135deg, rgba(0, 212, 211, 0.25), rgba(85, 239, 196, 0.25))'
                    : 'rgba(255, 255, 255, 0.08)',
                  border: message.type === 'user' 
                    ? '1px solid rgba(0, 212, 211, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#E8E8E8',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  animation: 'fadeInUp 0.5s ease-out'
                }}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#8892B0' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid rgba(0, 212, 211, 0.3)',
                  borderTopColor: '#00D2D3',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ fontSize: '14px' }}>Analyzing security data...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>
      
      <div style={{
        padding: '25px',
        background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.95), rgba(22, 33, 62, 0.95))',
        border: '1px solid rgba(0, 212, 211, 0.2)',
        borderRadius: '16px',
        borderTop: '1px solid rgba(0, 212, 211, 0.2)',
        marginTop: '20px'
      }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input
            type="text"
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Ask about security threats, vulnerabilities, incidents..."
            style={{
              flex: 1,
              padding: '15px 20px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(0, 212, 211, 0.3)',
              borderRadius: '12px',
              color: '#E8E8E8',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          />
          <button
            onClick={onSendMessage}
            disabled={!currentQuery.trim() || isLoading}
            style={{
              padding: '15px 30px',
              background: isLoading 
                ? 'rgba(136, 146, 176, 0.2)' 
                : 'linear-gradient(135deg, rgba(0, 212, 211, 0.25), rgba(85, 239, 196, 0.25))',
              border: isLoading 
                ? '1px solid rgba(136, 146, 176, 0.3)' 
                : '1px solid rgba(0, 212, 211, 0.4)',
              borderRadius: '12px',
              color: isLoading ? '#8892B0' : '#00D2D3',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Placeholder premium view components
function PremiumThreatsView({ threats }) {
  return (
    <div style={{ animation: 'fadeInUp 0.8s ease-out' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#E8E8E8', margin: '0 0 30px 0' }}>
        Threat Intelligence
      </h2>
      <div style={{ 
        padding: '25px', 
        background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.9), rgba(22, 33, 62, 0.9))', 
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ color: '#8892B0', fontSize: '16px' }}>
          Advanced threat intelligence platform - {threats?.length || 0} threats monitored
        </p>
      </div>
    </div>
  );
}

function PremiumVulnerabilitiesView({ vulnerabilities }) {
  return (
    <div style={{ animation: 'fadeInUp 0.8s ease-out' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#E8E8E8', margin: '0 0 30px 0' }}>
        Vulnerability Management
      </h2>
      <div style={{ 
        padding: '25px', 
        background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.9), rgba(22, 33, 62, 0.9))', 
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ color: '#8892B0', fontSize: '16px' }}>
          Comprehensive vulnerability management - {vulnerabilities?.length || 0} vulnerabilities tracked
        </p>
      </div>
    </div>
  );
}

function PremiumIncidentsView({ incidents }) {
  return (
    <div style={{ animation: 'fadeInUp 0.8s ease-out' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#E8E8E8', margin: '0 0 30px 0' }}>
        Incident Response
      </h2>
      <div style={{ 
        padding: '25px', 
        background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.9), rgba(22, 33, 62, 0.9))', 
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ color: '#8892B0', fontSize: '16px' }}>
          Advanced incident response system - {incidents?.length || 0} incidents managed
        </p>
      </div>
    </div>
  );
}

function PremiumComplianceView({ data }) {
  return (
    <div style={{ animation: 'fadeInUp 0.8s ease-out' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#E8E8E8', margin: '0 0 30px 0' }}>
        Compliance Management
      </h2>
      <div style={{ 
        padding: '25px', 
        background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.9), rgba(22, 33, 62, 0.9))', 
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ color: '#8892B0', fontSize: '16px' }}>
          Multi-framework compliance tracking - {data?.overallCompliance || 0}% overall compliance
        </p>
      </div>
    </div>
  );
}

function PremiumAnalyticsView({ data }) {
  return (
    <div style={{ animation: 'fadeInUp 0.8s ease-out' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#E8E8E8', margin: '0 0 30px 0' }}>
        Security Analytics
      </h2>
      <div style={{ 
        padding: '25px', 
        background: 'linear-gradient(135deg, rgba(15, 15, 30, 0.9), rgba(22, 33, 62, 0.9))', 
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ color: '#8892B0', fontSize: '16px' }}>
          Advanced security analytics and insights platform
        </p>
      </div>
    </div>
  );
}
