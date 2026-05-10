import React from 'react';

export default function TestComponent() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0F0F1E 0%, #1A1A2E 50%, #16213E 100%)',
      color: '#E8E8E8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', color: '#00D2D3', marginBottom: '20px' }}>
          🛡️ Security Operations Test
        </h1>
        <p style={{ fontSize: '18px', color: '#8892B0' }}>
          This component is working correctly!
        </p>
      </div>
    </div>
  );
}
