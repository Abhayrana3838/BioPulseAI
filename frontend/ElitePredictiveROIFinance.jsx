import { useState, useEffect, useRef, useCallback } from "react";
import CompanyDataROI from "./CompanyDataROI.jsx";

/* ═══════════════════════════════════════════════════════════
   REAL OPENAI API INTEGRATION
   Sends actual model data + metrics to OpenAI for analysis
═══════════════════════════════════════════════════════════ */
async function analyzeWithOpenAI(prompt, modelData, apiKey) {
  if (!apiKey || !apiKey.startsWith("sk-")) {
    throw new Error("Please enter a valid OpenAI API key (starts with sk-)");
  }
  const systemPrompt = `You are an expert ML deployment and business ROI analyst for BIOPULSE ELITE, an industrial predictive maintenance platform. 
You analyze real ML model performance data, bioethanol production metrics, and fleet logistics to provide actionable business intelligence.
Always respond with specific numbers, percentage improvements, and concrete recommendations.
Format your response with clear sections: ANALYSIS, KEY FINDINGS (3-5 bullet points), RECOMMENDATIONS, and ROI IMPACT.
Keep responses concise but data-driven. Use the actual model metrics provided.`;

  const userMessage = `${prompt}

CURRENT REAL MODEL DATA:
${JSON.stringify(modelData, null, 2)}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }
  const data = await response.json();
  return data.content?.map(c => c.text || "").join("") || "No response";
}

/* ═══════════════════════════════════════════════════════════
   PLASMA WAVE CANVAS
═══════════════════════════════════════════════════════════ */
function PlasmaWave() {
  const ref = useRef(null);
  const frame = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      [
        { amp: 5, freq: 0.014, speed: 0.05, color: "#FF8C42", phase: 0 },
        { amp: 4, freq: 0.018, speed: 0.07, color: "#00F5FF", phase: Math.PI },
        { amp: 3, freq: 0.011, speed: 0.04, color: "#9B5CFF", phase: Math.PI / 2 },
      ].forEach(w => {
        ctx.beginPath();
        for (let x = 0; x <= W; x++) {
          const y = H / 2 + Math.sin(x * w.freq + t * w.speed + w.phase) * w.amp
            + Math.cos(x * w.freq * 0.7 + t * w.speed * 1.2) * (w.amp * 0.4);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = w.color + "77"; ctx.lineWidth = 1.2; ctx.stroke();
      });
      t += 0.5;
      frame.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame.current);
  }, []);
  return <canvas ref={ref} width={380} height={26} style={{ width: 380, height: 26 }} />;
}

/* ═══════════════════════════════════════════════════════════
   MAIN FINANCE CHART with multiple chart types
═══════════════════════════════════════════════════════════ */
function AdvancedFinanceChart({ type, timeRange, metric }) {
  const ref = useRef(null);
  const frame = useRef(null);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    // Generate realistic bioethanol data
    const POINTS = timeRange === "1W" ? 7 : timeRange === "1M" ? 30 : timeRange === "3M" ? 90 : 365;
    const data = [];
    let price = metric === "ROI" ? 28 : metric === "REVENUE" ? 2.1 : metric === "COST" ? 0.85 : 127;
    for (let i = 0; i < POINTS; i++) {
      const trend = i / POINTS * (metric === "COST" ? -0.1 : 0.25);
      const open = price;
      const change = (Math.random() - 0.46) * (price * 0.04);
      const close = price + change + trend * 0.1;
      const high = Math.max(open, close) + Math.random() * price * 0.015;
      const low = Math.min(open, close) - Math.random() * price * 0.01;
      data.push({ open, close, high, low, vol: Math.random() * 1000 + 200 });
      price = close;
    }

    const minP = Math.min(...data.map(d => d.low)) - price * 0.02;
    const maxP = Math.max(...data.map(d => d.high)) + price * 0.02;
    const scaleY = v => H - 50 - ((v - minP) / (maxP - minP)) * (H - 70);
    const sx = i => 12 + (i / (data.length - 1)) * (W - 50);

    let progress = 0;
    const draw = () => {
      progress = Math.min(1, progress + 0.02);
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "rgba(3,5,10,1)"; ctx.fillRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "rgba(25,10,5,.2)"); bg.addColorStop(1, "rgba(3,5,10,0)");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // Grid + labels
      const gridLines = 5;
      for (let i = 0; i <= gridLines; i++) {
        const y = 20 + (i / gridLines) * (H - 70);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W - 40, y);
        ctx.strokeStyle = "rgba(255,140,66,.05)"; ctx.lineWidth = 1; ctx.stroke();
        const val = maxP - (i / gridLines) * (maxP - minP);
        ctx.fillStyle = "rgba(90,112,144,.5)";
        ctx.font = "400 8px 'JetBrains Mono'"; ctx.textAlign = "right";
        ctx.fillText(
          metric === "ROI" ? val.toFixed(1) + "%" :
            metric === "REVENUE" ? "$" + val.toFixed(2) + "M" :
              metric === "COST" ? "$" + val.toFixed(2) + "M" :
                val.toFixed(0) + " L/T",
          W - 2, y + 3
        );
      }

      const visCount = Math.floor(data.length * progress);

      if (type === "candle" && visCount > 0) {
        // Volume bars
        const maxVol = Math.max(...data.map(d => d.vol));
        data.slice(0, visCount).forEach((d, i) => {
          const x = sx(i);
          const cw = Math.max(1.5, (W - 50) / data.length * 0.6);
          const bull = d.close >= d.open;
          ctx.fillStyle = (bull ? "#00F5FF" : "#FF4466") + "22";
          const vh = (d.vol / maxVol) * 30;
          ctx.fillRect(x - cw / 2, H - 20 - vh, cw, vh);
        });

        // Candles
        data.slice(0, visCount).forEach((d, i) => {
          const x = sx(i);
          const cw = Math.max(1.5, (W - 50) / data.length * 0.55);
          const bull = d.close >= d.open;
          const col = bull ? "#00F5FF" : "#FF4466";
          ctx.beginPath(); ctx.moveTo(x, scaleY(d.high)); ctx.lineTo(x, scaleY(d.low));
          ctx.strokeStyle = col + "66"; ctx.lineWidth = 1; ctx.stroke();
          const top = scaleY(Math.max(d.open, d.close));
          const bh = Math.max(1, Math.abs(scaleY(d.open) - scaleY(d.close)));
          ctx.fillStyle = bull ? col + "66" : col + "55";
          ctx.fillRect(x - cw / 2, top, cw, bh);
          ctx.strokeStyle = col; ctx.lineWidth = 0.7;
          ctx.strokeRect(x - cw / 2, top, cw, bh);
        });

      } else if (visCount > 1) {
        // Area chart
        ctx.beginPath();
        ctx.moveTo(sx(0), scaleY(data[0].close));
        for (let i = 1; i < visCount; i++) ctx.lineTo(sx(i), scaleY(data[i].close));
        const lastX = sx(visCount - 1);
        ctx.lineTo(lastX, H - 20); ctx.lineTo(sx(0), H - 20); ctx.closePath();
        const areaG = ctx.createLinearGradient(0, 0, 0, H);
        areaG.addColorStop(0, "rgba(255,140,66,.18)");
        areaG.addColorStop(1, "rgba(255,140,66,0)");
        ctx.fillStyle = areaG; ctx.fill();

        // Forecast line (dashed)
        const forecastStart = Math.floor(visCount * 0.75);
        ctx.beginPath();
        for (let i = forecastStart; i < visCount; i++) ctx.lineTo(sx(i), scaleY(data[i].close));
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = "#FF8C4288"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.setLineDash([]);

        // Actual line
        ctx.beginPath();
        ctx.moveTo(sx(0), scaleY(data[0].close));
        for (let i = 1; i < forecastStart; i++) ctx.lineTo(sx(i), scaleY(data[i].close));
        ctx.strokeStyle = "#FF8C42"; ctx.lineWidth = 2; ctx.stroke();

        // Risk band
        ctx.beginPath();
        ctx.moveTo(sx(forecastStart), scaleY(data[forecastStart].close * 1.04));
        for (let i = forecastStart; i < visCount; i++)
          ctx.lineTo(sx(i), scaleY(data[i].close * 1.04));
        for (let i = visCount - 1; i >= forecastStart; i--)
          ctx.lineTo(sx(i), scaleY(data[i].close * 0.96));
        ctx.closePath();
        ctx.fillStyle = "rgba(255,68,102,.06)"; ctx.fill();

        // Current dot
        const ly = scaleY(data[visCount - 1].close);
        const g = ctx.createRadialGradient(lastX, ly, 0, lastX, ly, 12);
        g.addColorStop(0, "rgba(255,140,66,.7)"); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(lastX, ly, 10, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(lastX, ly, 3, 0, Math.PI * 2); ctx.fillStyle = "#FF8C42"; ctx.fill();
        // Price label
        ctx.fillStyle = "rgba(8,12,22,.9)";
        ctx.beginPath(); ctx.roundRect(lastX + 6, ly - 10, 50, 18, 3); ctx.fill();
        ctx.strokeStyle = "rgba(255,140,66,.4)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = "#FF8C42"; ctx.font = "700 9px 'JetBrains Mono'"; ctx.textAlign = "left";
        ctx.fillText(
          metric === "ROI" ? data[visCount - 1].close.toFixed(1) + "%" :
            "$" + data[visCount - 1].close.toFixed(2) + "M",
          lastX + 10, ly + 3
        );
      }

      // MA lines
      if (visCount > 10 && type === "area") {
        const mas = [
          { period: 7, color: "#9B5CFF44" },
          { period: 20, color: "#00F5FF33" },
        ];
        mas.forEach(ma => {
          ctx.beginPath();
          for (let i = ma.period; i < visCount; i++) {
            const avg = data.slice(i - ma.period, i).reduce((s, d) => s + d.close, 0) / ma.period;
            i === ma.period ? ctx.moveTo(sx(i), scaleY(avg)) : ctx.lineTo(sx(i), scaleY(avg));
          }
          ctx.strokeStyle = ma.color; ctx.lineWidth = 1; ctx.stroke();
        });
      }

      if (progress < 1) frame.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame.current);
  }, [type, timeRange, metric]);

  return <canvas ref={ref} width={700} height={260} style={{ width: "100%", height: 260 }} />;
}

/* ═══════════════════════════════════════════════════════════
   ROI GAUGE
═══════════════════════════════════════════════════════════ */
function ROIGauge({ value, max, label, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H * 0.7, r = W * 0.38;
    let p = 0;
    const target = value / max;
    const animate = () => {
      p = Math.min(target, p + 0.018);
      ctx.clearRect(0, 0, W, H);
      // Track
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI * 1.1, Math.PI * 0.1, false);
      ctx.strokeStyle = "rgba(255,255,255,.06)"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.stroke();
      // Fill gradient
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI * 1.1, -Math.PI * 1.1 + Math.PI * 1.2 * p, false);
      const g = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
      g.addColorStop(0, color + "AA"); g.addColorStop(1, color);
      ctx.strokeStyle = g; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.stroke();
      // Tip glow
      const ea = -Math.PI * 1.1 + Math.PI * 1.2 * p;
      const nx = cx + r * Math.cos(ea), ny = cy + r * Math.sin(ea);
      const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, 10);
      ng.addColorStop(0, color + "CC"); ng.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(nx, ny, 8, 0, Math.PI * 2); ctx.fillStyle = ng; ctx.fill();
      ctx.beginPath(); ctx.arc(nx, ny, 2.5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
      // Value
      ctx.fillStyle = color; ctx.font = "800 18px 'Syne'"; ctx.textAlign = "center";
      ctx.fillText(`${(value * p / target).toFixed(1)}%`, cx, cy + 2);
      ctx.fillStyle = "rgba(90,112,144,.7)"; ctx.font = "700 7px 'Syne'";
      ctx.fillText(label.toUpperCase(), cx, cy + 14);
      if (p < target) requestAnimationFrame(animate);
    };
    animate();
  }, [value, max, label, color]);
  return <canvas ref={ref} width={140} height={90} style={{ width: 140, height: 90 }} />;
}

/* ═══════════════════════════════════════════════════════════
   MAIN ROI FINANCE DASHBOARD
═══════════════════════════════════════════════════════════ */
export default function ROIFinanceDashboard() {
  const [chartType, setChartType] = useState("area");
  const [timeRange, setTimeRange] = useState("3M");
  const [metric, setMetric] = useState("ROI");
  const [chartKey, setChartKey] = useState(0);
  const [activeView, setActiveView] = useState("dashboard"); // "dashboard" or "company-data"
  const [apiKey, setApiKey] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiInput, setShowApiInput] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState("");
  const [customQuery, setCustomQuery] = useState("");

  // Real model data from README
  const MODEL_DATA = {
    models: {
      smart_manufacturing_ann: { accuracy: 98.39, trainAccuracy: 92.97, loss: 0.1563, dataset: 100000, features: 7, type: "PyTorch ANN" },
      iot_sensor_model: { accuracy: 95.2, dataset: 1800, features: 9, type: "sklearn Pipeline" },
      tpot_automl: { accuracy: 92.1, dataset: 1800, features: 7, type: "GaussianNB via TPOT" },
      bioethanol_regression: { r2: 0.85, dataset: 100, features: 8, type: "Linear Regression" },
      bioethanol_classification: { accuracy: 90.0, dataset: 100, features: 8, type: "Gradient Boosting" },
    },
    currentMetrics: {
      projectedROI_Q4: 34.8, netBiomassValue_M: 2.4, operationalCost_M: 0.89,
      predictionConfidence: 94.7, ethanolYield: 127.4, carbonCredit: 44.80,
      feedCost: 312, energyGeneration_MWh: 8.4, downtime_reduction_pct: 23,
      maintenance_cost_savings_pct: 31,
    },
    riskMatrix: {
      marketVolatility: "HIGH", supplyChain: "MEDIUM", climateDrift: "LOW", regulatory: "MEDIUM",
    },
  };

  const PRESET_QUERIES = [
    { label: "Q4 ROI Forecast", q: "Based on our current ML model performance metrics and bioethanol production data, provide a detailed Q4 ROI forecast with specific numbers and confidence intervals." },
    { label: "Cost Optimization", q: "Analyze our operational costs and ML model efficiency to identify the top 3 cost optimization opportunities with projected savings." },
    { label: "Risk Assessment", q: "Evaluate our current risk matrix in context of ML model accuracy and production metrics. Which risks pose the highest financial threat?" },
    { label: "Model Comparison", q: "Compare all 5 ML models by business impact. Which model contributes most to ROI and which should be prioritized for improvement?" },
    { label: "Maintenance ROI", q: "Calculate the direct financial ROI of our predictive maintenance ANN model (98.39% accuracy). Include avoided downtime costs and maintenance savings." },
    { label: "Bioethanol Optimization", q: "Using the bioethanol regression and classification model data, recommend fermentation parameter adjustments to maximize yield and revenue." },
  ];

  const runAIAnalysis = useCallback(async (query) => {
    if (!apiKey) { setAiError("Please enter your OpenAI API key first."); return; }
    setAiLoading(true); setAiError(null); setAiResponse(null);
    try {
      const result = await analyzeWithOpenAI(query, MODEL_DATA, apiKey);
      setAiResponse(result);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }, [apiKey]);

  const [liveMetrics, setLiveMetrics] = useState({
    roi: 34.8, revenue: 2.4, cost: 0.89, confidence: 94.7,
    yield: 127.4, carbon: 44.80, feed: 312, energy: 8.4,
  });

  useEffect(() => {
    const id = setInterval(() => {
      setLiveMetrics(m => ({
        roi: +(m.roi + (Math.random() - 0.48) * 0.1).toFixed(2),
        revenue: +(m.revenue + (Math.random() - 0.48) * 0.01).toFixed(3),
        cost: +(Math.max(0.7, m.cost + (Math.random() - 0.52) * 0.005)).toFixed(3),
        confidence: +(Math.min(99, Math.max(90, m.confidence + (Math.random() - 0.5) * 0.08))).toFixed(1),
        yield: +(m.yield + (Math.random() - 0.48) * 0.3).toFixed(1),
        carbon: +(m.carbon + (Math.random() - 0.48) * 0.2).toFixed(2),
        feed: +(m.feed + (Math.random() - 0.52) * 1).toFixed(0),
        energy: +(m.energy + (Math.random() - 0.48) * 0.05).toFixed(2),
      }));
    }, 2200);
    return () => clearInterval(id);
  }, []);

  // Show Company Data ROI view if selected
if (activeView === "company-data") {
  return <CompanyDataROI />;
}

return (
    <div style={{
      width: "100%", height: "calc(100vh - 48px)",
      display: "grid",
      gridTemplateColumns: "64px 1fr 300px",
      background: "#03050A", overflow: "hidden",
    }}>
      {/* ── SIDENAV ── */}
      <aside style={{
        background: "rgba(8,12,22,.7)", borderRight: "1px solid rgba(255,140,66,.08)",
        display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 4,
      }}>
        {[
          { icon: "◈", label: "Core" }, { icon: "⬡", label: "Fleet" },
          { icon: "◉", label: "Neural" }, { icon: "⬖", label: "Finance", active: true },
          { icon: "◫", label: "Risk" }, { icon: "⊕", label: "Reports" },
        ].map((item, i) => (
          <button key={i} style={{
            width: 48, height: 48, borderRadius: 6, border: "none",
            background: item.active ? "rgba(255,140,66,.12)" : "transparent",
            color: item.active ? "#FF8C42" : "#5A7090",
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 2,
          }}>
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            <span style={{ fontFamily: "'Syne'", fontSize: 7, fontWeight: 700 }}>{item.label}</span>
          </button>
        ))}
        <div style={{ height: 1, width: 32, background: "rgba(255,255,255,.1)", margin: "8px 0" }} />
        <button 
          onClick={() => setActiveView(activeView === "dashboard" ? "company-data" : "dashboard")}
          style={{
            width: 40, height: 40, borderRadius: 6, background: activeView === "company-data" ? "rgba(155,92,255,.15)" : "rgba(255,255,255,.04)",
            border: activeView === "company-data" ? "1px solid rgba(155,92,255,.5)" : "1px solid rgba(255,255,255,.1)", 
            color: activeView === "company-data" ? "#9B5CFF" : "#5A7090",
            fontSize: 18, cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center",
          }}
          title="Company Data Analysis"
        >
          🏢
        </button>
      </aside>

      {/* ── CENTER ── */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{
          padding: "10px 20px 8px", borderBottom: "1px solid rgba(255,140,66,.1)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
          background: "rgba(8,12,22,.6)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.35em", color: "#FF8C42" }}>
                PREDICTIVE_ANALYTICS_LAYER
              </div>
              <h1 style={{ fontFamily: "'Syne'", fontSize: 18, fontWeight: 800, letterSpacing: "0.04em", color: "#C8D8E8" }}>
                Elite ROI Finance Dashboard
              </h1>
            </div>
            <div style={{ width: 1, height: 28, background: "rgba(255,140,66,.2)" }} />
            <PlasmaWave />
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {/* API Key button */}
            <button onClick={() => setShowApiInput(!showApiInput)} style={{
              padding: "6px 14px", borderRadius: 4, cursor: "pointer",
              fontFamily: "'Syne'", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
              background: apiKey ? "rgba(0,245,255,.1)" : "rgba(255,140,66,.1)",
              border: `1px solid ${apiKey ? "rgba(0,245,255,.4)" : "rgba(255,140,66,.4)"}`,
              color: apiKey ? "#00F5FF" : "#FF8C42",
            }}>
              {apiKey ? "✓ AI READY" : "⚙ API KEY"}
            </button>
            {/* Chart type */}
            {["area", "candle"].map(t => (
              <button key={t} onClick={() => { setChartType(t); setChartKey(k => k + 1); }} style={{
                padding: "6px 12px", borderRadius: 4, cursor: "pointer",
                fontFamily: "'Syne'", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                background: chartType === t ? "rgba(255,140,66,.15)" : "transparent",
                border: chartType === t ? "1px solid rgba(255,140,66,.5)" : "1px solid rgba(255,140,66,.15)",
                color: chartType === t ? "#FF8C42" : "#5A7090",
              }}>{t.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {/* API Key input (collapsible) */}
        {showApiInput && (
          <div style={{
            padding: "10px 20px", background: "rgba(8,12,22,.9)",
            borderBottom: "1px solid rgba(255,140,66,.1)",
            display: "flex", gap: 8, alignItems: "center",
            animation: "fadeUp .2s ease-out",
          }}>
            <span style={{ fontFamily: "'Syne'", fontSize: 9, fontWeight: 700, color: "#5A7090", whiteSpace: "nowrap" }}>
              ANTHROPIC API KEY:
            </span>
            <input
              type="password" placeholder="sk-ant-..."
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              style={{
                flex: 1, padding: "7px 12px", borderRadius: 4, background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,140,66,.3)", color: "#C8D8E8",
                fontFamily: "'JetBrains Mono'", fontSize: 12, outline: "none",
              }}
            />
            <button onClick={() => { setApiKey(apiKeyInput); setShowApiInput(false); }} style={{
              padding: "7px 16px", borderRadius: 4, cursor: "pointer",
              fontFamily: "'Syne'", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
              background: "rgba(255,140,66,.15)", border: "1px solid #FF8C42", color: "#FF8C42",
            }}>SAVE</button>
            <span style={{ fontFamily: "'DM Sans'", fontSize: 10, color: "#5A7090", maxWidth: 180 }}>
              Key used locally only, sent directly to Anthropic API
            </span>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, flexShrink: 0 }}>
            {[
              { label: "PROJECTED_ROI_Q4", value: `+${liveMetrics.roi}%`, change: "+4.2%", pos: true, color: "#FF8C42" },
              { label: "NET_BIOMASS_VALUE", value: `$${liveMetrics.revenue.toFixed(2)}M`, change: "+$180K", pos: true, color: "#00F5FF" },
              { label: "OPERATIONAL_COST", value: `$${liveMetrics.cost}M`, change: "-2.1%", pos: true, color: "#9B5CFF" },
              { label: "PRED_CONFIDENCE", value: `${liveMetrics.confidence}%`, change: "+1.3%", pos: true, color: "#FF8C42" },
            ].map((c, i) => (
              <div key={i} style={{
                background: "rgba(8,12,22,.85)", border: "1px solid rgba(255,140,66,.1)",
                borderRadius: 6, padding: "12px 14px",
                animation: `fadeUp .4s ${i * 0.05}s both ease-out`,
              }}>
                <div style={{ fontFamily: "'Syne'", fontSize: 7, fontWeight: 700, letterSpacing: "0.18em", color: "#5A7090", marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 20, fontWeight: 700, color: c.color, marginBottom: 4 }}>{c.value}</div>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: c.pos ? "#00F5FF" : "#FF4466" }}>
                  {c.pos ? "▲" : "▼"} {c.change}
                </span>
                <span style={{ fontFamily: "'Syne'", fontSize: 8, color: "#5A7090", marginLeft: 4 }}>vs LAST CYCLE</span>
              </div>
            ))}
          </div>

          {/* Metric + Time range tabs */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
            <span style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", color: "#5A7090" }}>METRIC:</span>
            {["ROI", "REVENUE", "COST", "YIELD"].map(m => (
              <button key={m} onClick={() => { setMetric(m); setChartKey(k => k + 1); }} style={{
                padding: "4px 12px", borderRadius: 4, cursor: "pointer",
                fontFamily: "'Syne'", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                background: metric === m ? "rgba(255,140,66,.15)" : "transparent",
                border: metric === m ? "1px solid rgba(255,140,66,.4)" : "1px solid rgba(255,255,255,.06)",
                color: metric === m ? "#FF8C42" : "#5A7090",
              }}>{m}</button>
            ))}
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", color: "#5A7090" }}>RANGE:</span>
            {["1W", "1M", "3M", "1Y"].map(r => (
              <button key={r} onClick={() => { setTimeRange(r); setChartKey(k => k + 1); }} style={{
                padding: "4px 10px", borderRadius: 4, cursor: "pointer",
                fontFamily: "'Syne'", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                background: timeRange === r ? "rgba(255,140,66,.15)" : "transparent",
                border: timeRange === r ? "1px solid rgba(255,140,66,.4)" : "1px solid rgba(255,255,255,.06)",
                color: timeRange === r ? "#FF8C42" : "#5A7090",
              }}>{r}</button>
            ))}
          </div>

          {/* Main Chart */}
          <div style={{
            background: "rgba(8,12,22,.85)", border: "1px solid rgba(255,140,66,.12)",
            borderRadius: 6, overflow: "hidden", position: "relative", flexShrink: 0,
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0,
              background: "#FF8C42", color: "#03050A",
              fontFamily: "'JetBrains Mono'", fontSize: 8, fontWeight: 700,
              padding: "2px 8px", letterSpacing: "0.1em", zIndex: 5,
            }}>ROI_PRED_STREAM</div>
            <div style={{ padding: "8px 12px 0 12px", paddingTop: 20, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Syne'", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#FF8C42" }}>
                BIOMASS_REVENUE_PROJECTION — {metric} / {timeRange}
              </span>
              <div style={{ display: "flex", gap: 14 }}>
                {[["ACTUAL", "#FF8C42", "—"], ["FORECAST", "#FF8C4288", "- -"], ["RISK", "#FF446655", "░"]].map(([l, c, ic]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: c, fontSize: 12 }}>{ic}</span>
                    <span style={{ fontFamily: "'Syne'", fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "#5A7090" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <AdvancedFinanceChart key={`${chartKey}-${metric}-${timeRange}`} type={chartType} timeRange={timeRange} metric={metric} />
          </div>

          {/* Bottom KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, flexShrink: 0 }}>
            {[
              { label: "ETHANOL_YIELD", value: `${liveMetrics.yield} L/T`, change: "+3.1%", col: "#00F5FF" },
              { label: "CARBON_CREDIT", value: `$${liveMetrics.carbon}/T`, change: "+1.8%", col: "#9B5CFF" },
              { label: "FEED_COST", value: `$${liveMetrics.feed}/T`, change: "-0.4%", col: "#FF8C42" },
              { label: "ENERGY_GEN", value: `${liveMetrics.energy} MWh`, change: "+12%", col: "#00F5FF" },
            ].map(({ label, value, change, col }) => (
              <div key={label} style={{
                background: "rgba(8,12,22,.85)", border: `1px solid ${col}18`,
                borderRadius: 6, padding: "10px 14px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontFamily: "'Syne'", fontSize: 7, fontWeight: 700, letterSpacing: "0.15em", color: "#5A7090", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 700, color: col }}>{value}</div>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: change.startsWith("+") ? "#00F5FF" : "#FF4466" }}>
                  {change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: AI Analytics ── */}
      <div style={{
        borderLeft: "1px solid rgba(255,140,66,.1)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        background: "rgba(8,12,22,.5)",
      }}>
        {/* ROI Gauges */}
        <div style={{ padding: 16, borderBottom: "1px solid rgba(255,140,66,.08)" }}>
          <div style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "#5A7090", marginBottom: 10 }}>
            ROI_PREDICTION_GAUGES
          </div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <ROIGauge value={liveMetrics.roi} max={50} label="Q4 ROI" color="#FF8C42" />
            <ROIGauge value={liveMetrics.confidence} max={100} label="Confidence" color="#00F5FF" />
          </div>
        </div>

        {/* Risk Matrix */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,140,66,.08)" }}>
          <div style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "#5A7090", marginBottom: 10 }}>
            RISK_MATRIX
          </div>
          {[
            { l: "Market Volatility", r: "HIGH", c: "#FF4466", v: 78 },
            { l: "Supply Chain", r: "MED", c: "#FF8C42", v: 45 },
            { l: "Climate Drift", r: "LOW", c: "#00F5FF", v: 22 },
            { l: "Regulatory", r: "MED", c: "#FF8C42", v: 38 },
            { l: "Model Drift", r: "LOW", c: "#9B5CFF", v: 18 },
          ].map(({ l, r, c, v }) => (
            <div key={l} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#5A7090" }}>{l}</span>
                <span style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: c }}>{r}</span>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,.05)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: v + "%", borderRadius: 2,
                  background: `linear-gradient(90deg, ${c}66, ${c})`,
                  boxShadow: `0 0 6px ${c}55`, transition: "width 1s ease",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Model Performance Summary */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,140,66,.08)" }}>
          <div style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "#5A7090", marginBottom: 10 }}>
            MODEL_ACCURACY_LIVE
          </div>
          {[
            { name: "ANN (Manufacturing)", acc: 98.39, c: "#00F5FF" },
            { name: "IoT Sensor Model", acc: 95.2, c: "#9B5CFF" },
            { name: "TPOT AutoML", acc: 92.1, c: "#FF8C42" },
            { name: "Bioethanol Clf.", acc: 90.0, c: "#9B5CFF" },
          ].map(({ name, acc, c }) => (
            <div key={name} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontFamily: "'DM Sans'", fontSize: 10, color: "#5A7090" }}>{name}</span>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: c, fontWeight: 700 }}>{acc}%</span>
              </div>
              <div style={{ height: 2, background: "rgba(255,255,255,.05)", borderRadius: 1, overflow: "hidden" }}>
                <div style={{ height: "100%", width: acc + "%", background: c, borderRadius: 1 }} />
              </div>
            </div>
          ))}
        </div>

        {/* AI ANALYSIS SECTION */}
        <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>
          <div style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "#5A7090" }}>
            AI_ROI_ANALYSIS (CLAUDE)
          </div>

          {/* Preset queries */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {PRESET_QUERIES.slice(0, 4).map(q => (
              <button key={q.label} onClick={() => { setSelectedQuery(q.q); runAIAnalysis(q.q); }} style={{
                padding: "4px 9px", borderRadius: 3, cursor: "pointer",
                fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.1em",
                background: "rgba(255,140,66,.08)", border: "1px solid rgba(255,140,66,.2)",
                color: "#FF8C42", transition: "all .15s",
              }}>{q.label}</button>
            ))}
          </div>

          {/* Custom query */}
          <div style={{ display: "flex", gap: 6 }}>
            <input
              placeholder="Ask AI about your ROI data..."
              value={customQuery}
              onChange={e => setCustomQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && customQuery && runAIAnalysis(customQuery)}
              style={{
                flex: 1, padding: "7px 10px", borderRadius: 4,
                background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,140,66,.2)",
                color: "#C8D8E8", fontFamily: "'DM Sans'", fontSize: 12, outline: "none",
              }}
            />
            <button
              onClick={() => customQuery && runAIAnalysis(customQuery)}
              disabled={aiLoading || !apiKey}
              style={{
                padding: "7px 12px", borderRadius: 4, cursor: apiKey ? "pointer" : "not-allowed",
                background: "rgba(255,140,66,.15)", border: "1px solid rgba(255,140,66,.4)",
                color: "#FF8C42", fontFamily: "'Syne'", fontSize: 9, fontWeight: 700,
                opacity: !apiKey ? 0.5 : 1,
              }}>▶</button>
          </div>

          {/* AI Response area */}
          <div style={{
            flex: 1, overflowY: "auto",
            background: "rgba(3,5,10,.6)", borderRadius: 4,
            border: "1px solid rgba(255,140,66,.1)", padding: 12,
          }}>
            {aiLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", paddingTop: 20 }}>
                <div style={{
                  width: 28, height: 28, border: "2px solid rgba(255,140,66,.3)",
                  borderTopColor: "#FF8C42", borderRadius: "50%",
                  animation: "spin .8s linear infinite",
                }} />
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#5A7090" }}>
                  CLAUDE analyzing model data...
                </span>
              </div>
            )}
            {aiError && (
              <div style={{
                padding: 10, background: "rgba(255,68,102,.08)", borderRadius: 4,
                border: "1px solid rgba(255,68,102,.3)",
              }}>
                <div style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, color: "#FF4466", marginBottom: 4 }}>
                  ERROR
                </div>
                <div style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#FF4466" }}>{aiError}</div>
                {!apiKey && (
                  <button onClick={() => setShowApiInput(true)} style={{
                    marginTop: 8, padding: "5px 10px", borderRadius: 3, cursor: "pointer",
                    background: "rgba(255,140,66,.1)", border: "1px solid rgba(255,140,66,.3)",
                    color: "#FF8C42", fontFamily: "'Syne'", fontSize: 8, fontWeight: 700,
                  }}>Enter API Key</button>
                )}
              </div>
            )}
            {aiResponse && !aiLoading && (
              <div style={{ animation: "fadeUp .3s ease-out" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
                  paddingBottom: 8, borderBottom: "1px solid rgba(255,140,66,.1)",
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    background: "linear-gradient(135deg, #FF8C42, #9B5CFF)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: "#fff", fontWeight: 700,
                  }}>C</div>
                  <span style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, color: "#FF8C42", letterSpacing: "0.15em" }}>
                    CLAUDE ANALYSIS
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, color: "#5A7090" }}>
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div style={{
                  fontFamily: "'DM Sans'", fontSize: 11, color: "#C8D8E8",
                  lineHeight: 1.7, whiteSpace: "pre-wrap",
                }}>
                  {aiResponse}
                </div>
              </div>
            )}
            {!aiLoading && !aiError && !aiResponse && (
              <div style={{ textAlign: "center", paddingTop: 20 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>◈</div>
                <div style={{ fontFamily: "'Syne'", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: "#5A7090", marginBottom: 4 }}>
                  CLAUDE AI READY
                </div>
                <div style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#5A7090", lineHeight: 1.6 }}>
                  {apiKey ? "Select a preset query or type your own to analyze your real model data with AI" : "Enter your Anthropic API key above to enable AI analysis"}
                </div>
              </div>
            )}
          </div>

          {/* Generate Report CTA */}
          <button
            onClick={() => runAIAnalysis("Generate a comprehensive executive ROI report covering all 5 ML models, production metrics, risk assessment, and strategic recommendations with specific dollar figures.")}
            disabled={aiLoading || !apiKey}
            style={{
              padding: "11px", borderRadius: 4, cursor: apiKey ? "pointer" : "not-allowed",
              background: "rgba(255,140,66,.12)", border: "1px solid #FF8C42",
              color: "#FF8C42", fontFamily: "'Syne'", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.18em", transition: "all .2s",
              opacity: !apiKey ? 0.5 : 1,
              boxShadow: apiKey ? "0 0 15px rgba(255,140,66,.12)" : "none",
            }}
            onMouseEnter={e => { if (apiKey) { e.currentTarget.style.background = "#FF8C42"; e.currentTarget.style.color = "#03050A"; } }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,140,66,.12)"; e.currentTarget.style.color = "#FF8C42"; }}
          >
            ◈ GENERATE EXECUTIVE REPORT
          </button>
        </div>
      </div>
    </div>
  );
}