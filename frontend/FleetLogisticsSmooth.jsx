import { useState, useEffect, useRef, useCallback } from "react";

// Initial truck data with full details
const INITIAL_TRUCKS = [
  { id:"BP-902", status:"EN_ROUTE", moisture:12.4, eta:"08:14", load:78, lat:30.920, lng:75.870, speed:54, fuel:72, temp:28, driver:"Harpreet S.",  dest:"Mill A", distKm:12.4, cargo:"Sugarcane", weight:18.2, route:"HIGHWAY-23" },
  { id:"BP-774", status:"EN_ROUTE", moisture:14.1, eta:"08:26", load:91, lat:30.880, lng:75.820, speed:61, fuel:58, temp:29, driver:"Gurjant K.",   dest:"Mill B", distKm:8.9,  cargo:"Biomass",   weight:22.1, route:"ROUTE-45" },
  { id:"BP-112", status:"DELAYED",  moisture:9.8,  eta:"08:55", load:54, lat:30.930, lng:75.910, speed:12, fuel:81, temp:27, driver:"Ramandeep T.", dest:"Mill A", distKm:18.6, cargo:"Sugarcane", weight:13.1, route:"HIGHWAY-23" },
  { id:"BP-337", status:"EN_ROUTE", moisture:11.2, eta:"08:32", load:83, lat:30.860, lng:75.840, speed:48, fuel:44, temp:26, driver:"Jaspreet M.", dest:"Mill C", distKm:15.3, cargo:"Biomass",   weight:19.7, route:"ROUTE-88" },
  { id:"BP-608", status:"OFFLINE",  moisture:13.5, eta:"--:--", load:0,  lat:30.900, lng:75.880, speed:0,  fuel:0,  temp:0,  driver:"Sukhvir S.",   dest:"Mill B", distKm:0,    cargo:"None",      weight:0,    route:"N/A" }
];

// Status badge component
function StatusBadge({ status }) {
  const colors = {
    EN_ROUTE: { color: "#00FF88", bg: "rgba(0,255,136,.1)", text: "EN ROUTE" },
    DELAYED: { color: "#FF8C42", bg: "rgba(255,140,66,.1)", text: "DELAYED" },
    LOADING: { color: "#9B5CFF", bg: "rgba(155,92,255,.1)", text: "LOADING" },
    OFFLINE: { color: "#FF4466", bg: "rgba(255,68,102,.1)", text: "OFFLINE" }
  };
  const style = colors[status] || colors.EN_ROUTE;
  return (
    <span style={{ 
      padding: "4px 10px", 
      borderRadius: "6px", 
      fontSize: "11px", 
      fontWeight: "bold",
      color: style.color,
      background: style.bg,
      border: `1px solid ${style.color}33`,
      letterSpacing: "0.5px"
    }}>
      {style.text}
    </span>
  );
}

// Alert item component
function AlertItem({ alert, onDismiss }) {
  const colors = {
    success: "#00FF88",
    warning: "#FFD700", 
    critical: "#FF4466",
    info: "#00F5FF"
  };
  return (
    <div style={{
      padding: "12px",
      background: `${colors[alert.type]}11`,
      border: `1px solid ${colors[alert.type]}33`,
      borderRadius: "6px",
      marginBottom: "8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div>
        <div style={{ color: colors[alert.type], fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>
          {alert.type.toUpperCase()}
        </div>
        <div style={{ color: "#C8D8E8", fontSize: "13px" }}>
          {alert.message}
        </div>
        <div style={{ color: "#5A7090", fontSize: "11px", marginTop: "4px" }}>
          {alert.time}
        </div>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        style={{
          background: "transparent",
          border: "none",
          color: colors[alert.type],
          cursor: "pointer",
          fontSize: "16px",
          padding: "4px"
        }}
      >
        ×
      </button>
    </div>
  );
}

// Modal component
function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "rgba(8,12,22,0.98)",
        border: "1px solid rgba(0,245,255,0.15)",
        borderRadius: "12px",
        padding: "30px",
        maxWidth: "600px",
        width: "90%",
        maxHeight: "80vh",
        overflow: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#00F5FF", margin: 0, fontSize: "18px" }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#5A7090",
              cursor: "pointer",
              fontSize: "24px",
              padding: "0"
            }}
          >
            ×
          </button>
        </div>
        <div style={{ marginBottom: "20px" }}>
          {children}
        </div>
        {footer && (
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FleetLogisticsSmooth() {
  // Core state
  const [trucks, setTrucks] = useState(INITIAL_TRUCKS);
  const [selectedTruckId, setSelectedTruckId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [biomass, setBiomass] = useState(48.2);
  const [sparkData, setSparkData] = useState(() => Array.from({length:20}, () => Math.random() * 30 + 65));
  const [liveTime, setLiveTime] = useState("--:--:--");
  const [filterText, setFilterText] = useState("");

  // API keys - direct values to avoid env issues
  const [gmapsKey, setGmapsKey] = useState("AIzaSyDmtGCxWbuNcL4TQBvS9eESumGltyaXFMI");
  const [openaiKey, setOpenaiKey] = useState("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");
  const [gmapsKeyInput, setGmapsKeyInput] = useState("AIzaSyDmtGCxWbuNcL4TQBvS9eESumGltyaXFMI");
  const [openaiKeyInput, setOpenaiKeyInput] = useState("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");
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [locationWeatherData, setLocationWeatherData] = useState({});
  const [driverData, setDriverData] = useState([]);
  const [driverForm, setDriverForm] = useState({
    id: '',
    name: '',
    license: '',
    phone: '',
    experience: '',
    baseSpeed: '',
    rating: '',
    status: 'AVAILABLE'
  });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [routePlan, setRoutePlan] = useState(null);
  const [weatherSearch, setWeatherSearch] = useState('');
  const [customLocations, setCustomLocations] = useState([]);
  const [searchedWeather, setSearchedWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [apiServices, setApiServices] = useState({
    maps: { status: 'unknown', features: ['Static Maps', 'Dynamic Maps', 'JavaScript API', 'Geocoding', 'Traffic Layer'] },
    places: { status: 'unknown', features: ['Place Search', 'Place Details', 'Photos', 'Reviews', 'Nearby Search'] },
    routes: { status: 'unknown', features: ['Directions', 'Distance Matrix', 'Route Optimization', 'Traffic Data', 'Alternative Routes'] },
    geocoding: { status: 'unknown', features: ['Address to Coordinates', 'Coordinates to Address', 'Reverse Geocoding', 'Address Validation', 'Postal Codes'] },
    airQuality: { status: 'unknown', features: ['Air Quality Index', 'Pollutants (PM2.5, PM10, O3, NO2)', 'Health Recommendations', '500m Resolution'] },
    solar: { status: 'unknown', features: ['Solar Potential', 'Roof Analysis', 'Sunlight Hours', 'Solar Panel Recommendations', 'Energy Savings'] },
    pollen: { status: 'unknown', features: ['Pollen Count', 'Allergy Forecast', 'Plant Types (Grass, Weed, Tree)', '1km Resolution', 'Health Index'] },
    maps3D: { status: 'unknown', features: ['3D Maps', 'Photorealistic 3D', 'Building Models', 'Terrain Data', 'Immersive Views'] },
    mapsDatasets: { status: 'unknown', features: ['Custom Data Upload', 'Geospatial Data Management', 'Data Visualization', 'Dataset Hosting', 'Custom Overlays'] },
    mapTiles: { status: 'unknown', features: ['2D Map Tiles', '3D Map Tiles', 'Street View Tiles', 'Custom Styling', 'High Resolution'] },
    streetView: { status: 'unknown', features: ['360° Photos', 'Street View Images', 'Location Metadata', 'Coverage Areas', 'Publish API'] },
    mapsEmbed: { status: 'unknown', features: ['Embedded Maps', 'Place Embeds', 'Directions Embeds', 'Search Embeds', 'Simple Integration'] },
    weather: { status: 'unknown', features: ['Current Weather', 'Temperature', 'Humidity', 'Wind Speed', 'Weather Conditions', 'Forecast'] },
    openai: { status: 'unknown', features: ['AI Route Optimization', 'Delay Prediction', 'Fleet Intelligence Chat', 'Automated Dispatch', 'Predictive Analytics'] }
  });

  // Alerts
  const [alerts, setAlerts] = useState([]);

  // Modals
  const [modal, setModal] = useState(null);

  // Settings
  const [settings, setSettings] = useState({ 
    liveGps: true, 
    aiRoutes: true, 
    realtimeAlerts: true, 
    fuelMonitor: true, 
    traffic: false 
  });

  // Route optimizer
  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Map state
  const [trafficOn, setTrafficOn] = useState(false);

  const addAlert = useCallback((type, message) => {
    const a = { type, message, time: new Date().toLocaleTimeString("en-IN", { hour12: false }), id: Date.now() + Math.random() };
    setAlerts(prev => [a, ...prev].slice(0, 20));
  }, []);

  const dismissAlert = useCallback((id) => setAlerts(prev => prev.filter(a => a.id !== id)), []);

  // Check API services
  const checkApiServices = useCallback(async () => {
    const services = apiServices;
    
    // Check Google Maps API
    if (gmapsKey) {
      try {
        // Test Maps API
        const mapsResponse = await fetch(`https://maps.googleapis.com/maps/api/staticmap?center=30.900,75.880&zoom=12&size=100x100&key=${gmapsKey}`);
        services.maps = { 
          status: mapsResponse.ok ? 'active' : 'error', 
          features: ['Static Maps', 'Dynamic Maps', 'JavaScript API', 'Traffic Layer'] 
        };
        
        // Test Places API
        const placesResponse = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=30.900,75.880&radius=1000&type=gas_station&key=${gmapsKey}`);
        services.places = { 
          status: placesResponse.ok ? 'active' : 'error', 
          features: ['Place Search', 'Place Details', 'Photos', 'Reviews', 'Nearby Search'] 
        };
        
        // Test Geocoding API
        const geocodingResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Ludhiana,India&key=${gmapsKey}`);
        services.geocoding = { 
          status: geocodingResponse.ok ? 'active' : 'error', 
          features: ['Address to Coordinates', 'Coordinates to Address', 'Component Filtering', 'Reverse Geocoding'] 
        };
        
        // Test Routes API
        const routesResponse = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=30.900,75.880&destination=30.850,75.850&key=${gmapsKey}`);
        services.routes = { 
          status: routesResponse.ok ? 'active' : 'error', 
          features: ['Route Calculation', 'Distance Matrix', 'Traffic Data', 'Alternative Routes', 'Waypoints'] 
        };
        
        // Test Air Quality API
        try {
          const airQualityResponse = await fetch(`https://airquality.googleapis.com/v1/currentConditions:lookup?key=${gmapsKey}&location=30.900,75.880`);
          services.airQuality = { 
            status: airQualityResponse.ok ? 'active' : 'needs_key', 
            features: ['Air Quality Index', 'Pollutants (PM2.5, PM10, O3, NO2)', 'Health Recommendations', '500m Resolution'] 
          };
        } catch (error) {
          services.airQuality = { status: 'needs_key', features: ['Air Quality Index', 'Pollutants (PM2.5, PM10, O3, NO2)', 'Health Recommendations', '500m Resolution'] };
        }
        
        // Test Solar API
        try {
          const solarResponse = await fetch(`https://solar.googleapis.com/v1/dataLayers:get?key=${gmapsKey}&location.latitude=30.900&location.longitude=75.880`);
          services.solar = { 
            status: solarResponse.ok ? 'active' : 'needs_key', 
            features: ['Solar Potential', 'Roof Analysis', 'Sunlight Hours', 'Solar Panel Recommendations', 'Energy Savings'] 
          };
        } catch (error) {
          services.solar = { status: 'needs_key', features: ['Solar Potential', 'Roof Analysis', 'Sunlight Hours', 'Solar Panel Recommendations', 'Energy Savings'] };
        }
        
        // Test Pollen API
        try {
          const pollenResponse = await fetch(`https://pollen.googleapis.com/v1/forecast:lookup?key=${gmapsKey}&location.latitude=30.900&location.longitude=75.880&days=1`);
          services.pollen = { 
            status: pollenResponse.ok ? 'active' : 'needs_key', 
            features: ['Pollen Count', 'Allergy Forecast', 'Plant Types (Grass, Weed, Tree)', '1km Resolution', 'Health Index'] 
          };
        } catch (error) {
          services.pollen = { status: 'needs_key', features: ['Pollen Count', 'Allergy Forecast', 'Plant Types (Grass, Weed, Tree)', '1km Resolution', 'Health Index'] };
        }
        
        // Test Maps 3D API
        try {
          const maps3DResponse = await fetch(`https://tile.googleapis.com/v1/3dtiles/root.json?key=${gmapsKey}`);
          services.maps3D = { 
            status: maps3DResponse.ok ? 'active' : 'needs_key', 
            features: ['3D Maps', 'Photorealistic 3D', 'Building Models', 'Terrain Data', 'Immersive Views'] 
          };
        } catch (error) {
          services.maps3D = { status: 'needs_key', features: ['3D Maps', 'Photorealistic 3D', 'Building Models', 'Terrain Data', 'Immersive Views'] };
        }
        
        // Test Maps Datasets API
        try {
          const datasetsResponse = await fetch(`https://mapsplatform.googleapis.com/maps/datasets/v1?key=${gmapsKey}`);
          services.mapsDatasets = { 
            status: datasetsResponse.ok ? 'active' : 'needs_key', 
            features: ['Custom Data Upload', 'Geospatial Data Management', 'Data Visualization', 'Dataset Hosting'] 
          };
        } catch (error) {
          services.mapsDatasets = { status: 'needs_key', features: ['Custom Data Upload', 'Geospatial Data Management', 'Data Visualization', 'Dataset Hosting'] };
        }
        
        // Test Map Tiles API
        try {
          const tilesResponse = await fetch(`https://tile.googleapis.com/v1/2dtiles/1/0/0?key=${gmapsKey}`);
          services.mapTiles = { 
            status: tilesResponse.ok ? 'active' : 'needs_key', 
            features: ['2D Map Tiles', '3D Map Tiles', 'Street View Tiles', 'Custom Styling', 'High Resolution'] 
          };
        } catch (error) {
          services.mapTiles = { status: 'needs_key', features: ['2D Map Tiles', '3D Map Tiles', 'Street View Tiles', 'Custom Styling', 'High Resolution'] };
        }
        
        // Test Street View API
        try {
          const streetViewResponse = await fetch(`https://maps.googleapis.com/maps/api/streetview/metadata?location=30.900,75.880&key=${gmapsKey}`);
          services.streetView = { 
            status: streetViewResponse.ok ? 'active' : 'needs_key', 
            features: ['360° Photos', 'Street View Images', 'Location Metadata', 'Coverage Areas', 'Publish API'] 
          };
        } catch (error) {
          services.streetView = { status: 'needs_key', features: ['360° Photos', 'Street View Images', 'Location Metadata', 'Coverage Areas', 'Publish API'] };
        }
        
        // Test Maps Embed API
        try {
          const embedResponse = await fetch(`https://www.google.com/maps/embed/v1/place?key=${gmapsKey}&q=Ludhiana,India`);
          services.mapsEmbed = { 
            status: embedResponse.ok ? 'active' : 'needs_key', 
            features: ['Embedded Maps', 'Place Embeds', 'Directions Embeds', 'Search Embeds', 'Simple Integration'] 
          };
        } catch (error) {
          services.mapsEmbed = { status: 'needs_key', features: ['Embedded Maps', 'Place Embeds', 'Directions Embeds', 'Search Embeds', 'Simple Integration'] };
        }
        
        // Test Google Weather API
        try {
          const weatherResponse = await fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${gmapsKey}&location.latitude=30.900&location.longitude=75.880`);
          if (weatherResponse.ok) {
            const weather = await weatherResponse.json();
            setWeatherData(weather);
            services.weather = { 
              status: 'active', 
              features: ['Current Weather', 'Temperature', 'Humidity', 'Wind Speed', 'Weather Conditions', 'Forecast'] 
            };
            addAlert("success", "Weather API connected - Live weather data available");
          } else {
            services.weather = { 
              status: 'needs_key', 
              features: ['Current Weather', 'Temperature', 'Humidity', 'Wind Speed', 'Weather Conditions', 'Forecast'] 
            };
          }
        } catch (error) {
          services.weather = { 
            status: 'not_configured', 
            features: ['Current Weather', 'Temperature', 'Humidity', 'Wind Speed', 'Weather Conditions', 'Forecast'] 
          };
        }
        
      } catch (error) {
        services.maps = { status: 'error', features: [] };
        services.places = { status: 'error', features: [] };
        services.geocoding = { status: 'error', features: [] };
        services.routes = { status: 'error', features: [] };
        services.airQuality = { status: 'error', features: [] };
        services.solar = { status: 'error', features: [] };
        services.pollen = { status: 'error', features: [] };
        services.maps3D = { status: 'error', features: [] };
        services.mapsDatasets = { status: 'error', features: [] };
        services.mapTiles = { status: 'error', features: [] };
        services.streetView = { status: 'error', features: [] };
        services.mapsEmbed = { status: 'error', features: [] };
        services.weather = { status: 'error', features: [] };
      }
    }
    
    // Check OpenAI API
    if (openaiKey) {
      services.openai = { 
        status: 'configured', 
        features: ['Route Optimization', 'Delay Prediction', 'Fleet Intelligence', 'Chat Interface', 'Data Analysis'] 
      };
    } else {
      services.openai = { status: 'not_configured', features: [] };
    }
    
    setApiServices(services);
    return services;
  }, [gmapsKey, openaiKey, apiServices]);

  // Live clock
  useEffect(() => {
    const tick = () => setLiveTime(new Date().toLocaleTimeString("en-IN", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Generate initial alerts, load weather data, and add sample drivers
  useEffect(() => {
    const alerts = [
      { type: "warning", message: "Truck BP-608 offline for 45 minutes", time: new Date().toLocaleTimeString("en-IN", { hour12: false }) },
      { type: "info", message: "New biomass delivery scheduled for 14:30", time: new Date().toLocaleTimeString("en-IN", { hour12: false }) },
      { type: "success", message: "All trucks completed morning routes", time: new Date().toLocaleTimeString("en-IN", { hour12: false }) },
      { type: "critical", message: "Fuel level below 20% on BP-337", time: new Date().toLocaleTimeString("en-IN", { hour12: false }) }
    ];
    setAlerts(alerts);
    
    // Add sample drivers for testing
    if (driverData.length === 0) {
      const sampleDrivers = [
        {
          id: 'DRV-001',
          name: 'Rajesh Kumar',
          license: 'DL-12AB3456',
          phone: '+91 98765 43210',
          experience: 5,
          baseSpeed: 65,
          rating: 4.8,
          status: 'AVAILABLE',
          assignedRoute: null,
          totalDeliveries: 145,
          onTimePerformance: 92,
          fuelEfficiency: 85,
          accidents: 0,
          joinedDate: new Date().toISOString()
        },
        {
          id: 'DRV-002',
          name: 'Amit Singh',
          license: 'DL-34CD7890',
          phone: '+91 87654 32109',
          experience: 3,
          baseSpeed: 58,
          rating: 4.5,
          status: 'AVAILABLE',
          assignedRoute: null,
          totalDeliveries: 89,
          onTimePerformance: 88,
          fuelEfficiency: 82,
          accidents: 1,
          joinedDate: new Date().toISOString()
        }
      ];
      setDriverData(sampleDrivers);
      console.log('Sample drivers added:', sampleDrivers);
    }
    
    // Auto-load weather data for all locations
    const loadWeather = async () => {
      if (gmapsKey) {
        try {
          // All plant locations
          const locations = [
            { name: 'Pan Carbo Green Fuel', lat: 30.2097, lng: 74.9374 },
            { name: 'Bathinda Biomass Plant', lat: 30.2200, lng: 74.9500 },
            { name: 'Guru Nanak Dev Thermal Plant', lat: 30.1800, lng: 74.9200 },
            { name: 'Barnala Biomass Collection', lat: 30.3800, lng: 75.5400 },
            { name: 'Mansa Biomass Hub', lat: 29.9800, lng: 75.2000 },
            { name: 'Faridkot Collection Point', lat: 30.6800, lng: 74.7600 }
          ];

          const weatherPromises = locations.map(async (location) => {
            const response = await fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${gmapsKey}&location.latitude=${location.lat}&location.longitude=${location.lng}`);
            if (response.ok) {
              const weather = await response.json();
              return { ...location, weather };
            }
            return null;
          });

          const weatherResults = await Promise.all(weatherPromises);
          const weatherDataMap = {};
          
          weatherResults.forEach(result => {
            if (result) {
              weatherDataMap[result.name] = result.weather;
              // Set main weather data for Pan Carbo Green Fuel
              if (result.name === 'Pan Carbo Green Fuel') {
                setWeatherData(result.weather);
              }
            }
          });

          setLocationWeatherData(weatherDataMap);
          addAlert("success", "Weather data loaded for all locations");
        } catch (error) {
          console.log("Weather API not available yet");
        }
      }
    };
    
    loadWeather();
  }, [gmapsKey, addAlert]);

  // Generate initial alerts
  useEffect(() => {
    const timers = [
      setTimeout(() => addAlert("warning", "BP-112 running 41 min behind schedule"), 600),
      setTimeout(() => addAlert("critical", "BP-608 went OFFLINE — last seen 07:45"), 1100),
      setTimeout(() => addAlert("warning", "BP-337 fuel at 44% — refuel at Mill C recommended"), 1600),
      setTimeout(() => addAlert("info", "BP-774 moisture 14.1% — borderline quality threshold"), 2100),
      setTimeout(() => addAlert("success", "BP-902 on schedule — ETA 08:14"), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [addAlert]);

  // Live simulation
  useEffect(() => {
    const id = setInterval(() => {
      setTrucks(prev => prev.map(t => {
        if (t.status !== "EN_ROUTE") return t;
        const newFuel = Math.max(0, t.fuel - Math.random() * 0.12);
        const newSpeed = Math.max(15, Math.min(80, t.speed + (Math.random() - 0.5) * 5));
        const newMoisture = t.moisture != null ? +Math.max(8, Math.min(18, t.moisture + (Math.random() - 0.5) * 0.18)).toFixed(1) : null;
        return { ...t, fuel: newFuel, speed: newSpeed, moisture: newMoisture };
      }));
      setSparkData(prev => [...prev.slice(1), Math.random() * 30 + 65]);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Traffic layer toggle
  useEffect(() => {
    if (window.fleetMap && window.fleetMap.trafficLayer) {
      if (trafficOn) {
        window.fleetMap.trafficLayer.setMap(window.fleetMap.map);
      } else {
        window.fleetMap.trafficLayer.setMap(null);
      }
    }
  }, [trafficOn]);

  // Filter trucks
  const filteredTrucks = trucks.filter(t => 
    t.id.toLowerCase().includes(filterText.toLowerCase()) ||
    t.driver.toLowerCase().includes(filterText.toLowerCase()) ||
    t.dest.toLowerCase().includes(filterText.toLowerCase())
  );

  const selectedTruck = trucks.find(t => t.id === selectedTruckId);
  const activeTrucks = trucks.filter(t => t.status === "EN_ROUTE").length;
  const delayedTrucks = trucks.filter(t => t.status === "DELAYED").length;
  const totalBiomass = trucks.filter(t => t.cargo === "Sugarcane" || t.cargo === "Biomass").reduce((sum, t) => sum + t.weight, 0);

  // Load Google Maps with Routes
  const loadGoogleMaps = useCallback(() => {
    if (!gmapsKey || mapsLoaded) return;
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${gmapsKey}&libraries=places,traffic,directions`;
    script.async = true;
    script.onload = () => {
      setMapsLoaded(true);
      addAlert("success", "Google Maps loaded with route directions");
      
      // Initialize map after script loads
      setTimeout(() => {
        if (window.google && window.google.maps) {
          const mapElement = document.getElementById('google-map');
          if (mapElement) {
            const directionsService = new window.google.maps.DirectionsService();
            const directionsRenderer = new window.google.maps.DirectionsRenderer();
            
            const map = new window.google.maps.Map(mapElement, {
              center: { lat: 30.2097, lng: 74.9374 }, // Pan Carbo Green Fuel Limited Bathinda
              zoom: 12,
              mapTypeControl: true,
              streetViewControl: true,
              fullscreenControl: true
            });
            
            directionsRenderer.setMap(map);
            
            // Destinations around Bathinda (Biomass Plants and Collection Points)
            const destinations = [
              { name: "Bathinda Biomass Plant", address: "Bathinda Biomass Plant, Bathinda", lat: 30.2200, lng: 74.9500 },
              { name: "Guru Nanak Dev Thermal Plant", address: "GNDTP Bathinda, Bathinda", lat: 30.1800, lng: 74.9200 },
              { name: "Barnala Biomass Collection", address: "Barnala Biomass Collection Center", lat: 30.3800, lng: 75.5400 },
              { name: "Mansa Biomass Hub", address: "Mansa Biomass Hub, Mansa", lat: 29.9800, lng: 75.2000 },
              { name: "Faridkot Collection Point", address: "Faridkot Biomass Collection", lat: 30.6800, lng: 74.7600 }
            ];
            
            // Current location - Pan Carbo Green Fuel Limited Bathinda
            const currentLocation = { lat: 30.2097, lng: 74.9374 };
            
            // Add current location marker - Pan Carbo Green Fuel Limited
            new window.google.maps.Marker({
              position: currentLocation,
              map: map,
              title: "Pan Carbo Green Fuel Limited Bathinda",
              icon: {
                path: "M 0,0 C -3,-6 -3,-12 0,-18 C 3,-12 3,-6 0,0 z",
                fillColor: "#00F5FF",
                fillOpacity: 1,
                strokeColor: "#03050A",
                strokeWeight: 2,
                scale: 2
              },
              label: {
                text: "PCGFL",
                color: "#FFFFFF",
                fontWeight: "bold"
              }
            });
            
            // Add destination markers and calculate routes
            destinations.forEach((dest, index) => {
              // Add destination marker
              const destMarker = new window.google.maps.Marker({
                position: { lat: dest.lat, lng: dest.lng },
                map: map,
                title: dest.name,
                icon: {
                  path: "M -8,-8 L 8,-8 L 8,8 L -8,8 z",
                  fillColor: "#FFD700",
                  fillOpacity: 1,
                  strokeColor: "#03050A",
                  strokeWeight: 2,
                  scale: 2
                },
                label: {
                  text: `${index + 1}`,
                  color: "#000000",
                  fontWeight: "bold"
                }
              });
              
              // Calculate and display route
              directionsService.route({
                origin: currentLocation,
                destination: { lat: dest.lat, lng: dest.lng },
                travelMode: window.google.maps.TravelMode.DRIVING,
                provideRouteAlternatives: true,
                optimizeWaypoints: false
              }, (response, status) => {
                if (status === 'OK') {
                  // Use different colors for different routes
                  const routeColors = ['#00FF88', '#FF8C42', '#00F5FF', '#FFD700'];
                  const routeColor = routeColors[index % routeColors.length];
                  
                  // Create custom renderer for this route
                  const routeRenderer = new window.google.maps.DirectionsRenderer({
                    map: map,
                    directions: response,
                    routeIndex: 0,
                    polylineOptions: {
                      strokeColor: routeColor,
                      strokeWeight: 4,
                      strokeOpacity: 0.8
                    },
                    markerOptions: {
                      visible: false // Hide default markers, we use custom ones
                    }
                  });
                  
                  // Add route info window
                  const route = response.routes[0];
                  const distance = route.legs[0].distance.text;
                  const duration = route.legs[0].duration.text;
                  
                  const infoWindow = new window.google.maps.InfoWindow({
                    content: `
                      <div style="color: #C8D8E8; font-family: 'Segoe UI', sans-serif; padding: 10px; min-width: 200px;">
                        <div style="font-weight: bold; color: ${routeColor}; margin-bottom: 8px; font-size: 14px;">
                          🏭 ${dest.name}
                        </div>
                        <div style="font-size: 12px; margin-bottom: 4px;"><strong>Distance:</strong> ${distance}</div>
                        <div style="font-size: 12px; margin-bottom: 4px;"><strong>Duration:</strong> ${duration}</div>
                        <div style="font-size: 12px; margin-bottom: 4px;"><strong>Route Type:</strong> Fastest</div>
                        <div style="font-size: 12px; color: #5A7090;">Click for alternative routes</div>
                      </div>
                    `
                  });
                  
                  destMarker.addListener('click', () => {
                    infoWindow.open(map, destMarker);
                  });
                }
              });
            });
            
            // Add traffic layer
            const trafficLayer = new window.google.maps.TrafficLayer();
            if (trafficOn) {
              trafficLayer.setMap(map);
            }
            
            // Store map instance
            window.fleetMap = { map, trafficLayer, directionsService, directionsRenderer };
          }
        }
      }, 500);
    };
    script.onerror = () => {
      addAlert("critical", "Failed to load Google Maps - check API key");
    };
    document.head.appendChild(script);
  }, [gmapsKey, mapsLoaded, addAlert, trafficOn]);

  // Real driver management functions
  const addDriver = useCallback(() => {
    console.log('Add Driver clicked!');
    console.log('Driver form data:', driverForm);
    
    if (!driverForm.name || !driverForm.license || !driverForm.phone) {
      console.log('Validation failed - missing required fields');
      addAlert("warning", "Please fill all required driver fields");
      return;
    }

    const newDriver = {
      id: driverForm.id || `DRV-${Date.now()}`,
      name: driverForm.name,
      license: driverForm.license,
      phone: driverForm.phone,
      experience: parseInt(driverForm.experience) || 0,
      baseSpeed: parseInt(driverForm.baseSpeed) || 60,
      rating: parseFloat(driverForm.rating) || 4.0,
      status: driverForm.status,
      assignedRoute: null,
      totalDeliveries: 0,
      onTimePerformance: 100,
      fuelEfficiency: 85,
      accidents: 0,
      joinedDate: new Date().toISOString()
    };

    console.log('New driver created:', newDriver);
    
    setDriverData(prev => {
      const updated = [...prev, newDriver];
      console.log('Updated driver data:', updated);
      return updated;
    });
    
    setDriverForm({
      id: '',
      name: '',
      license: '',
      phone: '',
      experience: '',
      baseSpeed: '',
      rating: '',
      status: 'AVAILABLE'
    });
    
    addAlert("success", `Driver ${newDriver.name} added successfully`);
    setModal(null); // Close modal after adding driver
  }, [driverForm, addAlert]);

  // OpenAI Analysis for driver performance
  const analyzeDriversWithAI = useCallback(async () => {
    if (!openaiKey || driverData.length === 0) {
      addAlert("warning", "OpenAI API key and drivers required for analysis");
      return;
    }

    setRouteLoading(true);
    try {
      const driverSummary = driverData.map(driver => ({
        name: driver.name,
        rating: driver.rating,
        experience: driver.experience,
        speed: driver.baseSpeed,
        status: driver.status,
        performance: driver.onTimePerformance,
        efficiency: driver.fuelEfficiency
      }));

      const weatherSummary = Object.entries(locationWeatherData).map(([location, weather]) => ({
        location,
        temperature: weather.temperature?.degrees,
        condition: weather.weatherCondition?.description?.text,
        humidity: weather.relativeHumidity,
        windSpeed: weather.wind?.speed?.value
      }));

      const prompt = `As a fleet logistics expert, analyze these drivers and weather conditions to provide optimal route assignments:

DRIVERS:
${JSON.stringify(driverSummary, null, 2)}

WEATHER CONDITIONS:
${JSON.stringify(weatherSummary, null, 2)}

Please provide:
1. Driver performance ranking (best to worst)
2. Optimal driver-route assignments based on weather
3. Risk assessment for each driver-route combination
4. Recommendations for route optimization
5. Expected delivery times and success rates

Respond in JSON format with detailed analysis.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1
        })
      });

      if (response.ok) {
        const result = await response.json();
        const analysis = JSON.parse(result.choices[0].message.content);
        setAiAnalysis(analysis);
        addAlert("success", "AI driver analysis completed");
      }
    } catch (error) {
      addAlert("error", "AI analysis failed - check OpenAI API key");
    } finally {
      setRouteLoading(false);
    }
  }, [openaiKey, driverData, locationWeatherData, addAlert]);

  // Assign driver to route based on AI analysis
  const assignDriverToRoute = useCallback((driver) => {
    const locations = Object.keys(locationWeatherData);
    if (locations.length === 0) {
      addAlert("warning", "Weather data not available for route assignment");
      return;
    }

    // Find best route based on driver rating, experience, and weather conditions
    const bestLocation = locations.reduce((best, location) => {
      const weather = locationWeatherData[location];
      const weatherScore = weather.weatherCondition?.type === 'CLEAR' ? 3 :
                          weather.weatherCondition?.type === 'CLOUDY' ? 2 : 1;
      
      const driverScore = (driver.rating * driver.experience * driver.onTimePerformance) / 100;
      const totalScore = weatherScore + driverScore;
      
      return totalScore > (best.score || 0) ? { location, score: totalScore } : best;
    }, {});

    // Update driver assignment
    setDriverData(prev => prev.map(d => 
      d.id === driver.id 
        ? { ...d, assignedRoute: bestLocation.location, status: 'ASSIGNED' }
        : d
    ));

    addAlert("success", `${driver.name} assigned to ${bestLocation.location} based on performance and weather analysis`);
  }, [locationWeatherData, addAlert]);

  // Real weather search with geocoding
  const searchWeatherByLocation = useCallback(async (locationName) => {
    if (!gmapsKey || !locationName.trim()) {
      addAlert("warning", "Google Maps API key and location name required");
      return;
    }

    setWeatherLoading(true);
    try {
      // First, geocode the location to get coordinates
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${gmapsKey}`
      );
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.results && geocodeData.results.length > 0) {
          const location = geocodeData.results[0];
          const { lat, lng } = location.geometry.location;
          const formattedAddress = location.formatted_address;
          
          // Now fetch weather for these coordinates
          const weatherResponse = await fetch(
            `https://weather.googleapis.com/v1/currentConditions:lookup?key=${gmapsKey}&location.latitude=${lat}&location.longitude=${lng}`
          );
          
          if (weatherResponse.ok) {
            const weatherData = await weatherResponse.json();
            
            const weatherResult = {
              location: formattedAddress,
              coordinates: { lat, lng },
              weather: weatherData,
              timestamp: new Date().toISOString()
            };
            
            setSearchedWeather(weatherResult);
            setCustomLocations(prev => [...prev, weatherResult]);
            addAlert("success", `Weather data retrieved for ${formattedAddress}`);
          } else {
            addAlert("error", "Weather API request failed");
          }
        } else {
          addAlert("warning", "Location not found. Try a more specific address.");
        }
      } else {
        addAlert("error", "Geocoding failed - check location name");
      }
    } catch (error) {
      console.error('Weather search error:', error);
      addAlert("error", "Weather search failed - try again");
    } finally {
      setWeatherLoading(false);
    }
  }, [gmapsKey, addAlert]);

  // Analyze weather conditions for route planning
  const analyzeWeatherForRoute = useCallback((weatherData) => {
    if (!weatherData) return { suitable: false, reason: 'No weather data' };
    
    const temp = weatherData.temperature?.degrees || 20;
    const windSpeed = weatherData.wind?.speed?.value || 0;
    const humidity = weatherData.relativeHumidity || 50;
    const condition = weatherData.weatherCondition?.type || 'CLEAR';
    
    let score = 100;
    let issues = [];
    
    // Temperature analysis
    if (temp < 5) {
      score -= 20;
      issues.push('Very cold - potential ice');
    } else if (temp > 35) {
      score -= 15;
      issues.push('Very hot - driver fatigue risk');
    } else if (temp < 10) {
      score -= 10;
      issues.push('Cold conditions');
    }
    
    // Wind analysis
    if (windSpeed > 50) {
      score -= 25;
      issues.push('High winds - dangerous for heavy vehicles');
    } else if (windSpeed > 30) {
      score -= 15;
      issues.push('Moderate winds');
    }
    
    // Humidity analysis
    if (humidity > 90) {
      score -= 10;
      issues.push('Very high humidity - reduced visibility');
    }
    
    // Weather condition analysis
    if (condition === 'RAIN') {
      score -= 30;
      issues.push('Rain - slippery roads, reduced visibility');
    } else if (condition === 'SNOW') {
      score -= 40;
      issues.push('Snow - hazardous driving conditions');
    } else if (condition === 'FOG') {
      score -= 35;
      issues.push('Fog - severely reduced visibility');
    }
    
    const suitable = score >= 60;
    const rating = suitable ? (score >= 80 ? 'Excellent' : score >= 70 ? 'Good' : 'Fair') : 'Poor';
    
    return {
      suitable,
      score,
      rating,
      issues,
      recommendation: suitable ? 
        'Route is suitable for travel' : 
        'Consider postponing or choosing alternative route'
    };
  }, []);

  // Optimize routes with real AI analysis
  const optimizeRoutes = useCallback(() => {
    if (!openaiKey) {
      addAlert("warning", "OpenAI API key required for route optimization");
      return;
    }
    
    if (driverData.length === 0) {
      addAlert("warning", "Add drivers first before optimizing routes");
      return;
    }
    
    // Run AI analysis first, then assign routes
    analyzeDriversWithAI();
    
    // Auto-assign available drivers to optimal routes
    setTimeout(() => {
      driverData.forEach(driver => {
        if (driver.status === 'AVAILABLE' && !driver.assignedRoute) {
          assignDriverToRoute(driver);
        }
      });
    }, 3000);
  }, [openaiKey, addAlert, driverData, analyzeDriversWithAI, assignDriverToRoute]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#03050A", position: "relative", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Global Styles */}
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 5px rgba(0,245,255,0.5) } 50% { box-shadow: 0 0 20px rgba(0,245,255,0.8) } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,245,255,0.3); border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 60, zIndex: 200,
        background: "rgba(8,12,22,0.95)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(0,245,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <h1 style={{ 
            color: "#00F5FF", margin: 0, fontSize: 20, fontWeight: 800,
            letterSpacing: "0.1em", textShadow: "0 0 20px rgba(0,245,255,0.6)"
          }}>
            FLEET LOGISTICS
          </h1>
          <div style={{ 
            padding: "6px 12px", 
            background: "rgba(0,245,255,0.1)", 
            borderRadius: "20px",
            fontSize: "12px", 
            color: "#00F5FF",
            border: "1px solid rgba(0,245,255,0.2)"
          }}>
            {liveTime}
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Weather Widget */}
          {weatherData && (
            <div style={{
              padding: "8px 16px",
              background: "rgba(0,245,255,0.05)",
              border: "1px solid rgba(0,245,255,0.2)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <div style={{
                fontSize: "20px",
                color: "#FFD700"
              }}>
                {weatherData.weatherCondition?.type === 'CLEAR' ? '☀️' : 
                 weatherData.weatherCondition?.type === 'CLOUDY' ? '☁️' :
                 weatherData.weatherCondition?.type === 'RAIN' ? '🌧️' : '🌤️'}
              </div>
              <div>
                <div style={{
                  color: "#C8D8E8",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}>
                  {weatherData.temperature?.degrees}°C
                </div>
                <div style={{
                  color: "#5A7090",
                  fontSize: "10px",
                  textTransform: "uppercase"
                }}>
                  {weatherData.weatherCondition?.description?.text || 'Clear'}
                </div>
              </div>
              <div style={{
                color: "#5A7090",
                fontSize: "10px",
                borderLeft: "1px solid rgba(0,245,255,0.2)",
                paddingLeft: "10px"
              }}>
                <div>💧 {weatherData.relativeHumidity}%</div>
                <div>💨 {weatherData.wind?.speed?.value} km/h</div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setModal("api")}
            style={{
              padding: "8px 16px",
              background: "rgba(0,245,255,0.1)",
              border: "1px solid rgba(0,245,255,0.3)",
              borderRadius: "6px",
              color: "#00F5FF",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold"
            }}
          >
            ⚙️ API
          </button>
          <button
            onClick={() => setModal("settings")}
            style={{
              padding: "8px 16px",
              background: "rgba(155,92,255,0.1)",
              border: "1px solid rgba(155,92,255,0.3)",
              borderRadius: "6px",
              color: "#9B5CFF",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold"
            }}
          >
            ⚙️ SETTINGS
          </button>
          <button
            onClick={optimizeRoutes}
            disabled={routeLoading}
            style={{
              padding: "8px 16px",
              background: routeLoading ? "rgba(90,112,144,0.2)" : "rgba(0,255,136,0.1)",
              border: routeLoading ? "1px solid rgba(90,112,144,0.3)" : "1px solid rgba(0,255,136,0.3)",
              borderRadius: "6px",
              color: routeLoading ? "#5A7090" : "#00FF88",
              cursor: routeLoading ? "not-allowed" : "pointer",
              fontSize: "12px",
              fontWeight: "bold"
            }}
          >
            {routeLoading ? "🔄 OPTIMIZING..." : "🤖 OPTIMIZE ROUTES"}
          </button>
        </div>
      </div>

      {/* Prominent Weather Section */}
      <div style={{
        position: "fixed", top: 70, left: 24, right: 24, height: 120, zIndex: 150,
        background: "linear-gradient(135deg, rgba(0,245,255,0.1) 0%, rgba(0,255,136,0.05) 100%)",
        border: "1px solid rgba(0,245,255,0.3)",
        borderRadius: "12px",
        padding: "20px",
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              fontSize: "48px",
              color: "#FFD700"
            }}>
              {weatherData?.weatherCondition?.type === 'CLEAR' ? '☀️' : 
               weatherData?.weatherCondition?.type === 'CLOUDY' ? '☁️' :
               weatherData?.weatherCondition?.type === 'RAIN' ? '🌧️' : '🌤️'}
            </div>
            <div>
              <div style={{
                color: "#00F5FF", 
                fontSize: "14px", 
                fontWeight: "bold", 
                marginBottom: "5px"
              }}>
                🌤️ PAN CARBO GREEN FUEL, BATHINDA - LIVE WEATHER
              </div>
              {weatherData ? (
                <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
                  <div style={{
                    color: "#C8D8E8",
                    fontSize: "28px",
                    fontWeight: "bold"
                  }}>
                    {weatherData.temperature?.degrees}°C
                  </div>
                  <div style={{
                    color: "#00FF88",
                    fontSize: "16px"
                  }}>
                    {weatherData.weatherCondition?.description?.text || 'Clear'}
                  </div>
                  <div style={{ display: "flex", gap: 20 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#5A7090", fontSize: "11px" }}>💧 HUMIDITY</div>
                      <div style={{ color: "#00F5FF", fontSize: "18px", fontWeight: "bold" }}>
                        {weatherData.relativeHumidity}%
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#5A7090", fontSize: "11px" }}>💨 WIND</div>
                      <div style={{ color: "#00FF88", fontSize: "18px", fontWeight: "bold" }}>
                        {weatherData.wind?.speed?.value} km/h
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#5A7090", fontSize: "11px" }}>👁️ VISIBILITY</div>
                      <div style={{ color: "#FFD700", fontSize: "18px", fontWeight: "bold" }}>
                        {weatherData.visibility?.distance} km
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: "#5A7090", fontSize: "16px" }}>
                  Loading weather data for Bathinda...
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={async () => {
              if (gmapsKey) {
                try {
                  // Refresh all weather data for all locations
                  const locations = [
                    { name: 'Pan Carbo Green Fuel', lat: 30.2097, lng: 74.9374 },
                    { name: 'Bathinda Biomass Plant', lat: 30.2200, lng: 74.9500 },
                    { name: 'Guru Nanak Dev Thermal Plant', lat: 30.1800, lng: 74.9200 },
                    { name: 'Barnala Biomass Collection', lat: 30.3800, lng: 75.5400 },
                    { name: 'Mansa Biomass Hub', lat: 29.9800, lng: 75.2000 },
                    { name: 'Faridkot Collection Point', lat: 30.6800, lng: 74.7600 }
                  ];

                  const weatherPromises = locations.map(async (location) => {
                    const response = await fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${gmapsKey}&location.latitude=${location.lat}&location.longitude=${location.lng}`);
                    if (response.ok) {
                      const weather = await response.json();
                      return { ...location, weather };
                    }
                    return null;
                  });

                  const weatherResults = await Promise.all(weatherPromises);
                  const weatherDataMap = {};
                  
                  weatherResults.forEach(result => {
                    if (result) {
                      weatherDataMap[result.name] = result.weather;
                      // Set main weather data for Pan Carbo Green Fuel
                      if (result.name === 'Pan Carbo Green Fuel') {
                        setWeatherData(result.weather);
                      }
                    }
                  });

                  setLocationWeatherData(weatherDataMap);
                  addAlert("success", "Weather data refreshed for all locations");
                } catch (error) {
                  console.error("Weather refresh error:", error);
                  addAlert("warning", "Weather refresh failed - try again");
                }
              }
            }}
            style={{
              padding: "8px 16px",
              background: "rgba(0,245,255,0.1)",
              border: "1px solid rgba(0,245,255,0.3)",
              borderRadius: "6px",
              color: "#00F5FF",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold"
            }}
          >
            🔄 REFRESH
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ paddingTop: 200, height: "100vh", overflow: "hidden" }}>
        <div style={{ display: "flex", height: "100%" }}>
          {/* Left Panel - Map */}
          <div style={{ flex: "0 0 60%", position: "relative", background: "rgba(8,12,22,0.5)" }}>
            <div style={{
              position: "absolute", top: 20, left: 20, zIndex: 10,
              background: "rgba(8,12,22,0.9)", padding: "10px 15px", borderRadius: "8px",
              border: "1px solid rgba(0,245,255,0.15)"
            }}>
              <div style={{ color: "#00F5FF", fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>
                🗺️ LIVE MAP
              </div>
              <div style={{ color: "#5A7090", fontSize: "11px" }}>
                {mapsLoaded ? "✓ Google Maps Active" : "⚠ Click API to load maps"}
              </div>
            </div>
            
            {/* Google Maps Container */}
            <div id="google-map" style={{
              width: "100%", height: "100%",
              background: "linear-gradient(135deg, #0a0e1a 0%, #1a2332 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#5A7090", fontSize: "14px", position: "relative"
            }}>
              {!mapsLoaded && (
                <div style={{ textAlign: "center", zIndex: 1 }}>
                  <div style={{ fontSize: "48px", marginBottom: "20px" }}>🗺️</div>
                  <div>Google Maps Integration</div>
                  <div style={{ fontSize: "12px", marginTop: "10px" }}>
                    Click "⚙️ API" to load Google Maps
                  </div>
                  <button
                    onClick={loadGoogleMaps}
                    style={{
                      marginTop: "20px",
                      padding: "10px 20px",
                      background: "rgba(0,245,255,0.1)",
                      border: "1px solid #00F5FF",
                      borderRadius: "6px",
                      color: "#00F5FF",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    Load Google Maps
                  </button>
                </div>
              )}
              {mapsLoaded && (
                <div style={{
                  position: "absolute", top: 60, right: 20, zIndex: 10,
                  background: "rgba(8,12,22,0.9)", padding: "10px 15px", borderRadius: "8px",
                  border: "1px solid rgba(0,245,255,0.15)"
                }}>
                  <button
                    onClick={() => setTrafficOn(!trafficOn)}
                    style={{
                      padding: "6px 12px",
                      background: trafficOn ? "rgba(255,68,102,0.1)" : "rgba(0,245,255,0.1)",
                      border: trafficOn ? "1px solid #FF4466" : "1px solid #00F5FF",
                      borderRadius: "4px",
                      color: trafficOn ? "#FF4466" : "#00F5FF",
                      cursor: "pointer",
                      fontSize: "11px"
                    }}
                  >
                    🚦 Traffic {trafficOn ? "ON" : "OFF"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Driver Analysis & Weather */}
          <div style={{ flex: "0 0 40%", background: "rgba(8,12,22,0.5)", borderLeft: "1px solid rgba(0,245,255,0.1)", overflow: "auto" }}>
            {/* Driver Management & Analysis */}
            <div style={{ padding: 20, borderBottom: "1px solid rgba(0,245,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                <div style={{ color: "#00F5FF", fontSize: "14px", fontWeight: "bold" }}>
                  🚛 DRIVER MANAGEMENT
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      console.log('Add Driver button clicked!');
                      setModal("driver");
                    }}
                    style={{
                      padding: "6px 12px",
                      background: "rgba(0,245,255,0.1)",
                      border: "1px solid rgba(0,245,255,0.3)",
                      borderRadius: "4px",
                      color: "#00F5FF",
                      cursor: "pointer",
                      fontSize: "10px"
                    }}
                  >
                    ➕ Add Driver
                  </button>
                  <button
                    onClick={() => {
                      console.log('AI Analysis button clicked!');
                      console.log('Current drivers:', driverData);
                      analyzeDriversWithAI();
                    }}
                    disabled={routeLoading || driverData.length === 0}
                    style={{
                      padding: "6px 12px",
                      background: routeLoading ? "rgba(90,112,144,0.2)" : "rgba(155,92,255,0.1)",
                      border: routeLoading ? "1px solid rgba(90,112,144,0.3)" : "1px solid rgba(155,92,255,0.3)",
                      borderRadius: "4px",
                      color: routeLoading ? "#5A7090" : "#9B5CFF",
                      cursor: routeLoading ? "not-allowed" : "pointer",
                      fontSize: "10px"
                    }}
                  >
                    {routeLoading ? "🔄 Analyzing..." : "🤖 AI Analysis"}
                  </button>
                </div>
              </div>
              
              {/* Driver Performance Cards */}
              {driverData.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#5A7090",
                  fontSize: "12px"
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>👥</div>
                  <div>No drivers added yet</div>
                  <div style={{ fontSize: "10px", marginTop: "5px" }}>Click "Add Driver" to get started</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {driverData.map(driver => {
                    const driverWeather = locationWeatherData[driver.assignedRoute] || null;
                    
                    return (
                      <div key={driver.id} style={{
                        padding: "12px",
                        background: driver.status === 'ASSIGNED' ? "rgba(0,255,136,0.05)" :
                                   driver.status === 'AVAILABLE' ? "rgba(0,245,255,0.05)" :
                                   "rgba(90,112,144,0.05)",
                        border: `1px solid ${driver.status === 'ASSIGNED' ? 'rgba(0,255,136,0.2)' :
                                        driver.status === 'AVAILABLE' ? 'rgba(0,245,255,0.2)' :
                                        'rgba(90,112,144,0.2)'}`,
                        borderRadius: "8px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div>
                            <div style={{ color: "#C8D8E8", fontSize: "12px", fontWeight: "bold" }}>
                              {driver.id} - {driver.name}
                            </div>
                            <div style={{ color: "#5A7090", fontSize: "9px" }}>
                              📞 {driver.phone} | 📋 {driver.license}
                            </div>
                            <div style={{ color: "#5A7090", fontSize: "9px" }}>
                              Experience: {driver.experience} years | 🚚 {driver.totalDeliveries} deliveries
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ color: "#FFD700", fontSize: "14px", fontWeight: "bold" }}>
                              ⭐ {driver.rating}
                            </div>
                            <div style={{ color: "#5A7090", fontSize: "9px" }}>
                              {driver.baseSpeed} km/h | ⛽ {driver.fuelEfficiency}%
                            </div>
                            <div style={{ color: driver.onTimePerformance >= 90 ? "#00FF88" : "#FF8C42", fontSize: "9px" }}>
                              On-time: {driver.onTimePerformance}%
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <span style={{
                              padding: "2px 6px",
                              background: driver.status === 'ASSIGNED' ? "rgba(0,255,136,0.1)" :
                                         driver.status === 'AVAILABLE' ? "rgba(0,245,255,0.1)" :
                                         "rgba(90,112,144,0.1)",
                              color: driver.status === 'ASSIGNED' ? "#00FF88" :
                                     driver.status === 'AVAILABLE' ? "#00F5FF" :
                                     "#5A7090",
                              borderRadius: "4px",
                              fontSize: "8px",
                              fontWeight: "bold"
                            }}>
                              {driver.status}
                            </span>
                            {driver.assignedRoute && (
                              <span style={{
                                padding: "2px 6px",
                                background: "rgba(255,215,0,0.1)",
                                color: "#FFD700",
                                borderRadius: "4px",
                                fontSize: "8px"
                              }}>
                                📍 {driver.assignedRoute}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => assignDriverToRoute(driver)}
                            disabled={driver.status === 'ASSIGNED'}
                            style={{
                              padding: "4px 8px",
                              background: driver.status === 'ASSIGNED' ? "rgba(90,112,144,0.1)" : "rgba(155,92,255,0.1)",
                              border: driver.status === 'ASSIGNED' ? "1px solid rgba(90,112,144,0.3)" : "1px solid rgba(155,92,255,0.3)",
                              borderRadius: "4px",
                              color: driver.status === 'ASSIGNED' ? "#5A7090" : "#9B5CFF",
                              cursor: driver.status === 'ASSIGNED' ? "not-allowed" : "pointer",
                              fontSize: "8px"
                            }}
                          >
                            {driver.status === 'ASSIGNED' ? 'Assigned' : 'Assign Route'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <div style={{ padding: 20, borderBottom: "1px solid rgba(0,245,255,0.1)" }}>
                <div style={{ color: "#9B5CFF", fontSize: "14px", fontWeight: "bold", marginBottom: 15 }}>
                  🤖 AI ANALYSIS RESULTS
                </div>
                
                {/* Driver Performance Ranking */}
                <div style={{ marginBottom: 15 }}>
                  <div style={{ color: "#FFD700", fontSize: "12px", fontWeight: "bold", marginBottom: 8 }}>
                    🏆 DRIVER PERFORMANCE RANKING
                  </div>
                  {aiAnalysis.driverPerformanceRanking?.map((driver, index) => (
                    <div key={index} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px",
                      background: index === 0 ? "rgba(255,215,0,0.1)" : "rgba(155,92,255,0.05)",
                      border: `1px solid ${index === 0 ? "rgba(255,215,0,0.3)" : "rgba(155,92,255,0.2)"}`,
                      borderRadius: "6px",
                      marginBottom: "6px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          width: "24px",
                          height: "24px",
                          background: index === 0 ? "#FFD700" : "#9B5CFF",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          fontWeight: "bold",
                          color: "#000"
                        }}>
                          {driver.rank}
                        </span>
                        <span style={{ color: "#C8D8E8", fontSize: "11px", fontWeight: "bold" }}>
                          {driver.name}
                        </span>
                      </div>
                      <div style={{ color: "#00FF88", fontSize: "12px", fontWeight: "bold" }}>
                        {driver.performance}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* Route Assignments */}
                <div style={{ marginBottom: 15 }}>
                  <div style={{ color: "#00F5FF", fontSize: "12px", fontWeight: "bold", marginBottom: 8 }}>
                    📍 OPTIMAL ROUTE ASSIGNMENTS
                  </div>
                  {aiAnalysis.driverRouteAssignments?.map((assignment, index) => (
                    <div key={index} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px",
                      background: "rgba(0,245,255,0.05)",
                      border: "1px solid rgba(0,245,255,0.2)",
                      borderRadius: "6px",
                      marginBottom: "6px"
                    }}>
                      <span style={{ color: "#C8D8E8", fontSize: "11px" }}>
                        {assignment.driver}
                      </span>
                      <span style={{ color: "#00F5FF", fontSize: "11px", fontWeight: "bold" }}>
                        📍 {assignment.route}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Risk Assessment */}
                <div style={{ marginBottom: 15 }}>
                  <div style={{ color: "#FF8C42", fontSize: "12px", fontWeight: "bold", marginBottom: 8 }}>
                    ⚠️ RISK ASSESSMENT
                  </div>
                  {aiAnalysis.riskAssessment?.map((risk, index) => (
                    <div key={index} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px",
                      background: risk.risk === 'Low' ? "rgba(0,255,136,0.05)" : 
                                 risk.risk === 'Medium' ? "rgba(255,140,66,0.05)" : 
                                 "rgba(255,68,102,0.05)",
                      border: `1px solid ${risk.risk === 'Low' ? "rgba(0,255,136,0.2)" : 
                                      risk.risk === 'Medium' ? "rgba(255,140,66,0.2)" : 
                                      "rgba(255,68,102,0.2)"}`,
                      borderRadius: "6px",
                      marginBottom: "6px"
                    }}>
                      <span style={{ color: "#C8D8E8", fontSize: "11px" }}>
                        {risk.driver} → {risk.route}
                      </span>
                      <span style={{
                        color: risk.risk === 'Low' ? "#00FF88" : 
                               risk.risk === 'Medium' ? "#FF8C42" : "#FF4466",
                        fontSize: "10px",
                        fontWeight: "bold"
                      }}>
                        {risk.risk}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Expected Delivery Times */}
                <div style={{ marginBottom: 15 }}>
                  <div style={{ color: "#9B5CFF", fontSize: "12px", fontWeight: "bold", marginBottom: 8 }}>
                    ⏱️ EXPECTED DELIVERY PERFORMANCE
                  </div>
                  {aiAnalysis.expectedDeliveryTimesAndSuccessRates?.map((delivery, index) => (
                    <div key={index} style={{
                      padding: "8px",
                      background: "rgba(155,92,255,0.05)",
                      border: "1px solid rgba(155,92,255,0.2)",
                      borderRadius: "6px",
                      marginBottom: "6px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ color: "#C8D8E8", fontSize: "11px", fontWeight: "bold" }}>
                          {delivery.driver}
                        </span>
                        <span style={{ color: "#FFD700", fontSize: "11px", fontWeight: "bold" }}>
                          {delivery.expectedDeliveryTime}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#5A7090", fontSize: "9px" }}>
                          Success Rate
                        </span>
                        <span style={{ 
                          color: parseInt(delivery.successRate) >= 95 ? "#00FF88" : 
                                 parseInt(delivery.successRate) >= 90 ? "#FFD700" : "#FF8C42",
                          fontSize: "10px",
                          fontWeight: "bold"
                        }}>
                          {delivery.successRate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                {aiAnalysis.routeOptimizationRecommendations && (
                  <div>
                    <div style={{ color: "#00F5FF", fontSize: "12px", fontWeight: "bold", marginBottom: 8 }}>
                      💡 AI RECOMMENDATIONS
                    </div>
                    {aiAnalysis.routeOptimizationRecommendations?.map((rec, index) => (
                      <div key={index} style={{
                        padding: "10px",
                        background: "rgba(0,245,255,0.05)",
                        border: "1px solid rgba(0,245,255,0.2)",
                        borderRadius: "6px",
                        marginBottom: "6px"
                      }}>
                        <div style={{ color: "#FFD700", fontSize: "10px", fontWeight: "bold", marginBottom: 4 }}>
                          {rec.driver}
                        </div>
                        <div style={{ color: "#C8D8E8", fontSize: "10px" }}>
                          {rec.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Weather Search & Analysis */}
            <div style={{ padding: 20, borderBottom: "1px solid rgba(0,245,255,0.1)" }}>
              <div style={{ color: "#00F5FF", fontSize: "14px", fontWeight: "bold", marginBottom: 15 }}>
                🔍 WEATHER SEARCH & ROUTE ANALYSIS
              </div>
              
              {/* Search Interface */}
              <div style={{ marginBottom: 15 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    type="text"
                    placeholder="Search any location (city, address, landmark)"
                    value={weatherSearch}
                    onChange={(e) => setWeatherSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchWeatherByLocation(weatherSearch)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      background: "rgba(8,12,22,0.5)",
                      border: "1px solid rgba(0,245,255,0.2)",
                      borderRadius: "6px",
                      color: "#C8D8E8",
                      fontSize: "12px"
                    }}
                  />
                  <button
                    onClick={() => searchWeatherByLocation(weatherSearch)}
                    disabled={weatherLoading || !weatherSearch.trim()}
                    style={{
                      padding: "8px 16px",
                      background: weatherLoading ? "rgba(90,112,144,0.2)" : "rgba(0,245,255,0.1)",
                      border: weatherLoading ? "1px solid rgba(90,112,144,0.3)" : "1px solid rgba(0,245,255,0.3)",
                      borderRadius: "6px",
                      color: weatherLoading ? "#5A7090" : "#00F5FF",
                      cursor: weatherLoading ? "not-allowed" : "pointer",
                      fontSize: "11px"
                    }}
                  >
                    {weatherLoading ? "🔄 Searching..." : "🔍 Search"}
                  </button>
                </div>
              </div>

              {/* Current Search Result */}
              {searchedWeather && (
                <div style={{ marginBottom: 15 }}>
                  <div style={{ color: "#FFD700", fontSize: "12px", fontWeight: "bold", marginBottom: 8 }}>
                    📍 CURRENT SEARCH RESULT
                  </div>
                  <div style={{
                    padding: "12px",
                    background: "rgba(255,215,0,0.05)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    borderRadius: "8px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div>
                        <div style={{ color: "#C8D8E8", fontSize: "12px", fontWeight: "bold" }}>
                          {searchedWeather.location}
                        </div>
                        <div style={{ color: "#5A7090", fontSize: "9px" }}>
                          {searchedWeather.weather.weatherCondition?.description?.text || 'Unknown'}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "#FFD700", fontSize: "16px", fontWeight: "bold" }}>
                          {searchedWeather.weather.temperature?.degrees}°C
                        </div>
                        <div style={{ color: "#5A7090", fontSize: "9px" }}>
                          💧 {searchedWeather.weather.relativeHumidity}% 💨 {searchedWeather.weather.wind?.speed?.value}km/h
                        </div>
                      </div>
                    </div>
                    
                    {/* Route Analysis */}
                    {(() => {
                      const analysis = analyzeWeatherForRoute(searchedWeather.weather);
                      return (
                        <div style={{
                          padding: "8px",
                          background: analysis.suitable ? "rgba(0,255,136,0.05)" : "rgba(255,68,102,0.05)",
                          border: `1px solid ${analysis.suitable ? "rgba(0,255,136,0.2)" : "rgba(255,68,102,0.2)"}`,
                          borderRadius: "6px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ color: "#C8D8E8", fontSize: "10px", fontWeight: "bold" }}>
                              Route Suitability
                            </span>
                            <span style={{
                              color: analysis.suitable ? "#00FF88" : "#FF4466",
                              fontSize: "10px",
                              fontWeight: "bold"
                            }}>
                              {analysis.rating} ({analysis.score}/100)
                            </span>
                          </div>
                          <div style={{ color: "#5A7090", fontSize: "9px", marginBottom: 4 }}>
                            {analysis.recommendation}
                          </div>
                          {analysis.issues.length > 0 && (
                            <div style={{ color: "#FF8C42", fontSize: "8px" }}>
                              ⚠️ {analysis.issues.join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Custom Locations History */}
              {customLocations.length > 0 && (
                <div style={{ marginBottom: 15 }}>
                  <div style={{ color: "#9B5CFF", fontSize: "12px", fontWeight: "bold", marginBottom: 8 }}>
                    📋 SEARCHED LOCATIONS
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {customLocations.slice(-3).reverse().map((location, index) => {
                      const analysis = analyzeWeatherForRoute(location.weather);
                      return (
                        <div key={index} style={{
                          padding: "8px",
                          background: "rgba(155,92,255,0.05)",
                          border: "1px solid rgba(155,92,255,0.2)",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                        onClick={() => setSearchedWeather(location)}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ color: "#C8D8E8", fontSize: "10px", fontWeight: "bold" }}>
                                {location.location.length > 25 ? location.location.substring(0, 25) + '...' : location.location}
                              </div>
                              <div style={{ color: "#5A7090", fontSize: "8px" }}>
                                {location.weather.temperature?.degrees}°C • {analysis.rating}
                              </div>
                            </div>
                            <span style={{
                              color: analysis.suitable ? "#00FF88" : "#FF8C42",
                              fontSize: "8px",
                              fontWeight: "bold"
                            }}>
                              {analysis.score}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Weather for All Locations */}
            <div style={{ padding: 20, borderBottom: "1px solid rgba(0,245,255,0.1)" }}>
              <div style={{ color: "#00F5FF", fontSize: "14px", fontWeight: "bold", marginBottom: 15 }}>
                🌤️ PLANT LOCATIONS WEATHER
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(locationWeatherData).map(([locationName, weather]) => {
                  const analysis = analyzeWeatherForRoute(weather);
                  return (
                    <div key={locationName} style={{
                      padding: "10px",
                      background: "rgba(0,245,255,0.03)",
                      border: "1px solid rgba(0,245,255,0.1)",
                      borderRadius: "6px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div>
                          <div style={{ color: "#C8D8E8", fontSize: "11px", fontWeight: "bold" }}>
                            {locationName}
                          </div>
                          <div style={{ color: "#5A7090", fontSize: "9px" }}>
                            {weather.weatherCondition?.description?.text || 'Unknown'}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "#FFD700", fontSize: "14px", fontWeight: "bold" }}>
                            {weather.temperature?.degrees}°C
                          </div>
                          <div style={{ color: "#5A7090", fontSize: "9px" }}>
                            💧 {weather.relativeHumidity}% 💨 {weather.wind?.speed?.value}km/h
                          </div>
                        </div>
                      </div>
                      <div style={{
                        padding: "4px 6px",
                        background: analysis.suitable ? "rgba(0,255,136,0.05)" : "rgba(255,68,102,0.05)",
                        border: `1px solid ${analysis.suitable ? "rgba(0,255,136,0.2)" : "rgba(255,68,102,0.2)"}`,
                        borderRadius: "4px",
                        marginTop: "4px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#5A7090", fontSize: "8px" }}>
                            Route Status
                          </span>
                          <span style={{
                            color: analysis.suitable ? "#00FF88" : "#FF8C42",
                            fontSize: "8px",
                            fontWeight: "bold"
                          }}>
                            {analysis.rating} ({analysis.score}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metrics */}
            <div style={{ padding: 20, borderBottom: "1px solid rgba(0,245,255,0.1)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: "#00FF88" }}>{activeTrucks}</div>
                  <div style={{ fontSize: 11, color: "#5A7090" }}>ACTIVE</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: "#FF8C42" }}>{delayedTrucks}</div>
                  <div style={{ fontSize: 11, color: "#5A7090" }}>DELAYED</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: "#9B5CFF" }}>{totalBiomass.toFixed(1)}T</div>
                  <div style={{ fontSize: 11, color: "#5A7090" }}>BIOMASS</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: "#FFD700" }}>{alerts.length}</div>
                  <div style={{ fontSize: 11, color: "#5A7090" }}>ALERTS</div>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div style={{ padding: "15px 20px", borderBottom: "1px solid rgba(0,245,255,0.1)" }}>
              <input
                type="text"
                placeholder="🔍 Search trucks, drivers, destinations..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 15px",
                  background: "rgba(0,245,255,0.05)",
                  border: "1px solid rgba(0,245,255,0.2)",
                  borderRadius: "6px",
                  color: "#C8D8E8",
                  fontSize: "13px",
                  outline: "none"
                }}
              />
            </div>

            {/* Truck List */}
            <div style={{ padding: "20px" }}>
              <h3 style={{ color: "#00F5FF", margin: "0 0 15px 0", fontSize: "14px" }}>UNIT MANIFEST</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredTrucks.map(truck => (
                  <div
                    key={truck.id}
                    onClick={() => {
                      setSelectedTruckId(truck.id);
                      setDrawerOpen(true);
                    }}
                    style={{
                      padding: "12px",
                      background: selectedTruckId === truck.id ? "rgba(0,245,255,0.1)" : "rgba(0,245,255,0.02)",
                      border: `1px solid ${selectedTruckId === truck.id ? "#00F5FF" : "rgba(0,245,255,0.1)"}`,
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ color: "#00F5FF", fontWeight: "bold", fontSize: "13px" }}>{truck.id}</span>
                      <StatusBadge status={truck.status} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "11px", color: "#C8D8E8" }}>
                      <div><span style={{ color: "#5A7090" }}>Driver:</span> {truck.driver}</div>
                      <div><span style={{ color: "#5A7090" }}>Dest:</span> {truck.dest}</div>
                      <div><span style={{ color: "#5A7090" }}>ETA:</span> {truck.eta}</div>
                      <div><span style={{ color: "#5A7090" }}>Fuel:</span> {truck.fuel.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Truck Details Drawer */}
      {drawerOpen && selectedTruck && (
        <div style={{
          position: "fixed", top: 60, right: 0, width: 350, height: "calc(100vh - 60px)", zIndex: 300,
          background: "rgba(8,12,22,0.98)", borderLeft: "1px solid rgba(0,245,255,0.15)",
          padding: "20px", overflow: "auto"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ color: "#00F5FF", margin: 0, fontSize: "16px" }}>{selectedTruck.id}</h3>
            <button
              onClick={() => setDrawerOpen(false)}
              style={{
                background: "transparent", border: "none", color: "#5A7090",
                cursor: "pointer", fontSize: "20px", padding: 0
              }}
            >
              ×
            </button>
          </div>
          
          <StatusBadge status={selectedTruck.status} />
          
          <div style={{ marginTop: 20, display: "grid", gap: 15 }}>
            <div>
              <div style={{ color: "#5A7090", fontSize: "11px", marginBottom: "5px" }}>DRIVER</div>
              <div style={{ color: "#C8D8E8", fontSize: "14px", fontWeight: "bold" }}>{selectedTruck.driver}</div>
            </div>
            <div>
              <div style={{ color: "#5A7090", fontSize: "11px", marginBottom: "5px" }}>DESTINATION</div>
              <div style={{ color: "#C8D8E8", fontSize: "14px", fontWeight: "bold" }}>{selectedTruck.dest}</div>
            </div>
            <div>
              <div style={{ color: "#5A7090", fontSize: "11px", marginBottom: "5px" }}>ROUTE</div>
              <div style={{ color: "#C8D8E8", fontSize: "14px", fontWeight: "bold" }}>{selectedTruck.route}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
              <div>
                <div style={{ color: "#5A7090", fontSize: "11px", marginBottom: "5px" }}>SPEED</div>
                <div style={{ color: "#00FF88", fontSize: "16px", fontWeight: "bold" }}>{selectedTruck.speed} km/h</div>
              </div>
              <div>
                <div style={{ color: "#5A7090", fontSize: "11px", marginBottom: "5px" }}>FUEL</div>
                <div style={{ color: selectedTruck.fuel > 50 ? "#00FF88" : "#FF8C42", fontSize: "16px", fontWeight: "bold" }}>
                  {selectedTruck.fuel.toFixed(1)}%
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
              <div>
                <div style={{ color: "#5A7090", fontSize: "11px", marginBottom: "5px" }}>CARGO</div>
                <div style={{ color: "#C8D8E8", fontSize: "14px", fontWeight: "bold" }}>{selectedTruck.cargo}</div>
              </div>
              <div>
                <div style={{ color: "#5A7090", fontSize: "11px", marginBottom: "5px" }}>WEIGHT</div>
                <div style={{ color: "#C8D8E8", fontSize: "14px", fontWeight: "bold" }}>{selectedTruck.weight}T</div>
              </div>
            </div>
            <div>
              <div style={{ color: "#5A7090", fontSize: "11px", marginBottom: "5px" }}>COORDINATES</div>
              <div style={{ color: "#C8D8E8", fontSize: "12px", fontFamily: "monospace" }}>
                {selectedTruck.lat.toFixed(3)}, {selectedTruck.lng.toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Configuration Modal */}
      <Modal
        open={modal === "api"}
        onClose={() => setModal(null)}
        title="🔧 API_CONFIGURATION & SERVICES"
        footer={
          <>
            <button
              onClick={async () => {
                setGmapsKey(gmapsKeyInput);
                setOpenaiKey(openaiKeyInput);
                await checkApiServices();
                loadGoogleMaps();
                addAlert("success", "API keys updated and services checked");
              }}
              style={{
                padding: "10px 20px",
                background: "rgba(0,245,255,0.1)",
                border: "1px solid #00F5FF",
                borderRadius: "6px",
                color: "#00F5FF",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              CHECK & SAVE
            </button>
            <button
              onClick={() => setModal(null)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "1px solid #5A7090",
                borderRadius: "6px",
                color: "#5A7090",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              CLOSE
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Google Maps API */}
          <div>
            <div style={{ color: "#9B5CFF", fontSize: "14px", fontWeight: "bold", marginBottom: 10 }}>
              🗺️ Google Maps API Key
            </div>
            <div style={{ color: apiServices.maps.status === 'active' ? "#00FF88" : "#FF8C42", fontSize: "12px", marginBottom: 10 }}>
              {apiServices.maps.status === 'active' ? '✓ Active & Working' : 
               apiServices.maps.status === 'error' ? '✗ API Error' : 
               apiServices.maps.status === 'unknown' ? '⚠ Not Checked' : '○ Configure & Check'}
            </div>
            <input
              type="text"
              value={gmapsKeyInput}
              onChange={(e) => setGmapsKeyInput(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                background: "rgba(0,245,255,0.05)",
                border: "1px solid rgba(0,245,255,0.2)",
                borderRadius: "6px",
                color: "#C8D8E8",
                fontSize: "12px"
              }}
            />
            <div style={{ color: "#5A7090", fontSize: "11px", marginTop: 5 }}>
              Enables live Google Maps with traffic, street view & route calculation
            </div>
          </div>

          {/* OpenAI API */}
          <div>
            <div style={{ color: "#9B5CFF", fontSize: "14px", fontWeight: "bold", marginBottom: 10 }}>
              🤖 OpenAI API Key
            </div>
            <div style={{ color: apiServices.openai.status === 'configured' ? "#00FF88" : "#FF8C42", fontSize: "12px", marginBottom: 10 }}>
              {apiServices.openai.status === 'configured' ? '✓ Configured' : '⚠ Not Configured'}
            </div>
            <input
              type="text"
              value={openaiKeyInput}
              onChange={(e) => setOpenaiKeyInput(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                background: "rgba(155,92,255,0.05)",
                border: "1px solid rgba(155,92,255,0.2)",
                borderRadius: "6px",
                color: "#C8D8E8",
                fontSize: "12px"
              }}
            />
            <div style={{ color: "#5A7090", fontSize: "11px", marginTop: 5 }}>
              Powers AI route optimization, delay prediction & fleet intelligence chat
            </div>
          </div>

          {/* Service Status Grid */}
          <div>
            <div style={{ color: "#00F5FF", fontSize: "14px", fontWeight: "bold", marginBottom: 15 }}>
              📊 ALL GOOGLE API SERVICES STATUS (13 Services)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, maxHeight: "400px", overflow: "auto", paddingRight: "10px" }}>
              {/* Maps Service */}
              <div style={{
                padding: "10px",
                background: "rgba(0,245,255,0.05)",
                border: `1px solid ${apiServices.maps.status === 'active' ? '#00FF88' : 'rgba(0,245,255,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#00F5FF", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  🗺️ Maps
                </div>
                <div style={{ 
                  color: apiServices.maps.status === 'active' ? "#00FF88" : 
                         apiServices.maps.status === 'error' ? "#FF8C42" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.maps.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.maps.features.slice(0, 3).join(' • ')}
                </div>
              </div>

              {/* Places Service */}
              <div style={{
                padding: "10px",
                background: "rgba(155,92,255,0.05)",
                border: `1px solid ${apiServices.places.status === 'active' ? '#00FF88' : 'rgba(155,92,255,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#9B5CFF", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  📍 Places
                </div>
                <div style={{ 
                  color: apiServices.places.status === 'active' ? "#00FF88" : 
                         apiServices.places.status === 'error' ? "#FF8C42" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.places.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.places.features.slice(0, 3).join(' • ')}
                </div>
              </div>

              {/* Routes Service */}
              <div style={{
                padding: "10px",
                background: "rgba(0,255,136,0.05)",
                border: `1px solid ${apiServices.routes.status === 'active' ? '#00FF88' : 'rgba(0,255,136,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#00FF88", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  🛣️ Routes
                </div>
                <div style={{ 
                  color: apiServices.routes.status === 'active' ? "#00FF88" : 
                         apiServices.routes.status === 'error' ? "#FF8C42" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.routes.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.routes.features.slice(0, 3).join(' • ')}
                </div>
              </div>

              {/* Geocoding Service */}
              <div style={{
                padding: "10px",
                background: "rgba(255,140,66,0.05)",
                border: `1px solid ${apiServices.geocoding.status === 'active' ? '#00FF88' : 'rgba(255,140,66,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#FF8C42", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  🌍 Geocoding
                </div>
                <div style={{ 
                  color: apiServices.geocoding.status === 'active' ? "#00FF88" : 
                         apiServices.geocoding.status === 'error' ? "#FF8C42" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.geocoding.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.geocoding.features.slice(0, 3).join(' • ')}
                </div>
              </div>

              {/* Air Quality Service */}
              <div style={{
                padding: "10px",
                background: "rgba(0,245,255,0.05)",
                border: `1px solid ${apiServices.airQuality.status === 'active' ? '#00FF88' : 'rgba(0,245,255,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#00F5FF", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  🌬️ Air Quality
                </div>
                <div style={{ 
                  color: apiServices.airQuality.status === 'active' ? "#00FF88" : 
                         apiServices.airQuality.status === 'needs_key' ? "#FFD700" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.airQuality.status === 'needs_key' ? 'NEEDS KEY' : 
                   apiServices.airQuality.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.airQuality.features.slice(0, 3).join(' • ')}
                </div>
              </div>

              {/* Solar Service */}
              <div style={{
                padding: "10px",
                background: "rgba(255,215,0,0.05)",
                border: `1px solid ${apiServices.solar.status === 'active' ? '#00FF88' : 'rgba(255,215,0,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#FFD700", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  ☀️ Solar
                </div>
                <div style={{ 
                  color: apiServices.solar.status === 'active' ? "#00FF88" : 
                         apiServices.solar.status === 'needs_key' ? "#FFD700" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.solar.status === 'needs_key' ? 'NEEDS KEY' : 
                   apiServices.solar.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.solar.features.slice(0, 3).join(' • ')}
                </div>
              </div>

              {/* Pollen Service */}
              <div style={{
                padding: "10px",
                background: "rgba(255,140,66,0.05)",
                border: `1px solid ${apiServices.pollen.status === 'active' ? '#00FF88' : 'rgba(255,140,66,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#FF8C42", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  🌻 Pollen
                </div>
                <div style={{ 
                  color: apiServices.pollen.status === 'active' ? "#00FF88" : 
                         apiServices.pollen.status === 'needs_key' ? "#FFD700" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.pollen.status === 'needs_key' ? 'NEEDS KEY' : 
                   apiServices.pollen.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.pollen.features.slice(0, 3).join(' • ')}
                </div>
              </div>

              {/* Maps 3D Service */}
              <div style={{
                padding: "10px",
                background: "rgba(155,92,255,0.05)",
                border: `1px solid ${apiServices.maps3D.status === 'active' ? '#00FF88' : 'rgba(155,92,255,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#9B5CFF", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  🏙️ Maps 3D
                </div>
                <div style={{ 
                  color: apiServices.maps3D.status === 'active' ? "#00FF88" : 
                         apiServices.maps3D.status === 'needs_key' ? "#FFD700" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.maps3D.status === 'needs_key' ? 'NEEDS KEY' : 
                   apiServices.maps3D.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.maps3D.features.slice(0, 3).join(' • ')}
                </div>
              </div>

              {/* Maps Datasets Service */}
              <div style={{
                padding: "10px",
                background: "rgba(0,245,255,0.05)",
                border: `1px solid ${apiServices.mapsDatasets.status === 'active' ? '#00FF88' : 'rgba(0,245,255,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#00F5FF", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  📊 Datasets
                </div>
                <div style={{ 
                  color: apiServices.mapsDatasets.status === 'active' ? "#00FF88" : 
                         apiServices.mapsDatasets.status === 'needs_key' ? "#FFD700" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.mapsDatasets.status === 'needs_key' ? 'NEEDS KEY' : 
                   apiServices.mapsDatasets.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.mapsDatasets.features.slice(0, 3).join(' • ')}
                </div>
              </div>

              {/* Map Tiles Service */}
              <div style={{
                padding: "10px",
                background: "rgba(0,255,136,0.05)",
                border: `1px solid ${apiServices.mapTiles.status === 'active' ? '#00FF88' : 'rgba(0,255,136,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#00FF88", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  🎯 Map Tiles
                </div>
                <div style={{ 
                  color: apiServices.mapTiles.status === 'active' ? "#00FF88" : 
                         apiServices.mapTiles.status === 'needs_key' ? "#FFD700" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.mapTiles.status === 'needs_key' ? 'NEEDS KEY' : 
                   apiServices.mapTiles.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.mapTiles.features.slice(0, 3).join(' • ')}
                </div>
              </div>

              {/* Street View Service */}
              <div style={{
                padding: "10px",
                background: "rgba(255,140,66,0.05)",
                border: `1px solid ${apiServices.streetView.status === 'active' ? '#00FF88' : 'rgba(255,140,66,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#FF8C42", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  📸 Street View
                </div>
                <div style={{ 
                  color: apiServices.streetView.status === 'active' ? "#00FF88" : 
                         apiServices.streetView.status === 'needs_key' ? "#FFD700" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.streetView.status === 'needs_key' ? 'NEEDS KEY' : 
                   apiServices.streetView.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.streetView.features.slice(0, 3).join(' • ')}
                </div>
              </div>

              {/* Maps Embed Service */}
              <div style={{
                padding: "10px",
                background: "rgba(155,92,255,0.05)",
                border: `1px solid ${apiServices.mapsEmbed.status === 'active' ? '#00FF88' : 'rgba(155,92,255,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#9B5CFF", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  🔗 Maps Embed
                </div>
                <div style={{ 
                  color: apiServices.mapsEmbed.status === 'active' ? "#00FF88" : 
                         apiServices.mapsEmbed.status === 'needs_key' ? "#FFD700" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.mapsEmbed.status === 'needs_key' ? 'NEEDS KEY' : 
                   apiServices.mapsEmbed.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.mapsEmbed.features.slice(0, 3).join(' • ')}
                </div>
              </div>

              {/* Weather Service */}
              <div style={{
                padding: "10px",
                background: "rgba(0,245,255,0.05)",
                border: `1px solid ${apiServices.weather.status === 'active' ? '#00FF88' : 'rgba(0,245,255,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#00F5FF", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  🌤️ Weather
                </div>
                <div style={{ 
                  color: apiServices.weather.status === 'active' ? "#00FF88" : 
                         apiServices.weather.status === 'needs_key' ? "#FFD700" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.weather.status === 'needs_key' ? 'NEEDS KEY' : 
                   apiServices.weather.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.weather.features.slice(0, 3).join(' • ')}
                </div>
              </div>

              {/* OpenAI Service */}
              <div style={{
                padding: "10px",
                background: "rgba(155,92,255,0.05)",
                border: `1px solid ${apiServices.openai.status === 'configured' ? '#00FF88' : 'rgba(155,92,255,0.2)'}`,
                borderRadius: "6px"
              }}>
                <div style={{ color: "#9B5CFF", fontSize: "11px", fontWeight: "bold", marginBottom: 4 }}>
                  🤖 OpenAI
                </div>
                <div style={{ 
                  color: apiServices.openai.status === 'configured' ? "#00FF88" : "#5A7090", 
                  fontSize: "10px", marginBottom: 6 
                }}>
                  {apiServices.openai.status.toUpperCase()}
                </div>
                <div style={{ fontSize: "9px", color: "#5A7090", lineHeight: "1.2" }}>
                  {apiServices.openai.features.slice(0, 3).join(' • ')}
                </div>
              </div>
            </div>
          </div>

          {/* Weather Data Display */}
          {weatherData && (
            <div>
              <div style={{ color: "#00F5FF", fontSize: "14px", fontWeight: "bold", marginBottom: 10 }}>
                🌤️ LIVE WEATHER DATA (Pan Carbo Green Fuel, Bathinda)
              </div>
              <div style={{
                padding: "20px",
                background: "rgba(0,245,255,0.05)",
                border: "1px solid rgba(0,245,255,0.2)",
                borderRadius: "8px"
              }}>
                {/* Current Conditions Header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "20px",
                  paddingBottom: "15px",
                  borderBottom: "1px solid rgba(0,245,255,0.1)"
                }}>
                  <div style={{
                    fontSize: "32px",
                    color: "#FFD700"
                  }}>
                    {weatherData.weatherCondition?.type === 'CLEAR' ? '☀️' : 
                     weatherData.weatherCondition?.type === 'CLOUDY' ? '☁️' :
                     weatherData.weatherCondition?.type === 'RAIN' ? '🌧️' : '🌤️'}
                  </div>
                  <div>
                    <div style={{
                      color: "#C8D8E8",
                      fontSize: "24px",
                      fontWeight: "bold"
                    }}>
                      {weatherData.temperature?.degrees}°C
                    </div>
                    <div style={{
                      color: "#00FF88",
                      fontSize: "14px",
                      textTransform: "uppercase"
                    }}>
                      {weatherData.weatherCondition?.description?.text || 'Clear'}
                    </div>
                    <div style={{
                      color: "#5A7090",
                      fontSize: "12px"
                    }}>
                      Feels like {weatherData.feelsLikeTemperature?.degrees}°C
                    </div>
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "15px"
                }}>
                  <div style={{
                    padding: "12px",
                    background: "rgba(0,245,255,0.03)",
                    borderRadius: "6px",
                    textAlign: "center"
                  }}>
                    <div style={{ color: "#5A7090", fontSize: "11px", marginBottom: "5px" }}>💧 HUMIDITY</div>
                    <div style={{ color: "#00F5FF", fontSize: "18px", fontWeight: "bold" }}>
                      {weatherData.relativeHumidity}%
                    </div>
                  </div>
                  
                  <div style={{
                    padding: "12px",
                    background: "rgba(0,255,136,0.03)",
                    borderRadius: "6px",
                    textAlign: "center"
                  }}>
                    <div style={{ color: "#5A7090", fontSize: "11px", marginBottom: "5px" }}>💨 WIND</div>
                    <div style={{ color: "#00FF88", fontSize: "18px", fontWeight: "bold" }}>
                      {weatherData.wind?.speed?.value} km/h
                    </div>
                    <div style={{ color: "#5A7090", fontSize: "10px" }}>
                      {weatherData.wind?.direction?.cardinal}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: "12px",
                    background: "rgba(255,215,0,0.03)",
                    borderRadius: "6px",
                    textAlign: "center"
                  }}>
                    <div style={{ color: "#5A7090", fontSize: "11px", marginBottom: "5px" }}>👁️ VISIBILITY</div>
                    <div style={{ color: "#FFD700", fontSize: "18px", fontWeight: "bold" }}>
                      {weatherData.visibility?.distance} km
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div style={{
                  marginTop: "15px",
                  padding: "12px",
                  background: "rgba(155,92,255,0.03)",
                  borderRadius: "6px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px"
                }}>
                  <div>
                    <div style={{ color: "#5A7090", fontSize: "11px" }}>🌡️ Today's Range</div>
                    <div style={{ color: "#C8D8E8", fontSize: "14px", fontWeight: "bold" }}>
                      H: {weatherData.currentConditionsHistory?.maxTemperature?.degrees}°C / 
                      L: {weatherData.currentConditionsHistory?.minTemperature?.degrees}°C
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#5A7090", fontSize: "11px" }}>🌀 Air Pressure</div>
                    <div style={{ color: "#C8D8E8", fontSize: "14px", fontWeight: "bold" }}>
                      {weatherData.airPressure?.meanSeaLevelMillibars} mb
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        open={modal === "settings"}
        onClose={() => setModal(null)}
        title="⚙️ SYSTEM_SETTINGS"
        footer={
          <>
            <button
              onClick={() => {
                setModal(null);
                addAlert("success", "Settings saved successfully");
              }}
              style={{
                padding: "10px 20px",
                background: "rgba(0,245,255,0.1)",
                border: "1px solid #00F5FF",
                borderRadius: "6px",
                color: "#00F5FF",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              SAVE
            </button>
            <button
              onClick={() => setModal(null)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "1px solid #5A7090",
                borderRadius: "6px",
                color: "#5A7090",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              CANCEL
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {[
            { key: "liveGps", label: "🛰️ Live GPS Tracking", desc: "Real-time position updates" },
            { key: "aiRoutes", label: "🤖 AI Route Optimization", desc: "Smart route suggestions" },
            { key: "realtimeAlerts", label: "🔔 Real-time Alerts", desc: "Instant notifications" },
            { key: "fuelMonitor", label: "⛽ Fuel Monitoring", desc: "Track fuel consumption" },
            { key: "traffic", label: "🚦 Traffic Layer", desc: "Show traffic on maps" }
          ].map(({ key, label, desc }) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#C8D8E8", fontSize: "13px", fontWeight: "bold" }}>{label}</div>
                <div style={{ color: "#5A7090", fontSize: "11px" }}>{desc}</div>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                style={{
                  width: "40px", height: "20px",
                  background: settings[key] ? "#00F5FF" : "#5A7090",
                  border: "none", borderRadius: "10px",
                  cursor: "pointer", position: "relative",
                  transition: "background 0.3s"
                }}
              >
                <div style={{
                  position: "absolute", top: "2px", left: settings[key] ? "20px" : "2px",
                  width: "16px", height: "16px", background: "#03050A", borderRadius: "50%",
                  transition: "left 0.3s"
                }} />
              </button>
            </div>
          ))}
        </div>
      </Modal>

      {/* Route Optimization Results Modal */}
      {routeResult && (
        <Modal
          open={!!routeResult}
          onClose={() => setRouteResult(null)}
          title="🤖 AI_ROUTE_OPTIMIZER"
          footer={
            <button
              onClick={() => setRouteResult(null)}
              style={{
                padding: "10px 20px",
                background: "rgba(155,92,255,0.1)",
                border: "1px solid #9B5CFF",
                borderRadius: "6px",
                color: "#9B5CFF",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              APPLY OPTIMIZATIONS
            </button>
          }
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15, marginBottom: 20 }}>
            <div style={{ textAlign: "center", padding: "15px", background: "rgba(0,245,255,0.05)", borderRadius: "8px" }}>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#00F5FF" }}>{routeResult.totalSavings}</div>
              <div style={{ fontSize: "11px", color: "#5A7090" }}>TOTAL SAVINGS</div>
            </div>
            <div style={{ textAlign: "center", padding: "15px", background: "rgba(0,255,136,0.05)", borderRadius: "8px" }}>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#00FF88" }}>{routeResult.fuelReduction}</div>
              <div style={{ fontSize: "11px", color: "#5A7090" }}>FUEL REDUCTION</div>
            </div>
            <div style={{ textAlign: "center", padding: "15px", background: "rgba(255,140,66,0.05)", borderRadius: "8px" }}>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#FF8C42" }}>{routeResult.timeReduction}</div>
              <div style={{ fontSize: "11px", color: "#5A7090" }}>TIME REDUCTION</div>
            </div>
          </div>
          
          <div>
            <div style={{ color: "#9B5CFF", fontSize: "14px", fontWeight: "bold", marginBottom: 10 }}>AI RECOMMENDATIONS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {routeResult.recommendations.map((rec, i) => (
                <div key={i} style={{
                  padding: "10px",
                  background: "rgba(155,92,255,0.05)",
                  border: "1px solid rgba(155,92,255,0.2)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#C8D8E8"
                }}>
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Driver Management Modal */}
      <Modal
        open={modal === "driver"}
        onClose={() => setModal(null)}
      >
        <div style={{ color: "#00F5FF", fontSize: "18px", fontWeight: "bold", marginBottom: 20 }}>
          👥 ADD NEW DRIVER
        </div>
          
          <div style={{ display: "grid", gap: 15 }}>
            <div>
              <label style={{ color: "#C8D8E8", fontSize: "12px", display: "block", marginBottom: 5 }}>
                Driver ID (Optional)
              </label>
              <input
                type="text"
                placeholder="Auto-generated if empty"
                value={driverForm.id}
                onChange={(e) => setDriverForm(prev => ({ ...prev, id: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(8,12,22,0.5)",
                  border: "1px solid rgba(0,245,255,0.2)",
                  borderRadius: "6px",
                  color: "#C8D8E8",
                  fontSize: "14px"
                }}
              />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
              <div>
                <label style={{ color: "#C8D8E8", fontSize: "12px", display: "block", marginBottom: 5 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter driver name"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "rgba(8,12,22,0.5)",
                    border: "1px solid rgba(0,245,255,0.2)",
                    borderRadius: "6px",
                    color: "#C8D8E8",
                    fontSize: "14px"
                  }}
                />
              </div>
              
              <div>
                <label style={{ color: "#C8D8E8", fontSize: "12px", display: "block", marginBottom: 5 }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "rgba(8,12,22,0.5)",
                    border: "1px solid rgba(0,245,255,0.2)",
                    borderRadius: "6px",
                    color: "#C8D8E8",
                    fontSize: "14px"
                  }}
                />
              </div>
            </div>
            
            <div>
              <label style={{ color: "#C8D8E8", fontSize: "12px", display: "block", marginBottom: 5 }}>
                License Number *
              </label>
              <input
                type="text"
                placeholder="DL-12AB3456"
                value={driverForm.license}
                onChange={(e) => setDriverForm(prev => ({ ...prev, license: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(8,12,22,0.5)",
                  border: "1px solid rgba(0,245,255,0.2)",
                  borderRadius: "6px",
                  color: "#C8D8E8",
                  fontSize: "14px"
                }}
              />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15 }}>
              <div>
                <label style={{ color: "#C8D8E8", fontSize: "12px", display: "block", marginBottom: 5 }}>
                  Experience (Years)
                </label>
                <input
                  type="number"
                  placeholder="5"
                  min="0"
                  max="50"
                  value={driverForm.experience}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, experience: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "rgba(8,12,22,0.5)",
                    border: "1px solid rgba(0,245,255,0.2)",
                    borderRadius: "6px",
                    color: "#C8D8E8",
                    fontSize: "14px"
                  }}
                />
              </div>
              
              <div>
                <label style={{ color: "#C8D8E8", fontSize: "12px", display: "block", marginBottom: 5 }}>
                  Base Speed (km/h)
                </label>
                <input
                  type="number"
                  placeholder="60"
                  min="30"
                  max="120"
                  value={driverForm.baseSpeed}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, baseSpeed: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "rgba(8,12,22,0.5)",
                    border: "1px solid rgba(0,245,255,0.2)",
                    borderRadius: "6px",
                    color: "#C8D8E8",
                    fontSize: "14px"
                  }}
                />
              </div>
              
              <div>
                <label style={{ color: "#C8D8E8", fontSize: "12px", display: "block", marginBottom: 5 }}>
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  placeholder="4.5"
                  min="1"
                  max="5"
                  step="0.1"
                  value={driverForm.rating}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, rating: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "rgba(8,12,22,0.5)",
                    border: "1px solid rgba(0,245,255,0.2)",
                    borderRadius: "6px",
                    color: "#C8D8E8",
                    fontSize: "14px"
                  }}
                />
              </div>
            </div>
            
            <div>
              <label style={{ color: "#C8D8E8", fontSize: "12px", display: "block", marginBottom: 5 }}>
                Initial Status
              </label>
              <select
                value={driverForm.status}
                onChange={(e) => setDriverForm(prev => ({ ...prev, status: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "rgba(8,12,22,0.5)",
                  border: "1px solid rgba(0,245,255,0.2)",
                  borderRadius: "6px",
                  color: "#C8D8E8",
                  fontSize: "14px"
                }}
              >
                <option value="AVAILABLE">Available</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TRAINING">Training</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              onClick={addDriver}
              style={{
                flex: 1,
                padding: "12px",
                background: "rgba(0,245,255,0.1)",
                border: "1px solid rgba(0,245,255,0.3)",
                borderRadius: "6px",
                color: "#00F5FF",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
              ➕ Add Driver
            </button>
            <button
              onClick={() => setModal(null)}
              style={{
                flex: 1,
                padding: "12px",
                background: "rgba(90,112,144,0.1)",
                border: "1px solid rgba(90,112,144,0.3)",
                borderRadius: "6px",
                color: "#5A7090",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Cancel
            </button>
          </div>
        </Modal>

      {/* Alerts Indicator */}
      {alerts.length > 0 && (
        <div style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 250
        }}>
          <button
            onClick={() => setModal("alerts")}
            style={{
              padding: "12px 20px",
              background: "rgba(255,68,102,0.1)",
              border: "1px solid rgba(255,68,102,0.3)",
              borderRadius: "8px",
              color: "#FF4466",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
              animation: "pulse 2s infinite"
            }}
          >
            🔔 {alerts.length} ALERTS
          </button>
        </div>
      )}

      {/* Alerts Modal */}
      <Modal
        open={modal === "alerts"}
        onClose={() => setModal(null)}
        title="🔔 ALL_SYSTEM_ALERTS"
        footer={
          <>
            <button
              onClick={() => {
                setAlerts([]);
                setModal(null);
              }}
              style={{
                padding: "10px 20px",
                background: "rgba(255,68,102,0.1)",
                border: "1px solid #FF4466",
                borderRadius: "6px",
                color: "#FF4466",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              CLEAR ALL
            </button>
            <button
              onClick={() => setModal(null)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "1px solid #5A7090",
                borderRadius: "6px",
                color: "#5A7090",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              CLOSE
            </button>
          </>
        }
      >
        {alerts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#5A7090", fontSize: "14px" }}>
            No alerts
          </div>
        ) : (
          <div style={{ maxHeight: "300px", overflow: "auto" }}>
            {alerts.map(alert => (
              <AlertItem key={alert.id} alert={alert} onDismiss={dismissAlert} />
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
