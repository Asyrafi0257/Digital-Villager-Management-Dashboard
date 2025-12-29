// src/components/IncidentForm.jsx
import React, { useState, useEffect } from "react";
import api from "../backend/api/apiClient";
import eventEmitter from "../backend/api/eventEmitter";
import styles from "./reportIncident.module.css";

export default function IncidentForm() {
  const [form, setForm] = useState({
    type: "flood",
    title: "",
    description: "",
    status: "pending",
    location: "",
    latitude: "",
    longitude: "",
    reporter_name: "",
    reporter_phone: "",
  });
  const [message, setMessage] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  // Auto-detect location on component mount
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("❌ Geolocation not supported by browser");
      return;
    }

    setLocationStatus("🔍 Getting your location...");
    
    // Request high accuracy location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        console.log("📍 Location detected:", {
          latitude,
          longitude,
          accuracy: `${accuracy.toFixed(0)}m`,
          timestamp: new Date(position.timestamp).toISOString()
        });
        
        setLocationAccuracy(accuracy);
        
        // Show accuracy info
        const accuracyText = accuracy < 50 
          ? "✅ High accuracy" 
          : accuracy < 200 
          ? "⚠️ Medium accuracy" 
          : "⚠️ Low accuracy";
        
        setLocationStatus(`🔍 Reverse geocoding... (${accuracyText}, ±${accuracy.toFixed(0)}m)`);
        
        try {
          // Try multiple geocoding services for better accuracy
          const placeName = await reverseGeocode(latitude, longitude);
          
          setForm(prev => ({
            ...prev,
            location: placeName,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }));
          
          setLocationStatus(`✅ Location detected (±${accuracy.toFixed(0)}m accuracy)`);
          
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setLocationStatus(`⚠️ Location detected but address lookup failed`);
          
          // Still set coordinates even if address lookup fails
          setForm(prev => ({
            ...prev,
            location: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }));
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        
        let errorMsg = "❌ Location error: ";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Permission denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Location unavailable. Try again.";
            break;
          case error.TIMEOUT:
            errorMsg += "Request timeout. Try again.";
            break;
          default:
            errorMsg += error.message;
        }
        setLocationStatus(errorMsg);
      },
      {
        enableHighAccuracy: true,  // Request GPS (more accurate but slower)
        timeout: 10000,            // 10 seconds timeout
        maximumAge: 0              // Don't use cached location
      }
    );
  };

  // Improved reverse geocoding with multiple services
  const reverseGeocode = async (lat, lon) => {
    console.log("🌍 Attempting reverse geocoding...");
    
    // Method 1: OpenStreetMap Nominatim (Primary)
    try {
      const osmResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'DisasterManagementApp/1.0'
          }
        }
      );
      
      if (!osmResponse.ok) throw new Error("OSM API failed");
      
      const osmData = await osmResponse.json();
      console.log("📍 OSM Response:", osmData);
      
      // Build detailed address from OSM
      const addr = osmData.address || {};
      
      // Priority order for location components
      const components = [
        addr.house_number,
        addr.road || addr.street,
        addr.suburb || addr.neighbourhood || addr.hamlet,
        addr.village || addr.town || addr.city || addr.municipality,
        addr.state_district || addr.county,
        addr.state
      ].filter(Boolean);
      
      if (components.length > 0) {
        const detailedAddress = components.slice(0, 3).join(", ");
        console.log("✅ Address found:", detailedAddress);
        return detailedAddress;
      }
      
      // Fallback to display_name
      if (osmData.display_name) {
        return osmData.display_name.split(",").slice(0, 3).join(",");
      }
    } catch (err) {
      console.warn("⚠️ OSM geocoding failed:", err);
    }
    
    // Method 2: BigDataCloud (Backup)
    try {
      console.log("🔄 Trying BigDataCloud...");
      const bdcResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      
      if (!bdcResponse.ok) throw new Error("BigDataCloud API failed");
      
      const bdcData = await bdcResponse.json();
      console.log("📍 BigDataCloud Response:", bdcData);
      
      const components = [
        bdcData.locality,
        bdcData.principalSubdivision,
        bdcData.countryName
      ].filter(Boolean);
      
      if (components.length > 0) {
        const address = components.join(", ");
        console.log("✅ Address found (BigDataCloud):", address);
        return address;
      }
    } catch (err) {
      console.warn("⚠️ BigDataCloud geocoding failed:", err);
    }
    
    // Method 3: Fallback to coordinates
    console.log("⚠️ All geocoding services failed, using coordinates");
    return `Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  };

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();

    // Validate required fields
    if (!form.title.trim()) {
      setMessage("Error: Title is required");
      return;
    }
    if (!form.type) {
      setMessage("Error: Incident type is required");
      return;
    }
    if (!form.latitude || !form.longitude) {
      setMessage("Error: Location is required. Please use Auto-Detect or enter coordinates.");
      return;
    }

    try {
      console.log("Sending form data:", form);
      const { data } = await api.post("/incidents_create.php", form);
      console.log("Response data:", data);
      
      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage(
          data.created ? `✅ Incident created #${data.id}` : "Failed to create"
        );
        
        // Emit event to refresh map with the new incident
        if (data.created) {
          const incidentData = {
            id: data.id,
            latitude: parseFloat(form.latitude),
            longitude: parseFloat(form.longitude),
            type: form.type,
            title: form.title,
            description: form.description,
            status: form.status,
            location: form.location,
            reporter_name: form.reporter_name,
            reporter_phone: form.reporter_phone,
            created_at: new Date().toISOString(),
          };
          console.log("✅ Emitting incident data:", incidentData);
          eventEmitter.emit("incidentCreated", incidentData);
        }
        
        // Reset form (but keep location for convenience)
        setForm({
          type: "flood",
          title: "",
          description: "",
          status: "pending",
          location: form.location,
          latitude: form.latitude,
          longitude: form.longitude,
          reporter_name: "",
          reporter_phone: "",
        });
      }
    } catch (error) {
      console.error("Submit error details:", error);
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const sos = async () => {
    // Get fresh location for SOS
    if (!form.latitude || !form.longitude) {
      setMessage("⚠️ Please enable location first!");
      getLocation();
      return;
    }
    
    try {
      const payload = {
        type: "sos",
        title: "🆘 SOS - Emergency Alert",
        description: "Immediate assistance required",
        status: "critical",
        location: form.location || "Emergency Location",
        latitude: form.latitude,
        longitude: form.longitude,
        reporter_name: form.reporter_name || "Anonymous",
        reporter_phone: form.reporter_phone || "Not provided",
      };
      
      console.log("🆘 Sending SOS:", payload);
      const { data } = await api.post("/incidents_create.php", payload);
      console.log("SOS response:", data);
      
      if (data.created) {
        setMessage(`🆘 SOS DISPATCHED (#${data.id}) - Help is on the way!`);
        
        // Emit event for SOS
        const sosData = {
          id: data.id,
          latitude: parseFloat(payload.latitude),
          longitude: parseFloat(payload.longitude),
          type: "sos",
          title: payload.title,
          description: payload.description,
          status: "critical",
          location: payload.location,
          reporter_name: payload.reporter_name,
          reporter_phone: payload.reporter_phone,
          created_at: new Date().toISOString(),
        };
        console.log("✅ Emitting SOS data:", sosData);
        eventEmitter.emit("incidentCreated", sosData);
      } else {
        setMessage("❌ SOS failed - Please try again!");
      }
    } catch (error) {
      console.error("SOS error:", error);
      setMessage("❌ Error sending SOS - Please try again!");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Report Incident</h2>
      
      {/* Location Accuracy Info */}
      {locationAccuracy && (
        <div style={{
          padding: "10px",
          background: locationAccuracy < 50 ? "#e8f5e9" : locationAccuracy < 200 ? "#fff3e0" : "#ffebee",
          border: `1px solid ${locationAccuracy < 50 ? "#4caf50" : locationAccuracy < 200 ? "#ff9800" : "#f44336"}`,
          borderRadius: "6px",
          marginBottom: "16px",
          fontSize: "13px"
        }}>
          <strong>📍 Location Accuracy:</strong> ±{locationAccuracy.toFixed(0)} meters
          {locationAccuracy > 100 && (
            <div style={{ marginTop: "4px", fontSize: "12px" }}>
              💡 Tip: Enable GPS and move to an open area for better accuracy
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={submit} className={styles.form}>
        <label className={styles.label}>Type</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="flood">Flood</option>
          <option value="fire">Fire</option>
          <option value="landslide">Landslide</option>
          <option value="complaint">Complaint</option>
        </select>

        <label className={styles.label}>Title *</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Brief description of incident"
          required
          className={styles.input}
        />

        <label className={styles.label}>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Detailed information about the incident"
          className={styles.textarea}
          rows="4"
        />

        <label className={styles.label}>Location *</label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Auto-detected address or enter manually"
            className={styles.input}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={getLocation}
            style={{
              padding: "8px 16px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              whiteSpace: "nowrap"
            }}
          >
            📍 Auto-Detect
          </button>
        </div>
        
        {locationStatus && (
          <p style={{ 
            fontSize: "12px", 
            color: locationStatus.includes("❌") || locationStatus.includes("⚠️") ? "#d32f2f" : "#388e3c", 
            marginTop: "-12px", 
            marginBottom: "12px",
            padding: "8px",
            background: locationStatus.includes("❌") || locationStatus.includes("⚠️") ? "#ffebee" : "#e8f5e9",
            borderRadius: "4px"
          }}>
            {locationStatus}
          </p>
        )}

        {/* Show coordinates (read-only, for debugging) */}
        {form.latitude && form.longitude && (
          <div style={{
            fontSize: "11px",
            color: "#666",
            marginTop: "-8px",
            marginBottom: "12px",
            fontFamily: "monospace"
          }}>
            Coordinates: {parseFloat(form.latitude).toFixed(6)}, {parseFloat(form.longitude).toFixed(6)}
          </div>
        )}

        <label className={styles.label}>Your Name</label>
        <input
          name="reporter_name"
          value={form.reporter_name}
          onChange={handleChange}
          placeholder="Your name (optional)"
          className={styles.input}
        />

        <label className={styles.label}>Phone Number</label>
        <input
          name="reporter_phone"
          value={form.reporter_phone}
          onChange={handleChange}
          placeholder="Contact number (optional)"
          className={styles.input}
          type="tel"
        />

        <button type="submit" className={styles.button}>
          📝 Submit Report
        </button>
      </form>
        <div className={styles.btn}>
           <button
            onClick={sos}
            className={styles.button}
            style={{ 
            background: "#c62828",
            fontSize: "16px",
            fontWeight: "bold",
            padding: "14px",
            }}
        >
            🆘 EMERGENCY SOS
      </button> 
        </div>
      

      {message && (
        <p
          className={
            message.includes("Error") || message.includes("Failed") || message.includes("❌")
              ? styles.error
              : styles.success
          }
        >
          {message}
        </p>
      )}
      
      {/* Help text */}
      <div style={{
        marginTop: "16px",
        padding: "12px",
        background: "#f5f5f5",
        borderRadius: "6px",
        fontSize: "12px",
        color: "#666",
        display:"flex",
        flexDirection:"column",
      }}>
        <strong>💡 Tips for accurate location:</strong>
        <ul style={{ marginTop: "6px", marginBottom: "0", paddingLeft: "20px" }}>
          <li>Allow location permission when prompted</li>
          <li>Enable GPS/Location Services on your device</li>
          <li>Move to an open area away from buildings</li>
          <li>Wait 5-10 seconds for GPS to stabilize</li>
          <li>Use WiFi + GPS for best results</li>
        </ul>
      </div>
    </div>
  );
}