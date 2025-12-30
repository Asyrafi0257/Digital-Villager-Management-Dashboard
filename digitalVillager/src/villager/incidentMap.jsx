import React, { useEffect, useState } from "react";
import api from "../backend/api/apiClient";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import eventEmitter from "../backend/api/eventEmitter";
import style from "../villager/incidentMap.module.css";

// Custom marker icon creator
const createColoredIcon = (color, type) => {
  // Create SVG marker with custom color
  const svgIcon = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-${color}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path 
        d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" 
        fill="${color}" 
        filter="url(#shadow-${color})"
        stroke="white"
        stroke-width="2"
      />
      <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
      <text 
        x="16" 
        y="20" 
        text-anchor="middle" 
        font-size="14" 
        font-weight="bold" 
        fill="${color}"
      >
        ${getTypeEmoji(type)}
      </text>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42]
  });
};

// Get emoji for incident type
const getTypeEmoji = (type) => {
  const emojis = {
    flood: '💧',
    fire: '🔥',
    landslide: '⚠️',
    complaint: '📝',
    sos: '🆘'
  };
  return emojis[type] || '📍';
};

export default function IncidentMap() {
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch existing incidents from the server
    setLoading(true);
    api.get("/incidents_list.php")
      .then(res => {
        console.log("✅ Initial incidents loaded:", res.data);
        setIncidents(Array.isArray(res.data) ? res.data : []);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Error loading incidents:", err);
        console.error("📋 Error Details:");
        console.error("  Status:", err.response?.status);
        console.error("  Response Data:", err.response?.data);
        
        let errorMessage = "Failed to load existing incidents";
        if (err.response?.data?.error) {
          errorMessage += `: ${err.response.data.error}`;
        }
        
        setError(errorMessage);
        setIncidents([]);
        setLoading(false);
      });

    // Listen for new incidents
    const handleNewIncident = (incident) => {
      console.log("🔔 New incident received:", incident);
      
      if (!incident.latitude || !incident.longitude) {
        console.error("❌ Incident missing coordinates:", incident);
        return;
      }
      
      setIncidents((prevIncidents) => {
        const exists = prevIncidents.some(i => i.id === incident.id);
        if (exists) {
          console.log("⚠️ Incident already exists, skipping");
          return prevIncidents;
        }
        
        console.log("✅ Adding new incident to map");
        setError(null);
        return [...prevIncidents, incident];
      });
    };

    eventEmitter.on("incidentCreated", handleNewIncident);

    return () => {
      eventEmitter.off("incidentCreated", handleNewIncident);
    };
  }, []);

  // Color scheme for different statuses and types
  const getMarkerColor = (incident) => {
    // Priority 1: Status-based colors
    const statusColors = {
      critical: "#E53935",  // Red
      sos: "#C62828",       // Dark Red
      pending: "#FB8C00",   // Orange
      resolved: "#43A047",  // Green
      investigating: "#1E88E5" // Blue
    };

    // Priority 2: Type-based colors (if status doesn't match)
    const typeColors = {
      fire: "#FF5722",      // Deep Orange
      flood: "#2196F3",     // Blue
      landslide: "#795548", // Brown
      complaint: "#9E9E9E", // Grey
      sos: "#C62828"        // Dark Red
    };

    return statusColors[incident.status] || typeColors[incident.type] || "#607D8B";
  };

  // Filter out pending incidents AND ensure valid coordinates
  const validIncidents = incidents.filter(i => {
    // Skip pending status
    if (i.status === 'pending') {
      console.log("⏭️ Skipping pending incident:", i.id, i.title);
      return false;
    }
    
    // Check valid coordinates
    const lat = parseFloat(i.latitude);
    const lng = parseFloat(i.longitude);
    const isValid = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) > 0 && Math.abs(lng) > 0;
    
    if (!isValid) {
      console.warn("⚠️ Skipping invalid coordinates:", i.id);
    }
    
    return isValid;
  });

  // Count incidents by status for display
  const totalIncidents = incidents.length;
  const pendingCount = incidents.filter(i => i.status === 'pending').length;
  const displayedCount = validIncidents.length;

  return (
    <div className={style.parent}>
      <div className={style.container}>
        <h3 className={style.title}>
          🗺️ Emergency Alerts Map
        </h3>
        
        {/* Legend */}
        <div className={style.legend}>
          <div className={style.show}>Showing:</div>
          <div className={style.containCritical}>
            <span className={style.spanCritical}></span>
            <span>Critical/SOS</span>
          </div>
          <div className={style.invest}>
            <span className={style.spanInvest}></span>
            <span>Investigating</span>
          </div>
          <div className={style.resolve}>
            <span className={style.spanResolve}></span>
            <span>Resolved</span>
          </div>
          {/* <div className={style.hidden}>
            <span className={style.spanDisplay}>
              Displayed: {displayedCount}
            </span>
            {pendingCount > 0 && (
              <span className={style.spanHidden}>
                Hidden (Pending): {pendingCount}
              </span>
            )}
          </div> */}
        </div>

        {/* Info banner about pending incidents */}
        {/* {pendingCount > 0 && (
          <div className={style.containerPadding}>
            <span className={style.spanPendding}>ℹ️</span>
            <span>
              <strong>{pendingCount}</strong> pending incident{pendingCount !== 1 ? 's are' : ' is'} hidden from the map. 
              They will appear once their status changes to investigating, critical, or resolved.
            </span>
          </div>
        )} */}

        {loading && (
          <div className={style.loading}>
            🔄 Loading incidents...
          </div>
        )}

        {error && (
          <div className={style.warning}>
            <strong>⚠️ Warning:</strong> {error}
            <div className={style.warningText}>
              💡 New incidents you create will still appear on the map once approved!
            </div>
          </div>
        )}
      </div>
      
      <MapContainer 
        center={[6.118, 100.367]} 
        zoom={9} 
        className={style.mapContainer}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {validIncidents.length === 0 && !loading && (
          <div className={style.validIncident}>
            <div className={style.validEmoji}>📍</div>
            <div className={style.validNoActive}>
              No active incidents on map
            </div>
            <div className={style.containerCount}>
              {pendingCount > 0 
                ? `${pendingCount} pending incident${pendingCount !== 1 ? 's are' : ' is'} awaiting approval`
                : 'Submit a new incident to see it here once approved'
              }
            </div>
          </div>
        )}
        
        {validIncidents.map(i => {
          const markerColor = getMarkerColor(i);
          console.log(`📍 Rendering ${i.type} marker (${i.status}) with color:`, markerColor);
          
          return (
            <Marker 
              key={`incident-${i.id}-${i.created_at || Date.now()}`} 
              position={[parseFloat(i.latitude), parseFloat(i.longitude)]}
              icon={createColoredIcon(markerColor, i.type)}
            >
              <Popup>
                <div className={style.popupContainer}>
                  {/* Header with colored badge */}
                  <div 
                  className={style.headerContain}
                  style={{
                    background: `linear-gradient(135deg, ${markerColor}, ${markerColor}dd)` }}>
                    <span className={style.spanEmoji}>{getTypeEmoji(i.type)}</span>
                    <div>
                      <div className={style.typeContain}>
                        {i.type}
                      </div>
                      <div className={style.statusContain}>
                        {i.status}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className={style.containerTitle}>
                    <div className={style.title}>
                      {i.title}
                    </div>
                    
                    {i.description && (
                      <div className={style.description}>
                        {i.description}
                      </div>
                    )}
                    
                    {i.location && (
                      <div className={style.location}>
                        <span style={{ color: "#999" }}>📍</span>
                        <span style={{ color: "#555" }}>{i.location}</span>
                      </div>
                    )}
                    
                    {i.reporter_name && (
                      <div className={style.reporterName}>
                        <span style={{ color: "#999" }}>👤</span>
                        <span style={{ color: "#555" }}>{i.reporter_name}</span>
                      </div>
                    )}
                    
                    {i.reporter_phone && (
                      <div className={style.reporterPhone}>
                        <span style={{ color: "#999" }}>📞</span>
                        <span style={{ color: "#555" }}>{i.reporter_phone}</span>
                      </div>
                    )}
                    
                    {i.created_at && (
                      <div className={style.createdAt}>
                        <span>🕐</span>
                        {new Date(i.created_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Add custom CSS for marker animations */}
      <style>{`
        .custom-marker {
          animation: markerDrop 0.5s ease-out;
        }
        
        @keyframes markerDrop {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .custom-marker:hover {
          filter: brightness(1.1);
          transform: scale(1.1);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}