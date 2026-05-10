import { useState } from "react";
import NeuralNetworkDashboard from "./NeuralNetworkDashboard";
import ROIFinanceDashboard from "./ROIFinanceDashboard";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;width:100%;overflow:hidden}
body{background:#03050A;color:#C8D8E8;font-family:'DM Sans',sans-serif}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:rgba(155,92,255,.3);border-radius:2px}
::-webkit-scrollbar-track{background:transparent}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideInLeft{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideInRight{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes ripple{0%{transform:scale(.8);opacity:1}100%{transform:scale(2.2);opacity:0}}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes floatUp{0%{opacity:0;transform:translateY(6px)}50%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-6px)}}
@keyframes waveMove{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
`;

export default function App() {
  const [view, setView] = useState("neural");

  return (
    <>
      <style>{G}</style>
      <div style={{ width: "100vw", height: "100vh", background: "#03050A", position: "relative", overflow: "hidden" }}>
        {/* CRT scanlines overlay */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
          background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.04) 3px,rgba(0,0,0,.04) 4px)",
        }} />
        {/* View tabs */}
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 48, zIndex: 1000,
          background: "rgba(3,5,10,.97)", borderBottom: "1px solid rgba(155,92,255,.12)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 0,
        }}>
          {[["neural","◈ NEURAL MAP"], ["roi","⬖ ROI ANALYTICS"]].map(([k, label]) => (
            <button key={k} onClick={() => setView(k)} style={{
              padding: "0 32px", height: 48, border: "none", background: "transparent",
              fontFamily: "'Syne'", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
              color: view === k ? "#9B5CFF" : "#5A7090", cursor: "pointer",
              borderBottom: view === k ? "2px solid #9B5CFF" : "2px solid transparent",
              transition: "all .2s",
            }}>{label}</button>
          ))}
        </div>
        <div style={{ paddingTop: 48, height: "100vh" }}>
          {view === "neural" ? <NeuralNetworkDashboard /> : <ROIFinanceDashboard />}
        </div>
      </div>
    </>
  );
}
