import { useState, useEffect } from "react";
import api from "../backend/api/apiClient";


export default function DistrictOfficerDashboard() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [kampungSummary, setKampungSummary] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKampung, setFilterKampung] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("");
  const [notifySuccess, setNotifySuccess] = useState(false);

  useEffect(() => {
    fetchKampungSummary();
  }, []);

  const fetchKampungSummary = async () => {
    try {
      const { data } = await api.get("/incidents_summary_by_kampung.php");
      setKampungSummary(data);
    } catch (error) {
      console.error("Failed to fetch kampung summary", error);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data } = await api.get("get_all_incidents_for_district.php");
      setIncidents(data);
    } catch (error) {
      console.error("Failed to load incidents", error);
    }
  };

  const filteredIncidents = incidents
    .filter(i =>
      (!filterStatus || i.status === filterStatus) &&
      (!filterKampung || i.kampung?.toLowerCase().includes(filterKampung.toLowerCase()))
    )
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#ffffff",
      padding: "40px 24px",
      width:1280
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 16,
          padding: "32px 40px",
          marginBottom: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: 36, 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 800
          }}>
            🏛️ District Officer Dashboard
          </h1>
          <p style={{ 
            color: "#666", 
            margin: "8px 0 0 0",
            fontSize: 16
          }}>
            District‑level incident overview (read & assign only)
          </p>
        </div>

        {/* STATS (DYNAMIC) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <StatCard title="📋 Total Incidents" value={incidents.length} />
          <StatCard
            title="⏳ Pending"
            value={incidents.filter(i => i.status === "pending").length}
            gradient="linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)"
          />
          <StatCard
            title="🔄 In Progress"
            value={incidents.filter(i => i.status === "in_progress").length}
            gradient="linear-gradient(135deg, #29B6F6 0%, #039BE5 100%)"
          />
          <StatCard
            title="✅ Resolved"
            value={incidents.filter(i => i.status === "resolved").length}
            gradient="linear-gradient(135deg, #66BB6A 0%, #43A047 100%)"
          />
        </div>

        {/* SUMMARY BY KAMPUNG */}
        <section style={{ marginBottom: 32 }}>
          <div style={cardStyle}>
            <h2 style={cardTitle}>🏘️ Incident Summary by Kampung</h2>

            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                    <th style={thStyle}>Kampung</th>
                    <th style={thStyle}>Total Incidents</th>
                    <th style={thStyle}>Critical</th>
                    <th style={thStyle}>In Progress</th>
                    <th style={thStyle}>Resolved</th>
                  </tr>
                </thead>
                <tbody>
                  {kampungSummary.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: 24, color: "#999" }}>
                        No data available
                      </td>
                    </tr>
                  ) : (
                    kampungSummary.map((row, idx) => (
                      <tr 
                        key={row.kampung}
                        style={{
                          background: idx % 2 === 0 ? "#fafafa" : "white",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f0f0ff"}
                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fafafa" : "white"}
                      >
                        <td style={tdStyle}>{row.kampung}</td>
                        <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold" }}>{row.total_incidents}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>{row.critical}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>{row.in_progress}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>{row.resolved}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* LIST + DETAILS */}
        <section style={{ marginBottom: 32 }}>
          <div style={cardStyle}>
            <h2 style={cardTitle}>📝 Incident Reports</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 24,
                alignItems: "stretch",
              }}
            >
              {/* INCIDENT LIST */}
              <div>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <select onChange={e => setFilterStatus(e.target.value)} style={inputStyle}>
                    <option value="">🔍 All Status</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="in_progress">🔄 In Progress</option>
                    <option value="resolved">✅ Resolved</option>
                  </select>

                  <input
                    placeholder="🏘️ Filter by kampung"
                    onChange={e => setFilterKampung(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ 
                  border: "2px solid #e0e0e0", 
                  borderRadius: 12,
                  overflow: "hidden",
                  maxHeight: 500,
                  overflowY: "auto"
                }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Title</th>
                        <th style={thStyle}>Kampung</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIncidents.map((i, idx) => (
                        <tr
                          key={i.id}
                          onClick={() => setSelectedIncident(i)}
                          style={{
                            cursor: "pointer",
                            background: selectedIncident?.id === i.id ? "#f0f0ff" : (idx % 2 === 0 ? "#fafafa" : "white"),
                            transition: "all 0.2s ease"
                          }}
                          onMouseEnter={e => {
                            if (selectedIncident?.id !== i.id) {
                              e.currentTarget.style.background = "#f5f5ff";
                            }
                          }}
                          onMouseLeave={e => {
                            if (selectedIncident?.id !== i.id) {
                              e.currentTarget.style.background = idx % 2 === 0 ? "#fafafa" : "white";
                            }
                          }}
                        >
                          <td style={tdStyle}>{i.id}</td>
                          <td style={tdStyle}>{i.title}</td>
                          <td style={tdStyle}>{i.kampung}</td>
                          <td style={tdStyle}>{i.status}</td>
                          <td style={tdStyle}>{i.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DETAILS PANEL (RIGHT SIDE) */}
              <div
                style={{
                  border: "2px solid #e0e0e0",
                  borderRadius: 12,
                  padding: 24,
                  background: "linear-gradient(135deg, #f8f9ff 0%, #fafbff 100%)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
                }}
              >
                {!selectedIncident ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                    <p>Select an incident to view details</p>
                  </div>
                ) : (
                  <>
                    <h3 style={{ 
                      marginTop: 0,
                      fontSize: 20,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 700
                    }}>
                      📄 Incident Details
                    </h3>
                    <div>
                      <Detail label="Title" value={selectedIncident.title} />
                      <Detail label="Type" value={selectedIncident.type} />
                      <Detail label="Status" value={selectedIncident.status} />
                      <Detail label="Kampung" value={selectedIncident.kampung} />
                      <Detail label="Description" value={selectedIncident.description} />
                      <Detail label="Reported At" value={selectedIncident.created_at} />
                    </div>
                    

                    <hr style={{ margin: "20px 0", border: "none", borderTop: "2px solid #e0e0e0" }} />

                    <h4 style={{ fontSize: 16, marginBottom: 12, color: "#333" }}>🏢 Assign Agency</h4>
                    <select
                      style={inputStyle}
                      value={selectedAgency}
                      onChange={(e) => {
                        setSelectedAgency(e.target.value);
                        setNotifySuccess(false);
                      }}
                    >
                      <option value="">Select agency</option>
                      <option value="APM">APM</option>
                      <option value="JPAM">JPAM</option>
                      <option value="BOMBA">BOMBA</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Police">Police</option>
                    </select>

                    <button
                      style={{
                        ...primaryBtn,
                        opacity: !selectedAgency ? 0.5 : 1,
                        cursor: !selectedAgency ? "not-allowed" : "pointer"
                      }}
                      disabled={!selectedAgency}
                      onClick={() => setNotifySuccess(true)}
                    >
                      📢 Notify Agency
                    </button>

                    {notifySuccess && (
                      <div style={{ 
                        marginTop: 12,
                        padding: 12,
                        background: "#E8F5E9",
                        border: "2px solid #66BB6A",
                        borderRadius: 8,
                        color: "#2E7D32",
                        fontSize: 14,
                        fontWeight: 600
                      }}>
                        ✅ {selectedAgency} has been notified
                      </div>
                    )}

                    <p style={{ fontSize: 12, color: "#999", marginTop: 12, fontStyle: "italic" }}>
                      * District officer cannot change incident status
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", float:"right" }}>
            <button
              onClick={() => setSelectedIncident(null)}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                transition: "all 0.3s ease"
              }}
            >
              🔄 Reset Selection
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ===== Helpers ===== */

function StatCard({ title, value, gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }) {
  return (
    <div style={{
      background: gradient,
      borderRadius: 16,
      padding: 24,
      textAlign: "center",
      color: "white",
      boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
      transition: "transform 0.3s ease"
    }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, opacity: 0.9 }}>{title}</h3>
      <p style={{ 
        fontSize: 36, 
        fontWeight: 800, 
        margin: "12px 0 0 0" 
      }}>{value}</p>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <p style={{ margin: "10px 0", fontSize: 14, lineHeight: 1.6}}>
      <strong style={{ color: "#667eea", float:"left" }}>{label}:</strong>{" "}
      <span style={{ color: "#555" }}>{value || "-"}</span>
    </p>
  );
}

/* ===== Styles ===== */

const cardStyle = {
  background: "rgba(255,255,255,0.95)",
  borderRadius: 16,
  padding: 32,
  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  backdropFilter: "blur(10px)"
};

const cardTitle = {
  margin: "0 0 20px 0",
  fontSize: 22,
  fontWeight: 700,
  color: "#333"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14
};

const thStyle = {
  padding: "16px 20px",
  textAlign: "left",
  color: "white",
  fontWeight: 600,
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const tdStyle = {
  padding: "16px 20px",
  borderBottom: "1px solid #e0e0e0",
  color: "#333"
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 10,
  border: "2px solid #e0e0e0",
  marginBottom: 12,
  fontSize: 14,
  transition: "all 0.3s ease",
  outline: "none",
  fontFamily: "inherit"
};

const primaryBtn = {
  width: "100%",
  padding: "12px 16px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  marginTop: 4
};