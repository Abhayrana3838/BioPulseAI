// BIOPULSE ELITE — VOID CRYSTALLINE THEME
// Unique palette: Deep Void Black + Plasma Cyan + Chromatic Violet + Molten Amber
// Typography: Syne Display + JetBrains Mono data

export const THEME = {
  colors: {
    void: '#03050A',
    voidDeep: '#000308',
    voidSurface: '#080C14',
    voidPanel: 'rgba(8,12,22,0.72)',
    plasma: '#00F5FF',
    plasmaGlow: 'rgba(0,245,255,0.15)',
    plasmaDim: '#00CCDD',
    chromatic: '#9B5CFF',
    chromaticGlow: 'rgba(155,92,255,0.15)',
    amber: '#FF8C42',
    amberGlow: 'rgba(255,140,66,0.15)',
    surface: '#0D1520',
    surfaceHigh: '#131C2A',
    border: 'rgba(0,245,255,0.12)',
    borderHover: 'rgba(0,245,255,0.35)',
    text: '#C8D8E8',
    textDim: '#5A7090',
    error: '#FF4466',
  },
  fonts: {
    display: "'Syne', sans-serif",
    mono: "'JetBrains Mono', monospace",
    body: "'DM Sans', sans-serif",
  },
};

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #03050A;
    color: #C8D8E8;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }

  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,245,255,0.25); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(0,245,255,0.5); }

  ::selection { background: rgba(0,245,255,0.2); color: #00F5FF; }
`;
