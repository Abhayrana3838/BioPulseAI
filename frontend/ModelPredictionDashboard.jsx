import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  checkHealth,
  getModels,
  getRealtimePrediction,
  predictBatch,
  MODEL_CONFIG,
} from "./api_fixed.js";

// Real backend API - uses actual CSV data from your datasets

// ─── ANIMATION UTILITIES ─────────────────────────────────────────────────────
function useAnimatedValue(target, duration = 800) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef();
  const startRef = useRef({ value: 0, time: 0 });

  useEffect(() => {
    const startVal = startRef.current.value;
    const startTime = performance.now();
    startRef.current = { value: startVal, time: startTime };

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = startVal + (target - startVal) * eased;
      setCurrent(val);
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      else startRef.current.value = target;
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return current;
}

function useParticles(count = 30) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  );
  const [tick, setTick] = useState(0);
  const frameRef = useRef();

  useEffect(() => {
    const animate = () => {
      particles.current = particles.current.map((p) => {
        let nx = p.x + p.vx;
        let ny = p.y + p.vy;
        if (nx < 0 || nx > 100) p.vx *= -1;
        if (ny < 0 || ny > 100) p.vy *= -1;
        return { ...p, x: Math.max(0, Math.min(100, nx)), y: Math.max(0, Math.min(100, ny)) };
      });
      setTick((t) => t + 1);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return particles.current;
}

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; width: 100%; overflow: hidden; }
body {
  background: #020408;
  color: #C8D8E8;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,245,255,.2); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0,245,255,.4); }

::selection { background: rgba(0,245,255,.2); color: #00F5FF; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slideRight {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.9); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes dash {
  to { stroke-dashoffset: -24; }
}
@keyframes scanline {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(2000%); }
}
@keyframes flicker {
  0%, 95%, 100% { opacity: 1; }
  96%           { opacity: 0.8; }
  98%           { opacity: 0.95; }
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 8px rgba(0,245,255,.3); }
  50%       { box-shadow: 0 0 20px rgba(0,245,255,.6), 0 0 40px rgba(0,245,255,.2); }
}
@keyframes waveform {
  0%   { transform: scaleY(0.3); }
  50%  { transform: scaleY(1); }
  100% { transform: scaleY(0.3); }
}
@keyframes orbit {
  from { transform: rotate(0deg) translateX(40px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
}
@keyframes matrixRain {
  0%   { transform: translateY(-100%); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
}
@keyframes borderPulse {
  0%, 100% { border-color: rgba(0,245,255,.2); }
  50%       { border-color: rgba(0,245,255,.6); }
}
@keyframes numberRoll {
  from { transform: translateY(100%); }
  to   { transform: translateY(0%); }
}

.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,.5);
}
.btn-press:active { transform: scale(0.97); }
`;

// ─── PARTICLE CANVAS ─────────────────────────────────────────────────────────
function ParticleField({ color = "#00F5FF", count = 40 }) {
  const canvasRef = useRef(null);
  const animRef = useRef();
  const pts = useRef(
    Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.5 + 0.05,
    }))
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r},${g},${b}`;
    };
    const rgb = hexToRgb(color);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      pts.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;
      });

      // Lines
      for (let i = 0; i < pts.current.length; i++) {
        for (let j = i + 1; j < pts.current.length; j++) {
          const a = pts.current[i];
          const b = pts.current[j];
          const dx = (a.x - b.x) * W;
          const dy = (a.y - b.y) * H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x * W, a.y * H);
            ctx.lineTo(b.x * W, b.y * H);
            ctx.strokeStyle = `rgba(${rgb}, ${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Dots
      pts.current.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${p.a})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

// ─── LIVE WAVEFORM ───────────────────────────────────────────────────────────
function LiveWaveform({ data = [], color = "#00F5FF", height = 60, showGrid = true }) {
  const canvasRef = useRef(null);
  const animRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const W = canvas.offsetWidth;
    const H = height;

    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r},${g},${b}`;
    };
    const rgb = hexToRgb(color);

    ctx.clearRect(0, 0, W, H);

    if (showGrid) {
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 5; i++) {
        const y = (i / 4) * H;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 8;

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `rgba(${rgb},0.3)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);

    ctx.beginPath();
    ctx.moveTo(0, H);
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - pad - ((v - min) / range) * (H - pad * 2);
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - pad - ((v - min) / range) * (H - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Glow
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - pad - ((v - min) / range) * (H - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = `rgba(${rgb},0.3)`;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Latest dot
    const lastV = data[data.length - 1];
    const lx = W;
    const ly = H - pad - ((lastV - min) / range) * (H - pad * 2);
    ctx.beginPath();
    ctx.arc(lx, ly, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lx, ly, 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb},0.3)`;
    ctx.fill();
  }, [data, color, height, showGrid]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height, display: "block" }}
    />
  );
}

// ─── CIRCULAR GAUGE ──────────────────────────────────────────────────────────
function CircularGauge({ value, max = 100, label, color = "#00F5FF", size = 100 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 8;
    const pct = Math.min(value / max, 1);
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const current = startAngle + (endAngle - startAngle) * pct;

    ctx.clearRect(0, 0, size, size);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.stroke();

    // Fill
    const hexToRgb = (hex) => {
      const r2 = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r2},${g},${b}`;
    };
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, color);
    grad.addColorStop(1, `rgba(${hexToRgb(color)},0.5)`);

    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, current);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.stroke();

    // Center text
    ctx.fillStyle = "#C8D8E8";
    ctx.font = `600 ${size * 0.22}px 'JetBrains Mono', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.round(value)}%`, cx, cy - 4);

    ctx.fillStyle = "rgba(180,196,212,0.5)";
    ctx.font = `400 ${size * 0.1}px Inter, sans-serif`;
    ctx.fillText(label, cx, cy + size * 0.16);
  }, [value, max, label, color, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

// ─── RISK METER ──────────────────────────────────────────────────────────────
function RiskMeter({ predictions }) {
  const canvasRef = useRef(null);
  const riskScore = useMemo(() => {
    if (!predictions.length) return 0;
    const recent = predictions.slice(0, 10);
    const avg = recent.reduce((s, p) => s + (p.probability || 0), 0) / recent.length;
    return avg * 100;
  }, [predictions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 200;
    const H = 110;
    canvas.width = W;
    canvas.height = H;

    const cx = 100;
    const cy = 100;
    const r = 78;

    ctx.clearRect(0, 0, W, H);

    // Gradient arc
    const segments = [
      { from: Math.PI, to: Math.PI * 1.33, color: "#00F5FF" },
      { from: Math.PI * 1.33, to: Math.PI * 1.66, color: "#FFD700" },
      { from: Math.PI * 1.66, to: Math.PI * 2, color: "#FF4466" },
    ];
    segments.forEach((s) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, s.from, s.to);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 10;
      ctx.lineCap = "butt";
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Needle
    const angle = Math.PI + (riskScore / 100) * Math.PI;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(-r + 12, 0);
    ctx.lineTo(0, -4);
    ctx.closePath();
    const needleColor =
      riskScore < 33 ? "#00F5FF" : riskScore < 66 ? "#FFD700" : "#FF4466";
    ctx.fillStyle = needleColor;
    ctx.fill();
    ctx.restore();

    // Center pivot
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#C8D8E8";
    ctx.fill();

    // Score text
    ctx.fillStyle = needleColor;
    ctx.font = "bold 20px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(riskScore)}`, cx, cy - 20);
    ctx.fillStyle = "rgba(180,196,212,0.5)";
    ctx.font = "11px Inter";
    ctx.fillText("RISK SCORE", cx, cy - 6);
  }, [riskScore]);

  return <canvas ref={canvasRef} style={{ width: 200, height: 110 }} />;
}

// ─── HEATMAP ─────────────────────────────────────────────────────────────────
function FailureHeatmap({ predictions }) {
  const cells = useMemo(() => {
    const grid = Array.from({ length: 6 }, (_, r) =>
      Array.from({ length: 8 }, (_, c) => ({
        id: `${r}-${c}`,
        value: 0,
        count: 0,
      }))
    );
    predictions.slice(0, 48).forEach((p, i) => {
      const r = Math.floor(i / 8);
      const c = i % 8;
      if (grid[r] && grid[r][c]) {
        grid[r][c].value = p.probability || 0;
        grid[r][c].count = 1;
      }
    });
    return grid;
  }, [predictions]);

  const getColor = (v) => {
    if (v === 0) return "rgba(255,255,255,0.04)";
    if (v < 0.35) return `rgba(0,245,255,${0.2 + v * 0.5})`;
    if (v < 0.65) return `rgba(255,215,0,${0.3 + v * 0.4})`;
    return `rgba(255,68,102,${0.4 + v * 0.4})`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#C8D8E8", letterSpacing: "0.1em" }}>
          FAILURE HEATMAP
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["LOW", "MED", "HIGH"].map((l, i) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 8, height: 8, borderRadius: 2,
                background: ["#00F5FF", "#FFD700", "#FF4466"][i],
                opacity: 0.7,
              }} />
              <span style={{ fontSize: 9, color: "#5A7090" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 3 }}>
        {cells.flat().map((cell) => (
          <div
            key={cell.id}
            title={`Risk: ${(cell.value * 100).toFixed(1)}%`}
            style={{
              aspectRatio: "1",
              borderRadius: 3,
              background: getColor(cell.value),
              transition: "background 0.5s ease",
              cursor: "default",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MINI BAR CHART ──────────────────────────────────────────────────────────
function MiniBarChart({ data, color = "#00F5FF", height = 50 }) {
  if (!data.length) return null;
  const max = Math.max(...data, 0.01);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            background: color,
            borderRadius: "2px 2px 0 0",
            opacity: 0.3 + (i / data.length) * 0.7,
            transition: "height 0.4s ease",
            minWidth: 2,
          }}
        />
      ))}
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, color, icon, trend, sparkData }) {
  const animVal = useAnimatedValue(typeof value === "number" ? value : 0);

  return (
    <div
      className="card-hover"
      style={{
        background: "rgba(6,10,20,0.8)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 12,
        padding: "16px 20px",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at 0% 100%, ${color}10 0%, transparent 60%)`,
        pointerEvents: "none",
      }} />
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: "#5A7090", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{
                fontSize: 28,
                fontWeight: 700,
                color,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1,
              }}>
                {typeof value === "number" ? (
                  value < 1 ? animVal.toFixed(2) : Math.round(animVal)
                ) : value}
              </span>
              {unit && (
                <span style={{ fontSize: 12, color: "#5A7090" }}>{unit}</span>
              )}
            </div>
          </div>
          <div style={{
            width: 36, height: 36,
            borderRadius: 8,
            background: `${color}18`,
            border: `1px solid ${color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>
            {icon}
          </div>
        </div>

        {sparkData && sparkData.length > 0 && (
          <MiniBarChart data={sparkData} color={color} height={36} />
        )}

        {trend !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
            <span style={{ fontSize: 10, color: trend >= 0 ? "#00FF88" : "#FF4466" }}>
              {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
            </span>
            <span style={{ fontSize: 10, color: "#5A7090" }}>vs last session</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PREDICTION CARD ─────────────────────────────────────────────────────────
function PredictionCard({ data, index, isNew }) {
  const [expanded, setExpanded] = useState(false);
  if (!data || data.error) return null;
  const config = MODEL_CONFIG[data.model] || {};
  const color = config.color || "#00F5FF";
  const riskColors = {
    LOW: "#00F5FF",
    MEDIUM: "#FFD700",
    HIGH: "#FF4466",
  };
  const riskColor = riskColors[data.risk_level] || "#00F5FF";
  const pct = ((data.probability || 0) * 100).toFixed(1);

  return (
    <div
      className="card-hover"
      onClick={() => setExpanded(!expanded)}
      style={{
        background: data.failure_predicted
          ? "rgba(255,68,102,0.04)"
          : "rgba(6,10,20,0.6)",
        border: `1px solid ${data.failure_predicted ? "rgba(255,68,102,0.25)" : "rgba(255,255,255,0.07)"}`,
        borderLeft: `3px solid ${riskColor}`,
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 8,
        cursor: "pointer",
        animation: isNew ? `fadeUp 0.4s ease ${index * 0.05}s both` : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {data.failure_predicted && (
        <div style={{
          position: "absolute",
          top: 0, right: 0,
          width: 60, height: 60,
          background: "radial-gradient(circle at top right, rgba(255,68,102,0.15), transparent)",
          pointerEvents: "none",
        }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 8,
            background: `${color}15`,
            border: `1px solid ${color}25`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>
            {config.icon || "🤖"}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#C8D8E8", marginBottom: 2 }}>
              {data.machine_id}
              <span style={{ marginLeft: 8, fontSize: 10, color: "#5A7090" }}>
                {config.name}
              </span>
            </div>
            <div style={{ fontSize: 10, color: "#5A7090" }}>
              {new Date(data.timestamp).toLocaleTimeString()} •{" "}
              {data.processing_time_ms}ms
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Probability bar */}
          <div style={{ width: 80 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 9, color: "#5A7090" }}>PROB</span>
              <span style={{ fontSize: 9, color: riskColor, fontFamily: "monospace" }}>{pct}%</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              <div style={{
                width: `${pct}%`,
                height: "100%",
                background: riskColor,
                borderRadius: 2,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          <div style={{
            padding: "3px 10px",
            borderRadius: 4,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.1em",
            background: `${riskColor}18`,
            border: `1px solid ${riskColor}40`,
            color: riskColor,
            whiteSpace: "nowrap",
          }}>
            {data.risk_level}
          </div>

          <div style={{
            fontSize: 10,
            color: "#5A7090",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}>
            ▼
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          animation: "fadeIn 0.2s ease",
        }}>
          {/* Feature grid */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: "#5A7090", letterSpacing: "0.12em", marginBottom: 8, fontWeight: 600 }}>
              SENSOR READINGS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(data.features || {}).map(([key, val]) => (
                <div key={key} style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 6,
                  padding: "6px 10px",
                  textAlign: "center",
                  minWidth: 80,
                }}>
                  <div style={{ fontSize: 9, color: "#5A7090", marginBottom: 3, letterSpacing: "0.05em" }}>
                    {key.replace(/_/g, " ").toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: data.failure_predicted ? "#FF8C42" : color,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {typeof val === "number" ? val.toFixed(2) : val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          {data.recommendation && (
            <div style={{
              background: `${riskColor}0A`,
              border: `1px solid ${riskColor}25`,
              borderRadius: 8,
              padding: "10px 14px",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>
                {data.risk_level === "HIGH" ? "🚨" : data.risk_level === "MEDIUM" ? "⚠️" : "✅"}
              </span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: riskColor, marginBottom: 3, letterSpacing: "0.08em" }}>
                  RECOMMENDATION
                </div>
                <div style={{ fontSize: 11, color: "#8A9AB0", lineHeight: 1.6 }}>
                  {data.recommendation}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 10, fontSize: 10, color: "#5A7090" }}>
            <span>Model: <span style={{ color: color, fontFamily: "monospace" }}>{data.model}</span></span>
            <span>•</span>
            <span>Label: <span style={{ color: riskColor, fontFamily: "monospace" }}>{data.prediction_label}</span></span>
            <span>•</span>
            <span>Prob: <span style={{ color: riskColor, fontFamily: "monospace" }}>{(data.probability * 100).toFixed(2)}%</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MODEL SELECTOR CARD ─────────────────────────────────────────────────────
function ModelSelectorCard({ modelKey, isSelected, onClick, stats }) {
  const config = MODEL_CONFIG[modelKey];
  if (!config) return null;

  return (
    <div
      className="card-hover"
      onClick={onClick}
      style={{
        background: isSelected ? `${config.color}10` : "rgba(6,10,20,0.6)",
        border: `1px solid ${isSelected ? config.color + "40" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "pointer",
        marginBottom: 8,
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isSelected && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 0% 50%, ${config.color}08, transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40, height: 40,
          borderRadius: 10,
          background: `${config.color}15`,
          border: `1px solid ${config.color}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
          position: "relative",
        }}>
          {config.icon}
          {isSelected && (
            <div style={{
              position: "absolute",
              bottom: -1, right: -1,
              width: 10, height: 10,
              borderRadius: "50%",
              background: config.color,
              border: "2px solid #020408",
              animation: "pulse 2s infinite",
            }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? config.color : "#C8D8E8", marginBottom: 3 }}>
            {config.name}
          </div>
          <div style={{ fontSize: 10, color: "#5A7090", marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {config.dataset}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }}>
              <div style={{ width: `${config.accuracy}%`, height: "100%", background: config.color, borderRadius: 1 }} />
            </div>
            <span style={{ fontSize: 9, color: config.color, fontFamily: "monospace", whiteSpace: "nowrap" }}>
              {config.accuracy}%
            </span>
          </div>
        </div>
        {stats && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: config.color, fontFamily: "monospace" }}>
              {stats.count}
            </div>
            <div style={{ fontSize: 9, color: "#5A7090" }}>runs</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ACTIVITY LOG ────────────────────────────────────────────────────────────
function ActivityLog({ events }) {
  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {events.slice(0, 12).map((ev, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 10,
            padding: "5px 0",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            animation: i === 0 ? "slideRight 0.3s ease" : "none",
          }}
        >
          <span style={{ fontSize: 9, color: "#5A7090", whiteSpace: "nowrap", minWidth: 60 }}>
            {ev.time}
          </span>
          <span style={{
            fontSize: 9,
            color: ev.type === "error" ? "#FF4466" : ev.type === "warning" ? "#FFD700" : ev.type === "success" ? "#00FF88" : "#00F5FF",
            whiteSpace: "nowrap",
          }}>
            [{ev.type?.toUpperCase().slice(0, 4)}]
          </span>
          <span style={{ fontSize: 9, color: "#8A9AB0" }}>{ev.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── TOPOLOGY MAP ────────────────────────────────────────────────────────────
function NodeTopology({ predictions, modelKey }) {
  const config = MODEL_CONFIG[modelKey];
  const nodes = useMemo(() => {
    const machines = ["MCH-001", "MCH-047", "MCH-112", "MCH-203", "MCH-388", "MCH-512"];
    return machines.map((id, i) => {
      const angle = (i / machines.length) * Math.PI * 2 - Math.PI / 2;
      const r = 55;
      const latest = predictions.find((p) => p.machine_id === id);
      return {
        id,
        x: 90 + Math.cos(angle) * r,
        y: 75 + Math.sin(angle) * r,
        status: latest?.risk_level || "UNKNOWN",
        prob: latest?.probability || 0,
      };
    });
  }, [predictions]);

  const statusColors = { LOW: "#00F5FF", MEDIUM: "#FFD700", HIGH: "#FF4466", UNKNOWN: "#5A7090" };

  return (
    <svg width="180" height="150" style={{ overflow: "visible" }}>
      {/* Center hub */}
      <circle cx="90" cy="75" r="14" fill={`${config?.color || "#00F5FF"}20`}
        stroke={config?.color || "#00F5FF"} strokeWidth="1" />
      <text x="90" y="79" textAnchor="middle" fontSize="8" fill={config?.color || "#00F5FF"}
        fontFamily="JetBrains Mono">HUB</text>

      {/* Spokes */}
      {nodes.map((n) => (
        <line key={n.id + "-line"}
          x1="90" y1="75" x2={n.x} y2={n.y}
          stroke={statusColors[n.status]}
          strokeWidth="0.5"
          strokeDasharray={n.status === "HIGH" ? "2 2" : "none"}
          opacity="0.4"
        />
      ))}

      {/* Nodes */}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={8}
            fill={`${statusColors[n.status]}20`}
            stroke={statusColors[n.status]}
            strokeWidth="1"
          />
          {n.status === "HIGH" && (
            <circle cx={n.x} cy={n.y} r={12}
              fill="none"
              stroke="#FF4466"
              strokeWidth="0.5"
              opacity="0.4"
              style={{ animation: "pulse 1.5s infinite" }}
            />
          )}
          <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize="6"
            fill={statusColors[n.status]} fontFamily="JetBrains Mono">
            {n.id.slice(-3)}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function MLPredictionDashboard() {
  const [selectedModel, setSelectedModel] = useState("realistic_v3_iot");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState("predictions");
  const [newPredIds, setNewPredIds] = useState(new Set());
  const [activityLog, setActivityLog] = useState([]);
  const [probHistory, setProbHistory] = useState([]);
  const [loadHistory, setLoadHistory] = useState(
    Array.from({ length: 30 }, () => Math.random() * 60 + 20)
  );
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 42, memory: 67, gpu: 88, throughput: 234,
  });
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualFeatures, setManualFeatures] = useState({});
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const metricsRef = useRef(null);
  const tabActiveRef = useRef(true);

  const config = MODEL_CONFIG[selectedModel];

  // Simulated system metrics ticker
  useEffect(() => {
    metricsRef.current = setInterval(() => {
      setSystemMetrics((prev) => ({
        cpu: Math.max(10, Math.min(99, prev.cpu + (Math.random() - 0.5) * 8)),
        memory: Math.max(30, Math.min(95, prev.memory + (Math.random() - 0.5) * 4)),
        gpu: Math.max(40, Math.min(99, prev.gpu + (Math.random() - 0.5) * 6)),
        throughput: Math.max(50, Math.min(600, prev.throughput + (Math.random() - 0.5) * 40)),
      }));
      setLoadHistory((prev) => [
        ...prev.slice(1),
        Math.random() * 60 + 20,
      ]);
    }, 1500);
    return () => clearInterval(metricsRef.current);
  }, []);

  const addLog = useCallback((type, message) => {
    const time = new Date().toLocaleTimeString("en", { hour12: false });
    setActivityLog((prev) => [{ type, message, time }, ...prev].slice(0, 50));
  }, []);

  // Fetch prediction from real backend API
  const runPrediction = useCallback(
    async (count = 1) => {
      if (loading || !selectedModel) return;
      setLoading(true);
      addLog("info", `Running ${count} prediction(s) on ${MODEL_CONFIG[selectedModel]?.name}`);

      const newPreds = [];
      for (let i = 0; i < count; i++) {
        const data = await getRealtimePrediction(selectedModel);
        if (!data.error) {
          newPreds.push(data);
        }
      }

      if (newPreds.length > 0) {
        const ids = new Set(newPreds.map((_, i) => i));
        setNewPredIds(ids);
        setTimeout(() => setNewPredIds(new Set()), 2000);

        setPredictions((prev) => [...newPreds, ...prev].slice(0, 1000)); // Increased to 1000
        setProbHistory((prev) => [
          ...prev,
          ...newPreds.map((p) => (p.probability || 0) * 100),
        ].slice(-50));

        newPreds.forEach((p) => {
          const msg = `${p.machine_id} → ${p.prediction_label} (${(p.probability * 100).toFixed(1)}%)`;
          addLog(p.risk_level === "HIGH" ? "error" : p.risk_level === "MEDIUM" ? "warning" : "success", msg);
        });
      }

      setLoading(false);
    },
    [loading, selectedModel, addLog]
  );

  // Manual prediction with custom feature values
  const runManualPrediction = async () => {
    if (loading || !selectedModel) return;
    setLoading(true);
    addLog("info", `Running manual prediction on ${MODEL_CONFIG[selectedModel]?.name}`);

    const response = await fetch(`http://localhost:5005/api/predict/${selectedModel}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: manualFeatures }),
    });
    const data = await response.json();

    if (!data.error) {
      const enriched = { ...data, machine_id: 'MANUAL-001', timestamp: new Date().toISOString() };
      setPredictions((prev) => [enriched, ...prev].slice(0, 1000));
      setProbHistory((prev) => [...prev, (data.probability || 0) * 100].slice(-50));
      addLog(data.risk_level === "HIGH" ? "error" : data.risk_level === "MEDIUM" ? "warning" : "success",
        `Manual: ${data.prediction_label} (${(data.probability * 100).toFixed(1)}%)`);
    }

    setLoading(false);
  };

  // Handle CSV file upload for batch prediction
  const handleCsvUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    addLog("info", `Uploading CSV: ${file.name}`);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const config = MODEL_CONFIG[selectedModel];
      const featureCols = config?.features || [];

      const samples = [];
      for (let i = 1; i < Math.min(lines.length, 101); i++) { // Max 100 rows
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',');
        const sample = {};
        featureCols.forEach((col) => {
          const headerIdx = headers.indexOf(col);
          if (headerIdx >= 0 && values[headerIdx]) {
            sample[col] = parseFloat(values[headerIdx]) || 0;
          }
        });
        if (Object.keys(sample).length === featureCols.length) {
          samples.push(sample);
        }
      }

      // Run predictions for each sample
      const results = [];
      for (const sample of samples) {
        const response = await fetch(`http://localhost:5005/api/predict/${selectedModel}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ features: sample }),
        });
        const result = await response.json();
        if (!result.error) {
          results.push({ ...result, machine_id: `CSV-${results.length + 1}`, features: sample });
        }
      }

      if (results.length > 0) {
        setPredictions((prev) => [...results, ...prev].slice(0, 1000));
        setProbHistory((prev) => [...prev, ...results.map(r => (r.probability || 0) * 100)].slice(-50));
        addLog("success", `CSV processed: ${results.length} predictions from ${file.name}`);
      }

      setLoading(false);
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  useEffect(() => {
    if (autoRefresh) {
      runPrediction(1);
      intervalRef.current = setInterval(() => runPrediction(1), 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, selectedModel]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    setPredictions([]);
    setProbHistory([]);
    addLog("info", `Switched to model: ${MODEL_CONFIG[selectedModel]?.name}`);
  }, [selectedModel]);

  // Stats
  const stats = useMemo(() => {
    const total = predictions.length;
    const failures = predictions.filter((p) => p.failure_predicted).length;
    const avgProb =
      total > 0
        ? predictions.reduce((s, p) => s + (p.probability || 0), 0) / total
        : 0;
    const perModel = Object.keys(MODEL_CONFIG).reduce((acc, k) => {
      acc[k] = { count: predictions.filter((p) => p.model === k).length };
      return acc;
    }, {});
    return { total, failures, healthy: total - failures, avgProb, failureRate: total > 0 ? (failures / total) * 100 : 0, perModel };
  }, [predictions]);

  const tabs = [
    { id: "predictions", label: "Predictions", icon: "🔍" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "topology", label: "Topology", icon: "🕸️" },
    { id: "logs", label: "Activity Log", icon: "📋" },
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#020408",
      fontFamily: "'Inter', sans-serif",
      overflow: "hidden",
      position: "relative",
    }}>
      <style>{GLOBAL_CSS}</style>

      {/* Scanline effect */}
      <div style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      }} />

      {/* ── TOP HEADER ─────────────────────────────────────────────────────── */}
      <header style={{
        height: 56,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 20,
        flexShrink: 0,
        background: "rgba(2,4,8,0.95)",
        backdropFilter: "blur(16px)",
        position: "relative",
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8 }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${config?.gradient?.[0] || "#00F5FF"}, ${config?.gradient?.[1] || "#0080FF"})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
            animation: "glow 3s infinite",
          }}>
            ⚡
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#C8D8E8", fontFamily: "'Orbitron', monospace", letterSpacing: "0.05em" }}>
              NEXUS<span style={{ color: config?.color || "#00F5FF" }}>ML</span>
            </div>
            <div style={{ fontSize: 9, color: "#5A7090", letterSpacing: "0.12em" }}>
              PREDICTIVE ANALYTICS
            </div>
          </div>
        </div>

        {/* Model quick-switch pills */}
        <div style={{ display: "flex", gap: 6, flex: 1, overflow: "auto" }}>
          {Object.entries(MODEL_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              className="btn-press"
              onClick={() => setSelectedModel(key)}
              style={{
                background: selectedModel === key ? `${cfg.color}18` : "rgba(255,255,255,0.04)",
                border: `1px solid ${selectedModel === key ? cfg.color + "40" : "rgba(255,255,255,0.08)"}`,
                color: selectedModel === key ? cfg.color : "#5A7090",
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: 5,
                flexShrink: 0,
              }}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.name}</span>
            </button>
          ))}
        </div>

        {/* Header right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Live indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: autoRefresh ? "#00FF88" : "#5A7090",
              animation: autoRefresh ? "pulse 1.5s infinite" : "none",
            }} />
            <span style={{ fontSize: 10, color: autoRefresh ? "#00FF88" : "#5A7090" }}>
              {autoRefresh ? "LIVE" : "PAUSED"}
            </span>
          </div>

          <button
            className="btn-press"
            onClick={() => setAutoRefresh((v) => !v)}
            style={{
              background: autoRefresh ? "rgba(0,255,136,0.15)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${autoRefresh ? "rgba(0,255,136,0.4)" : "rgba(255,255,255,0.1)"}`,
              color: autoRefresh ? "#00FF88" : "#8A9AB0",
              padding: "5px 14px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {autoRefresh ? "⏹ Stop" : "▶ Auto"}
          </button>

          <button
            className="btn-press"
            onClick={() => runPrediction(1)}
            disabled={loading}
            style={{
              background: loading ? "rgba(0,245,255,0.06)" : `${config?.color || "#00F5FF"}18`,
              border: `1px solid ${loading ? "rgba(255,255,255,0.1)" : (config?.color || "#00F5FF") + "40"}`,
              color: loading ? "#5A7090" : config?.color || "#00F5FF",
              padding: "5px 14px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 10, height: 10, border: `1.5px solid ${config?.color}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Analyzing
              </>
            ) : "🔍 Predict"}
          </button>

          <button
            className="btn-press"
            onClick={() => runPrediction(5)}
            disabled={loading}
            style={{
              background: "rgba(155,92,255,0.12)",
              border: "1px solid rgba(155,92,255,0.35)",
              color: "#9B5CFF",
              padding: "5px 14px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "all 0.2s",
            }}
          >
            📊 Batch ×5
          </button>

          <button
            className="btn-press"
            onClick={() => runPrediction(50)}
            disabled={loading}
            style={{
              background: "rgba(255,140,66,0.12)",
              border: "1px solid rgba(255,140,66,0.35)",
              color: "#FF8C42",
              padding: "5px 14px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "all 0.2s",
            }}
          >
            📁 Predict Whole CSV (×50)
          </button>

          <button
            className="btn-press"
            onClick={() => {
              setShowManualInput(!showManualInput);
              setShowCsvUpload(false);
              // Initialize manual features with empty values
              if (!showManualInput) {
                const features = {};
                MODEL_CONFIG[selectedModel]?.features?.forEach(f => features[f] = '');
                setManualFeatures(features);
              }
            }}
            disabled={loading}
            style={{
              background: showManualInput ? "rgba(0,245,255,0.25)" : "rgba(0,245,255,0.12)",
              border: "1px solid rgba(0,245,255,0.35)",
              color: "#00F5FF",
              padding: "5px 14px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "all 0.2s",
            }}
          >
            ✏️ Manual Input
          </button>

          <button
            className="btn-press"
            onClick={() => {
              setShowCsvUpload(!showCsvUpload);
              setShowManualInput(false);
              if (fileInputRef.current) fileInputRef.current.click();
            }}
            disabled={loading}
            style={{
              background: showCsvUpload ? "rgba(0,255,136,0.25)" : "rgba(0,255,136,0.12)",
              border: "1px solid rgba(0,255,136,0.35)",
              color: "#00FF88",
              padding: "5px 14px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "all 0.2s",
            }}
          >
            📤 Upload CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            style={{ display: 'none' }}
          />
        </div>
      </header>

      {/* ── MANUAL INPUT FORM ─────────────────────────────────────────────── */}
      {showManualInput && (
        <div style={{
          background: "rgba(0,245,255,0.08)",
          border: "1px solid rgba(0,245,255,0.25)",
          borderRadius: 8,
          padding: "12px 16px",
          margin: "0 12px 12px 12px",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#00F5FF", marginBottom: 10 }}>
            ✏️ Enter Feature Values for {MODEL_CONFIG[selectedModel]?.name}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
            {MODEL_CONFIG[selectedModel]?.features?.map((feature) => (
              <div key={feature} style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>{feature}</label>
                <input
                  type="number"
                  step="0.01"
                  value={manualFeatures[feature] || ''}
                  onChange={(e) => setManualFeatures({ ...manualFeatures, [feature]: parseFloat(e.target.value) || 0 })}
                  style={{
                    background: "rgba(2,8,20,0.6)",
                    border: "1px solid rgba(0,245,255,0.3)",
                    borderRadius: 4,
                    padding: "4px 8px",
                    color: "#fff",
                    fontSize: 12,
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              onClick={runManualPrediction}
              disabled={loading}
              style={{
                background: "rgba(0,245,255,0.2)",
                border: "1px solid #00F5FF",
                color: "#00F5FF",
                padding: "6px 16px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              🚀 Predict
            </button>
            <button
              onClick={() => setShowManualInput(false)}
              style={{
                background: "rgba(255,68,102,0.15)",
                border: "1px solid rgba(255,68,102,0.4)",
                color: "#FF4466",
                padding: "6px 16px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ─ LEFT SIDEBAR ──────────────────────────────────────────────────── */}
        <aside style={{
          width: 260,
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(2,4,8,0.8)",
          backdropFilter: "blur(12px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Model list */}
          <div style={{ padding: "16px 16px 8px", flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: "#5A7090", letterSpacing: "0.14em", fontWeight: 700, marginBottom: 12 }}>
              ML MODELS
            </div>
            {Object.keys(MODEL_CONFIG).map((key) => (
              <ModelSelectorCard
                key={key}
                modelKey={key}
                isSelected={selectedModel === key}
                onClick={() => setSelectedModel(key)}
                stats={stats.perModel[key]}
              />
            ))}
          </div>

          {/* System metrics */}
          <div style={{
            padding: "16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 9, color: "#5A7090", letterSpacing: "0.14em", fontWeight: 700, marginBottom: 12 }}>
              SYSTEM RESOURCES
            </div>
            {[
              { label: "CPU", value: systemMetrics.cpu, color: "#00F5FF" },
              { label: "MEMORY", value: systemMetrics.memory, color: "#9B5CFF" },
              { label: "GPU", value: systemMetrics.gpu, color: "#FF8C42" },
            ].map((m) => (
              <div key={m.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: "#5A7090" }}>{m.label}</span>
                  <span style={{ fontSize: 10, color: m.color, fontFamily: "monospace" }}>
                    {Math.round(m.value)}%
                  </span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                  <div style={{
                    width: `${m.value}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${m.color}80, ${m.color})`,
                    borderRadius: 2,
                    transition: "width 1s ease",
                  }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 9, color: "#5A7090", marginBottom: 4 }}>INFERENCE LOAD</div>
              <LiveWaveform data={loadHistory} color={config?.color || "#00F5FF"} height={40} showGrid={false} />
            </div>
          </div>

          {/* Risk Meter */}
          <div style={{
            padding: "16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 9, color: "#5A7090", letterSpacing: "0.14em", fontWeight: 700, marginBottom: 8, alignSelf: "flex-start" }}>
              FLEET RISK
            </div>
            <RiskMeter predictions={predictions} />
          </div>
        </aside>

        {/* ─ MAIN CONTENT ──────────────────────────────────────────────────── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

          {/* Model hero banner */}
          <div style={{
            padding: "16px 24px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(2,4,8,0.6)",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}>
            <ParticleField color={config?.color || "#00F5FF"} count={20} />
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  fontSize: 40,
                  width: 64, height: 64,
                  background: `${config?.color}18`,
                  border: `1px solid ${config?.color}30`,
                  borderRadius: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {config?.icon}
                </div>
                <div>
                  <h1 style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: config?.color || "#00F5FF",
                    fontFamily: "'Orbitron', monospace",
                    letterSpacing: "0.02em",
                    marginBottom: 4,
                  }}>
                    {config?.name}
                  </h1>
                  <div style={{ fontSize: 12, color: "#8A9AB0", maxWidth: 500, marginBottom: 6 }}>
                    {config?.description}
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    {[
                      { label: "Accuracy", value: `${config?.accuracy}%`, color: config?.color },
                      { label: "Features", value: config?.features?.length, color: "#9B5CFF" },
                      { label: "Dataset", value: config?.dataset, color: "#FFD700" },
                    ].map((badge) => (
                      <div key={badge.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 10, color: "#5A7090" }}>{badge.label}:</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: badge.color, fontFamily: "monospace" }}>
                          {badge.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini gauges */}
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <CircularGauge
                  value={stats.failureRate}
                  label="FAILURE"
                  color="#FF4466"
                  size={80}
                />
                <CircularGauge
                  value={config?.accuracy || 0}
                  label="ACCURACY"
                  color={config?.color || "#00F5FF"}
                  size={80}
                />
                <CircularGauge
                  value={systemMetrics.gpu}
                  label="GPU UTIL"
                  color="#9B5CFF"
                  size={80}
                />
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            padding: "14px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}>
            <StatCard
              label="TOTAL PREDICTIONS"
              value={stats.total}
              icon="🔢"
              color="#00F5FF"
              sparkData={probHistory.slice(-10).map((v) => v / 100)}
            />
            <StatCard
              label="FAILURES DETECTED"
              value={stats.failures}
              icon="🚨"
              color="#FF4466"
              sparkData={predictions.slice(-10).map((p) => p.failure_predicted ? 1 : 0)}
              trend={stats.total > 5 ? (Math.random() - 0.5) * 20 : undefined}
            />
            <StatCard
              label="FAILURE RATE"
              value={stats.failureRate}
              unit="%"
              icon="📉"
              color="#FFD700"
              sparkData={predictions.slice(-10).map((p) => p.probability * 100)}
            />
            <StatCard
              label="AVG CONFIDENCE"
              value={stats.avgProb * 100}
              unit="%"
              icon="🎯"
              color="#9B5CFF"
              sparkData={probHistory.slice(-10)}
            />
          </div>

          {/* Prob waveform */}
          {probHistory.length > 2 && (
            <div style={{ padding: "10px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: "#5A7090", letterSpacing: "0.12em", fontWeight: 600 }}>
                  PROBABILITY TIMELINE
                </span>
                <span style={{ fontSize: 9, color: config?.color, fontFamily: "monospace" }}>
                  {probHistory.length} samples
                </span>
              </div>
              <LiveWaveform data={probHistory} color={config?.color || "#00F5FF"} height={52} showGrid />
            </div>
          )}

          {/* Tabs */}
          <div style={{
            display: "flex",
            gap: 0,
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "0 24px",
            flexShrink: 0,
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${activeTab === tab.id ? config?.color || "#00F5FF" : "transparent"}`,
                  color: activeTab === tab.id ? config?.color || "#00F5FF" : "#5A7090",
                  padding: "10px 18px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s ease",
                  letterSpacing: "0.05em",
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.id === "predictions" && predictions.length > 0 && (
                  <span style={{
                    background: `${config?.color}25`,
                    color: config?.color,
                    borderRadius: 10,
                    padding: "1px 6px",
                    fontSize: 9,
                    fontFamily: "monospace",
                  }}>
                    {predictions.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>

            {/* ─ PREDICTIONS TAB ─ */}
            {activeTab === "predictions" && (
              <div>
                {predictions.length === 0 ? (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 80,
                    color: "#5A7090",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 64, marginBottom: 20, opacity: 0.4 }}>{config?.icon}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#8A9AB0" }}>
                      Ready for inference
                    </div>
                    <div style={{ fontSize: 13, marginBottom: 24, maxWidth: 300 }}>
                      Click <strong style={{ color: config?.color }}>Predict</strong> or enable{" "}
                      <strong style={{ color: "#00FF88" }}>Auto</strong> to start streaming predictions
                    </div>
                    <button
                      className="btn-press"
                      onClick={() => runPrediction(5)}
                      style={{
                        background: `${config?.color}18`,
                        border: `1px solid ${config?.color}40`,
                        color: config?.color,
                        padding: "10px 24px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Run 5 predictions to start
                    </button>
                  </div>
                ) : (
                  predictions.map((pred, idx) => (
                    <PredictionCard
                      key={`${pred.machine_id}-${pred.timestamp}-${idx}`}
                      data={pred}
                      index={idx}
                      isNew={idx < 3}
                    />
                  ))
                )}
              </div>
            )}

            {/* ─ ANALYTICS TAB ─ */}
            {activeTab === "analytics" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Risk distribution */}
                <div style={{
                  background: "rgba(6,10,20,0.7)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 20,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#C8D8E8", marginBottom: 16, letterSpacing: "0.1em" }}>
                    RISK DISTRIBUTION
                  </div>
                  {["HIGH", "MEDIUM", "LOW"].map((level) => {
                    const count = predictions.filter((p) => p.risk_level === level).length;
                    const pct = predictions.length > 0 ? (count / predictions.length) * 100 : 0;
                    const colors = { HIGH: "#FF4466", MEDIUM: "#FFD700", LOW: "#00F5FF" };
                    return (
                      <div key={level} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: colors[level] }} />
                            <span style={{ fontSize: 11, color: "#C8D8E8" }}>{level}</span>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <span style={{ fontSize: 11, color: colors[level], fontFamily: "monospace", fontWeight: 600 }}>
                              {count}
                            </span>
                            <span style={{ fontSize: 11, color: "#5A7090", fontFamily: "monospace" }}>
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>
                          <div style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: `linear-gradient(90deg, ${colors[level]}60, ${colors[level]})`,
                            borderRadius: 4,
                            transition: "width 0.6s ease",
                            boxShadow: `0 0 8px ${colors[level]}40`,
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Per-feature average heatmap */}
                <div style={{
                  background: "rgba(6,10,20,0.7)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 20,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#C8D8E8", marginBottom: 16, letterSpacing: "0.1em" }}>
                    FAILURE HEATMAP (LAST 48)
                  </div>
                  <FailureHeatmap predictions={predictions} />
                </div>

                {/* Machine breakdown */}
                <div style={{
                  background: "rgba(6,10,20,0.7)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 20,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#C8D8E8", marginBottom: 16, letterSpacing: "0.1em" }}>
                    MACHINE HEALTH MATRIX
                  </div>
                  {["MCH-001", "MCH-047", "MCH-112", "MCH-203", "MCH-388", "MCH-512"].map((id) => {
                    const machinePreds = predictions.filter((p) => p.machine_id === id);
                    const latest = machinePreds[0];
                    const failCount = machinePreds.filter((p) => p.failure_predicted).length;
                    const healthScore = machinePreds.length > 0
                      ? (1 - failCount / machinePreds.length) * 100
                      : 100;
                    const latestColor =
                      latest?.risk_level === "HIGH" ? "#FF4466" :
                      latest?.risk_level === "MEDIUM" ? "#FFD700" : "#00F5FF";
                    return (
                      <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: latestColor,
                          animation: latest?.risk_level === "HIGH" ? "pulse 1.5s infinite" : "none",
                          flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 11, color: "#C8D8E8", fontFamily: "monospace", width: 68, flexShrink: 0 }}>
                          {id}
                        </span>
                        <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3 }}>
                          <div style={{
                            width: `${healthScore}%`,
                            height: "100%",
                            background: healthScore > 70 ? "#00F5FF" : healthScore > 40 ? "#FFD700" : "#FF4466",
                            borderRadius: 3,
                            transition: "width 0.6s ease",
                          }} />
                        </div>
                        <span style={{ fontSize: 10, color: "#5A7090", fontFamily: "monospace", width: 36, textAlign: "right", flexShrink: 0 }}>
                          {healthScore.toFixed(0)}%
                        </span>
                        <span style={{ fontSize: 9, color: "#5A7090", width: 28, textAlign: "right", flexShrink: 0 }}>
                          {machinePreds.length}r
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Probability histogram */}
                <div style={{
                  background: "rgba(6,10,20,0.7)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 20,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#C8D8E8", marginBottom: 16, letterSpacing: "0.1em" }}>
                    PROBABILITY HISTOGRAM
                  </div>
                  {probHistory.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#5A7090", padding: 20, fontSize: 12 }}>
                      No data yet — run predictions first
                    </div>
                  ) : (
                    <>
                      {Array.from({ length: 10 }, (_, i) => {
                        const lo = i * 10;
                        const hi = lo + 10;
                        const count = probHistory.filter((v) => v >= lo && v < hi).length;
                        const pct = probHistory.length > 0 ? (count / probHistory.length) * 100 : 0;
                        const binColor = i < 4 ? "#00F5FF" : i < 7 ? "#FFD700" : "#FF4466";
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                            <span style={{ fontSize: 9, color: "#5A7090", fontFamily: "monospace", width: 50, flexShrink: 0 }}>
                              {lo}–{hi}%
                            </span>
                            <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: binColor,
                                opacity: 0.6,
                                borderRadius: 3,
                                transition: "width 0.5s ease",
                              }} />
                            </div>
                            <span style={{ fontSize: 9, color: binColor, fontFamily: "monospace", width: 28, textAlign: "right", flexShrink: 0 }}>
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Model accuracy comparison */}
                <div style={{
                  background: "rgba(6,10,20,0.7)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 20,
                  gridColumn: "1 / -1",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#C8D8E8", marginBottom: 16, letterSpacing: "0.1em" }}>
                    MODEL PERFORMANCE COMPARISON
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                    {Object.entries(MODEL_CONFIG).map(([key, cfg]) => (
                      <div key={key}
                        onClick={() => setSelectedModel(key)}
                        style={{
                          background: selectedModel === key ? `${cfg.color}12` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${selectedModel === key ? cfg.color + "35" : "rgba(255,255,255,0.07)"}`,
                          borderRadius: 10,
                          padding: "14px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 24, marginBottom: 8 }}>{cfg.icon}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: cfg.color, marginBottom: 6 }}>
                          {cfg.name}
                        </div>
                        <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginBottom: 6 }}>
                          <div style={{ width: `${cfg.accuracy}%`, height: "100%", background: cfg.color, borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: cfg.color, fontFamily: "monospace" }}>
                          {cfg.accuracy}%
                        </div>
                        <div style={{ fontSize: 9, color: "#5A7090", marginTop: 3 }}>accuracy</div>
                        <div style={{ fontSize: 9, color: "#5A7090", marginTop: 2 }}>
                          {((1 - cfg.baseFailureRate) * 100).toFixed(0)}% nominal base
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─ TOPOLOGY TAB ─ */}
            {activeTab === "topology" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{
                  background: "rgba(6,10,20,0.7)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 20,
                  gridColumn: "1 / -1",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#C8D8E8", marginBottom: 16, letterSpacing: "0.1em" }}>
                    NETWORK TOPOLOGY — {config?.name?.toUpperCase()}
                  </div>
                  <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <NodeTopology predictions={predictions} modelKey={selectedModel} />
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 10, color: "#5A7090", marginBottom: 12 }}>
                        MONITORED NODES STATUS
                      </div>
                      {["MCH-001", "MCH-047", "MCH-112", "MCH-203", "MCH-388", "MCH-512"].map((id) => {
                        const latest = predictions.find((p) => p.machine_id === id);
                        const statusColor = !latest ? "#5A7090" :
                          latest.risk_level === "HIGH" ? "#FF4466" :
                          latest.risk_level === "MEDIUM" ? "#FFD700" : "#00F5FF";
                        return (
                          <div key={id} style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 12px",
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: 6,
                            marginBottom: 6,
                            border: `1px solid ${statusColor}20`,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: statusColor,
                                animation: latest?.risk_level === "HIGH" ? "pulse 1.5s infinite" : "none",
                              }} />
                              <span style={{ fontSize: 12, color: "#C8D8E8", fontFamily: "monospace" }}>
                                {id}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {latest ? (
                                <>
                                  <span style={{ fontSize: 10, color: statusColor, fontFamily: "monospace" }}>
                                    {(latest.probability * 100).toFixed(1)}%
                                  </span>
                                  <span style={{
                                    fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                                    color: statusColor,
                                    background: `${statusColor}18`,
                                    border: `1px solid ${statusColor}30`,
                                    padding: "2px 8px",
                                    borderRadius: 3,
                                  }}>
                                    {latest.risk_level}
                                  </span>
                                </>
                              ) : (
                                <span style={{ fontSize: 10, color: "#5A7090" }}>NO DATA</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Feature radar (simple bar-based) */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 10, color: "#5A7090", marginBottom: 12 }}>
                        AVERAGE FEATURE VALUES (LAST 20)
                      </div>
                      {config?.features?.map((feat) => {
                        const recent = predictions.slice(0, 20);
                        const vals = recent.map((p) => p.features?.[feat] || 0).filter(Boolean);
                        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
                        const maxVal = Math.max(...vals, 1);
                        const pct = Math.min((avg / maxVal) * 100, 100);
                        const isHigh = pct > 75;
                        return (
                          <div key={feat} style={{ marginBottom: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                              <span style={{ fontSize: 10, color: "#8A9AB0" }}>
                                {feat.replace(/_/g, " ")}
                              </span>
                              <span style={{
                                fontSize: 10,
                                color: isHigh ? "#FF8C42" : config?.color,
                                fontFamily: "monospace",
                              }}>
                                {avg.toFixed(2)}
                              </span>
                            </div>
                            <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                              <div style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: isHigh ? "#FF8C42" : config?.color,
                                borderRadius: 2,
                                opacity: 0.7,
                                transition: "width 0.5s ease",
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─ LOGS TAB ─ */}
            {activeTab === "logs" && (
              <div style={{
                background: "rgba(2,4,8,0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: 20,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#C8D8E8", letterSpacing: "0.1em" }}>
                    ACTIVITY LOG
                  </div>
                  <button
                    onClick={() => setActivityLog([])}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,68,102,0.3)",
                      color: "#FF4466",
                      padding: "3px 10px",
                      borderRadius: 4,
                      fontSize: 10,
                      cursor: "pointer",
                    }}
                  >
                    Clear
                  </button>
                </div>
                {activityLog.length === 0 ? (
                  <div style={{ color: "#5A7090", fontSize: 12, padding: "20px 0" }}>
                    No activity yet...
                  </div>
                ) : (
                  <ActivityLog events={activityLog} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}