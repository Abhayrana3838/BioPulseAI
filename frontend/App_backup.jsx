import { useState } from 'react'

function TestComponent() {
  return (
    <div style={{ 
      padding: '50px', 
      color: '#00F5FF', 
      fontSize: '24px',
      textAlign: 'center',
      fontFamily: 'Arial'
    }}>
      <h1>BIOPULSE ELITE - TEST PAGE</h1>
      <p>Frontend is working correctly!</p>
      <p style={{ fontSize: '16px', color: '#5A7090' }}>
        If you can see this, the basic React app is functioning.
      </p>
    </div>
  )
}

function App() {
  return <TestComponent />
}

export default App
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
