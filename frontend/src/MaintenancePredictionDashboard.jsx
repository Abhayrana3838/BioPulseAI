import { useState, useEffect, useRef } from 'react';
import { getRealtimePrediction, getDashboardStats, checkHealth, predict } from './api.js';

const G = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;700&family=DM+Sans:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;width:100%}
body{background:#03050A;color:#C8D8E8;font-family:'DM Sans',sans-serif;overflow:hidden}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:rgba(0,245,255,.25);border-radius:2px}
::selection{background:rgba(0,245,255,.2);color:#00F5FF}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1} 50%{opacity:.5}}
@keyframes scan{0%{transform:translateX(-100%)} 100%{transform:translateX(200%)}}
@keyframes spin{from{transform:rotate(0deg)} to{transform:rotate(360deg)}}
`;

// Status Badge Component
function StatusBadge({ level }) {
  const colors = {
    LOW: { bg: 'rgba(0,245,255,.15)', border: '#00F5FF', text: '#00F5FF' },
    MEDIUM: { bg: 'rgba(255,140,66,.15)', border: '#FF8C42', text: '#FF8C42' },
    HIGH: { bg: 'rgba(255,68,102,.15)', border: '#FF4466', text: '#FF4466' }
  };
  const c = colors[level] || colors.LOW;
  
  return (
    <span style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      padding: '4px 12px',
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.1em'
    }}>
      {level} RISK
    </span>
  );
}

// Sensor Value Component
function SensorValue({ label, value, unit = '', alert = false }) {
  return (
    <div style={{
      background: alert ? 'rgba(255,68,102,.08)' : 'rgba(8,12,22,.72)',
      border: `1px solid ${alert ? 'rgba(255,68,102,.3)' : 'rgba(0,245,255,.12)'}`,
      borderRadius: 6,
      padding: 12,
      minWidth: 100
    }}>
      <div style={{ fontSize: 9, color: '#5A7090', marginBottom: 4, letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        color: alert ? '#FF4466' : '#00F5FF',
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        {typeof value === 'number' ? value.toFixed(3) : value}{unit}
      </div>
    </div>
  );
}

// Prediction Card Component
function PredictionCard({ data, index }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!data) return null;
  
  const isFailure = data.failure_predicted;
  
  return (
    <div style={{
      background: isFailure ? 'rgba(255,68,102,.05)' : 'rgba(8,12,22,.72)',
      border: `1px solid ${isFailure ? 'rgba(255,68,102,.2)' : 'rgba(0,245,255,.12)'}`,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      cursor: 'pointer',
      transition: 'all .2s',
      animation: `fadeUp 0.3s ease ${index * 0.1}s both`
    }} onClick={() => setExpanded(!expanded)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#C8D8E8', marginBottom: 4 }}>
            {data.machine_id || 'Unknown Machine'}
          </div>
          <div style={{ fontSize: 10, color: '#5A7090' }}>
            {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>
        <StatusBadge level={data.risk_level} />
      </div>
      
      {expanded && data.sensors && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,245,255,.1)' }}>
          <div style={{ fontSize: 10, color: '#5A7090', marginBottom: 12, letterSpacing: '0.1em' }}>SENSOR READINGS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(data.sensors).map(([key, val]) => (
              <SensorValue key={key} label={key.toUpperCase()} value={val} alert={isFailure} />
            ))}
          </div>
          {data.probability && (
            <div style={{ marginTop: 12, fontSize: 11, color: '#5A7090' }}>
              Failure Probability: <span style={{ color: isFailure ? '#FF4466' : '#00F5FF' }}>{(data.probability * 100).toFixed(1)}%</span>
            </div>
          )}
          {data.recommendation && (
            <div style={{ marginTop: 8, fontSize: 10, color: isFailure ? '#FF8C42' : '#00F5FF' }}>
              💡 {data.recommendation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main Dashboard Component
export default function MaintenancePredictionDashboard() {
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  // Check backend health
  useEffect(() => {
    const checkBackend = async () => {
      const health = await checkHealth();
      setBackendStatus(health.status === 'healthy' ? 'connected' : 'disconnected');
    };
    checkBackend();
  }, []);

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      const data = await getDashboardStats();
      if (!data.error) {
        setStats(data);
      }
    };
    loadStats();
  }, []);

  // Fetch real-time predictions
  const fetchPrediction = async () => {
    if (loading) return;
    setLoading(true);
    
    const data = await getRealtimePrediction();
    if (!data.error) {
      setPredictions(prev => [data, ...prev].slice(0, 20)); // Keep last 20
    }
    
    setLoading(false);
  };

  // Auto-refresh predictions
  useEffect(() => {
    if (autoRefresh && backendStatus === 'connected') {
      fetchPrediction();
      intervalRef.current = setInterval(fetchPrediction, 3000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, backendStatus]);

  // Manual prediction
  const handleManualPredict = async () => {
    await fetchPrediction();
  };

  const failureCount = predictions.filter(p => p.failure_predicted).length;
  const failureRate = predictions.length > 0 ? (failureCount / predictions.length * 100).toFixed(1) : 0;

  return (
    <div style={{ 
      padding: '80px 20px 40px 88px', 
      background: '#03050A', 
      minHeight: 'calc(100vh - 32px)',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{G}</style>
      
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ 
          fontSize: 28, 
          fontWeight: 800, 
          color: '#00F5FF',
          letterSpacing: '0.1em',
          marginBottom: 8
        }}>
          MAINTENANCE PREDICTION AI
        </div>
        <div style={{ fontSize: 12, color: '#5A7090' }}>
          Real-time machine failure prediction using ML models
        </div>
      </div>

      {/* Backend Status */}
      <div style={{
        background: backendStatus === 'connected' ? 'rgba(0,245,255,.08)' : 'rgba(255,68,102,.08)',
        border: `1px solid ${backendStatus === 'connected' ? 'rgba(0,245,255,.2)' : 'rgba(255,68,102,.2)'}`,
        borderRadius: 6,
        padding: '8px 16px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: 'fit-content'
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: backendStatus === 'connected' ? '#00F5FF' : '#FF4466',
          animation: backendStatus === 'connected' ? 'pulse 2s infinite' : 'none'
        }} />
        <span style={{ fontSize: 11, color: backendStatus === 'connected' ? '#00F5FF' : '#FF4466' }}>
          Backend {backendStatus}
        </span>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: 12,
          marginBottom: 24 
        }}>
          <div style={{ background: 'rgba(8,12,22,.72)', border: '1px solid rgba(0,245,255,.12)', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 10, color: '#5A7090', marginBottom: 4 }}>TOTAL MACHINES</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#00F5FF' }}>{stats.total_machines || 0}</div>
          </div>
          <div style={{ background: 'rgba(8,12,22,.72)', border: '1px solid rgba(255,68,102,.12)', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 10, color: '#5A7090', marginBottom: 4 }}>PREDICTED FAILURES</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#FF4466' }}>{failureCount}</div>
          </div>
          <div style={{ background: 'rgba(8,12,22,.72)', border: '1px solid rgba(255,140,66,.12)', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 10, color: '#5A7090', marginBottom: 4 }}>FAILURE RATE</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#FF8C42' }}>{failureRate}%</div>
          </div>
          <div style={{ background: 'rgba(8,12,22,.72)', border: '1px solid rgba(155,92,255,.12)', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 10, color: '#5A7090', marginBottom: 4 }}>HEALTHY</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#9B5CFF' }}>{predictions.length - failureCount}</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <button
          onClick={handleManualPredict}
          disabled={loading || backendStatus !== 'connected'}
          style={{
            background: 'rgba(0,245,255,.15)',
            border: '1px solid rgba(0,245,255,.4)',
            color: '#00F5FF',
            padding: '10px 20px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Analyzing...' : '🔍 Run Prediction'}
        </button>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            style={{ accentColor: '#00F5FF' }}
          />
          <span style={{ fontSize: 11, color: '#5A7090' }}>Auto-refresh (3s)</span>
        </label>
      </div>

      {/* Predictions List */}
      <div style={{ 
        background: 'rgba(3,5,10,.5)', 
        border: '1px solid rgba(0,245,255,.1)', 
        borderRadius: 12,
        padding: 20,
        maxHeight: 'calc(100vh - 350px)',
        overflow: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16,
          paddingBottom: 16,
          borderBottom: '1px solid rgba(0,245,255,.1)'
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#C8D8E8' }}>
            Recent Predictions ({predictions.length})
          </div>
          <div style={{ fontSize: 10, color: '#5A7090' }}>
            Click cards to expand details
          </div>
        </div>

        {predictions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#5A7090' }}>
            {backendStatus === 'connected' 
              ? 'Waiting for predictions...' 
              : 'Connect to backend to start predictions'}
          </div>
        ) : (
          predictions.map((pred, idx) => (
            <PredictionCard key={idx} data={pred} index={idx} />
          ))
        )}
      </div>
    </div>
  );
}
