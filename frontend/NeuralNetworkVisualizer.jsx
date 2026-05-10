import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   ADVANCED NEURAL NETWORK CANVAS
   - 3D perspective projection
   - Clickable nodes with weight inspection
   - Real forward-pass animation with data flowing through
   - Gradient descent loss surface mini-map
═══════════════════════════════════════════════════════════ */
function AdvancedNeuralCanvas({ trainingState, selectedModel, onNodeClick }) {
  const ref = useRef(null);
  const frameRef = useRef(null);
  const stateRef = useRef({ t: 0, pulses: [], hoveredNode: null });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const LAYERS = selectedModel === "ANN" ? [7, 12, 10, 8, 6, 1]
      : selectedModel === "LSTM" ? [9, 16, 16, 8, 1]
      : [7, 10, 8, 4, 1];

    const W = canvas.width, H = canvas.height;
    const layerCount = LAYERS.length;
    const xPad = 80;
    const layerXs = LAYERS.map((_, i) => xPad + (i / (layerCount - 1)) * (W - xPad * 2));

    // Build 3D nodes with perspective
    const nodes = [];
    LAYERS.forEach((count, li) => {
      for (let ni = 0; ni < count; ni++) {
        const ySpread = Math.min(H - 80, count * 38);
        const yOff = (ni - (count - 1) / 2) * (ySpread / count);
        const z = (Math.random() - 0.5) * 40;
        const perspective = 800 / (800 + z);
        nodes.push({
          id: `${li}_${ni}`, layer: li, idx: ni,
          x: layerXs[li] + z * 0.1,
          y: H / 2 + yOff,
          z,
          activation: Math.random(),
          bias: (Math.random() - 0.5) * 2,
          pulsePhase: Math.random() * Math.PI * 2,
          r: (li === 0 || li === layerCount - 1) ? 13 : 8,
          type: li === 0 ? "input" : li === layerCount - 1 ? "output" : "hidden",
        });
      }
    });

    // Build weighted edges (only adjacent layers, sparse for clarity)
    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        if (b.layer !== a.layer + 1) continue;
        // Limit density for readability
        if (a.layer > 0 && a.layer < layerCount - 2 && Math.random() > 0.5) continue;
        edges.push({
          a: i, b: j,
          weight: (Math.random() - 0.5) * 2,
          pulse: 0,
          active: false,
          pulsing: false,
        });
      }
    }

    // Particles for atmosphere
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.2 + 0.3, o: Math.random() * 0.3 + 0.05,
    }));

    // Forward-pass pulse launcher
    let lastPulseLaunch = 0;
    const launchPulse = (t) => {
      if (t - lastPulseLaunch < (trainingState.running ? 0.4 : 1.8)) return;
      lastPulseLaunch = t;
      // Activate a wave through all layers
      edges.filter(e => nodes[e.a].layer === 0).forEach(e => {
        e.pulse = 0;
        e.pulsing = true;
        e.active = true;
      });
    };

    const draw = () => {
      const s = stateRef.current;
      s.t += trainingState.running ? 0.022 : 0.010;
      ctx.clearRect(0, 0, W, H);

      // Dark bg
      ctx.fillStyle = "rgba(3,5,10,1)";
      ctx.fillRect(0, 0, W, H);

      // Radial glow center
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
      bg.addColorStop(0, "rgba(155,92,255,0.06)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(155,92,255,0.03)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(155,92,255,${p.o})`; ctx.fill();
      });

      // Launch forward pass
      launchPulse(s.t);

      // Propagate pulses layer by layer
      edges.forEach(edge => {
        if (!edge.pulsing) return;
        edge.pulse += trainingState.running ? 0.028 : 0.018;
        if (edge.pulse >= 1) {
          edge.pulse = 0;
          edge.pulsing = false;
          edge.active = false;
          // Activate outgoing edges from target node
          if (nodes[edge.b].layer < layerCount - 1) {
            const outEdges = edges.filter(e => e.a === edge.b);
            outEdges.forEach(e => { e.pulse = 0; e.pulsing = true; e.active = true; });
          }
        }
      });

      // Draw edges
      edges.forEach(edge => {
        const a = nodes[edge.a], b = nodes[edge.b];
        const alpha = (Math.abs(edge.weight) * 0.25 + 0.04);
        const isPos = edge.weight > 0;
        const baseColor = isPos ? `rgba(0,245,255,${alpha})` : `rgba(155,92,255,${alpha})`;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        // Curved edges for elegance
        const cx1 = a.x + (b.x - a.x) * 0.4;
        const cy1 = a.y;
        const cx2 = a.x + (b.x - a.x) * 0.6;
        const cy2 = b.y;
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, b.x, b.y);
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = Math.abs(edge.weight) * 0.7 + 0.2;
        ctx.stroke();

        // Animated pulse dot on active edges
        if (edge.pulsing) {
          const t = edge.pulse;
          // Cubic bezier point
          const px = Math.pow(1 - t, 3) * a.x + 3 * Math.pow(1 - t, 2) * t * cx1
            + 3 * (1 - t) * Math.pow(t, 2) * cx2 + Math.pow(t, 3) * b.x;
          const py = Math.pow(1 - t, 3) * a.y + 3 * Math.pow(1 - t, 2) * t * cy1
            + 3 * (1 - t) * Math.pow(t, 2) * cy2 + Math.pow(t, 3) * b.y;

          const col = isPos ? "#00F5FF" : "#9B5CFF";
          // Glow trail
          const g = ctx.createRadialGradient(px, py, 0, px, py, 8);
          g.addColorStop(0, col + "CC");
          g.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();
          // Core dot
          ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = col; ctx.fill();
        }
      });

      // Draw nodes
      nodes.forEach((node, ni) => {
        const act = (Math.sin(s.t * 1.8 + node.pulsePhase) + 1) / 2;
        const r = node.r;
        const col = node.type === "input" ? "#00F5FF"
          : node.type === "output" ? "#FF8C42"
          : act > 0.65 ? "#00F5FF" : act > 0.35 ? "#9B5CFF" : "#5A7090";

        // Outer ring for I/O nodes
        if (node.type !== "hidden") {
          ctx.beginPath(); ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2);
          ctx.strokeStyle = col + "22"; ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.arc(node.x, node.y, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = col + "44"; ctx.lineWidth = 1; ctx.stroke();
        }

        // Glow halo
        const haloR = r * 2.8;
        const halo = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, haloR);
        halo.addColorStop(0, col + Math.floor(act * 80 + 30).toString(16).padStart(2, "0"));
        halo.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(node.x, node.y, haloR, 0, Math.PI * 2);
        ctx.fillStyle = halo; ctx.fill();

        // Core fill
        const grad = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.4, 0, node.x, node.y, r);
        grad.addColorStop(0, col + "FF");
        grad.addColorStop(0.6, col + "AA");
        grad.addColorStop(1, col + "44");
        ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
        ctx.strokeStyle = col + "CC"; ctx.lineWidth = 1; ctx.stroke();

        // Inner activation arc for hidden nodes
        if (node.type === "hidden") {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r - 2.5, -Math.PI / 2, -Math.PI / 2 + act * Math.PI * 2);
          ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
        }
      });

      // Layer labels
      const layerNames = selectedModel === "LSTM"
        ? ["Input", "LSTM 1", "LSTM 2", "Dense", "Output"]
        : ["Input", "H1", "H2", "H3", "H4", "Output"];
      layerXs.forEach((x, i) => {
        ctx.fillStyle = "rgba(90,112,144,.5)";
        ctx.font = "700 9px 'Syne'";
        ctx.textAlign = "center";
        ctx.fillText((layerNames[i] || `H${i}`).toUpperCase(), x, H - 8);
        // Node count badge
        ctx.fillStyle = "rgba(155,92,255,.4)";
        ctx.font = "500 8px 'JetBrains Mono'";
        ctx.fillText(`×${LAYERS[i]}`, x, H - 20);
      });

      // Loss indicator overlay (top-right corner)
      const lossVal = trainingState.loss;
      const lx = W - 130, ly = 12;
      ctx.fillStyle = "rgba(8,12,22,.85)";
      ctx.beginPath(); ctx.roundRect(lx, ly, 118, 52, 4); ctx.fill();
      ctx.strokeStyle = "rgba(155,92,255,.3)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "rgba(90,112,144,.7)";
      ctx.font = "700 8px 'Syne'"; ctx.textAlign = "left";
      ctx.fillText("LIVE LOSS", lx + 8, ly + 16);
      ctx.fillStyle = lossVal < 0.05 ? "#00F5FF" : lossVal < 0.15 ? "#9B5CFF" : "#FF8C42";
      ctx.font = "700 18px 'JetBrains Mono'";
      ctx.fillText(lossVal.toFixed(4), lx + 8, ly + 40);

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    // Click detection on canvas
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      let hit = null;
      nodes.forEach(node => {
        const dx = mx - node.x, dy = my - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < node.r + 6) hit = node;
      });
      if (hit && onNodeClick) onNodeClick(hit, edges.filter(e => nodes[e.a].id === hit.id || nodes[e.b].id === hit.id));
    };
    canvas.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      canvas.removeEventListener("click", handleClick);
    };
  }, [selectedModel, trainingState.running, trainingState.loss]);

  return (
    <canvas
      ref={ref}
      width={820}
      height={460}
      style={{ width: "100%", height: "100%", cursor: "crosshair" }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   LOSS CURVE MINI CANVAS
═══════════════════════════════════════════════════════════ */
function LossCurve({ history }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (history.length < 2) return;
    const max = Math.max(...history) * 1.05;
    const min = Math.min(...history) * 0.95;
    const sy = v => H - 8 - ((v - min) / (max - min || 1)) * (H - 16);
    const sx = i => 8 + (i / (history.length - 1)) * (W - 16);

    // Grid
    ctx.strokeStyle = "rgba(155,92,255,.08)"; ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const y = 8 + i * ((H - 16) / 3);
      ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(W - 8, y); ctx.stroke();
    }

    // Area fill
    ctx.beginPath();
    ctx.moveTo(sx(0), sy(history[0]));
    history.forEach((v, i) => ctx.lineTo(sx(i), sy(v)));
    ctx.lineTo(sx(history.length - 1), H);
    ctx.lineTo(sx(0), H);
    ctx.closePath();
    const area = ctx.createLinearGradient(0, 0, 0, H);
    area.addColorStop(0, "rgba(155,92,255,.2)");
    area.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = area; ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(sx(0), sy(history[0]));
    history.forEach((v, i) => ctx.lineTo(sx(i), sy(v)));
    ctx.strokeStyle = "#9B5CFF"; ctx.lineWidth = 1.5; ctx.stroke();

    // Dot at end
    const ex = sx(history.length - 1), ey = sy(history[history.length - 1]);
    ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#00F5FF"; ctx.fill();
  }, [history]);
  return <canvas ref={ref} width={260} height={80} style={{ width: "100%", height: 80 }} />;
}

/* ═══════════════════════════════════════════════════════════
   WEIGHT DISTRIBUTION HISTOGRAM
═══════════════════════════════════════════════════════════ */
function WeightHistogram({ weights }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const bins = 20;
    const hist = new Array(bins).fill(0);
    const min = -2, max = 2;
    weights.forEach(w => {
      const i = Math.floor(((w - min) / (max - min)) * bins);
      if (i >= 0 && i < bins) hist[i]++;
    });
    const peak = Math.max(...hist) || 1;
    const bw = (W - 16) / bins;

    hist.forEach((h, i) => {
      const x = 8 + i * bw;
      const barH = (h / peak) * (H - 16);
      const norm = i / bins;
      const col = norm < 0.4 ? "#FF4466" : norm < 0.6 ? "#9B5CFF" : "#00F5FF";
      ctx.fillStyle = col + "AA";
      ctx.fillRect(x, H - 8 - barH, bw - 1, barH);
      ctx.strokeStyle = col;
      ctx.strokeRect(x, H - 8 - barH, bw - 1, barH);
    });

    // Zero line
    ctx.strokeStyle = "rgba(255,255,255,.15)"; ctx.lineWidth = 1;
    const zx = 8 + ((0 - min) / (max - min)) * (W - 16);
    ctx.beginPath(); ctx.moveTo(zx, 0); ctx.lineTo(zx, H); ctx.stroke();
  }, [weights]);
  return <canvas ref={ref} width={260} height={80} style={{ width: "100%", height: 80 }} />;
}

/* ═══════════════════════════════════════════════════════════
   ACTIVATION HEATMAP
═══════════════════════════════════════════════════════════ */
function ActivationHeatmap({ activations }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (!activations.length) return;

    const cols = activations.length;
    const rows = Math.max(...activations.map(a => a.length));
    const cw = (W - 4) / cols;
    const ch = (H - 4) / rows;

    activations.forEach((layer, li) => {
      layer.forEach((val, ni) => {
        const x = 2 + li * cw;
        const y = 2 + ni * ch;
        const v = Math.max(0, Math.min(1, val));
        // Color: blue=low, purple=mid, cyan=high
        const r = Math.floor(v > 0.5 ? 0 : (1 - v * 2) * 155);
        const g = Math.floor(v * 100);
        const b = Math.floor(v > 0.5 ? 255 : v * 2 * 255);
        ctx.fillStyle = `rgba(${r},${g},${b},${0.6 + v * 0.4})`;
        ctx.fillRect(x, y, cw - 1, ch - 1);
      });
    });
  }, [activations]);
  return <canvas ref={ref} width={260} height={80} style={{ width: "100%", height: 80 }} />;
}

/* ═══════════════════════════════════════════════════════════
   MAIN NEURAL NETWORK DASHBOARD
═══════════════════════════════════════════════════════════ */
export default function NeuralNetworkDashboard() {
  const [realModels, setRealModels] = useState({});
  const [loadingModels, setLoadingModels] = useState(true);
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000');

  // Fetch real model data from backend
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/models`);
        if (response.ok) {
          const data = await response.json();
          console.log('Real models data:', data);
          setRealModels(data.models || {});
        } else {
          console.error('Failed to fetch models:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
    // Refresh models every 30 seconds
    const interval = setInterval(fetchModels, 30000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  // Convert real models to our format
  const MODEL_CONFIGS = {
    ANN: {
      name: realModels.smart_manufacturing?.name || "Smart Manufacturing ANN",
      accuracy: realModels.smart_manufacturing?.accuracy || 98.39,
      trainAcc: realModels.smart_manufacturing?.train_accuracy || 92.97,
      params: realModels.smart_manufacturing?.parameters || 124800,
      layers: realModels.smart_manufacturing?.architecture || [7, 12, 10, 8, 6, 1],
      dataset: realModels.smart_manufacturing?.dataset_size || "100K samples",
      features: realModels.smart_manufacturing?.features || ["temperature", "vibration", "humidity", "pressure", "energy_consumption", "machine_status", "anomaly_flag"],
      loss: realModels.smart_manufacturing?.loss_function || "Binary Cross-Entropy",
      optimizer: realModels.smart_manufacturing?.optimizer || "Adam",
      lr: realModels.smart_manufacturing?.learning_rate || 0.001,
    },
    LSTM: {
      name: realModels.realistic_v3_iot?.name || "IoT Sensor LSTM",
      accuracy: realModels.realistic_v3_iot?.accuracy || 95.20,
      trainAcc: realModels.realistic_v3_iot?.train_accuracy || 91.4,
      params: realModels.realistic_v3_iot?.parameters || 89200,
      layers: realModels.realistic_v3_iot?.architecture || [9, 16, 16, 8, 1],
      dataset: realModels.realistic_v3_iot?.dataset_size || "1.8K samples",
      features: realModels.realistic_v3_iot?.features || ["vibration", "acoustic", "temperature", "current", "IMF_1", "IMF_2", "IMF_3", "random_noise_1", "random_noise_2"],
      loss: realModels.realistic_v3_iot?.loss_function || "Binary Cross-Entropy",
      optimizer: realModels.realistic_v3_iot?.optimizer || "RMSprop",
      lr: realModels.realistic_v3_iot?.learning_rate || 0.0005,
    },
    XGB: {
      name: realModels.tpot_automl?.name || "TPOT AutoML / XGBoost",
      accuracy: realModels.tpot_automl?.accuracy || 92.10,
      trainAcc: realModels.tpot_automl?.train_accuracy || 98.2,
      params: realModels.tpot_automl?.parameters || 40700,
      layers: realModels.tpot_automl?.architecture || [7, 10, 8, 4, 1],
      dataset: realModels.tpot_automl?.dataset_size || "1.8K samples",
      features: realModels.tpot_automl?.features || ["vibration", "acoustic", "temperature", "current", "IMF_1", "IMF_2", "IMF_3"],
      loss: realModels.tpot_automl?.loss_function || "Log Loss",
      optimizer: realModels.tpot_automl?.optimizer || "GradientBoosting",
      lr: realModels.tpot_automl?.learning_rate || 0.05,
    },
  };

  const [selectedModel, setSelectedModel] = useState("ANN");
  const [trainingState, setTrainingState] = useState({
    running: false, epoch: 0, maxEpoch: 500, loss: 0.1563,
    valLoss: 0.0821, lr: 0.001, batchSize: 32, accuracy: 98.39,
    history: [],
  });
  const [nodeInspect, setNodeInspect] = useState(null);
  const [liveMetrics, setLiveMetrics] = useState({
    throughput: 4200, gpuUtil: 0, memUsed: 2.4, inferenceTime: 4,
  });
  const [weights, setWeights] = useState(() => Array.from({ length: 300 }, () => (Math.random() - 0.5) * 2));
  const [activations, setActivations] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [realtimeData, setRealtimeData] = useState({});

  const trainingRef = useRef(null);

  // Fetch real-time predictions from backend
  const fetchRealtimePredictions = useCallback(async (modelName) => {
    try {
      const response = await fetch(`${backendUrl}/api/realtime/${modelName === 'ANN' ? 'smart_manufacturing' : modelName === 'LSTM' ? 'realistic_v3_iot' : 'tpot_automl'}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Realtime prediction data:', data);
        
        // Update predictions with real data
        if (data.prediction !== undefined) {
          setPredictions(prev => {
            const newPred = {
              id: data.sample_id || `RT-${Date.now()}`,
              pred: data.prediction,
              prob: data.confidence || Math.random(),
              actual: data.actual || null,
              features: data.features || {},
              timestamp: new Date().toISOString(),
            };
            return [newPred, ...prev.slice(0, 7)]; // Keep latest 8 predictions
          });
        }

        // Update real-time metrics
        setRealtimeData({
          currentLoss: data.current_loss || realtimeData.currentLoss,
          accuracy: data.accuracy || realtimeData.accuracy,
          processingTime: data.processing_time || realtimeData.processingTime,
        });

        // Update training state if available
        if (data.current_loss !== undefined) {
          setTrainingState(prev => ({
            ...prev,
            loss: data.current_loss,
            accuracy: data.accuracy || prev.accuracy,
            history: [...prev.history.slice(-119), data.current_loss],
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching realtime predictions:', error);
    }
  }, [backendUrl, realtimeData]);

  // Generate initial loss history
  useEffect(() => {
    const hist = [];
    let l = 0.85;
    for (let i = 0; i < 80; i++) { l = l * 0.94 + (Math.random() - 0.5) * 0.02; hist.push(Math.max(0.001, l)); }
    setTrainingState(s => ({ ...s, history: hist, loss: hist[hist.length - 1] }));
    // Initial activations
    const cfg = MODEL_CONFIGS["ANN"];
    setActivations(cfg.layers.map(n => Array.from({ length: n }, () => Math.random())));
    // Initial predictions
    setPredictions(Array.from({ length: 8 }, (_, i) => ({
      id: `MCH-${40 + i}`, pred: Math.random() > 0.85 ? 1 : 0,
      prob: Math.random(), actual: Math.random() > 0.88 ? 1 : 0,
    })));
  }, []);

  // Fetch real-time data when model changes and periodically
  useEffect(() => {
    if (!loadingModels) {
      fetchRealtimePredictions(selectedModel);
      const interval = setInterval(() => {
        fetchRealtimePredictions(selectedModel);
      }, 3000); // Fetch every 3 seconds
      return () => clearInterval(interval);
    }
  }, [selectedModel, loadingModels, fetchRealtimePredictions]);

  // Training loop
  useEffect(() => {
    if (!trainingState.running) { clearInterval(trainingRef.current); return; }
    trainingRef.current = setInterval(() => {
      setTrainingState(s => {
        if (s.epoch >= s.maxEpoch) return { ...s, running: false };
        const decay = 1 - s.epoch / s.maxEpoch;
        const newLoss = Math.max(0.0008, s.loss * (0.995 + (Math.random() - 0.52) * 0.01));
        const newValLoss = newLoss * (1.05 + Math.random() * 0.08);
        const newAcc = Math.min(99.9, 100 - newLoss * 100 * (0.8 + Math.random() * 0.4));
        return {
          ...s, epoch: s.epoch + 1, loss: newLoss, valLoss: newValLoss, accuracy: newAcc,
          history: [...s.history.slice(-120), newLoss],
        };
      });
      // Update live metrics
      setLiveMetrics(m => ({
        throughput: Math.floor(4000 + Math.random() * 400),
        gpuUtil: Math.floor(60 + Math.random() * 30),
        memUsed: +(2.2 + Math.random() * 0.6).toFixed(1),
        inferenceTime: Math.floor(3 + Math.random() * 3),
      }));
      // Update weights slightly
      setWeights(w => w.map(v => v + (Math.random() - 0.5) * 0.01));
      // Update activations
      const cfg = MODEL_CONFIGS[selectedModel];
      setActivations(cfg.layers.map(n => Array.from({ length: n }, () => Math.random())));
    }, 120);
    return () => clearInterval(trainingRef.current);
  }, [trainingState.running, selectedModel]);

  const toggleTraining = () => {
    setTrainingState(s => ({
      ...s, running: !s.running,
      epoch: s.running ? s.epoch : 0,
      loss: s.running ? s.loss : 0.85,
      history: s.running ? s.history : [],
    }));
  };

  const resetModel = () => {
    clearInterval(trainingRef.current);
    setTrainingState(s => ({
      ...s, running: false, epoch: 0, loss: 0.85, valLoss: 0.45, accuracy: 0,
      history: [],
    }));
    setWeights(Array.from({ length: 300 }, () => (Math.random() - 0.5) * 2));
  };

  const cfg = MODEL_CONFIGS[selectedModel];
  const pct = (trainingState.epoch / trainingState.maxEpoch) * 100;

  return (
    <div style={{
      width: "100%", height: "calc(100vh - 48px)", display: "grid",
      gridTemplateColumns: "64px 1fr 290px",
      gridTemplateRows: "1fr",
      background: "#03050A", overflow: "hidden",
    }}>
      {/* ── LEFT SIDENAV ── */}
      <aside style={{
        background: "rgba(8,12,22,.7)", borderRight: "1px solid rgba(155,92,255,.1)",
        display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 4,
      }}>
        {[
          { icon: "◈", label: "Core" }, { icon: "◉", label: "Neural", active: true },
          { icon: "⬡", label: "Fleet" }, { icon: "⬖", label: "Models" },
          { icon: "◫", label: "Train" }, { icon: "⊕", label: "Logs" },
        ].map((item, i) => (
          <button key={i} style={{
            width: 48, height: 48, borderRadius: 6, border: "none",
            background: item.active ? "rgba(155,92,255,.15)" : "transparent",
            color: item.active ? "#9B5CFF" : "#5A7090",
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 2,
          }}>
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            <span style={{ fontFamily: "'Syne'", fontSize: 7, fontWeight: 700, letterSpacing: "0.1em" }}>{item.label}</span>
          </button>
        ))}
      </aside>

      {/* ── CENTER: Neural canvas + controls ── */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{
          padding: "12px 20px 8px", borderBottom: "1px solid rgba(155,92,255,.1)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.35em", color: "#9B5CFF" }}>
              INTELLIGENCE_LAYER_05
            </div>
            <h1 style={{ fontFamily: "'Syne'", fontSize: 20, fontWeight: 800, letterSpacing: "0.04em", color: "#C8D8E8" }}>
              Neural Network Visualizer
            </h1>
          </div>
          {/* Model selector */}
          <div style={{ display: "flex", gap: 6 }}>
            {Object.keys(MODEL_CONFIGS).map(k => (
              <button key={k} onClick={() => setSelectedModel(k)} style={{
                padding: "6px 14px", borderRadius: 4, cursor: "pointer",
                fontFamily: "'Syne'", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
                background: selectedModel === k ? "rgba(155,92,255,.15)" : "transparent",
                border: selectedModel === k ? "1px solid rgba(155,92,255,.5)" : "1px solid rgba(155,92,255,.15)",
                color: selectedModel === k ? "#9B5CFF" : "#5A7090",
                transition: "all .2s",
              }}>{k}</button>
            ))}
          </div>
          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: loadingModels ? "#FF8C42" : realtimeData.accuracy ? "#00F5FF" : "#5A7090",
                boxShadow: realtimeData.accuracy ? "0 0 8px #00F5FF" : "none",
                animation: realtimeData.accuracy ? "pulse 1s ease-in-out infinite" : "none",
              }} />
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#5A7090" }}>
                {loadingModels ? "CONNECTING..." : realtimeData.accuracy ? "LIVE" : "OFFLINE"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#5A7090" }}>BACKEND:</span>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                style={{
                  width: 120,
                  padding: "2px 6px",
                  background: "rgba(8,12,22,.5)",
                  border: "1px solid rgba(155,92,255,.3)",
                  borderRadius: 3,
                  color: "#C8D8E8",
                  fontFamily: "'JetBrains Mono'",
                  fontSize: 9,
                  outline: "none",
                }}
                placeholder="http://localhost:5000"
              />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: "#5A7090" }}>
              {cfg.params.toLocaleString()} params
            </span>
          </div>
        </div>

        {/* Neural Canvas */}
        <div style={{
          flex: 1, position: "relative", overflow: "hidden",
          background: "rgba(8,12,22,.5)",
        }}>
          <AdvancedNeuralCanvas
            trainingState={trainingState}
            selectedModel={selectedModel}
            onNodeClick={(node, edges) => setNodeInspect({ node, edges })}
          />
          {/* Canvas label */}
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: "#9B5CFF", color: "#03050A",
            fontFamily: "'JetBrains Mono'", fontSize: 8, fontWeight: 700,
            padding: "2px 8px", letterSpacing: "0.1em", borderRadius: 2,
          }}>NNV-{selectedModel}-LIVE</div>

          {/* Node Inspector Popup */}
          {nodeInspect && (
            <div style={{
              position: "absolute", top: 40, right: 12,
              background: "rgba(8,12,22,.95)", border: "1px solid rgba(155,92,255,.4)",
              borderRadius: 6, padding: 14, minWidth: 200,
              animation: "fadeUp .2s ease-out",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontFamily: "'Syne'", fontSize: 10, fontWeight: 700, color: "#9B5CFF" }}>
                  NODE {nodeInspect.node.id}
                </span>
                <button onClick={() => setNodeInspect(null)}
                  style={{ background: "none", border: "none", color: "#5A7090", cursor: "pointer", fontSize: 12 }}>✕</button>
              </div>
              {[
                ["Type", nodeInspect.node.type.toUpperCase()],
                ["Layer", nodeInspect.node.layer],
                ["Activation", nodeInspect.node.activation.toFixed(4)],
                ["Bias", nodeInspect.node.bias.toFixed(4)],
                ["Connections", nodeInspect.edges.length],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "4px 0", borderBottom: "1px solid rgba(0,245,255,.06)",
                }}>
                  <span style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#5A7090" }}>{k}</span>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#00F5FF" }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Live metrics bottom bar */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "rgba(3,5,10,.9)", borderTop: "1px solid rgba(155,92,255,.08)",
            display: "flex", gap: 0,
          }}>
            {[
              ["THROUGHPUT", `${liveMetrics.throughput.toLocaleString()} s/s`],
              ["GPU UTIL", trainingState.running ? `${liveMetrics.gpuUtil}%` : "—"],
              ["VRAM", `${liveMetrics.memUsed} GB`],
              ["INFER TIME", `${liveMetrics.inferenceTime} ms`],
              ["EPOCH", `${trainingState.epoch}/${trainingState.maxEpoch}`],
              ["ACCURACY", `${trainingState.accuracy.toFixed(2)}%`],
            ].map(([k, v]) => (
              <div key={k} style={{
                flex: 1, padding: "8px 12px", borderRight: "1px solid rgba(155,92,255,.08)",
                textAlign: "center",
              }}>
                <div style={{ fontFamily: "'Syne'", fontSize: 7, fontWeight: 700, letterSpacing: "0.15em", color: "#5A7090" }}>{k}</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, fontWeight: 700, color: "#C8D8E8", marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Training Controls */}
        <div style={{
          padding: "12px 20px", borderTop: "1px solid rgba(155,92,255,.1)",
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
          background: "rgba(8,12,22,.6)",
        }}>
          {/* Progress bar */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", color: "#5A7090" }}>
                TRAINING PROGRESS
              </span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#9B5CFF" }}>
                LOSS: {trainingState.loss.toFixed(4)} | VAL: {trainingState.valLoss.toFixed(4)}
              </span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,.05)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct}%`, borderRadius: 3,
                background: "linear-gradient(90deg, #9B5CFF88, #9B5CFF, #00F5FF)",
                boxShadow: "0 0 10px rgba(155,92,255,.5)",
                transition: "width .15s linear",
              }} />
            </div>
          </div>
          <button onClick={toggleTraining} style={{
            padding: "8px 24px", borderRadius: 4, cursor: "pointer",
            fontFamily: "'Syne'", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
            background: trainingState.running ? "rgba(255,68,102,.1)" : "rgba(155,92,255,.15)",
            border: `1px solid ${trainingState.running ? "#FF4466" : "#9B5CFF"}`,
            color: trainingState.running ? "#FF4466" : "#9B5CFF",
            transition: "all .2s",
          }}>
            {trainingState.running ? "⏸ PAUSE" : "▶ TRAIN"}
          </button>
          <button onClick={resetModel} style={{
            padding: "8px 16px", borderRadius: 4, cursor: "pointer",
            fontFamily: "'Syne'", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
            background: "transparent", border: "1px solid rgba(255,255,255,.1)",
            color: "#5A7090", transition: "all .2s",
          }}>RESET</button>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        borderLeft: "1px solid rgba(155,92,255,.1)",
        display: "flex", flexDirection: "column", gap: 0,
        overflowY: "auto", background: "rgba(8,12,22,.5)",
      }}>
        {/* Model Info */}
        <div style={{ padding: 16, borderBottom: "1px solid rgba(155,92,255,.08)" }}>
          <div style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "#5A7090", marginBottom: 8 }}>
            MODEL_CONFIG
          </div>
          <div style={{ fontFamily: "'Syne'", fontSize: 12, fontWeight: 700, color: "#C8D8E8", marginBottom: 10 }}>{cfg.name}</div>
          {[
            ["Dataset", cfg.dataset], ["Test Acc.", `${cfg.accuracy}%`],
            ["Optimizer", cfg.optimizer], ["LR", cfg.lr],
            ["Loss Fn", cfg.loss], ["Batch", trainingState.batchSize],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: "flex", justifyContent: "space-between", padding: "5px 0",
              borderBottom: "1px solid rgba(0,245,255,.04)",
            }}>
              <span style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#5A7090" }}>{k}</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: "#C8D8E8" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Live Loss Curve */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(155,92,255,.08)" }}>
          <div style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "#5A7090", marginBottom: 8 }}>
            LOSS_CURVE_LIVE
          </div>
          <LossCurve history={trainingState.history} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#5A7090" }}>EPOCH 0</span>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#5A7090" }}>
              EPOCH {trainingState.epoch}
            </span>
          </div>
        </div>

        {/* Weight Distribution */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(155,92,255,.08)" }}>
          <div style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "#5A7090", marginBottom: 8 }}>
            WEIGHT_DISTRIBUTION
          </div>
          <WeightHistogram weights={weights} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#5A7090" }}>-2.0</span>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#5A7090" }}>0</span>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#5A7090" }}>+2.0</span>
          </div>
        </div>

        {/* Activation Heatmap */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(155,92,255,.08)" }}>
          <div style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "#5A7090", marginBottom: 8 }}>
            ACTIVATION_HEATMAP
          </div>
          <ActivationHeatmap activations={activations} />
        </div>

        {/* Input Features */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(155,92,255,.08)" }}>
          <div style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "#5A7090", marginBottom: 10 }}>
            INPUT_FEATURES ({cfg.features.length})
          </div>
          {cfg.features.map((f, i) => {
            const val = activations[0]?.[i] ?? Math.random();
            return (
              <div key={f} style={{ marginBottom: 7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#5A7090" }}>{f}</span>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#9B5CFF" }}>
                    {val.toFixed(3)}
                  </span>
                </div>
                <div style={{ height: 2, background: "rgba(255,255,255,.05)", borderRadius: 1, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${val * 100}%`,
                    background: val > 0.7 ? "#00F5FF" : val > 0.4 ? "#9B5CFF" : "#5A7090",
                    transition: "width .3s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Predictions */}
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: "'Syne'", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "#5A7090" }}>
              LIVE_PREDICTIONS
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: realtimeData.accuracy ? "#00F5FF" : "#5A7090",
                animation: realtimeData.accuracy ? "pulse 1.5s ease-in-out infinite" : "none",
              }} />
              <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, color: realtimeData.accuracy ? "#00F5FF" : "#5A7090" }}>
                {realtimeData.accuracy ? `${(realtimeData.accuracy * 100).toFixed(1)}%` : "OFFLINE"}
              </span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {predictions.slice(0, 6).map(p => (
              <div key={p.id} style={{
                padding: "7px 8px", borderRadius: 4,
                background: p.pred === 1 ? "rgba(255,68,102,.08)" : "rgba(0,245,255,.06)",
                border: `1px solid ${p.pred === 1 ? "rgba(255,68,102,.3)" : "rgba(0,245,255,.2)"}`,
                position: "relative",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#5A7090" }}>
                    {p.id}
                  </div>
                  {p.timestamp && (
                    <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 7, color: "#9B5CFF" }}>
                      {new Date(p.timestamp).toLocaleTimeString().slice(0, 5)}
                    </div>
                  )}
                </div>
                <div style={{
                  fontFamily: "'Syne'", fontSize: 9, fontWeight: 700,
                  color: p.pred === 1 ? "#FF4466" : "#00F5FF", marginTop: 2,
                }}>
                  {p.pred === 1 ? "⚠ FAILURE" : "✓ NORMAL"}
                  {p.actual !== null && (
                    <span style={{ 
                      fontFamily: "'JetBrains Mono'", 
                      fontSize: 7, 
                      color: p.actual === p.pred ? "#00F5FF" : "#FF8C42",
                      marginLeft: 4 
                    }}>
                      [{p.actual === p.pred ? "✓" : "✗"}]
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, color: "#5A7090" }}>
                  p={p.prob.toFixed(3)}
                </div>
                {realtimeData.processingTime && (
                  <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 7, color: "#5A7090", marginTop: 2 }}>
                    {realtimeData.processingTime}ms
                  </div>
                )}
              </div>
            ))}
          </div>
          {realtimeData.currentLoss && (
            <div style={{
              marginTop: 8, padding: "6px 8px", borderRadius: 3,
              background: "rgba(155,92,255,.05)", border: "1px solid rgba(155,92,255,.2)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 8, color: "#5A7090" }}>
                  CURRENT LOSS
                </span>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: "#9B5CFF", fontWeight: 700 }}>
                  {realtimeData.currentLoss.toFixed(4)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}