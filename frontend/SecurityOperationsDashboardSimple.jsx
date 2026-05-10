import React, { useState, useEffect } from 'react';

export default function SecurityOperationsDashboard() {
  const [securityScore, setSecurityScore] = useState(85);
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);

  // Generate some sample alerts
  useEffect(() => {
    const sampleAlerts = [
      {
        id: 'ALERT-1',
        severity: 'CRITICAL',
        message: 'Suspicious network traffic detected',
        timestamp: new Date().toISOString(),
        source: '192.168.1.100',
        requiresAction: true
      },
      {
        id: 'ALERT-2',
        severity: 'HIGH',
        message: 'Multiple failed login attempts',
        timestamp: new Date().toISOString(),
        source: '10.0.0.50',
        requiresAction: true
      }
    ];
    setRealTimeAlerts(sampleAlerts);
  }, []);

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

      {/* Main Content */}
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
          
          {realTimeAlerts.map((alert, index) => (
            <div
              key={alert.id}
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
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#00D2D3',
              margin: '0 0 20px 0'
            }}>
              🛡️ Security Operations Dashboard
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#8892B0',
              marginBottom: '30px'
            }}>
              Advanced security monitoring and threat intelligence
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              maxWidth: '800px'
            }}>
              <div style={{
                padding: '20px',
                background: 'rgba(15, 15, 30, 0.8)',
                border: '1px solid rgba(0, 212, 211, 0.1)',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#FF4757', marginBottom: '5px' }}>
                  {realTimeAlerts.filter(a => a.severity === 'CRITICAL').length}
                </div>
                <div style={{ fontSize: '12px', color: '#8892B0' }}>Critical Threats</div>
              </div>
              
              <div style={{
                padding: '20px',
                background: 'rgba(15, 15, 30, 0.8)',
                border: '1px solid rgba(0, 212, 211, 0.1)',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#00D2D3', marginBottom: '5px' }}>
                  {securityScore}%
                </div>
                <div style={{ fontSize: '12px', color: '#8892B0' }}>Security Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
