import { useState, useEffect } from "react";

function FleetLogisticsTest() {
  const [trucks, setTrucks] = useState([
    { id: "BP-902", status: "EN_ROUTE", driver: "Harpreet S." },
    { id: "BP-774", status: "EN_ROUTE", driver: "Gurjant K." }
  ]);

  return (
    <div style={{ 
      padding: '20px', 
      color: '#00F5FF',
      fontFamily: 'Arial'
    }}>
      <h1>Fleet Logistics Dashboard - Test Version</h1>
      <p>This is a simplified version to test if the component works.</p>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Active Trucks:</h2>
        {trucks.map(truck => (
          <div key={truck.id} style={{ 
            padding: '10px', 
            margin: '10px 0', 
            background: 'rgba(0,245,255,0.1)',
            border: '1px solid #00F5FF',
            borderRadius: '5px'
          }}>
            <strong>ID:</strong> {truck.id} | 
            <strong> Status:</strong> {truck.status} | 
            <strong> Driver:</strong> {truck.driver}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FleetLogisticsTest;
