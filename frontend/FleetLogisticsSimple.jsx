import { useState, useEffect } from "react";

const INITIAL_TRUCKS = [
  { id:"BP-902", status:"EN_ROUTE", moisture:12.4, eta:"08:14", load:78, driver:"Harpreet S.", dest:"Mill A", distKm:12.4, cargo:"Sugarcane", weight:18.2 },
  { id:"BP-774", status:"EN_ROUTE", moisture:14.1, eta:"08:26", load:91, driver:"Gurjant K.", dest:"Mill B", distKm:8.9, cargo:"Biomass", weight:22.1 },
  { id:"BP-112", status:"DELAYED", moisture:9.8, eta:"08:55", load:54, driver:"Ramandeep T.", dest:"Mill A", distKm:18.6, cargo:"Sugarcane", weight:13.1 }
];

function StatusBadge({ status }) {
  const colors = {
    EN_ROUTE: { color: "#00FF88", bg: "rgba(0,255,136,.1)" },
    DELAYED: { color: "#FF8C42", bg: "rgba(255,140,66,.1)" },
    LOADING: { color: "#9B5CFF", bg: "rgba(155,92,255,.1)" }
  };
  const style = colors[status] || colors.LOADING;
  return (
    <span style={{ 
      padding: "2px 8px", 
      borderRadius: "4px", 
      fontSize: "10px", 
      fontWeight: "bold",
      color: style.color,
      background: style.bg,
      border: `1px solid ${style.color}33`
    }}>
      {status}
    </span>
  );
}

export default function FleetLogisticsSimple() {
  const [trucks, setTrucks] = useState(INITIAL_TRUCKS);
  const [selectedTruck, setSelectedTruck] = useState(null);

  return (
    <div style={{ 
      height: "100vh", 
      background: "#03050A", 
      color: "#C8D8E8",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ 
        background: "rgba(8,12,22,0.95)", 
        padding: "20px", 
        borderRadius: "8px",
        border: "1px solid rgba(0,245,255,0.15)",
        marginBottom: "20px"
      }}>
        <h1 style={{ 
          color: "#00F5FF", 
          margin: "0 0 10px 0",
          fontSize: "24px",
          fontWeight: "bold"
        }}>
          FLEET LOGISTICS DASHBOARD
        </h1>
        <p style={{ margin: 0, color: "#5A7090" }}>
          Real-time fleet tracking and management system
        </p>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "20px",
        marginBottom: "20px"
      }}>
        <div style={{ 
          background: "rgba(8,12,22,0.95)", 
          padding: "20px", 
          borderRadius: "8px",
          border: "1px solid rgba(0,245,255,0.15)"
        }}>
          <h2 style={{ color: "#00F5FF", margin: "0 0 15px 0" }}>Fleet Status</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#00F5FF" }}>3</div>
              <div style={{ fontSize: "12px", color: "#5A7090" }}>Total Trucks</div>
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#FF8C42" }}>1</div>
              <div style={{ fontSize: "12px", color: "#5A7090" }}>Delayed</div>
            </div>
          </div>
        </div>

        <div style={{ 
          background: "rgba(8,12,22,0.95)", 
          padding: "20px", 
          borderRadius: "8px",
          border: "1px solid rgba(0,245,255,0.15)"
        }}>
          <h2 style={{ color: "#00F5FF", margin: "0 0 15px 0" }}>System Status</h2>
          <div style={{ fontSize: "14px", color: "#00FF88" }}>
            ● All systems operational
          </div>
        </div>
      </div>

      <div style={{ 
        background: "rgba(8,12,22,0.95)", 
        padding: "20px", 
        borderRadius: "8px",
        border: "1px solid rgba(0,245,255,0.15)"
      }}>
        <h2 style={{ color: "#00F5FF", margin: "0 0 15px 0" }}>Active Trucks</h2>
        <div style={{ display: "grid", gap: "10px" }}>
          {trucks.map(truck => (
            <div 
              key={truck.id}
              onClick={() => setSelectedTruck(truck)}
              style={{ 
                padding: "15px", 
                background: selectedTruck?.id === truck.id ? "rgba(0,245,255,0.1)" : "rgba(0,245,255,0.02)",
                border: `1px solid ${selectedTruck?.id === truck.id ? "#00F5FF" : "rgba(0,245,255,0.1)"}`,
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: "bold", color: "#00F5FF" }}>{truck.id}</span>
                <StatusBadge status={truck.status} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "#5A7090" }}>Driver:</span> {truck.driver}
                </div>
                <div>
                  <span style={{ color: "#5A7090" }}>Destination:</span> {truck.dest}
                </div>
                <div>
                  <span style={{ color: "#5A7090" }}>ETA:</span> {truck.eta}
                </div>
                <div>
                  <span style={{ color: "#5A7090" }}>Cargo:</span> {truck.cargo}
                </div>
                <div>
                  <span style={{ color: "#5A7090" }}>Weight:</span> {truck.weight}T
                </div>
                <div>
                  <span style={{ color: "#5A7090" }}>Load:</span> {truck.load}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
