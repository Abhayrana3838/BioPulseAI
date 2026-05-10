import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getRealtimePrediction, checkHealth, MODEL_CONFIG } from "./api_fixed.js";

// ─── FEATURE RANGES FOR UI DISPLAY ─────────────────────────────────────────────
const FEATURE_RANGES = {
  // IoT Sensor Net
  temp_c:[20,120],vibration_hz:[0.1,50],pressure_bar:[1,20],humidity_pct:[10,95],current_amp:[0.5,50],
  // Predictive Maintenance
  rpm:[500,3600],torque_nm:[10,800],bearing_temp:[25,150],oil_viscosity:[20,200],wear_index:[0,1],
  // Power Grid
  voltage_kv:[110,500],load_pct:[10,100],power_factor:[0.7,1.0],harmonic_dist:[0.01,0.15],fault_current:[0,5],
  // HVAC
  supply_temp:[55,95],return_temp:[45,80],airflow_cfm:[200,2000],cop_ratio:[2,5],refrigerant_psi:[100,400],
  // Structural Health
  strain_mpa:[10,300],displacement_mm:[0.01,5],corrosion_idx:[0,1],load_cycles:[0,1e6],crack_width:[0,2],
  // Bioethanol
  temperature:[25,45],ph:[4,6.5],substrate_concentration:[10,50],fermentation_time:[24,72],
  yeast_concentration:[0.5,3],oxygen_level:[0.1,2],nitrogen_source:[0,2],catalyst_type:[0,2],growth_rate:[1,6],
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Exo+2:wght@300;400;500;600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;width:100%;overflow-x:hidden;overflow-y:auto}
body{background:#000508;color:#C8D8E8;font-family:'Exo 2',sans-serif;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:2px}::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(0,245,255,.25);border-radius:1px}

/* ── CINEMATIC CORE ANIMATIONS ── */
@keyframes cinematicFadeIn{
  0%{opacity:0;transform:scale(1.04) translateY(8px);filter:blur(4px)}
  100%{opacity:1;transform:scale(1) translateY(0);filter:blur(0)}
}
@keyframes slideFromLeft{
  0%{opacity:0;transform:translateX(-60px) skewX(-3deg)}
  100%{opacity:1;transform:translateX(0) skewX(0)}
}
@keyframes slideFromRight{
  0%{opacity:0;transform:translateX(60px) skewX(3deg)}
  100%{opacity:1;transform:translateX(0) skewX(0)}
}
@keyframes revealDown{
  0%{clip-path:inset(0 0 100% 0)}
  100%{clip-path:inset(0 0 0% 0)}
}
@keyframes scanH{
  0%{transform:translateX(-100%)}100%{transform:translateX(200%)}
}
@keyframes scanV{
  0%{transform:translateY(-100%)}100%{transform:translateY(300%)}
}
@keyframes dataPulse{
  0%,100%{opacity:.6;transform:scale(1)}
  50%{opacity:1;transform:scale(1.02)}
}
@keyframes neonPulse{
  0%,100%{text-shadow:0 0 4px currentColor,0 0 12px currentColor}
  50%{text-shadow:0 0 8px currentColor,0 0 24px currentColor,0 0 40px currentColor}
}
@keyframes borderFlow{
  0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}
}
@keyframes statusBlink{
  0%,90%,100%{opacity:1}92%{opacity:0.2}95%{opacity:1}97%{opacity:0.3}
}
@keyframes dataFallChar{
  0%{transform:translateY(-100%);opacity:0}
  10%{opacity:1}90%{opacity:.6}
  100%{transform:translateY(100%);opacity:0}
}
@keyframes waveIn{
  0%{transform:scaleX(0);transform-origin:left center}
  100%{transform:scaleX(1);transform-origin:left center}
}
@keyframes glitchH{
  0%,100%{clip-path:none;transform:none}
  20%{clip-path:inset(30% 0 40% 0);transform:translateX(-4px)}
  40%{clip-path:inset(10% 0 70% 0);transform:translateX(4px)}
  60%{clip-path:inset(60% 0 10% 0);transform:translateX(-2px)}
  80%{clip-path:none;transform:none}
}
@keyframes alertFlash{
  0%,100%{background:rgba(255,68,102,.06)}
  50%{background:rgba(255,68,102,.18)}
}
@keyframes spinOrbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes breathe{
  0%,100%{box-shadow:0 0 10px rgba(0,245,255,.15)}
  50%{box-shadow:0 0 30px rgba(0,245,255,.4),0 0 60px rgba(0,245,255,.1)}
}
@keyframes ticker{
  0%{transform:translateX(0)}100%{transform:translateX(-50%)}
}
@keyframes progressFill{
  from{width:0}to{width:var(--w)}
}
@keyframes numberCount{
  from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}
}
@keyframes radarSweep{
  from{transform:rotate(0deg)}to{transform:rotate(360deg)}
}
@keyframes ping{
  0%{transform:scale(1);opacity:1}
  75%,100%{transform:scale(2.5);opacity:0}
}
@keyframes morse{
  0%,100%{opacity:1}48%{opacity:1}50%{opacity:.1}52%{opacity:1}
}

.fade-in{animation:cinematicFadeIn .6s ease-out both}
.from-left{animation:slideFromLeft .5s ease-out both}
.from-right{animation:slideFromRight .5s ease-out both}
.reveal-down{animation:revealDown .5s ease-out both}
.neon-text{animation:neonPulse 3s ease-in-out infinite}
.status-blink{animation:statusBlink 5s linear infinite}
.breathe{animation:breathe 4s ease-in-out infinite}
`;

// ─── MATRIX RAIN CANVAS ───────────────────────────────────────────────────────
function MatrixRain({ width = 200, height = 100, color = "#00F5FF", density = 0.5 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cols = Math.floor(width / 14);
    const drops = Array.from({ length: cols }, () => Math.random() * -height / 14);
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/\\|=+-";
    let anim;
    const draw = () => {
      ctx.fillStyle = "rgba(0,5,8,0.08)";
      ctx.fillRect(0, 0, width, height);
      ctx.font = `10px 'Share Tech Mono', monospace`;
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const alpha = Math.random() > 0.85 ? 1 : 0.35;
        ctx.fillStyle = `rgba(${color === "#00F5FF" ? "0,245,255" : "155,92,255"},${alpha})`;
        ctx.fillText(char, i * 14, y * 14);
        drops[i] = y > height / 14 + Math.random() * 5 ? 0 : y + density;
      });
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, [width, height, color, density]);
  return <canvas ref={ref} width={width} height={height} style={{ width, height, display: "block" }} />;
}

// ─── OSCILLOSCOPE CANVAS ──────────────────────────────────────────────────────
function Oscilloscope({ data = [], color = "#00F5FF", height = 80, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath(); ctx.moveTo(0, (i / 4) * H); ctx.lineTo(W, (i / 4) * H); ctx.stroke();
    }
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath(); ctx.moveTo((i / 8) * W, 0); ctx.lineTo((i / 8) * W, H); ctx.stroke();
    }
    if (data.length < 2) return;
    const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1;
    const pad = 6;
    // Glow layer
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - pad - ((v - min) / rng) * (H - pad * 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    const rgb = color === "#00F5FF" ? "0,245,255" : color === "#FF8C42" ? "255,140,66" :
      color === "#FFD700" ? "255,215,0" : color === "#9B5CFF" ? "155,92,255" : "0,255,136";
    ctx.strokeStyle = `rgba(${rgb},0.25)`; ctx.lineWidth = 5; ctx.lineJoin = "round";
    ctx.stroke();
    // Fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `rgba(${rgb},0.2)`); grad.addColorStop(1, `rgba(${rgb},0)`);
    ctx.beginPath();
    ctx.moveTo(0, H);
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - pad - ((v - min) / rng) * (H - pad * 2);
      ctx.lineTo(x, y);
    });
    ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    // Main line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - pad - ((v - min) / rng) * (H - pad * 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    // Live dot
    const lastV = data[data.length - 1];
    const lx = W, ly = H - pad - ((lastV - min) / rng) * (H - pad * 2);
    ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.beginPath(); ctx.arc(lx, ly, 7, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rgb},0.5)`; ctx.lineWidth = 1; ctx.stroke();
  }, [data, color, height]);
  return (
    <div style={{ position: "relative" }}>
      {label && (
        <div style={{ position: "absolute", top: 4, left: 6, zIndex: 1,
          fontFamily: "'Share Tech Mono'", fontSize: 9, color: color, opacity: 0.7 }}>
          {label}
        </div>
      )}
      <canvas ref={ref} width={400} height={height}
        style={{ width: "100%", height, display: "block" }} />
    </div>
  );
}

// ─── RADAR SWEEP ──────────────────────────────────────────────────────────────
function RadarDisplay({ predictions, size = 120, color = "#00F5FF" }) {
  const ref = useRef(null);
  const angle = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = size / 2, cy = size / 2, r = size / 2 - 6;
    const blips = predictions.slice(0, 6).map((p, i) => ({
      angle: (i / 6) * Math.PI * 2,
      dist: 0.3 + (p.probability || 0.3) * 0.6,
      color: p.risk_level === "HIGH" ? "#FF4466" : p.risk_level === "MEDIUM" ? "#FFD700" : "#00F5FF",
      alive: Date.now() - new Date(p.timestamp).getTime() < 10000,
    }));
    let anim;
    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      angle.current += 0.025;
      // Rings
      [0.25, 0.5, 0.75, 1].forEach(f => {
        ctx.beginPath(); ctx.arc(cx, cy, r * f, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,245,255,0.12)"; ctx.lineWidth = 0.5; ctx.stroke();
      });
      // Cross
      ctx.strokeStyle = "rgba(0,245,255,0.1)"; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
      // Sweep
      const sweepGrad = ctx.createConicalGradient
        ? null
        : (() => {
          const g = ctx.createLinearGradient(cx, cy, cx + r, cy);
          g.addColorStop(0, `rgba(0,245,255,0.4)`); g.addColorStop(1, "rgba(0,245,255,0)");
          return g;
        })();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle.current);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, -0.4, 0);
      ctx.closePath();
      ctx.fillStyle = "rgba(0,245,255,0.12)";
      ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0);
      ctx.strokeStyle = "rgba(0,245,255,0.8)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      // Blips
      blips.forEach(b => {
        const bx = cx + Math.cos(b.angle) * r * b.dist;
        const by = cy + Math.sin(b.angle) * r * b.dist;
        ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fillStyle = b.color; ctx.fill();
        if (b.color === "#FF4466") {
          ctx.beginPath(); ctx.arc(bx, by, 6 + Math.sin(Date.now() * 0.003) * 3, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,68,102,0.4)"; ctx.lineWidth = 0.5; ctx.stroke();
        }
      });
      // Center
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, [predictions, size, color]);
  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size }} />;
}

// ─── DATA STREAM TICKER ───────────────────────────────────────────────────────
function DataTicker({ predictions, color = "#00F5FF" }) {
  const items = useMemo(() => {
    const base = predictions.slice(0, 8).map(p =>
      `${p.machine_id} // ${p.prediction_label} // ${(p.probability * 100).toFixed(1)}% // ${p.risk_level}`
    );
    if (base.length === 0) return ["AWAITING SENSOR DATA // STREAM NOMINAL // ALL SYSTEMS STANDBY"];
    return [...base, ...base];
  }, [predictions]);

  return (
    <div style={{ overflow: "hidden", position: "relative", height: 22 }}>
      <div style={{ display: "flex", gap: 48, whiteSpace: "nowrap",
        animation: "ticker 18s linear infinite" }}>
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: "'Share Tech Mono'", fontSize: 10, color,
            opacity: 0.7, letterSpacing: "0.06em",
          }}>
            ▸ {item}
          </span>
        ))}
      </div>
      <div style={{
        position: "absolute", left: 0, top: 0, width: 40, height: "100%",
        background: "linear-gradient(90deg, #000508, transparent)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ─── CINEMATIC MAINTENANCE VIDEO PANEL ───────────────────────────────────────
function MaintenanceVideoFeed({ prediction, modelKey }) {
  const ref = useRef(null);
  const frameRef = useRef(null);
  const cfg = MODEL_CONFIG[modelKey] || MODEL_CONFIG.realistic_v3_iot;
  const isAlert = prediction?.risk_level === "HIGH";

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    let t = 0;
    // Procedural "video" — looks like thermal/night-vision camera feed
    const NODES = Array.from({ length: 8 }, (_, i) => ({
      x: 40 + (i % 4) * (W / 4.2), y: 40 + Math.floor(i / 4) * (H / 2.5),
      r: 12 + Math.random() * 8,
      freq: 0.8 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      label: `S${(i + 1).toString().padStart(2, "0")}`,
      status: i < 6 ? (Math.random() > 0.3 ? "OK" : "WARN") : "CRIT",
    }));
    const PIPES = [[0,1],[1,2],[2,3],[4,5],[5,6],[6,7],[0,4],[1,5],[2,6],[3,7]];
    const particles = Array.from({ length: 30 }, (_, i) => ({
      pipe: i % PIPES.length, progress: Math.random(),
      speed: 0.002 + Math.random() * 0.004, bright: Math.random() > 0.7,
    }));

    const hexRgb = hex => {
      const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
      return `${r},${g},${b}`;
    };
    const mainRgb = hexRgb(cfg.color);

    const draw = () => {
      t += 0.016;
      // Background — dark industrial
      ctx.fillStyle = isAlert ? "rgba(8,2,4,0.85)" : "rgba(2,4,8,0.85)";
      ctx.fillRect(0, 0, W, H);

      // Grid overlay
      ctx.strokeStyle = `rgba(${mainRgb},0.04)`; ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Pipes / connections
      PIPES.forEach(([a, b], pi) => {
        ctx.beginPath();
        ctx.moveTo(NODES[a].x, NODES[a].y);
        ctx.lineTo(NODES[b].x, NODES[b].y);
        ctx.strokeStyle = `rgba(${mainRgb},0.15)`; ctx.lineWidth = 1.5; ctx.stroke();
      });

      // Particles flowing along pipes
      particles.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const [a, b] = PIPES[p.pipe];
        const px = NODES[a].x + (NODES[b].x - NODES[a].x) * p.progress;
        const py = NODES[a].y + (NODES[b].y - NODES[a].y) * p.progress;
        ctx.beginPath(); ctx.arc(px, py, p.bright ? 2.5 : 1, 0, Math.PI * 2);
        ctx.fillStyle = p.bright ? cfg.color : `rgba(${mainRgb},0.6)`;
        ctx.fill();
        if (p.bright) {
          const trailLen = 0.08;
          const tx = px - (NODES[b].x - NODES[a].x) * trailLen;
          const ty = py - (NODES[b].y - NODES[a].y) * trailLen;
          const grad = ctx.createLinearGradient(tx, ty, px, py);
          grad.addColorStop(0, "rgba(0,0,0,0)");
          grad.addColorStop(1, `rgba(${mainRgb},0.5)`);
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(px, py);
          ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.stroke();
        }
      });

      // Nodes
      NODES.forEach((n, i) => {
        const pulse = Math.sin(t * n.freq + n.phase) * 0.5 + 0.5;
        const r = n.r + pulse * 3;
        const isCrit = n.status === "CRIT" && isAlert;
        const nodeColor = isCrit ? "#FF4466" : n.status === "WARN" ? "#FFD700" : cfg.color;
        const nodeRgb = isCrit ? "255,68,102" : n.status === "WARN" ? "255,215,0" : mainRgb;

        // Outer ring
        ctx.beginPath(); ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${nodeRgb},${0.15 + pulse * 0.25})`; ctx.lineWidth = 1; ctx.stroke();

        // Fill
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
        grd.addColorStop(0, `rgba(${nodeRgb},0.4)`);
        grd.addColorStop(0.5, `rgba(${nodeRgb},0.15)`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
        // Core
        ctx.beginPath(); ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor; ctx.fill();
        // Label
        ctx.fillStyle = "rgba(200,216,232,0.7)";
        ctx.font = "9px 'Share Tech Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y + r + 12);
      });

      // Corner HUD elements
      // Top-left bracket
      ctx.strokeStyle = `rgba(${mainRgb},0.5)`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(12, 24); ctx.lineTo(12, 12); ctx.lineTo(24, 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W - 12, 24); ctx.lineTo(W - 12, 12); ctx.lineTo(W - 24, 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, H - 24); ctx.lineTo(12, H - 12); ctx.lineTo(24, H - 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W - 12, H - 24); ctx.lineTo(W - 12, H - 12); ctx.lineTo(W - 24, H - 12); ctx.stroke();

      // Crosshair center
      const cx = W / 2, cy = H / 2;
      ctx.strokeStyle = `rgba(${mainRgb},0.25)`; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx - 20, cy); ctx.lineTo(cx - 5, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 5, cy); ctx.lineTo(cx + 20, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy - 5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 5); ctx.lineTo(cx, cy + 20); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${mainRgb},0.4)`; ctx.stroke();

      // Alert overlay
      if (isAlert) {
        const flashAlpha = (Math.sin(t * 4) * 0.5 + 0.5) * 0.08;
        ctx.fillStyle = `rgba(255,68,102,${flashAlpha})`;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = `rgba(255,68,102,${0.3 + flashAlpha * 2})`; ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, W - 4, H - 4);
      }

      // Scanline sweep
      const scanY = (t * 60) % H;
      const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 4);
      scanGrad.addColorStop(0, "rgba(0,0,0,0)");
      scanGrad.addColorStop(0.5, `rgba(${mainRgb},0.04)`);
      scanGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 20, W, 24);

      // Bottom status bar
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, H - 28, W, 28);
      ctx.fillStyle = `rgba(${mainRgb},0.9)`;
      ctx.font = "9px 'Share Tech Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`FEED: ${cfg.name.toUpperCase()}  //  T+${t.toFixed(1)}s  //  NODES:${NODES.length}  //  STREAM:LIVE`, 10, H - 10);

      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [prediction, modelKey, isAlert, cfg]);

  return (
    <div style={{ position: "relative", borderRadius: 6, overflow: "hidden",
      border: `1px solid ${isAlert ? "rgba(255,68,102,0.5)" : `${cfg.color}30`}`,
      boxShadow: isAlert ? "0 0 30px rgba(255,68,102,0.25)" : `0 0 20px ${cfg.color}15`,
    }}>
      <canvas ref={ref} width={520} height={280}
        style={{ width: "100%", display: "block" }} />
      {/* REC indicator */}
      <div style={{ position: "absolute", top: 12, right: 12,
        display: "flex", alignItems: "center", gap: 6,
        background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: 4 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%",
          background: "#FF4466", animation: "statusBlink 2s linear infinite" }} />
        <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#FF4466" }}>REC</span>
      </div>
      {/* Model tag */}
      <div style={{ position: "absolute", top: 12, left: 12,
        background: "rgba(0,0,0,0.7)", padding: "4px 10px", borderRadius: 4,
        border: `1px solid ${cfg.color}30`,
        fontFamily: "'Share Tech Mono'", fontSize: 9, color: cfg.color }}>
        {cfg.icon} {cfg.name.toUpperCase()}
      </div>
    </div>
  );
}

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, unit, color, sub, animate }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof value !== "number") return;
    const start = display, end = value, dur = 600, begin = performance.now();
    const tick = now => {
      const p = Math.min((now - begin) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(start + (end - start) * ease);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <div style={{ background: "rgba(4,8,16,0.85)", border: `1px solid ${color}20`,
      borderRadius: 8, padding: "14px 16px", position: "relative", overflow: "hidden",
      borderLeft: `2px solid ${color}`,
    }}>
      <div style={{ position: "absolute", inset: 0,
        background: `radial-gradient(circle at 0% 100%, ${color}08, transparent 60%)`,
        pointerEvents: "none" }} />
      <div style={{ fontSize: 9, fontFamily: "'Share Tech Mono'", color: "#5A7090",
        letterSpacing: "0.14em", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: "'Orbitron'", fontSize: 24, fontWeight: 700, color,
          lineHeight: 1, animation: animate ? "numberCount 0.4s ease-out" : "none" }}>
          {typeof value === "number"
            ? value < 1 && value > 0 ? display.toFixed(2)
            : Math.round(display) : value}
        </span>
        {unit && <span style={{ fontSize: 11, color: "#5A7090", fontFamily: "'Share Tech Mono'" }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 9, color: "#5A7090", marginTop: 4, fontFamily: "'Share Tech Mono'" }}>{sub}</div>}
    </div>
  );
}

// ─── RISK GAUGE ───────────────────────────────────────────────────────────────
function RiskArcGauge({ value = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 180, H = 100, cx = 90, cy = 92, r = 70;
    ctx.clearRect(0, 0, W, H);
    const startA = Math.PI, endA = Math.PI * 2;
    // BG arc
    ctx.beginPath(); ctx.arc(cx, cy, r, startA, endA);
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 10; ctx.lineCap = "round"; ctx.stroke();
    // Colored arc
    const coloredEnd = startA + (endA - startA) * Math.min(value / 100, 1);
    const arcColor = value < 33 ? "#00F5FF" : value < 66 ? "#FFD700" : "#FF4466";
    ctx.beginPath(); ctx.arc(cx, cy, r, startA, coloredEnd);
    ctx.strokeStyle = arcColor; ctx.lineWidth = 10; ctx.lineCap = "round"; ctx.stroke();
    // Needle
    const needleA = startA + (endA - startA) * Math.min(value / 100, 1);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(needleA);
    ctx.beginPath(); ctx.moveTo(-r + 10, 0); ctx.lineTo(0, 3); ctx.lineTo(0, -3); ctx.closePath();
    ctx.fillStyle = arcColor; ctx.fill(); ctx.restore();
    // Center circle
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#0A0E1A"; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = arcColor; ctx.fill();
    // Text
    ctx.fillStyle = arcColor; ctx.font = "bold 20px 'Orbitron', monospace";
    ctx.textAlign = "center"; ctx.fillText(`${Math.round(value)}`, cx, cy - 18);
    ctx.fillStyle = "rgba(180,196,212,0.45)"; ctx.font = "9px 'Share Tech Mono', monospace";
    ctx.fillText("RISK SCORE", cx, cy - 4);
  }, [value]);
  return <canvas ref={ref} width={180} height={100} style={{ width: 180, height: 100 }} />;
}

// ─── PREDICTION DETAIL PANEL ──────────────────────────────────────────────────
function PredictionDetail({ pred, cfg }) {
  const [expanded, setExpanded] = useState(false);
  if (!pred) return null;
  const isHigh = pred.risk_level === "HIGH";
  const isMed = pred.risk_level === "MEDIUM";
  const riskColor = isHigh ? "#FF4466" : isMed ? "#FFD700" : "#00F5FF";

  return (
    <div style={{ background: "rgba(4,8,16,0.9)", border: `1px solid ${riskColor}25`,
      borderRadius: 8, padding: "16px", overflow: "hidden",
      animation: isHigh ? "alertFlash 2s ease-in-out infinite" : "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8,
            background: `${riskColor}15`, border: `1px solid ${riskColor}30`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            {cfg?.icon}
          </div>
          <div>
            <div style={{ fontFamily: "'Orbitron'", fontSize: 11, fontWeight: 600, color: riskColor, marginBottom: 2 }}>
              {pred.machine_id}
            </div>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#5A7090" }}>
              {new Date(pred.timestamp).toLocaleTimeString()} • {pred.processing_time_ms}ms
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {isHigh && (
            <div style={{ position: "relative", width: 14, height: 14, marginLeft: "auto", marginBottom: 4 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
                background: "#FF4466", animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite" }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#FF4466" }} />
            </div>
          )}
          <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, fontWeight: 700,
            color: riskColor, background: `${riskColor}15`, border: `1px solid ${riskColor}35`,
            padding: "3px 10px", borderRadius: 3, letterSpacing: "0.1em" }}>
            {pred.risk_level}
          </span>
        </div>
      </div>

      {/* Probability bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#5A7090" }}>FAILURE PROBABILITY</span>
          <span style={{ fontFamily: "'Orbitron'", fontSize: 11, color: riskColor, fontWeight: 600 }}>
            {(pred.probability * 100).toFixed(1)}%
          </span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3, transition: "width 0.8s ease",
            width: `${pred.probability * 100}%`,
            background: `linear-gradient(90deg, ${riskColor}60, ${riskColor})`,
            boxShadow: `0 0 8px ${riskColor}60`,
          }} />
        </div>
      </div>

      {/* Feature chips */}
      <div onClick={() => setExpanded(!expanded)} style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12, cursor: "pointer" }}>
        {Object.entries(pred.features || {}).map(([k, v]) => (
          <div key={k} style={{ background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "4px 8px",
            fontFamily: "'Share Tech Mono'", fontSize: 9 }}>
            <span style={{ color: "#5A7090" }}>{k.replace(/_/g, "·")}</span>
            <span style={{ color: cfg?.color || "#00F5FF", marginLeft: 4 }}>
              {typeof v === "number" ? v.toFixed(2) : v}
            </span>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div style={{ background: `${riskColor}08`, border: `1px solid ${riskColor}20`,
        borderRadius: 6, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>
          {isHigh ? "🚨" : isMed ? "⚠️" : "✅"}
        </span>
        <div>
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: riskColor,
            letterSpacing: "0.1em", marginBottom: 4 }}>SYSTEM RECOMMENDATION</div>
          <div style={{ fontFamily: "'Exo 2'", fontSize: 11, color: "#8A9AB0", lineHeight: 1.6 }}>
            {pred.recommendation}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HISTORY STREAM LIST ──────────────────────────────────────────────────────
function HistoryStream({ predictions, cfg }) {
  return (
    <div style={{ overflowY: "auto", maxHeight: 240, paddingRight: 4 }}>
      {predictions.length === 0 && (
        <div style={{ textAlign: "center", padding: 30, color: "#5A7090",
          fontFamily: "'Share Tech Mono'", fontSize: 11 }}>
          AWAITING STREAM DATA...
        </div>
      )}
      {predictions.map((p, i) => {
        const rc = p.risk_level === "HIGH" ? "#FF4466" : p.risk_level === "MEDIUM" ? "#FFD700" : "#00F5FF";
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "7px 10px", borderRadius: 5, marginBottom: 4,
            background: "rgba(4,8,16,0.6)", borderLeft: `2px solid ${rc}`,
            animation: i === 0 ? "slideFromLeft 0.3s ease-out" : "none",
            transition: "all 0.2s",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%",
              background: rc, flexShrink: 0,
              animation: p.risk_level === "HIGH" ? "ping 1.5s infinite" : "none" }} />
            <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 10, color: "#8A9AB0", flex: 1 }}>
              {p.machine_id}
            </span>
            <span style={{ fontFamily: "'Orbitron'", fontSize: 10, color: rc, fontWeight: 600 }}>
              {(p.probability * 100).toFixed(0)}%
            </span>
            <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: rc,
              background: `${rc}12`, border: `1px solid ${rc}25`,
              padding: "2px 6px", borderRadius: 3, letterSpacing: "0.08em" }}>
              {p.risk_level}
            </span>
            <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: "#5A7090", flexShrink: 0 }}>
              {new Date(p.timestamp).toLocaleTimeString("en",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"})}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── SOP DOCUMENT VIEWER ──────────────────────────────────────────────────────
function SOPViewer({ modelKey, prediction }) {
  const cfg = MODEL_CONFIG[modelKey] || MODEL_CONFIG.realistic_v3_iot;
  const steps = [
    { n: "01", title: "PRE-DIAGNOSIS CHECK", done: true,
      body: `Initialize ${cfg.name} diagnostic subsystem. Verify all ${cfg.features?.length} sensor nodes report within ±5% tolerance. Clear cache buffers and authorize encrypted handshake.` },
    { n: "02", title: "SENSOR CALIBRATION", done: true,
      body: `Run cross-validation sweep on primary features: ${cfg.features?.slice(0,3).join(", ")}. Re-zero baselines against archived profiles. Tolerance window: 150ms.` },
    { n: "03", title: "ANOMALY ISOLATION",
      done: prediction?.risk_level === "HIGH" || prediction?.risk_level === "MEDIUM",
      body: `${prediction?.failure_predicted ? `CRITICAL — ${prediction.machine_id} isolated. Failure probability ${(prediction?.probability * 100).toFixed(1)}%. Initiate emergency protocol.` : "Automated anomaly scan returned nominal. No isolation required at this time."}` },
    { n: "04", title: "CORRECTIVE ACTION", done: false,
      body: `${prediction?.risk_level === "HIGH" ? "Dispatch field technician. ETA < 2h. Reference schematic 7-C for bearing replacement sequence." : "Schedule next maintenance window per standard 30-day rotation protocol."}` },
    { n: "05", title: "VERIFICATION & SIGN-OFF", done: false,
      body: "Run final 360° diagnostic pass. Generate SHA-256 verified maintenance report. Archive to central database." },
  ];

  return (
    <div style={{ background: "rgba(4,8,16,0.9)", border: "1px solid rgba(0,245,255,0.12)",
      borderRadius: 8, padding: "20px", height: "100%", overflow: "auto" }}>
      {/* Header */}
      <div style={{ borderLeft: `3px solid ${cfg.color}`, paddingLeft: 14, marginBottom: 20 }}>
        <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: cfg.color,
          opacity: 0.7, letterSpacing: "0.12em", marginBottom: 4 }}>
          SOP·REV·4.1.2 // CLASSIFIED // {cfg.dataset?.toUpperCase()}
        </div>
        <div style={{ fontFamily: "'Orbitron'", fontSize: 15, fontWeight: 700, color: cfg.color,
          letterSpacing: "0.06em", animation: "neonPulse 4s ease-in-out infinite" }}>
          {cfg.name.toUpperCase().replace(/ /g, "_")}_MAINTENANCE_PROTOCOL
        </div>
      </div>

      {/* Steps */}
      {steps.map((s, i) => (
        <div key={i} style={{ marginBottom: 14, display: "flex", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%",
              background: s.done ? `${cfg.color}20` : "rgba(255,255,255,0.04)",
              border: `1px solid ${s.done ? cfg.color : "rgba(255,255,255,0.1)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Share Tech Mono'", fontSize: 9,
              color: s.done ? cfg.color : "#5A7090" }}>
              {s.done ? "✓" : s.n}
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 1, height: 24, marginTop: 4,
                background: s.done ? `${cfg.color}40` : "rgba(255,255,255,0.06)" }} />
            )}
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ fontFamily: "'Orbitron'", fontSize: 10, fontWeight: 600,
              color: s.done ? cfg.color : "#8A9AB0", letterSpacing: "0.08em", marginBottom: 5 }}>
              {s.n} // {s.title}
            </div>
            <div style={{ fontFamily: "'Exo 2'", fontSize: 11, color: "#5A7090", lineHeight: 1.65 }}>
              {s.body}
            </div>
          </div>
        </div>
      ))}

      {/* Footer */}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(0,245,255,0.08)",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#5A7090" }}>
          DOC_VERIFIED_SHA256: 8a7c...3f1d
        </span>
        <button style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}50`,
          color: cfg.color, padding: "8px 16px", borderRadius: 5, cursor: "pointer",
          fontFamily: "'Orbitron'", fontSize: 9, fontWeight: 600, letterSpacing: "0.14em",
          transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = cfg.color; e.currentTarget.style.color = "#000508"; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${cfg.color}15`; e.currentTarget.style.color = cfg.color; }}>
          ◈ GENERATE REPORT
        </button>
      </div>
    </div>
  );
}

// ─── VORTEX BAR ───────────────────────────────────────────────────────────────
function VortexBar({ color = "#00F5FF" }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 260, H = 28;
    const pts = Array.from({ length: 80 }, (_, i) => ({
      x: (i / 79) * W, baseY: H / 2,
      phase: (i / 79) * Math.PI * 4, amp: 2 + Math.random() * 5,
      freq: 1 + Math.random() * 2, speed: 0.03 + Math.random() * 0.05,
    }));
    let t = 0, anim;
    const hexRgb = hex => {
      const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
      return `${r},${g},${b}`;
    };
    const rgb = hexRgb(color);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.04;
      ctx.beginPath();
      pts.forEach((p, i) => {
        const y = p.baseY + Math.sin(p.phase + t * p.speed * p.freq) * p.amp;
        i === 0 ? ctx.moveTo(p.x, y) : ctx.lineTo(p.x, y);
      });
      ctx.strokeStyle = `rgba(${rgb},0.6)`; ctx.lineWidth = 1; ctx.stroke();
      pts.forEach((p, i) => {
        if (i % 8 === 0) {
          const y = p.baseY + Math.sin(p.phase + t * p.speed * p.freq) * p.amp;
          ctx.beginPath(); ctx.arc(p.x, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},0.8)`; ctx.fill();
        }
      });
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, [color]);
  return <canvas ref={ref} width={260} height={28} style={{ width: 260, height: 28 }} />;
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function MaintenanceCinematicDashboard() {
  const [selectedModel, setSelectedModel] = useState("ann_smart_manufacturing");
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [probHistory, setProbHistory] = useState([]);
  const [loadHistory, setLoadHistory] = useState(Array.from({length:40},()=>Math.random()*60+20));
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [systemTime, setSystemTime] = useState(new Date());
  const [frameCount, setFrameCount] = useState(0);
  const [backendStatus] = useState("connected"); // Replace with real checkHealth()
  const [activeTab, setActiveTab] = useState("feed");
  const timerRef = useRef(null);
  const clockRef = useRef(null);
  const loadRef = useRef(null);

  const cfg = MODEL_CONFIG[selectedModel];

  // Clock tick
  useEffect(() => {
    clockRef.current = setInterval(() => {
      setSystemTime(new Date());
      setFrameCount(f => f + 1);
    }, 1000);
    return () => clearInterval(clockRef.current);
  }, []);

  // Load history ticker
  useEffect(() => {
    loadRef.current = setInterval(() => {
      setLoadHistory(h => [...h.slice(1), Math.random() * 70 + 20]);
    }, 1200);
    return () => clearInterval(loadRef.current);
  }, []);

  // Fetch prediction
  const fetchPrediction = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const data = await getRealtimePrediction(selectedModel);
    if (!data.error) {
      setLatest(data);
      setHistory(h => [data, ...h].slice(0, 80));
      setProbHistory(h => [...h, data.probability * 100].slice(-50));
    }
    setLoading(false);
  }, [loading, selectedModel]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      fetchPrediction();
      timerRef.current = setInterval(fetchPrediction, 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, selectedModel]);

  // Model switch resets history
  useEffect(() => {
    clearInterval(timerRef.current);
    setHistory([]); setProbHistory([]); setLatest(null);
  }, [selectedModel]);

  const riskScore = useMemo(() => {
    if (!history.length) return 0;
    return history.slice(0, 10).reduce((s, p) => s + p.probability, 0) / Math.min(history.length, 10) * 100;
  }, [history]);

  const failures = history.filter(p => p.failure_predicted).length;
  const failureRate = history.length ? (failures / history.length * 100).toFixed(1) : "0.0";
  const isAlert = latest?.risk_level === "HIGH";

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000508",
      display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <style>{CSS}</style>

      {/* ── GLOBAL SCANLINES ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998,
        background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)",
        mixBlendMode: "multiply" }} />

      {/* ── ALERT VIGNETTE ── */}
      {isAlert && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9997,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(255,68,102,0.08) 100%)",
          animation: "alertFlash 1.5s ease-in-out infinite" }} />
      )}

      {/* ══════════════════════════════════════════════════════ HEADER */}
      <header style={{ height: 52, flexShrink: 0,
        background: "rgba(0,5,8,0.95)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${isAlert ? "rgba(255,68,102,0.4)" : "rgba(0,245,255,0.1)"}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", position: "relative", overflow: "hidden",
        animation: "revealDown 0.6s ease-out",
      }}>
        {/* Header scan line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
          animation: "scanH 3s linear infinite", opacity: 0.4, pointerEvents: "none" }} />

        {/* Logo */}
        <div className="from-left" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 18,
            background: `${cfg.color}15`, border: `1px solid ${cfg.color}40` }}>
            {cfg.icon}
          </div>
          <div>
            <div style={{ fontFamily: "'Orbitron'", fontSize: 13, fontWeight: 900,
              color: cfg.color, letterSpacing: "0.15em",
              textShadow: `0 0 16px ${cfg.color}80`, animation: "neonPulse 4s infinite" }}>
              BIOPULSE<span style={{ color: "#FF4466" }}>·</span>ELITE
            </div>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: "#5A7090",
              letterSpacing: "0.12em" }}>MAINTENANCE CORE v4.2</div>
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
          <VortexBar color={cfg.color} />
        </div>

        {/* Center — model selector pills */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", maxWidth: "45vw", padding: "0 8px",
          scrollbarWidth: "thin", scrollbarColor: "rgba(0,245,255,0.3) transparent" }}>
          {Object.entries(MODEL_CONFIG).map(([key, c]) => (
            <button key={key} onClick={() => setSelectedModel(key)} style={{
              background: selectedModel === key ? `${c.color}15` : "rgba(255,255,255,0.03)",
              border: `1px solid ${selectedModel === key ? c.color + "50" : "rgba(255,255,255,0.07)"}`,
              color: selectedModel === key ? c.color : "#5A7090",
              padding: "6px 14px", borderRadius: 20, fontSize: 11,
              fontFamily: "'Share Tech Mono'", cursor: "pointer",
              transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="from-right" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* System clock */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Orbitron'", fontSize: 14, fontWeight: 600, color: cfg.color }}>
              {systemTime.toLocaleTimeString("en", { hour12: false })}
            </div>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: "#5A7090" }}>
              {systemTime.toLocaleDateString("en", { year:"numeric",month:"2-digit",day:"2-digit" })}
            </div>
          </div>

          {/* Backend dot */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ position: "relative", width: 10, height: 10 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
                background: "#00FF88", animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite" }} />
              <div style={{ position: "absolute", inset: "2px", borderRadius: "50%", background: "#00FF88" }} />
            </div>
            <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#00FF88" }}>LIVE</span>
          </div>

          <button onClick={() => setAutoRefresh(v => !v)} style={{
            background: autoRefresh ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${autoRefresh ? "rgba(0,255,136,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: autoRefresh ? "#00FF88" : "#5A7090", padding: "5px 12px", borderRadius: 5,
            fontFamily: "'Share Tech Mono'", fontSize: 10, cursor: "pointer", transition: "all 0.2s",
          }}>
            {autoRefresh ? "⏹ STOP" : "▶ AUTO"}
          </button>

          <button onClick={fetchPrediction} disabled={loading} style={{
            background: loading ? "rgba(0,245,255,0.05)" : `${cfg.color}15`,
            border: `1px solid ${loading ? "rgba(255,255,255,0.1)" : cfg.color + "50"}`,
            color: loading ? "#5A7090" : cfg.color, padding: "5px 14px", borderRadius: 5,
            fontFamily: "'Orbitron'", fontSize: 9, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.1em", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6,
          }}>
            {loading ? (
              <><div style={{ width: 10, height: 10, border: `1.5px solid ${cfg.color}`,
                borderTopColor: "transparent", borderRadius: "50%", animation: "spinOrbit 0.8s linear infinite" }} />
              PROCESSING</>
            ) : "◈ SCAN"}
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════ DATA TICKER */}
      <div style={{ height: 28, flexShrink: 0,
        background: "rgba(0,3,6,0.9)",
        borderBottom: "1px solid rgba(0,245,255,0.08)",
        padding: "3px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: cfg.color,
          letterSpacing: "0.16em", flexShrink: 0, opacity: 0.8 }}>DATASTREAM ►</span>
        <DataTicker predictions={history} color={cfg.color} />
      </div>

      {/* ══════════════════════════════════════════════════════ BODY */}
      <div style={{ flex: 1, display: "grid",
        gridTemplateColumns: "260px 1fr 280px",
        gridTemplateRows: "1fr",
        gap: 0, overflow: "hidden" }}>

        {/* ══ LEFT PANEL ═══════════════════════════════════════════════════ */}
        <div style={{ borderRight: "1px solid rgba(0,245,255,0.08)",
          background: "rgba(0,3,6,0.8)", display: "flex", flexDirection: "column",
          overflow: "hidden", animation: "slideFromLeft 0.5s ease-out" }}>

          {/* Matrix rain header */}
          <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
            <MatrixRain width={260} height={80} color={cfg.color} density={0.3} />
            <div style={{ position: "absolute", inset: 0,
              background: "linear-gradient(0deg, rgba(0,3,6,1) 0%, transparent 60%)",
              pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 10, left: 16 }}>
              <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: cfg.color, opacity: 0.6, marginBottom: 2 }}>
                SYSTEM STATUS
              </div>
              <div style={{ fontFamily: "'Orbitron'", fontSize: 11, color: cfg.color, fontWeight: 700 }}>
                {cfg.name.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Risk gauge */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            <RiskArcGauge value={riskScore} />
          </div>

          {/* Metrics */}
          <div style={{ padding: "12px 12px 8px", display: "grid",
            gridTemplateColumns: "1fr 1fr", gap: 8, flexShrink: 0 }}>
            <MetricCard label="TOTAL SCANS" value={history.length} color={cfg.color} animate />
            <MetricCard label="FAILURES" value={failures} color="#FF4466" animate />
            <MetricCard label="FAIL RATE" value={parseFloat(failureRate)} unit="%" color="#FFD700" animate />
            <MetricCard label="ACCURACY" value={cfg.accuracy} unit="%" color="#00FF88" />
          </div>

          {/* Oscilloscope — probability over time */}
          <div style={{ padding: "0 12px 12px", flexShrink: 0 }}>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: "#5A7090",
              letterSpacing: "0.12em", marginBottom: 6 }}>PROBABILITY WAVE</div>
            <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 6, overflow: "hidden",
              border: `1px solid ${cfg.color}15` }}>
              <Oscilloscope data={probHistory} color={cfg.color} height={70} label="FAIL%" />
            </div>
          </div>

          {/* Radar */}
          <div style={{ padding: "0 12px", flexShrink: 0 }}>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: "#5A7090",
              letterSpacing: "0.12em", marginBottom: 6 }}>FLEET RADAR</div>
            <div style={{ display: "flex", justifyContent: "center",
              background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: 10,
              border: `1px solid ${cfg.color}15` }}>
              <RadarDisplay predictions={history} size={120} color={cfg.color} />
            </div>
          </div>

          {/* Feature analysis bars */}
          <div style={{ padding: "12px", flex: 1, overflow: "auto" }}>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: "#5A7090",
              letterSpacing: "0.12em", marginBottom: 8 }}>AVG SENSOR LEVELS</div>
            {(cfg.features || []).map(feat => {
              const vals = history.slice(0,20).map(p => p.features?.[feat] || 0).filter(Boolean);
              const avg = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
              const [lo, hi] = FEATURE_RANGES[feat] || [0,100];
              const pct = Math.min(((avg - lo) / (hi - lo)) * 100, 100);
              const warn = pct > 75;
              return (
                <div key={feat} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: "#5A7090" }}>
                      {feat.replace(/_/g,"·").toUpperCase()}
                    </span>
                    <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9,
                      color: warn ? "#FFD700" : cfg.color }}>
                      {avg.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2 }}>
                    <div style={{ height: "100%", borderRadius: 2,
                      width: `${pct}%`, transition: "width 0.8s ease",
                      background: warn ? "#FFD700" : cfg.color, opacity: 0.7 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ CENTER PANEL ══════════════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "cinematicFadeIn 0.7s ease-out" }}>

          {/* Tab bar */}
          <div style={{ height: 40, flexShrink: 0,
            borderBottom: "1px solid rgba(0,245,255,0.08)",
            background: "rgba(0,3,6,0.6)", display: "flex", alignItems: "center",
            padding: "0 16px", gap: 0 }}>
            {[
              { id: "feed", label: "LIVE FEED" },
              { id: "sop", label: "MAINTENANCE SOP" },
              { id: "history", label: "EVENT STREAM" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                background: "transparent", border: "none", cursor: "pointer",
                borderBottom: `2px solid ${activeTab === tab.id ? cfg.color : "transparent"}`,
                color: activeTab === tab.id ? cfg.color : "#5A7090",
                padding: "0 18px", height: "100%",
                fontFamily: "'Share Tech Mono'", fontSize: 9, letterSpacing: "0.14em",
                transition: "all 0.2s",
              }}>
                {tab.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            {/* Load waveform mini */}
            <div style={{ width: 120, opacity: 0.6 }}>
              <Oscilloscope data={loadHistory} color={cfg.color} height={28} />
            </div>
            <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: "#5A7090",
              marginLeft: 8, width: 60 }}>
              {history.length} events
            </span>
          </div>

          {/* Tab body */}
          <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
            {activeTab === "feed" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Main video canvas */}
                <MaintenanceVideoFeed prediction={latest} modelKey={selectedModel} />

                {/* Alert banner */}
                {isAlert && (
                  <div style={{ background: "rgba(255,68,102,0.1)",
                    border: "1px solid rgba(255,68,102,0.5)", borderRadius: 8,
                    padding: "12px 18px", display: "flex", alignItems: "center", gap: 14,
                    animation: "alertFlash 1.5s ease-in-out infinite" }}>
                    <div style={{ position: "relative", width: 16, height: 16 }}>
                      <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
                        background: "#FF4466", animation: "ping 1s infinite" }} />
                      <div style={{ position: "absolute", inset: "3px", borderRadius: "50%", background: "#FF4466" }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Orbitron'", fontSize: 11, fontWeight: 700,
                        color: "#FF4466", letterSpacing: "0.12em", marginBottom: 3 }}>
                        ⚠ CRITICAL ALERT — {latest?.machine_id}
                      </div>
                      <div style={{ fontFamily: "'Exo 2'", fontSize: 11, color: "#FF8C42" }}>
                        {latest?.recommendation}
                      </div>
                    </div>
                    <div style={{ marginLeft: "auto", fontFamily: "'Orbitron'", fontSize: 20,
                      fontWeight: 900, color: "#FF4466" }}>
                      {(latest?.probability * 100).toFixed(1)}%
                    </div>
                  </div>
                )}

                {/* Latest prediction breakdown */}
                <PredictionDetail pred={latest} cfg={cfg} />
              </div>
            )}

            {activeTab === "sop" && (
              <SOPViewer modelKey={selectedModel} prediction={latest} />
            )}

            {activeTab === "history" && (
              <div>
                <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#5A7090",
                  letterSpacing: "0.14em", marginBottom: 12 }}>
                  EVENT LOG // {history.length} TOTAL RECORDS
                </div>
                {/* Full probability oscilloscope */}
                {probHistory.length > 2 && (
                  <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 8,
                    border: `1px solid ${cfg.color}15`, marginBottom: 16, overflow: "hidden" }}>
                    <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: cfg.color,
                      opacity: 0.6, padding: "8px 12px 4px", letterSpacing: "0.12em" }}>
                      PROBABILITY TIMELINE // {probHistory.length} SAMPLES
                    </div>
                    <Oscilloscope data={probHistory} color={cfg.color} height={100} />
                  </div>
                )}
                <HistoryStream predictions={history} cfg={cfg} />
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT PANEL ════════════════════════════════════════════════════ */}
        <div style={{ borderLeft: "1px solid rgba(0,245,255,0.08)",
          background: "rgba(0,3,6,0.8)", display: "flex", flexDirection: "column",
          overflow: "hidden", animation: "slideFromRight 0.5s ease-out" }}>

          {/* Matrix rain header */}
          <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
            <MatrixRain width={280} height={70} color="#9B5CFF" density={0.25} />
            <div style={{ position: "absolute", inset: 0,
              background: "linear-gradient(0deg, rgba(0,3,6,1) 0%, transparent 60%)",
              pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 8, left: 16, right: 16,
              display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: "#9B5CFF", opacity: 0.6, marginBottom: 2 }}>
                  ACTIVE STREAM
                </div>
                <div style={{ fontFamily: "'Orbitron'", fontSize: 10, fontWeight: 700, color: "#9B5CFF" }}>
                  ANALYSIS ENGINE
                </div>
              </div>
              <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 9, color: "#5A7090" }}>
                F/{frameCount.toString().padStart(4,"0")}
              </div>
            </div>
          </div>

          {/* Live prediction numeric display */}
          {latest && (
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0,
              background: `${isAlert ? "rgba(255,68,102,0.06)" : `${cfg.color}05`}`,
              animation: isAlert ? "alertFlash 2s infinite" : "dataPulse 4s infinite" }}>
              <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: "#5A7090",
                letterSpacing: "0.14em", marginBottom: 8 }}>LIVE INFERENCE OUTPUT</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { l: "PROBABILITY", v: `${(latest.probability * 100).toFixed(2)}%`,
                    c: isAlert ? "#FF4466" : cfg.color },
                  { l: "MACHINE", v: latest.machine_id, c: "#C8D8E8" },
                  { l: "STATUS", v: latest.prediction_label, c: isAlert ? "#FF4466" : "#00FF88" },
                  { l: "LATENCY", v: `${latest.processing_time_ms}ms`, c: "#FFD700" },
                ].map(m => (
                  <div key={m.l} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 5,
                    padding: "8px 10px", borderLeft: `2px solid ${m.c}30` }}>
                    <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 7, color: "#5A7090",
                      letterSpacing: "0.12em", marginBottom: 3 }}>{m.l}</div>
                    <div style={{ fontFamily: "'Orbitron'", fontSize: 13, fontWeight: 700,
                      color: m.c, lineHeight: 1, animation: "numberCount 0.4s ease-out" }}>
                      {m.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Per-model performance */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: "#5A7090",
              letterSpacing: "0.14em", marginBottom: 10 }}>ALL MODEL STATUS</div>
            {Object.entries(MODEL_CONFIG).map(([key, c]) => (
              <div key={key} onClick={() => setSelectedModel(key)} style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                padding: "6px 10px", borderRadius: 5, cursor: "pointer",
                background: selectedModel === key ? `${c.color}0A` : "transparent",
                border: `1px solid ${selectedModel === key ? c.color + "30" : "transparent"}`,
                transition: "all 0.2s",
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{c.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 9,
                    color: selectedModel === key ? c.color : "#8A9AB0",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.name}
                  </div>
                  <div style={{ height: 2, background: "rgba(255,255,255,0.05)",
                    borderRadius: 1, marginTop: 3 }}>
                    <div style={{ height: "100%", width: `${c.accuracy}%`,
                      background: c.color, borderRadius: 1, opacity: 0.7 }} />
                  </div>
                </div>
                <span style={{ fontFamily: "'Orbitron'", fontSize: 9, color: c.color,
                  fontWeight: 600, flexShrink: 0 }}>{c.accuracy}%</span>
              </div>
            ))}
          </div>

          {/* Feature reading cards for latest prediction */}
          {latest && (
            <div style={{ padding: "14px 16px", flex: 1, overflow: "auto" }}>
              <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: "#5A7090",
                letterSpacing: "0.14em", marginBottom: 10 }}>SENSOR READINGS</div>
              {Object.entries(latest.features || {}).map(([k, v], i) => {
                const [lo, hi] = FEATURE_RANGES[k] || [0, 100];
                const pct = Math.min(((v - lo) / (hi - lo)) * 100, 100);
                const warn = pct > 75;
                return (
                  <div key={k} style={{ marginBottom: 10, padding: "8px 10px",
                    background: "rgba(0,0,0,0.3)", borderRadius: 5,
                    border: `1px solid ${warn ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.05)"}`,
                    animation: `cinematicFadeIn 0.3s ease-out ${i * 0.05}s both`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 9,
                        color: warn ? "#FFD700" : "#8A9AB0", letterSpacing: "0.08em" }}>
                        {k.replace(/_/g, " ").toUpperCase()}
                      </span>
                      <span style={{ fontFamily: "'Orbitron'", fontSize: 11, fontWeight: 600,
                        color: warn ? "#FFD700" : cfg.color }}>
                        {typeof v === "number" ? v.toFixed(3) : v}
                      </span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2 }}>
                      <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`,
                        background: warn ? "#FFD700" : cfg.color,
                        opacity: 0.6, transition: "width 0.6s ease",
                        boxShadow: warn ? "0 0 6px rgba(255,215,0,0.5)" : "none" }} />
                    </div>
                    {warn && (
                      <div style={{ fontFamily: "'Share Tech Mono'", fontSize: 7,
                        color: "#FFD700", marginTop: 3, letterSpacing: "0.1em" }}>
                        ⚠ ELEVATED — {pct.toFixed(0)}% OF RANGE
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════ FOOTER */}
      <footer style={{ height: 28, flexShrink: 0,
        background: "rgba(0,3,6,0.98)", borderTop: "1px solid rgba(0,245,255,0.07)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "AES256", active: true },
            { label: "STREAM:LIVE", active: autoRefresh },
            { label: "PORT:5005", active: true },
            { label: `MODEL:${selectedModel.toUpperCase()}`, active: true },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%",
                background: item.active ? cfg.color : "#5A7090",
                animation: item.active ? "morse 3s linear infinite" : "none" }} />
              <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 8,
                color: item.active ? `rgba(${cfg.color === "#00F5FF" ? "0,245,255" : "155,92,255"},.5)` : "#5A7090",
                letterSpacing: "0.1em" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <span style={{ fontFamily: "'Share Tech Mono'", fontSize: 8, color: "#5A7090" }}>
          © 2025 BIOPULSE ELITE // REAL-TIME MAINTENANCE CORE // ALL RIGHTS RESERVED
        </span>
      </footer>
    </div>
  );
}