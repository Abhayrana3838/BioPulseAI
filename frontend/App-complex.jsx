import { useState, Component } from 'react'
import FleetLogisticsDashboard from './FleetLogisticsDashboard.jsx'
import MaintenanceSOPsDashboard from './MaintenanceSOPsDashboard.jsx'
import NeuralNetworkVisualizer from './NeuralNetworkVisualizer.jsx'
import ElitePredictiveROIFinance from './ElitePredictiveROIFinance.jsx'
import SecurityOperationsDashboard from './SecurityOperationsDashboard.jsx'
import ModelPredictionDashboard from './ModelPredictionDashboard.jsx'

// Error Boundary to catch component errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    console.error('Component Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: '#ff4444', margin: '20px', borderRadius: '8px' }}>
          <h2>Component Error Detected</h2>
          <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
          <p><strong>Component:</strong> {this.props.componentName}</p>
          <details style={{ marginTop: '10px' }}>
            <summary>Error Details</summary>
            <pre style={{ background: '#000', color: '#0f0', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo.componentStack}
            </pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  const [activeView, setActiveView] = useState('fleet')

  const views = [
    { id: 'fleet', name: 'FLEET LOGISTICS', component: FleetLogisticsDashboard },
    { id: 'maintenance', name: 'MAINTENANCE SOPs', component: MaintenanceSOPsDashboard },
    { id: 'prediction', name: 'ML MODELS', component: ModelPredictionDashboard },
    { id: 'neural', name: 'NEURAL NETWORK', component: NeuralNetworkVisualizer },
    { id: 'finance', name: 'PREDICTIVE ROI', component: ElitePredictiveROIFinance },
    { id: 'security', name: 'SECURITY OPS', component: SecurityOperationsDashboard },
  ]

  const ActiveComponent = views.find(v => v.id === activeView)?.component || views[0].component

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#03050A', position: 'relative' }}>
      {/* Global Navigation Bar */}
      <nav style={{
        position: 'fixed', top: 12, left: 12, right: 12, height: 56, zIndex: 200,
        background: 'rgba(8,12,22,0.95)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(0,245,255,0.15)', borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 0 40px rgba(0,245,255,0.08)'
      }}>
        <div style={{ 
          fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800,
          letterSpacing: '0.25em', color: '#00F5FF',
          textShadow: '0 0 20px rgba(0,245,255,.6)'
        }}>
          BIOPULSE ELITE
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              style={{
                fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: '0.15em', padding: '8px 16px',
                background: activeView === view.id ? 'rgba(0,245,255,0.15)' : 'transparent',
                color: activeView === view.id ? '#00F5FF' : '#5A7090',
                border: activeView === view.id ? '1px solid rgba(0,245,255,0.4)' : '1px solid rgba(0,245,255,0.1)',
                borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {view.name}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 14, cursor: 'pointer', color: '#00F5FF' }}>⌨</span>
          <span style={{ fontSize: 14, cursor: 'pointer', color: '#00F5FF' }}>🔔</span>
          <span style={{ fontSize: 14, cursor: 'pointer', color: '#00F5FF' }}>⚙</span>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: 76, position: 'relative', zIndex: 1 }}>
        <ErrorBoundary componentName={activeView}>
          {ActiveComponent && <ActiveComponent key={activeView} />}
        </ErrorBoundary>
      </div>

      {/* Footer */}
      <footer style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 32, zIndex: 200,
        background: 'rgba(3,5,10,.95)', borderTop: '1px solid rgba(0,245,255,.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 20px'
      }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', color: '#5A7090' }}>
          © 2024 BIOPULSE ELITE // SECURE_HANDSHAKE_ESTABLISHED
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          {['AES256_ACTIVE', 'STREAM:SYNCED', 'PORT:8080'].map(l => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#00F5FF', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(0,245,255,.5)', letterSpacing: '0.1em' }}>{l}</span>
            </div>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default App
