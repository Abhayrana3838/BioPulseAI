import { useState, useEffect, useRef, useCallback } from "react";

/* ─── GLOBAL STYLES ──────────────────────────────────────────────────────── */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;700&family=DM+Sans:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;width:100%}
body{background:#030509;color:#C8D8E8;font-family:'DM Sans',sans-serif;overflow:hidden}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(0,245,255,.2);border-radius:2px}
::selection{background:rgba(0,245,255,.2);color:#00F5FF}

@keyframes glowPulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes neonFlicker{0%,100%{opacity:1}92%{opacity:1}93%{opacity:.3}94%{opacity:1}96%{opacity:.5}97%{opacity:1}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideInLeft{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulseRing{0%,100%{box-shadow:0 0 0 0 rgba(0,245,255,.5)}50%{box-shadow:0 0 0 10px rgba(0,245,255,0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes alertFlash{0%,100%{background:rgba(255,68,68,.05)}50%{background:rgba(255,68,68,.12)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
`;

/* ─── INITIAL TRUCK DATA ─────────────────────────────────────────────────── */
const INITIAL_TRUCKS = [
  { id:"BP-902", status:"EN_ROUTE", moisture:12.4, eta:"08:14", load:78, lat:30.920, lng:75.870, speed:54, fuel:72, temp:28, driver:"Harpreet S.",  dest:"Mill A", distKm:12.4, cargo:"Sugarcane", weight:18.2 },
  { id:"BP-774", status:"EN_ROUTE", moisture:14.1, eta:"08:26", load:91, lat:30.880, lng:75.820, speed:61, fuel:58, temp:29, driver:"Gurjant K.",   dest:"Mill B", distKm:8.9,  cargo:"Biomass",   weight:22.1 },
  { id:"BP-112", status:"DELAYED",  moisture:9.8,  eta:"08:55", load:54, lat:30.930, lng:75.910, speed:12, fuel:81, temp:27, driver:"Ramandeep T.", dest:"Mill A", distKm:18.6, cargo:"Sugarcane", weight:13.1 },
  { id:"BP-449", status:"LOADING",  moisture:null, eta:"TBD",   load:12, lat:30.910, lng:75.850, speed:0,  fuel:95, temp:30, driver:"Sukhdev M.",  dest:"TBD",    distKm:0,    cargo:"Pending",   weight:0    },
  { id:"BP-337", status:"EN_ROUTE", moisture:11.2, eta:"09:10", load:83, lat:30.860, lng:75.780, speed:58, fuel:44, temp:29, driver:"Balwinder P.", dest:"Mill C", distKm:22.3, cargo:"Biomass",   weight:20.0 },
  { id:"BP-608", status:"OFFLINE",  moisture:null, eta:"---",   load:0,  lat:30.940, lng:75.830, speed:0,  fuel:18, temp:null,driver:"Amarjit R.",  dest:"---",    distKm:0,    cargo:"---",       weight:0    },
];

const CENTER = { lat: 30.9010, lng: 75.8573 };

const DARK_MAP_STYLE = [
  {elementType:"geometry",stylers:[{color:"#030509"}]},
  {elementType:"labels.text.stroke",stylers:[{color:"#030509"}]},
  {elementType:"labels.text.fill",stylers:[{color:"#5A7090"}]},
  {featureType:"road",elementType:"geometry",stylers:[{color:"#0a1520"}]},
  {featureType:"road.highway",elementType:"geometry",stylers:[{color:"#0f2030"}]},
  {featureType:"road.highway",elementType:"geometry.stroke",stylers:[{color:"#00F5FF33"}]},
  {featureType:"water",elementType:"geometry",stylers:[{color:"#05101e"}]},
  {featureType:"poi",elementType:"geometry",stylers:[{color:"#0a1020"}]},
  {featureType:"administrative",elementType:"geometry.stroke",stylers:[{color:"#00F5FF22"}]},
];

/* ─── DNA HELIX CANVAS ───────────────────────────────────────────────────── */
function DNAHelixBar() {
  const ref = useRef(null);
  const frameRef = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width, H = canvas.height;
      const nodes = 30, spacing = W / (nodes + 1);
      for (let i = 0; i <= nodes; i++) {
        const x = spacing * (i + 1);
        const y1 = H/2 + Math.sin(i*0.45+t) * (H/2-3);
        const y2 = H/2 - Math.sin(i*0.45+t) * (H/2-3);
        ctx.beginPath(); ctx.arc(x, y1, 2, 0, Math.PI*2);
        const g1 = ctx.createRadialGradient(x,y1,0,x,y1,4);
        g1.addColorStop(0,"#00F5FF"); g1.addColorStop(1,"transparent");
        ctx.fillStyle = g1; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y2, 2, 0, Math.PI*2);
        const g2 = ctx.createRadialGradient(x,y2,0,x,y2,4);
        g2.addColorStop(0,"#9B5CFF"); g2.addColorStop(1,"transparent");
        ctx.fillStyle = g2; ctx.fill();
        if (i % 3 === 0) {
          ctx.beginPath(); ctx.moveTo(x,y1); ctx.lineTo(x,y2);
          ctx.strokeStyle="rgba(0,245,255,.18)"; ctx.lineWidth=0.8; ctx.stroke();
        }
        if (i > 0) {
          const px = spacing*i;
          const py1 = H/2 + Math.sin((i-1)*0.45+t)*(H/2-3);
          const py2 = H/2 - Math.sin((i-1)*0.45+t)*(H/2-3);
          ctx.beginPath(); ctx.moveTo(px,py1); ctx.lineTo(x,y1);
          ctx.strokeStyle="rgba(0,245,255,.32)"; ctx.lineWidth=1; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px,py2); ctx.lineTo(x,y2);
          ctx.strokeStyle="rgba(155,92,255,.32)"; ctx.lineWidth=1; ctx.stroke();
        }
      }
      t += 0.03;
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, []);
  return <canvas ref={ref} width={300} height={26} style={{ width:300, height:26 }} />;
}

/* ─── RADAR / MAP CANVAS ─────────────────────────────────────────────────── */
function RadarCanvas({ trucks }) {
  const ref = useRef(null);
  const frameRef = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0;
    const routes = [
      { pts:[[100,200],[240,170],[370,230],[500,195],[640,215]], color:"#00F5FF", flow:0 },
      { pts:[[80,320],[210,280],[330,310],[460,275],[590,295]], color:"#9B5CFF", flow:0.3 },
      { pts:[[160,130],[290,150],[410,120],[530,150],[660,130]], color:"#00F5FF", flow:0.6 },
      { pts:[[120,380],[250,350],[380,370],[500,340],[620,355]], color:"#FF8C42", flow:0.15 },
    ];
    let particles = Array.from({length:80},()=>({
      x:Math.random()*700, y:Math.random()*420,
      vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25,
      r:Math.random()*1.4+.2, o:Math.random()*.5+.1,
    }));
    const resize = () => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const draw = () => {
      t += 0.012;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle="#030509"; ctx.fillRect(0,0,W,H);
      // Grid
      ctx.strokeStyle="rgba(0,245,255,.025)"; ctx.lineWidth=1;
      for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      // Hex overlay
      ctx.strokeStyle="rgba(155,92,255,.03)";
      for(let hx=0;hx<W;hx+=80){for(let hy=0;hy<H;hy+=70){
        const cx=hx+(hy%140===0?40:0),cy=hy;
        ctx.beginPath();
        for(let i=0;i<6;i++){const a=(Math.PI/3)*i; i===0?ctx.moveTo(cx+34*Math.cos(a),cy+34*Math.sin(a)):ctx.lineTo(cx+34*Math.cos(a),cy+34*Math.sin(a));}
        ctx.closePath(); ctx.stroke();
      }}
      // Particles
      particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(0,245,255,${p.o*.3})`; ctx.fill();
      });
      // Routes
      routes.forEach(route=>{
        const spts = route.pts.map(p=>[p[0]*(W/700),p[1]*(H/420)]);
        ctx.beginPath(); ctx.moveTo(spts[0][0],spts[0][1]);
        for(let i=1;i<spts.length;i++) ctx.lineTo(spts[i][0],spts[i][1]);
        ctx.strokeStyle=route.color+"28"; ctx.lineWidth=1; ctx.setLineDash([4,8]); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(spts[0][0],spts[0][1]);
        for(let i=1;i<spts.length;i++) ctx.lineTo(spts[i][0],spts[i][1]);
        ctx.strokeStyle=route.color+"15"; ctx.lineWidth=3; ctx.stroke();
        route.flow=(route.flow+0.003)%1;
        const pos=route.flow*(spts.length-1), idx=Math.floor(pos), tt=pos-idx;
        if(idx<spts.length-1){
          const mx=spts[idx][0]+(spts[idx+1][0]-spts[idx][0])*tt;
          const my=spts[idx][1]+(spts[idx+1][1]-spts[idx][1])*tt;
          ctx.beginPath(); ctx.arc(mx,my,9,0,Math.PI*2); ctx.strokeStyle=route.color+"44"; ctx.lineWidth=1; ctx.stroke();
          const grd=ctx.createRadialGradient(mx,my,0,mx,my,12);
          grd.addColorStop(0,route.color+"55"); grd.addColorStop(1,"transparent");
          ctx.beginPath(); ctx.arc(mx,my,12,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
          ctx.beginPath(); ctx.arc(mx,my,5,0,Math.PI*2); ctx.fillStyle=route.color; ctx.fill();
        }
      });
      // Radar
      const rCx=W*.5, rCy=H*.5, rR=Math.min(W,H)*.22, sw=t*1.2;
      [1,.66,.33].forEach(f=>{ctx.beginPath();ctx.arc(rCx,rCy,rR*f,0,Math.PI*2);ctx.strokeStyle="rgba(0,245,255,.045)";ctx.lineWidth=1;ctx.stroke();});
      ctx.strokeStyle="rgba(0,245,255,.03)"; ctx.lineWidth=.5;
      ctx.beginPath();ctx.moveTo(rCx-rR,rCy);ctx.lineTo(rCx+rR,rCy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(rCx,rCy-rR);ctx.lineTo(rCx,rCy+rR);ctx.stroke();
      ctx.beginPath();ctx.moveTo(rCx,rCy);ctx.lineTo(rCx+rR*Math.cos(sw),rCy+rR*Math.sin(sw));
      ctx.strokeStyle="rgba(0,245,255,.5)";ctx.lineWidth=1.5;ctx.stroke();
      ctx.beginPath();ctx.moveTo(rCx,rCy);ctx.arc(rCx,rCy,rR,sw-.7,sw);ctx.closePath();
      const swG=ctx.createRadialGradient(rCx,rCy,0,rCx,rCy,rR);
      swG.addColorStop(0,"rgba(0,245,255,.0)");swG.addColorStop(1,"rgba(0,245,255,.05)");
      ctx.fillStyle=swG;ctx.fill();
      // Truck blips
      trucks.forEach((tk,i)=>{
        if(tk.status==="OFFLINE") return;
        const angle=(i/trucks.length)*Math.PI*2+t*.1, dist=(0.3+i*.08)*rR;
        const bx=rCx+Math.cos(angle)*dist, by=rCy+Math.sin(angle)*dist;
        const col=tk.status==="DELAYED"?"#FF8C42":tk.status==="LOADING"?"#9B5CFF":"#00F5FF";
        ctx.beginPath();ctx.arc(bx,by,4,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();
        ctx.beginPath();ctx.arc(bx,by,8,0,Math.PI*2);ctx.strokeStyle=col+"44";ctx.lineWidth=1;ctx.stroke();
      });
      // Coords watermark
      ctx.fillStyle="rgba(0,245,255,.22)";ctx.font="9px 'JetBrains Mono',monospace";
      ctx.fillText(`${CENTER.lat.toFixed(4)}°N  ${CENTER.lng.toFixed(4)}°E`,8,H-8);
      ctx.fillText("LUDHIANA, PUNJAB, IN",W-175,H-8);
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return ()=>{cancelAnimationFrame(frameRef.current);window.removeEventListener("resize",resize);};
  }, [trucks]);
  return <canvas ref={ref} style={{ width:"100%", height:"100%", display:"block" }} />;
}

/* ─── STATUS BADGE ───────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = {
    EN_ROUTE:{ color:"#00F5FF", bg:"rgba(0,245,255,.07)",  dot:true  },
    DELAYED: { color:"#FF8C42", bg:"rgba(255,140,66,.07)", dot:true  },
    LOADING: { color:"#9B5CFF", bg:"rgba(155,92,255,.07)", dot:false },
    OFFLINE: { color:"#FF4466", bg:"rgba(255,68,102,.07)", dot:false },
    ARRIVED: { color:"#00FF88", bg:"rgba(0,255,136,.07)",  dot:true  },
  };
  const c = cfg[status] || cfg.LOADING;
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:4,padding:"2px 7px",
      border:`1px solid ${c.color}33`,borderRadius:2,background:c.bg,
      fontFamily:"'JetBrains Mono',monospace",fontSize:8,fontWeight:700,
      letterSpacing:"0.12em",color:c.color }}>
      {c.dot && <span style={{ width:4,height:4,borderRadius:"50%",background:c.color,
        animation:"glowPulse 1.8s ease-in-out infinite" }} />}
      {status}
    </span>
  );
}

/* ─── GLOW BUTTON ────────────────────────────────────────────────────────── */
function GlowBtn({ children, onClick, variant="primary", style={} }) {
  const [hov, setHov] = useState(false);
  const v = {
    primary:   { bg:hov?"#00F5FF":"rgba(0,245,255,.08)",   color:hov?"#030509":"#00F5FF",   border:"#00F5FF",   shadow:hov?"0 0 24px rgba(0,245,255,.4)":"none" },
    secondary: { bg:hov?"#9B5CFF":"rgba(155,92,255,.08)",  color:hov?"#fff":"#9B5CFF",      border:"rgba(155,92,255,.5)", shadow:hov?"0 0 24px rgba(155,92,255,.4)":"none" },
    danger:    { bg:hov?"#FF4444":"rgba(255,68,68,.08)",    color:hov?"#fff":"#FF4444",      border:"rgba(255,68,68,.5)",  shadow:hov?"0 0 20px rgba(255,68,68,.4)":"none" },
  }[variant];
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,
        borderRadius:4,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontSize:10,
        fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",transition:"all .2s",
        border:`1px solid ${v.border}`,background:v.bg,color:v.color,
        boxShadow:v.shadow,padding:"10px 16px",...style }}>
      {children}
    </button>
  );
}

/* ─── TOGGLE ─────────────────────────────────────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <div onClick={()=>onChange(!on)} style={{ width:36,height:20,borderRadius:10,cursor:"pointer",
      border:`1px solid ${on?"#00F5FF":"rgba(0,245,255,.3)"}`,
      background:on?"rgba(0,245,255,.25)":"rgba(0,245,255,.07)",
      position:"relative",transition:"all .2s",flexShrink:0 }}>
      <div style={{ position:"absolute",top:2,left:2,width:14,height:14,borderRadius:"50%",
        background:"#00F5FF",transition:"transform .2s",
        transform:on?"translateX(16px)":"translateX(0)" }} />
    </div>
  );
}

/* ─── MODAL ──────────────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children, footer, width=480 }) {
  if (!open) return null;
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}}
      style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",
        zIndex:500,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ background:"rgba(5,8,18,.98)",border:"1px solid rgba(0,245,255,.2)",
        borderRadius:10,width,maxHeight:"80vh",overflow:"hidden",display:"flex",
        flexDirection:"column",boxShadow:"0 0 60px rgba(0,245,255,.1)",
        animation:"fadeUp .25s ease-out" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"14px 20px",borderBottom:"1px solid rgba(0,245,255,.1)" }}>
          <span style={{ fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,
            letterSpacing:".2em",color:"#00F5FF" }}>{title}</span>
          <span onClick={onClose} style={{ color:"#5A7090",cursor:"pointer",fontSize:16,
            transition:"color .2s" }} onMouseEnter={e=>e.target.style.color="#00F5FF"}
            onMouseLeave={e=>e.target.style.color="#5A7090"}>✕</span>
        </div>
        <div style={{ padding:20,flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:14 }}>
          {children}
        </div>
        {footer && <div style={{ padding:"12px 20px",borderTop:"1px solid rgba(0,245,255,.1)",
          display:"flex",gap:10,justifyContent:"flex-end" }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ─── TRUCK DETAIL DRAWER ────────────────────────────────────────────────── */
function TruckDrawer({ truck, open, onClose, onOptimize, onAlert }) {
  if (!truck) return null;
  const fuelColor = truck.fuel<25?"#FF4444":truck.fuel<50?"#FF8C42":"#00F5FF";
  const Section = ({title,children})=>(
    <div style={{ border:"1px solid rgba(0,245,255,.08)",borderRadius:6,padding:12 }}>
      <div style={{ fontFamily:"'Syne',sans-serif",fontSize:8,fontWeight:700,letterSpacing:".2em",
        color:"#5A7090",marginBottom:10 }}>{title}</div>
      {children}
    </div>
  );
  const DField = ({k,v,color="#C8D8E8"})=>(
    <div><div style={{ fontFamily:"'Syne',sans-serif",fontSize:7,fontWeight:700,letterSpacing:".15em",color:"#5A7090",marginBottom:2 }}>{k}</div>
    <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color }}>{v}</div></div>
  );
  const SensorBox = ({val,label,color="#00F5FF"})=>(
    <div style={{ background:"rgba(0,245,255,.03)",border:"1px solid rgba(0,245,255,.07)",
      borderRadius:4,padding:"8px 4px",textAlign:"center" }}>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color }}>{val}</div>
      <div style={{ fontFamily:"'Syne',sans-serif",fontSize:7,letterSpacing:".1em",color:"#5A7090",marginTop:2 }}>{label}</div>
    </div>
  );
  return (
    <div style={{ position:"absolute",right:0,top:0,width:300,height:"100%",
      background:"rgba(3,5,9,.97)",borderLeft:"1px solid rgba(0,245,255,.15)",
      zIndex:100,display:"flex",flexDirection:"column",
      transform:open?"translateX(0)":"translateX(100%)",transition:"transform .3s ease" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"14px 16px",borderBottom:"1px solid rgba(0,245,255,.1)" }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:7,fontWeight:700,
            letterSpacing:".2em",color:"#5A7090",marginBottom:4 }}>UNIT_DETAIL</div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:700,color:"#00F5FF" }}>{truck.id}</div>
        </div>
        <span onClick={onClose} style={{ color:"#5A7090",cursor:"pointer",fontSize:16 }}>✕</span>
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10 }}>
        <Section title="VEHICLE_INFO">
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            <DField k="DRIVER"      v={truck.driver} />
            <DField k="STATUS"      v={<StatusBadge status={truck.status}/>} />
            <DField k="DESTINATION" v={truck.dest} />
            <DField k="CARGO"       v={truck.cargo} />
            <DField k="WEIGHT"      v={`${truck.weight} T`} />
            <DField k="DISTANCE"    v={`${truck.distKm} km`} />
            <DField k="ETA"         v={truck.eta} color={truck.status==="DELAYED"?"#FF8C42":"#00F5FF"} />
            <DField k="SPEED"       v={`${truck.speed} km/h`} color="#9B5CFF" />
          </div>
        </Section>
        <Section title="LIVE_SENSORS">
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6 }}>
            <SensorBox val={truck.fuel!=null?`${truck.fuel}%`:"--"} label="FUEL" color={fuelColor}/>
            <SensorBox val={truck.moisture!=null?`${truck.moisture}%`:"--.-%"} label="MOISTURE"/>
            <SensorBox val={truck.temp!=null?`${truck.temp}°C`:"--"} label="TEMP"/>
            <SensorBox val={`${truck.load}%`} label="LOAD"/>
            <SensorBox val={truck.speed} label="KM/H" color="#9B5CFF"/>
            <SensorBox val={truck.lat.toFixed(3)} label="LAT" color="#5A7090"/>
          </div>
        </Section>
        <Section title="ACTIONS">
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            <GlowBtn style={{ width:"100%",fontSize:9 }} onClick={()=>onOptimize(truck.id)}>⬡ OPTIMIZE ROUTE</GlowBtn>
            <GlowBtn style={{ width:"100%",fontSize:9 }} variant="secondary" onClick={()=>onAlert(`Calling driver ${truck.driver} (${truck.id})`)}>📞 CONTACT DRIVER</GlowBtn>
            <GlowBtn style={{ width:"100%",fontSize:9 }} variant="danger" onClick={()=>onAlert(`Manual alert raised for ${truck.id}`)}>⚠ RAISE ALERT</GlowBtn>
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ─── AI CHAT ────────────────────────────────────────────────────────────── */
function AIChat({ trucks, openaiKey, biomass }) {
  const [messages, setMessages] = useState([
    { role:"bot", text:"Fleet AI online. I can optimize routes, analyze delays & predict ETAs. Ask me anything — or add your OpenAI key for full GPT-4o intelligence!" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,typing]);

  const getLocalReply = useCallback((t)=>{
    const q = t.toLowerCase();
    const delayed = trucks.filter(x=>x.status==="DELAYED");
    const lowFuel = trucks.filter(x=>x.fuel<30);
    if(q.includes("delay")||q.includes("slow")) return `BP-112 is running at only 12 km/h — 41 min behind schedule. Driver Ramandeep T. on route to Mill A. Consider rerouting via NH-95.`;
    if(q.includes("fuel")) return lowFuel.length>0?`${lowFuel.map(x=>x.id).join(", ")} ${lowFuel.length>1?"have":"has"} fuel below 30%. BP-608 critically low at 18% — prioritize fueling.`:"All units above 30% fuel.";
    if(q.includes("optim")||q.includes("route")) return "BP-337 can save ~4.2 km via NH-44 bypass. BP-774 avoid Industrial Area congestion. BP-112 reroute via Jamalpur saves 12 min.";
    if(q.includes("worry")||q.includes("concern")) return "Top concerns: (1) BP-112 delayed 41 min. (2) BP-608 offline — last seen 07:45. (3) BP-337 fuel at 44% on 22 km route.";
    if(q.includes("moisture")) return "BP-774 highest at 14.1% — borderline quality. BP-112 lowest at 9.8% — optimal. Fleet avg 11.9%.";
    if(q.includes("eta")) return "Arrivals: BP-902 at 08:14 → BP-774 at 08:26 → BP-112 delayed 08:55 → BP-337 at 09:10.";
    return `Fleet: ${trucks.filter(x=>x.status==="EN_ROUTE").length} en route, ${delayed.length} delayed, ${biomass.toFixed(1)}T biomass inbound. Add OpenAI key (🔑) for full AI intelligence.`;
  },[trucks,biomass]);

  const send = useCallback(async ()=>{
    const text = input.trim(); if(!text) return;
    setInput("");
    setMessages(m=>[...m,{role:"user",text}]);
    setTyping(true);
    if(!openaiKey) {
      setTimeout(()=>{ setTyping(false); setMessages(m=>[...m,{role:"bot",text:getLocalReply(text)}]); },800);
      return;
    }
    try {
      const ctx = `You are Fleet AI for BIOPULSE ELITE, a biomass fleet system in Ludhiana, Punjab, India.
Fleet: ${trucks.map(t=>`${t.id}: ${t.status}, driver:${t.driver}, ETA:${t.eta}, speed:${t.speed}km/h, fuel:${t.fuel}%, load:${t.load}%, moisture:${t.moisture!=null?t.moisture+"%":"N/A"}, dest:${t.dest}`).join(" | ")}
Biomass inbound: ${biomass.toFixed(1)} tons. Be concise (2-3 sentences), specific with IDs.`;
      const res = await fetch("https://api.openai.com/v1/chat/completions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${openaiKey}`},
        body:JSON.stringify({model:"gpt-4o",max_tokens:200,messages:[{role:"system",content:ctx},{role:"user",content:text}]})
      });
      const data = await res.json();
      setTyping(false);
      setMessages(m=>[...m,{role:"bot",text:data.choices?.[0]?.message?.content||"AI error: "+JSON.stringify(data.error)}]);
    } catch(e) {
      setTyping(false);
      setMessages(m=>[...m,{role:"bot",text:"Connection error. Check your OpenAI key."}]);
    }
  },[input,openaiKey,trucks,biomass,getLocalReply]);

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <div style={{ flex:1,overflowY:"auto",padding:"8px 10px",display:"flex",flexDirection:"column",gap:7 }}>
        {messages.map((m,i)=>(
          <div key={i} style={{ display:"flex",gap:7,flexDirection:m.role==="user"?"row-reverse":"row",animation:"fadeUp .25s ease-out" }}>
            <div style={{ width:22,height:22,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:9,flexShrink:0,
              background:m.role==="bot"?"rgba(0,245,255,.08)":"rgba(155,92,255,.08)",
              border:m.role==="bot"?"1px solid rgba(0,245,255,.18)":"1px solid rgba(155,92,255,.2)",
              color:m.role==="bot"?"#00F5FF":"#9B5CFF" }}>
              {m.role==="bot"?"AI":"U"}
            </div>
            <div style={{ padding:"6px 10px",borderRadius:4,fontSize:11,lineHeight:1.5,maxWidth:"84%",
              background:m.role==="bot"?"rgba(0,245,255,.05)":"rgba(155,92,255,.1)",
              border:m.role==="bot"?"1px solid rgba(0,245,255,.1)":"1px solid rgba(155,92,255,.22)",
              color:"#C8D8E8",textAlign:m.role==="user"?"right":"left" }}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display:"flex",gap:7 }}>
            <div style={{ width:22,height:22,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:9,background:"rgba(0,245,255,.08)",border:"1px solid rgba(0,245,255,.18)",color:"#00F5FF" }}>AI</div>
            <div style={{ padding:"6px 10px",borderRadius:4,background:"rgba(0,245,255,.05)",border:"1px solid rgba(0,245,255,.1)" }}>
              {[0,1,2].map(i=><span key={i} style={{ display:"inline-block",width:4,height:4,borderRadius:"50%",background:"#00F5FF",margin:"0 2px",animation:`blink 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div style={{ display:"flex",gap:6,padding:"7px 9px",borderTop:"1px solid rgba(0,245,255,.07)" }}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Ask AI: optimize BP-112 route..."
          style={{ flex:1,background:"rgba(0,245,255,.04)",border:"1px solid rgba(0,245,255,.14)",
            borderRadius:4,color:"#C8D8E8",fontFamily:"'DM Sans',sans-serif",fontSize:11,
            padding:"5px 9px",outline:"none" }}/>
        <button onClick={send}
          style={{ background:"rgba(0,245,255,.1)",border:"1px solid rgba(0,245,255,.3)",color:"#00F5FF",
            padding:"5px 10px",borderRadius:4,cursor:"pointer",fontFamily:"'Syne',sans-serif",
            fontSize:9,fontWeight:700,letterSpacing:".14em" }}>
          SEND ▶
        </button>
      </div>
    </div>
  );
}

/* ─── SPARKLINE CANVAS ───────────────────────────────────────────────────── */
function Sparkline({ data }) {
  const ref = useRef(null);
  useEffect(()=>{
    const c=ref.current; if(!c||!data.length) return;
    const ctx=c.getContext("2d");
    c.width=c.offsetWidth*2; c.height=c.offsetHeight*2;
    ctx.scale(2,2); const W=c.offsetWidth,H=c.offsetHeight;
    ctx.clearRect(0,0,W,H);
    const mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
    ctx.beginPath();
    data.forEach((v,i)=>{
      const x=(i/(data.length-1))*W, y=H-((v-mn)/rng)*(H-4)-2;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.strokeStyle="#00F5FF";ctx.lineWidth=1.5;ctx.stroke();
    const last=data[data.length-1],lx=W,ly=H-((last-mn)/rng)*(H-4)-2;
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,"rgba(0,245,255,.2)");g.addColorStop(1,"rgba(0,245,255,0)");
    ctx.fillStyle=g;ctx.fill();
    ctx.beginPath();ctx.arc(lx,ly,3,0,Math.PI*2);ctx.fillStyle="#00F5FF";ctx.fill();
  },[data]);
  return <canvas ref={ref} style={{ width:"100%",height:38,display:"block" }}/>;
}

/* ─── TRUCK ROW ──────────────────────────────────────────────────────────── */
function TruckRow({ truck, selected, onClick, delay=0 }) {
  const [hov,setHov]=useState(false);
  const isAlert = truck.status==="DELAYED"||truck.status==="OFFLINE"||(truck.fuel&&truck.fuel<25);
  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ padding:"10px 13px",borderBottom:"1px solid rgba(0,245,255,.05)",cursor:"pointer",
        transition:"background .2s",animation:`fadeUp .35s ${delay}s both ease-out`,
        background:selected?"rgba(0,245,255,.07)":hov?"rgba(0,245,255,.04)":
          isAlert?"rgba(255,68,68,.025)":"transparent",
        borderLeft:selected?"2px solid #00F5FF":isAlert?"2px solid rgba(255,68,68,.4)":"2px solid transparent" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7 }}>
        <div style={{ display:"flex",alignItems:"center",gap:7 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:"#00F5FF" }}>{truck.id}</span>
          {truck.fuel<25&&truck.fuel!==null&&<span style={{ fontSize:8,color:"#FF4444",fontFamily:"'Syne',sans-serif",fontWeight:700 }}>⛽ LOW</span>}
        </div>
        <StatusBadge status={truck.status}/>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:7 }}>
        {[["MOISTURE",truck.moisture!=null?truck.moisture+"%":"--.-%","#C8D8E8"],
          ["ETA",truck.eta,truck.status==="DELAYED"?"#FF8C42":"#00F5FF"],
          ["SPEED",truck.speed+" km/h","#9B5CFF"]].map(([k,v,c])=>(
          <div key={k}>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:7,fontWeight:700,letterSpacing:".14em",color:"#5A7090",marginBottom:1 }}>{k}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:c }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ height:2,background:"rgba(0,245,255,.06)",borderRadius:1,overflow:"hidden" }}>
        <div style={{ height:"100%",width:`${truck.load}%`,borderRadius:1,
          background:"linear-gradient(90deg,#00F5FF,#9B5CFF)",
          boxShadow:"0 0 6px rgba(0,245,255,.3)",transition:"width .6s ease" }}/>
      </div>
    </div>
  );
}

/* ─── ALERT ITEM ─────────────────────────────────────────────────────────── */
function AlertItem({ alert, onDismiss }) {
  const cfg = { critical:{bg:"rgba(255,68,68,.06)",border:"rgba(255,68,68,.25)",icon:"🔴"}, warning:{bg:"rgba(255,140,66,.06)",border:"rgba(255,140,66,.2)",icon:"🟠"}, info:{bg:"rgba(0,245,255,.04)",border:"rgba(0,245,255,.12)",icon:"🔵"}, success:{bg:"rgba(0,255,136,.04)",border:"rgba(0,255,136,.15)",icon:"🟢"} };
  const c = cfg[alert.type]||cfg.info;
  return (
    <div style={{ display:"flex",alignItems:"flex-start",gap:7,padding:"7px 9px",borderRadius:4,
      border:`1px solid ${c.border}`,background:c.bg,animation:"fadeUp .25s ease-out",cursor:"pointer" }}>
      <span style={{ fontSize:11,flexShrink:0,marginTop:1 }}>{c.icon}</span>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#C8D8E8",lineHeight:1.4 }}>{alert.message}</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#5A7090",marginTop:2 }}>{alert.time}</div>
      </div>
      <span onClick={e=>{e.stopPropagation();onDismiss(alert.id);}} style={{ color:"#5A7090",cursor:"pointer",fontSize:10,flexShrink:0 }}>✕</span>
    </div>
  );
}

/* ─── SETTINGS ROW ───────────────────────────────────────────────────────── */
function SettingRow({ label, on, onChange, children }) {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
      padding:"9px 0",borderBottom:"1px solid rgba(0,245,255,.06)" }}>
      <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#C8D8E8" }}>{label}</span>
      {children || <Toggle on={on} onChange={onChange}/>}
    </div>
  );
}

/* ─── MAIN DASHBOARD ─────────────────────────────────────────────────────── */
export default function FleetLogisticsDashboard() {
  // Core state
  const [trucks, setTrucks] = useState(INITIAL_TRUCKS);
  const [selectedTruckId, setSelectedTruckId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [biomass, setBiomass] = useState(48.2);
  const [sparkData, setSparkData] = useState(()=>Array.from({length:20},()=>Math.random()*30+65));
  const [liveTime, setLiveTime] = useState("--:--:--");
  const [filterText, setFilterText] = useState("");

  // API keys - initialize from environment variables
  const [gmapsKey, setGmapsKey] = useState(process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "");
  const [openaiKey, setOpenaiKey] = useState(process.env.REACT_APP_OPENAI_API_KEY || "");
  const [gmapsKeyInput, setGmapsKeyInput] = useState(process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "");
  const [openaiKeyInput, setOpenaiKeyInput] = useState(process.env.REACT_APP_OPENAI_API_KEY || "");
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // Alerts
  const [alerts, setAlerts] = useState([]);

  // Modals
  const [modal, setModal] = useState(null); // "api"|"settings"|"analytics"|"route"|"alerts"

  // Settings
  const [settings, setSettings] = useState({ liveGps:true, aiRoutes:true, realtimeAlerts:true, fuelMonitor:true, traffic:false });

  // Route optimizer
  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Map refs
  const googleMapRef = useRef(null);
  const gMapInstanceRef = useRef(null);
  const trafficLayerRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const [trafficOn, setTrafficOn] = useState(false);

  const addAlert = useCallback((type, message)=>{
    const a = {type,message,time:new Date().toLocaleTimeString("en-IN",{hour12:false}),id:Date.now()+Math.random()};
    setAlerts(prev=>[a,...prev].slice(0,20));
  },[]);

  const dismissAlert = useCallback((id)=>setAlerts(prev=>prev.filter(a=>a.id!==id)),[]);

  /* ── Live clock ── */
  useEffect(()=>{
    const tick=()=>setLiveTime(new Date().toLocaleTimeString("en-IN",{hour12:false}));
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  },[]);

  /* ── Open API modal on first load ── */
  useEffect(()=>{const t=setTimeout(()=>setModal("api"),800);return()=>clearTimeout(t);},[]);

  /* ── Generate initial alerts ── */
  useEffect(()=>{
    const timers=[
      setTimeout(()=>addAlert("warning","BP-112 running 41 min behind schedule"),600),
      setTimeout(()=>addAlert("critical","BP-608 went OFFLINE — last seen 07:45"),1100),
      setTimeout(()=>addAlert("warning","BP-337 fuel at 44% — refuel at Mill C recommended"),1600),
      setTimeout(()=>addAlert("info","BP-774 moisture 14.1% — borderline quality threshold"),2100),
      setTimeout(()=>addAlert("success","BP-902 on schedule — ETA 08:14"),2600),
    ];
    return()=>timers.forEach(clearTimeout);
  },[addAlert]);

  /* ── Live simulation ── */
  useEffect(()=>{
    const id=setInterval(()=>{
      setTrucks(prev=>prev.map(t=>{
        if(t.status!=="EN_ROUTE") return t;
        const newFuel=Math.max(0,t.fuel-Math.random()*.12);
        const newSpeed=Math.max(15,Math.min(80,t.speed+(Math.random()-.5)*5));
        const newMoisture=t.moisture!=null?+Math.max(8,Math.min(18,t.moisture+(Math.random()-.5)*.18)).toFixed(1):null;
        if(newFuel<20 && Math.random()<.04) addAlert("critical",`${t.id} critically low fuel (${newFuel.toFixed(0)}%) — dispatch fuel truck`);
        return {...t,fuel:+newFuel.toFixed(1),speed:+newSpeed.toFixed(0),moisture:newMoisture,
          lat:t.lat+(Math.random()-.5)*.0008,lng:t.lng+(Math.random()-.5)*.0008};
      }));
      setBiomass(v=>+Math.max(30,Math.min(70,v+(Math.random()-.5)*.3)).toFixed(1));
      setSparkData(prev=>[...prev.slice(1),+(Math.random()*30+65).toFixed(1)]);
    },3000);
    return()=>clearInterval(id);
  },[addAlert]);

  /* ── Google Maps loader ── */
  const loadGoogleMaps = useCallback(()=>{
    if(!gmapsKey){addAlert("warning","Paste your Google Maps API key first");return;}
    if(window.google?.maps){initGMap();return;}
    const s=document.createElement("script");
    s.src=`https://maps.googleapis.com/maps/api/js?key=${gmapsKey}&libraries=places,geometry`;
    s.async=true;
    s.onload=()=>initGMap();
    s.onerror=()=>addAlert("critical","Google Maps failed — check API key");
    document.head.appendChild(s);
  },[gmapsKey]);

  const initGMap=useCallback(()=>{
    if(!googleMapRef.current||!window.google) return;
    const map=new window.google.maps.Map(googleMapRef.current,{
      center:CENTER,zoom:12,styles:DARK_MAP_STYLE,disableDefaultUI:true,zoomControl:true,
    });
    gMapInstanceRef.current=map;
    trafficLayerRef.current=new window.google.maps.TrafficLayer();
    setMapsLoaded(true);
    addAlert("success","Google Maps loaded with live traffic data");
    placeTruckMarkers(map);
    drawRoutePolylines(map);
  },[]);

  const placeTruckMarkers=useCallback((map)=>{
    if(!map||!window.google) return;
    markersRef.current.forEach(m=>m.setMap(null));
    markersRef.current=trucks.map(tk=>{
      const marker=new window.google.maps.Marker({
        position:{lat:tk.lat,lng:tk.lng},map,title:tk.id,
        icon:{path:window.google.maps.SymbolPath.CIRCLE,scale:8,
          fillColor:tk.status==="DELAYED"?"#FF8C42":tk.status==="OFFLINE"?"#FF4466":tk.status==="LOADING"?"#9B5CFF":"#00F5FF",
          fillOpacity:1,strokeColor:"#030509",strokeWeight:2},
      });
      const iw=new window.google.maps.InfoWindow({
        content:`<div style="background:#030509;color:#00F5FF;padding:10px;font-family:JetBrains Mono,monospace;font-size:11px;border-radius:4px;min-width:150px">
          <b>${tk.id}</b> · ${tk.status}<br>Driver: ${tk.driver}<br>Speed: ${tk.speed} km/h<br>ETA: ${tk.eta}<br>Fuel: ${tk.fuel}%
        </div>`,
      });
      marker.addListener("click",()=>{iw.open(map,marker);setSelectedTruckId(tk.id);setDrawerOpen(true);});
      return marker;
    });
  },[trucks]);

  const drawRoutePolylines=useCallback((map)=>{
    if(!map||!window.google) return;
    polylinesRef.current.forEach(p=>p.setMap(null));
    polylinesRef.current=[];
    const ds=new window.google.maps.DirectionsService();
    trucks.filter(t=>t.status==="EN_ROUTE").forEach(tk=>{
      const dest=tk.dest==="Mill A"?{lat:30.88,lng:75.85}:tk.dest==="Mill B"?{lat:30.90,lng:75.80}:{lat:30.85,lng:75.89};
      ds.route({origin:{lat:tk.lat,lng:tk.lng},destination:dest,travelMode:window.google.maps.TravelMode.DRIVING},(res,status)=>{
        if(status==="OK"){
          const p=new window.google.maps.Polyline({
            path:res.routes[0].overview_path,geodesic:true,
            strokeColor:tk.status==="DELAYED"?"#FF8C42":"#00F5FF",strokeOpacity:.7,strokeWeight:2,
          });
          p.setMap(map); polylinesRef.current.push(p);
        }
      });
    });
  },[trucks]);

  const toggleTraffic=useCallback(()=>{
    if(!gMapInstanceRef.current||!trafficLayerRef.current){addAlert("info","Load Google Maps first (click 🔑)");return;}
    const next=!trafficOn;
    trafficLayerRef.current.setMap(next?gMapInstanceRef.current:null);
    setTrafficOn(next);
  },[trafficOn]);

  /* ── Route optimizer ── */
  const optimizeRoutes=useCallback(async()=>{
    setModal("route"); setRouteLoading(true); setRouteResult(null);
    if(!openaiKey){
      setTimeout(()=>{
        setRouteLoading(false);
        setRouteResult([
          {truck:"BP-112",rec:"Take NH-95 bypass via Jamalpur — avoids construction. Saves 12 min.",time:"▼ 12 min",fuel:"▼ 1.2L"},
          {truck:"BP-337",rec:"Refuel at BP Station on GT Road before Mill C — 18 km range concern.",time:"▲ 4 min",fuel:"Prevents breakdown"},
          {truck:"BP-774",rec:"Current route optimal. Traffic on Miller Ganj cleared. Maintain heading.",time:"✓ On track",fuel:"✓ Nominal"},
        ]);
      },1200);
      return;
    }
    try{
      const res=await fetch("https://api.openai.com/v1/chat/completions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${openaiKey}`},
        body:JSON.stringify({model:"gpt-4o",max_tokens:400,messages:[{role:"user",content:
          `Fleet route optimizer. Trucks:\n${trucks.filter(t=>t.status==="EN_ROUTE").map(t=>`${t.id}: pos(${t.lat.toFixed(3)},${t.lng.toFixed(3)}), dest:${t.dest}, dist:${t.distKm}km, speed:${t.speed}km/h, fuel:${t.fuel}%`).join("\n")}\nGive 3 optimizations as JSON array [{truck,rec,time,fuel}].`
        }]})
      });
      const data=await res.json();
      const raw=data.choices?.[0]?.message?.content||"[]";
      try{setRouteResult(JSON.parse(raw.replace(/```json|```/g,"").trim()));}
      catch{setRouteResult([{truck:"AI Response",rec:raw,time:"",fuel:""}]);}
    }catch(e){setRouteResult([{truck:"Error",rec:"Could not connect to OpenAI. Check key.",time:"",fuel:""}]);}
    setRouteLoading(false);
  },[openaiKey,trucks]);

  const applyRoutes=useCallback(()=>{
    setTrucks(p=>p.map(t=>t.id==="BP-112"?{...t,eta:"08:43"}:t));
    addAlert("success","Optimized routes applied to all active units");
    setModal(null);
  },[addAlert]);

  /* ── Filtered trucks ── */
  const filteredTrucks = trucks.filter(t=>{
    const q=filterText.toLowerCase();
    return !q||(t.id+t.status+t.driver+t.dest).toLowerCase().includes(q);
  });

  const selectedTruck = trucks.find(t=>t.id===selectedTruckId)||null;
  const enRouteCnt = trucks.filter(t=>t.status==="EN_ROUTE").length;
  const delayedCnt = trucks.filter(t=>t.status==="DELAYED").length;
  const idleCnt = trucks.filter(t=>t.status==="OFFLINE"||t.status==="LOADING").length;
  const avgSpeed = enRouteCnt>0?(trucks.filter(t=>t.status==="EN_ROUTE").reduce((a,b)=>a+b.speed,0)/enRouteCnt).toFixed(0):"--";

  /* ─── RENDER ─────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{G}</style>
      <div style={{ width:"100vw",height:"100vh",background:"#030509",overflow:"hidden",position:"relative",display:"grid",
        gridTemplateRows:"56px 1fr",gridTemplateColumns:"64px 1fr" }}>

        {/* Scanline */}
        <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:999,
          background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.022) 2px,rgba(0,0,0,.022) 4px)" }}/>

        {/* ── TOP NAV ── */}
        <nav style={{ gridColumn:"1/-1",gridRow:1,display:"flex",alignItems:"center",
          justifyContent:"space-between",padding:"0 20px",
          background:"rgba(5,8,18,.92)",borderBottom:"1px solid rgba(0,245,255,.12)",
          backdropFilter:"blur(24px)",zIndex:200,animation:"slideInLeft .4s ease-out" }}>
          <div style={{ display:"flex",alignItems:"center",gap:16 }}>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,
              letterSpacing:".25em",color:"#00F5FF",
              textShadow:"0 0 20px rgba(0,245,255,.6)",animation:"neonFlicker 10s ease-in-out infinite" }}>
              BIOPULSE ELITE
            </div>
            <div style={{ width:1,height:18,background:"rgba(0,245,255,.2)" }}/>
            <DNAHelixBar/>
          </div>
          <div style={{ display:"flex",gap:24,alignItems:"center" }}>
            {["OPERATIONS","ANALYTICS","ROUTE_OPT","SETTINGS"].map(n=>(
              <span key={n} onClick={()=>n==="ANALYTICS"?setModal("analytics"):n==="ROUTE_OPT"?optimizeRoutes():n==="SETTINGS"?setModal("settings"):null}
                style={{ fontFamily:"'Syne',sans-serif",fontSize:9,fontWeight:700,letterSpacing:".2em",
                  color:n==="OPERATIONS"?"#00F5FF":"#5A7090",cursor:"pointer",
                  borderBottom:n==="OPERATIONS"?"1px solid #00F5FF":"none",paddingBottom:2 }}>{n}</span>
            ))}
          </div>
          <div style={{ display:"flex",gap:14,alignItems:"center" }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:"#00F5FF",animation:"pulseRing 2s ease-in-out infinite" }}/>
            <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#00F5FF" }}>{liveTime}</span>
            <span onClick={()=>setModal("alerts")} style={{ fontSize:14,cursor:"pointer",color:"#00F5FF",filter:"drop-shadow(0 0 5px rgba(0,245,255,.4))" }}>🔔</span>
            <span onClick={()=>setModal("api")} style={{ fontSize:14,cursor:"pointer",color:"#00F5FF",filter:"drop-shadow(0 0 5px rgba(0,245,255,.4))" }}>🔑</span>
            <span onClick={()=>setModal("settings")} style={{ fontSize:14,cursor:"pointer",color:"#00F5FF",filter:"drop-shadow(0 0 5px rgba(0,245,255,.4))" }}>⚙</span>
          </div>
        </nav>

        {/* ── SIDE NAV ── */}
        <aside style={{ gridRow:2,display:"flex",flexDirection:"column",alignItems:"center",
          padding:"12px 0",gap:4,background:"rgba(5,8,18,.8)",
          borderRight:"1px solid rgba(0,245,255,.08)",zIndex:150,animation:"slideInLeft .5s ease-out" }}>
          {[["⬡","Fleet"],["◉","Map"],["◈","Routes"],["⬖","Fuel"],["◫","Logs"]].map(([icon,label],i)=>(
            <button key={label} onClick={()=>{ if(label==="Routes") optimizeRoutes(); }}
              style={{ width:44,height:44,borderRadius:6,border:i===0?"1px solid rgba(0,245,255,.3)":"1px solid transparent",
                background:i===0?"rgba(0,245,255,.1)":"transparent",
                color:i===0?"#00F5FF":"#5A7090",cursor:"pointer",display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",gap:2,transition:"all .2s",fontSize:15,
                boxShadow:i===0?"0 0 12px rgba(0,245,255,.15)":"none" }}>
              <span style={{ fontSize:14 }}>{icon}</span>
              <span style={{ fontFamily:"'Syne',sans-serif",fontSize:7,fontWeight:700,letterSpacing:".1em" }}>{label}</span>
            </button>
          ))}
          <div style={{ flex:1 }}/>
          <button onClick={()=>setModal("api")}
            style={{ width:44,height:44,borderRadius:6,border:"1px solid transparent",background:"transparent",
              color:"#5A7090",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",
              justifyContent:"center",gap:2,fontSize:15 }}>
            <span style={{ fontSize:14 }}>🔑</span>
            <span style={{ fontFamily:"'Syne',sans-serif",fontSize:7,fontWeight:700,letterSpacing:".1em" }}>APIs</span>
          </button>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ gridRow:2,overflow:"hidden",display:"grid",
          gridTemplateColumns:"1fr 310px",gridTemplateRows:"1fr 180px",gap:8,padding:"8px 8px 8px 0" }}>

          {/* MAP PANEL */}
          <div style={{ gridRow:1,gridColumn:1,background:"rgba(6,10,22,.88)",
            border:"1px solid rgba(0,245,255,.1)",borderRadius:8,overflow:"hidden",
            position:"relative",animation:"fadeUp .5s ease-out" }}>
            {/* Chip */}
            <div style={{ position:"absolute",top:0,left:0,zIndex:20,background:"#00F5FF",
              color:"#030509",fontFamily:"'JetBrains Mono',monospace",fontSize:8,fontWeight:700,
              padding:"3px 8px",letterSpacing:".1em" }}>MAP_GRID_SYS·v3.1</div>
            {/* Corner decorations */}
            {[["top:0,left:0","borderTop,borderLeft"],["top:0,right:0","borderTop,borderRight"],
              ["bottom:0,left:0","borderBottom,borderLeft"],["bottom:0,right:0","borderBottom,borderRight"]].map(([_,__],i)=>(
              <div key={i} style={{ position:"absolute",width:12,height:12,
                top:i<2?0:"auto",bottom:i>=2?0:"auto",
                left:i%2===0?0:"auto",right:i%2!==0?0:"auto",
                borderTop:i<2?"1px solid rgba(0,245,255,.4)":undefined,
                borderBottom:i>=2?"1px solid rgba(0,245,255,.4)":undefined,
                borderLeft:i%2===0?"1px solid rgba(0,245,255,.4)":undefined,
                borderRight:i%2!==0?"1px solid rgba(0,245,255,.4)":undefined,
                zIndex:5,pointerEvents:"none" }}/>
            ))}
            {/* Map content */}
            <div style={{ width:"100%",height:"100%",position:"relative" }}>
              {mapsLoaded
                ? <div ref={googleMapRef} style={{ width:"100%",height:"100%" }}/>
                : <><RadarCanvas trucks={trucks}/>
                   <div ref={googleMapRef} style={{ display:"none" }}/></>
              }
            </div>
            {/* HUD */}
            <div style={{ position:"absolute",top:24,left:16,display:"flex",flexDirection:"column",gap:8,zIndex:20 }}>
              {[["RADIUS_ACTIVE","20.00 KM"],["UNITS_IN_TRANSIT",`${enRouteCnt} / 6`],["AVG_SPEED",`${avgSpeed} KM/H`]].map(([k,v])=>(
                <div key={k} style={{ background:"rgba(5,8,18,.88)",backdropFilter:"blur(12px)",
                  border:"1px solid rgba(0,245,255,.15)",borderRadius:6,padding:"9px 13px",minWidth:130 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif",fontSize:7,fontWeight:700,letterSpacing:".2em",color:"#5A7090",marginBottom:3 }}>{k}</div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:15,color:"#00F5FF",fontWeight:700 }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Map controls */}
            <div style={{ position:"absolute",top:24,right:16,display:"flex",flexDirection:"column",gap:6,zIndex:20 }}>
              {[
                ["◉ TRAFFIC",toggleTraffic,trafficOn],
                ["⬡ OPTIMIZE",optimizeRoutes,false],
                ["⊕ LOAD MAP",()=>{if(!mapsLoaded)loadGoogleMaps();else{gMapInstanceRef.current?.panTo(CENTER);}},mapsLoaded],
              ].map(([label,fn,active])=>(
                <button key={label} onClick={fn}
                  style={{ background:active?"rgba(0,245,255,.15)":"rgba(5,8,18,.88)",
                    border:`1px solid ${active?"#00F5FF":"rgba(0,245,255,.2)"}`,borderRadius:4,
                    color:"#00F5FF",fontFamily:"'JetBrains Mono',monospace",fontSize:9,padding:"6px 10px",
                    cursor:"pointer",letterSpacing:".1em",transition:"all .2s",
                    boxShadow:active?"0 0 8px rgba(0,245,255,.3)":"none" }}>{label}</button>
              ))}
            </div>
            {/* Legend */}
            <div style={{ position:"absolute",bottom:14,left:16,display:"flex",gap:14,zIndex:20 }}>
              {[["PLASMA ROUTE","#00F5FF"],["ALT ROUTE","#9B5CFF"],["DELAY ZONE","#FF8C42"]].map(([l,c])=>(
                <div key={l} style={{ display:"flex",alignItems:"center",gap:5 }}>
                  <div style={{ width:18,height:1.5,background:c,boxShadow:`0 0 5px ${c}` }}/>
                  <span style={{ fontFamily:"'Syne',sans-serif",fontSize:7,fontWeight:700,letterSpacing:".14em",color:"#5A7090" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ gridRow:"1/-1",gridColumn:2,display:"flex",flexDirection:"column",gap:8,
            animation:"slideInRight .5s ease-out",overflow:"hidden",position:"relative" }}>

            {/* Fleet Status */}
            <div style={{ background:"rgba(6,10,22,.88)",border:"1px solid rgba(0,245,255,.1)",
              borderRadius:8,padding:14,flexShrink:0 }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
                <span style={{ fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,letterSpacing:".15em",color:"#00F5FF" }}>FLEET_STATUS</span>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#00F5FF" }}>LIVE</span>
                  <div style={{ width:6,height:6,borderRadius:"50%",background:"#00F5FF",animation:"pulseRing 2s ease-in-out infinite" }}/>
                </div>
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#5A7090",letterSpacing:".1em" }}>BIOMASS_INBOUND</span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#00F5FF",fontWeight:700 }}>{biomass} T</span>
                </div>
                <div style={{ height:3,background:"rgba(0,245,255,.08)",borderRadius:2,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${(biomass/70)*100}%`,borderRadius:2,
                    background:"linear-gradient(90deg,#00F5FF,#9B5CFF)",
                    boxShadow:"0 0 8px rgba(0,245,255,.4)",transition:"width .8s ease" }}/>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                {[["ACTIVE",enRouteCnt,"#00F5FF"],["DELAYED",delayedCnt,"#FF8C42"],["IDLE",idleCnt,"#9B5CFF"]].map(([l,v,c])=>(
                  <div key={l} style={{ textAlign:"center",padding:"8px 4px",background:"rgba(0,245,255,.03)",
                    border:"1px solid rgba(0,245,255,.07)",borderRadius:4 }}>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,color:c }}>{v}</div>
                    <div style={{ fontFamily:"'Syne',sans-serif",fontSize:7,fontWeight:700,color:"#5A7090",letterSpacing:".14em",marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Truck list */}
            <div style={{ flex:1,overflow:"hidden",background:"rgba(6,10,22,.88)",
              border:"1px solid rgba(0,245,255,.1)",borderRadius:8,display:"flex",
              flexDirection:"column",minHeight:0 }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"10px 13px",borderBottom:"1px solid rgba(0,245,255,.07)" }}>
                <span style={{ fontFamily:"'Syne',sans-serif",fontSize:8,fontWeight:700,letterSpacing:".2em",color:"#5A7090" }}>UNIT_MANIFEST</span>
                <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                  <input value={filterText} onChange={e=>setFilterText(e.target.value)}
                    placeholder="Search..."
                    style={{ background:"rgba(0,245,255,.04)",border:"1px solid rgba(0,245,255,.12)",
                      borderRadius:3,color:"#C8D8E8",fontFamily:"'JetBrains Mono',monospace",
                      fontSize:9,padding:"3px 8px",outline:"none",width:80 }}/>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#00F5FF" }}>{filteredTrucks.length} UNITS</span>
                </div>
              </div>
              <div style={{ flex:1,overflowY:"auto" }}>
                {filteredTrucks.map((t,i)=>(
                  <TruckRow key={t.id} truck={t} selected={selectedTruckId===t.id} delay={i*0.045}
                    onClick={()=>{ setSelectedTruckId(t.id); setDrawerOpen(true); }}/>
                ))}
              </div>
              <div style={{ padding:10,borderTop:"1px solid rgba(0,245,255,.07)" }}>
                <GlowBtn style={{ width:"100%" }} onClick={optimizeRoutes}>⬡ OPTIMIZE_ALL_ROUTES</GlowBtn>
              </div>
            </div>

            {/* Drawer */}
            <TruckDrawer truck={selectedTruck} open={drawerOpen}
              onClose={()=>{setDrawerOpen(false);setSelectedTruckId(null);}}
              onOptimize={(id)=>{addAlert("info",`Optimizing route for ${id}...`);setTimeout(()=>addAlert("success",`${id}: new route saves 8 min`),1500);setDrawerOpen(false);}}
              onAlert={(msg)=>addAlert("critical",msg)}/>
          </div>

          {/* BOTTOM ROW */}
          <div style={{ gridRow:2,gridColumn:1,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>

            {/* AI Chat */}
            <div style={{ background:"rgba(6,10,22,.88)",border:"1px solid rgba(0,245,255,.1)",borderRadius:8,overflow:"hidden",display:"flex",flexDirection:"column" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"8px 12px",borderBottom:"1px solid rgba(0,245,255,.07)" }}>
                <span style={{ fontFamily:"'Syne',sans-serif",fontSize:8,fontWeight:700,letterSpacing:".18em",color:"#5A7090" }}>AI_FLEET_INTELLIGENCE</span>
                <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#9B5CFF" }}>{openaiKey?"GPT-4o":"LOCAL"}</span>
                  <div style={{ width:5,height:5,borderRadius:"50%",background:openaiKey?"#00FF88":"#9B5CFF",animation:"glowPulse 2s infinite" }}/>
                </div>
              </div>
              <AIChat trucks={trucks} openaiKey={openaiKey} biomass={biomass}/>
            </div>

            {/* Alerts */}
            <div style={{ background:"rgba(6,10,22,.88)",border:"1px solid rgba(0,245,255,.1)",borderRadius:8,overflow:"hidden",display:"flex",flexDirection:"column" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"8px 12px",borderBottom:"1px solid rgba(0,245,255,.07)" }}>
                <span style={{ fontFamily:"'Syne',sans-serif",fontSize:8,fontWeight:700,letterSpacing:".18em",color:"#5A7090" }}>LIVE_ALERTS</span>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <button onClick={()=>setAlerts([])}
                    style={{ background:"none",border:"none",color:"#5A7090",fontFamily:"'Syne',sans-serif",fontSize:7,letterSpacing:".14em",cursor:"pointer" }}>CLEAR</button>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#00F5FF" }}>{alerts.length}</span>
                </div>
              </div>
              <div style={{ flex:1,overflowY:"auto",padding:"6px 8px",display:"flex",flexDirection:"column",gap:5 }}>
                {alerts.length===0
                  ? <div style={{ textAlign:"center",padding:"20px 0",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#3A5070" }}>No alerts</div>
                  : alerts.map(a=><AlertItem key={a.id} alert={a} onDismiss={dismissAlert}/>)
                }
              </div>
            </div>

            {/* KPIs */}
            <div style={{ background:"rgba(6,10,22,.88)",border:"1px solid rgba(0,245,255,.1)",borderRadius:8,overflow:"hidden",display:"flex",flexDirection:"column" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"8px 12px",borderBottom:"1px solid rgba(0,245,255,.07)" }}>
                <span style={{ fontFamily:"'Syne',sans-serif",fontSize:8,fontWeight:700,letterSpacing:".18em",color:"#5A7090" }}>PERFORMANCE_KPIs</span>
                <button onClick={()=>setModal("analytics")}
                  style={{ background:"rgba(0,245,255,.07)",border:"1px solid rgba(0,245,255,.18)",borderRadius:3,color:"#00F5FF",fontFamily:"'JetBrains Mono',monospace",fontSize:8,padding:"3px 7px",cursor:"pointer" }}>
                  EXPAND ↗
                </button>
              </div>
              <div style={{ padding:"10px 12px",flex:1,display:"flex",flexDirection:"column",gap:8 }}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                  {[["ON_TIME_RATE","91.2%","▲ 2.1% week"],["AVG_MOISTURE",trucks.filter(t=>t.moisture).length>0?(trucks.filter(t=>t.moisture).reduce((a,b)=>a+b.moisture,0)/trucks.filter(t=>t.moisture).length).toFixed(1)+"%":"--","▼ optimal"],["FUEL_EFF.","8.4 KM/L","▲ fleet avg"],["DELIVERIES","247","today"]].map(([k,v,sub])=>(
                    <div key={k} style={{ background:"rgba(0,245,255,.03)",border:"1px solid rgba(0,245,255,.07)",borderRadius:4,padding:"7px 9px" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif",fontSize:7,fontWeight:700,letterSpacing:".14em",color:"#5A7090",marginBottom:3 }}>{k}</div>
                      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:700,color:"#00F5FF" }}>{v}</div>
                      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#5A7090",marginTop:1 }}>{sub}</div>
                    </div>
                  ))}
                </div>
                <Sparkline data={sparkData}/>
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer style={{ position:"fixed",bottom:0,left:0,right:0,height:28,zIndex:100,
          background:"rgba(3,5,10,.96)",borderTop:"1px solid rgba(0,245,255,.07)",
          display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 18px" }}>
          <span style={{ fontFamily:"'Syne',sans-serif",fontSize:7,fontWeight:700,letterSpacing:".2em",color:"#5A7090" }}>
            © 2025 BIOPULSE ELITE // SECURE_HANDSHAKE_ESTABLISHED
          </span>
          <div style={{ display:"flex",gap:18,alignItems:"center" }}>
            {["AES256_ACTIVE","STREAM:SYNCED","PORT:8080"].map(l=>(
              <div key={l} style={{ display:"flex",alignItems:"center",gap:5 }}>
                <div style={{ width:4,height:4,borderRadius:"50%",background:"#00F5FF",animation:"glowPulse 2s ease-in-out infinite" }}/>
                <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(0,245,255,.45)",letterSpacing:".1em" }}>{l}</span>
              </div>
            ))}
          </div>
        </footer>

        {/* ── MODALS ── */}

        {/* API Keys */}
        <Modal open={modal==="api"} onClose={()=>setModal(null)} title="🔑 API_CONFIGURATION"
          footer={<GlowBtn onClick={()=>setModal(null)}>DONE</GlowBtn>}>
          <div style={{ background:"rgba(155,92,255,.06)",border:"1px solid rgba(155,92,255,.2)",borderRadius:6,padding:14,display:"flex",flexDirection:"column",gap:10 }}>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:9,fontWeight:700,letterSpacing:".2em",color:"#9B5CFF" }}>GOOGLE MAPS API KEY</div>
            <div style={{ display:"flex",gap:8 }}>
              <input type="password" value={gmapsKeyInput} onChange={e=>setGmapsKeyInput(e.target.value)} placeholder="AIza..."
                style={{ flex:1,background:"rgba(0,0,0,.3)",border:"1px solid rgba(155,92,255,.25)",borderRadius:4,color:"#C8D8E8",fontFamily:"'JetBrains Mono',monospace",fontSize:10,padding:"6px 10px",outline:"none" }}/>
              <button onClick={()=>{if(gmapsKeyInput){setGmapsKey(gmapsKeyInput);setModal(null);setTimeout(()=>loadGoogleMaps(),300);}}}
                style={{ background:"rgba(155,92,255,.15)",border:"1px solid rgba(155,92,255,.4)",color:"#9B5CFF",padding:"6px 12px",borderRadius:4,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontSize:8,fontWeight:700,letterSpacing:".14em",whiteSpace:"nowrap" }}>
                LOAD MAP
              </button>
            </div>
            {process.env.REACT_APP_GOOGLE_MAPS_API_KEY && (
              <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"#00FF88" }}>✓ Loaded from .env file</div>
            )}
            <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#5A7090" }}>Enables live Google Maps with traffic, street view & route calculation</div>
          </div>
          <div style={{ background:"rgba(0,245,255,.04)",border:"1px solid rgba(0,245,255,.2)",borderRadius:6,padding:14,display:"flex",flexDirection:"column",gap:10 }}>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:9,fontWeight:700,letterSpacing:".2em",color:"#00F5FF" }}>OPENAI API KEY</div>
            <div style={{ display:"flex",gap:8 }}>
              <input type="password" value={openaiKeyInput} onChange={e=>setOpenaiKeyInput(e.target.value)} placeholder="sk-proj-..."
                style={{ flex:1,background:"rgba(0,0,0,.3)",border:"1px solid rgba(0,245,255,.22)",borderRadius:4,color:"#C8D8E8",fontFamily:"'JetBrains Mono',monospace",fontSize:10,padding:"6px 10px",outline:"none" }}/>
              <button onClick={()=>{if(openaiKeyInput){setOpenaiKey(openaiKeyInput);addAlert("success","OpenAI GPT-4o connected — Fleet AI active");setModal(null);}}}
                style={{ background:"rgba(0,245,255,.1)",border:"1px solid rgba(0,245,255,.35)",color:"#00F5FF",padding:"6px 12px",borderRadius:4,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontSize:8,fontWeight:700,letterSpacing:".14em",whiteSpace:"nowrap" }}>
                ACTIVATE AI
              </button>
            </div>
            {process.env.REACT_APP_OPENAI_API_KEY && (
              <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"#00FF88" }}>✓ Loaded from .env file</div>
            )}
            <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#5A7090" }}>Powers AI route optimization, delay prediction & fleet intelligence chat</div>
          </div>
          <div style={{ background:"rgba(255,140,66,.05)",border:"1px solid rgba(255,140,66,.2)",borderRadius:4,padding:"10px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#FF8C42" }}>
            ⚠ Keys stored in memory only — cleared on page refresh. Never share API keys publicly.
          </div>
        </Modal>

        {/* Settings */}
        <Modal open={modal==="settings"} onClose={()=>setModal(null)} title="⚙ SYSTEM_SETTINGS"
          footer={<GlowBtn onClick={()=>setModal(null)}>SAVE & CLOSE</GlowBtn>}>
          {[["Live GPS Tracking","liveGps"],["AI Route Suggestions","aiRoutes"],["Real-time Alerts","realtimeAlerts"],["Fuel Monitoring","fuelMonitor"],["Traffic Layer","traffic"]].map(([label,key])=>(
            <SettingRow key={key} label={label} on={settings[key]} onChange={v=>setSettings(p=>({...p,[key]:v}))}/>
          ))}
          <SettingRow label="Update Interval">
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <input type="range" min={5} max={60} defaultValue={15}
                style={{ width:80,accentColor:"#00F5FF" }}/>
              <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#00F5FF" }}>15s</span>
            </div>
          </SettingRow>
        </Modal>

        {/* Route Optimizer */}
        <Modal open={modal==="route"} onClose={()=>setModal(null)} title="⬡ AI_ROUTE_OPTIMIZER"
          footer={<>
            <GlowBtn variant="secondary" onClick={()=>setModal(null)}>CANCEL</GlowBtn>
            <GlowBtn onClick={applyRoutes}>APPLY ROUTES</GlowBtn>
          </>}>
          {routeLoading
            ? <div style={{ textAlign:"center",padding:"30px 0" }}>
                <div style={{ width:24,height:24,border:"2px solid rgba(0,245,255,.2)",borderTopColor:"#00F5FF",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px" }}/>
                <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#5A7090" }}>AI analyzing all routes...</div>
              </div>
            : routeResult?.map((r,i)=>(
              <div key={i} style={{ background:"rgba(0,245,255,.04)",border:"1px solid rgba(0,245,255,.12)",borderRadius:6,padding:14 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:"#00F5FF" }}>{r.truck}</span>
                  <div style={{ display:"flex",gap:10 }}>
                    {r.time&&<span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#00FF88" }}>{r.time}</span>}
                    {r.fuel&&<span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#9B5CFF" }}>{r.fuel}</span>}
                  </div>
                </div>
                <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#C8D8E8",lineHeight:1.5 }}>{r.rec||r.recommendation}</div>
              </div>
            ))
          }
        </Modal>

        {/* Alerts Modal */}
        <Modal open={modal==="alerts"} onClose={()=>setModal(null)} title="🔔 ALL_SYSTEM_ALERTS"
          footer={<><GlowBtn variant="danger" onClick={()=>{setAlerts([]);setModal(null);}}>CLEAR ALL</GlowBtn><GlowBtn onClick={()=>setModal(null)}>CLOSE</GlowBtn></>}>
          {alerts.length===0
            ? <div style={{ textAlign:"center",padding:"20px 0",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#3A5070" }}>No alerts</div>
            : alerts.map(a=><AlertItem key={a.id} alert={a} onDismiss={dismissAlert}/>)
          }
        </Modal>

        {/* Analytics Modal */}
        <Modal open={modal==="analytics"} onClose={()=>setModal(null)} title="◈ FLEET_ANALYTICS_DEEP" width={600}
          footer={<GlowBtn onClick={()=>setModal(null)}>CLOSE</GlowBtn>}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10 }}>
            {[["TOTAL_TRIPS","1,247","this month"],["TOTAL_TONNAGE","3.8K T","delivered"],["AVG_DELAY","4.2 min","per trip"],["COST_SAVED","₹2.4L","via AI routes"]].map(([k,v,s])=>(
              <div key={k} style={{ background:"rgba(0,245,255,.03)",border:"1px solid rgba(0,245,255,.07)",borderRadius:4,padding:"10px 9px" }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:7,fontWeight:700,letterSpacing:".14em",color:"#5A7090",marginBottom:5 }}>{k}</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:700,color:"#00F5FF" }}>{v}</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"#5A7090",marginTop:2 }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"rgba(0,245,255,.02)",border:"1px solid rgba(0,245,255,.08)",borderRadius:6,padding:14 }}>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:8,fontWeight:700,letterSpacing:".18em",color:"#5A7090",marginBottom:10 }}>BIOMASS THROUGHPUT — TODAY</div>
            <Sparkline data={[...sparkData,...sparkData.map(v=>v*0.9)].slice(0,30)}/>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
            {[["BP-902","EN_ROUTE",78,72],["BP-774","EN_ROUTE",91,58],["BP-112","DELAYED",54,81],["BP-337","EN_ROUTE",83,44]].map(([id,st,load,fuel])=>(
              <div key={id} style={{ background:"rgba(0,245,255,.03)",border:"1px solid rgba(0,245,255,.07)",borderRadius:4,padding:10 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:7 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:"#00F5FF" }}>{id}</span>
                  <StatusBadge status={st}/>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:5 }}>
                  {[["LOAD",`${load}%`],["FUEL",`${fuel}%`]].map(([k,v])=>(
                    <div key={k}>
                      <div style={{ fontFamily:"'Syne',sans-serif",fontSize:7,color:"#5A7090",letterSpacing:".12em",marginBottom:2 }}>{k}</div>
                      <div style={{ height:2,background:"rgba(0,245,255,.06)",borderRadius:1,overflow:"hidden" }}>
                        <div style={{ height:"100%",width:v,background:"linear-gradient(90deg,#00F5FF,#9B5CFF)",borderRadius:1 }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Modal>

      </div>
    </>
  );
}