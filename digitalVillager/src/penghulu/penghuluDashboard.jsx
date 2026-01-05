import React, { useState, useEffect } from "react";
import api from "../backend/api/apiClient";

export default function PenghuluDashboard() {
  const [stats, setStats] = useState({
    total_incidents: 0,
    total_complaints: 0,
    total_victims: 0,
    total_affected: 0,
    by_type: {},
    by_status: {},
    victims_by_type: {},
    victims_by_marital_status: {},
    recent: [],
    recent_victims: []
  });
  const [kampungList, setKampungList] = useState([]);
  const [selectedKampung, setSelectedKampung] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKampungList();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [selectedKampung]);

  const fetchKampungList = async () => {
    try {
      console.log("Fetching kampung list...");
      const { data } = await api.get("/get_kampung.php");
      console.log("Kampung list received:", data);
      setKampungList(data.kampungs || []);
    } catch (error) {
      console.error("Error fetching kampung list:", error.response?.data || error.message);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log("Fetching penghulu dashboard stats for kampung:", selectedKampung);
      const { data } = await api.get("/penghulu_dashboard.php", {
        params: { kampung: selectedKampung }
      });
      console.log("Penghulu Dashboard stats received:", data);
      setStats(data);
    } catch (error) {
      console.error("Error fetching penghulu dashboard stats:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const statsStyle = {
    container: {
      padding: 20,
      backgroundColor: "#ffffff",
      borderRadius: 8,
      marginBottom: 20,
      width: 1280,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      flexWrap: "wrap",
      gap: 15
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#333",
      margin: 0
    },
    badge: {
      padding: "8px 16px",
      backgroundColor: "#ffc107",
      color: "#333",
      borderRadius: 6,
      fontWeight: "bold",
      fontSize: "14px"
    },
    filterContainer: { 
      backgroundColor: "white", 
      padding: 20, 
      borderRadius: 8, 
      marginBottom: 20, 
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      display: "flex",
      alignItems: "center",
      gap: 15,
      flexWrap: "wrap"
    },
    filterLabel: { 
      fontSize: 16, 
      fontWeight: "bold", 
      color: "#333" 
    },
    select: {
      padding: "10px 15px",
      fontSize: 14,
      borderRadius: 6,
      border: "2px solid #ddd",
      backgroundColor: "white",
      cursor: "pointer",
      minWidth: 200,
      outline: "none"
    },
    clearButton: {
      padding: "8px 16px",
      backgroundColor: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 14,
      fontWeight: "500"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 20,
      marginBottom: 30
    },
    statCard: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      textAlign: "center"
    },
    statNumber: {
      fontSize: 36,
      fontWeight: "bold",
      color: "#007bff"
    },
    statLabel: {
      fontSize: 14,
      color: "#666",
      marginTop: 8
    },
    sectionsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: 20
    },
    section: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
      color: "#333"
    },
    listItem: {
      display: "flex",
      justifyContent: "space-between",
      padding: 10,
      borderBottom: "1px solid #eee",
      fontSize: 14
    },
    recentTable: {
      width: "100%",
      borderCollapse: "collapse"
    },
    tableHeader: {
      backgroundColor: "#f9f9f9",
      padding: 10,
      textAlign: "left",
      fontWeight: "bold",
      borderBottom: "2px solid #ddd",
      fontSize: "13px"
    },
    tableCell: {
      padding: 10,
      borderBottom: "1px solid #eee",
      fontSize: "13px"
    },
    statusBadge: {
      padding: "4px 8px",
      borderRadius: 4,
      fontSize: 12,
      fontWeight: "bold",
      color: "white"
    },
    twoColumnGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20,
      marginTop: 20
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "critical": return "#c62828";
      case "pending": return "#f57c00";
      case "in_progress": return "#1976d2";
      case "resolved": return "#388e3c";
      default: return "#666";
    }
  };

  const getDisasterTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case "flood": return "💧";
      case "fire": return "🔥";
      case "landslide": return "⚠️";
      case "storm": return "🌪️";
      case "earthquake": return "🏚️";
      default: return "📋";
    }
  };

  if (loading && kampungList.length === 0) {
    return <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>;
  }

  return (
    <div style={statsStyle.container}>
      {/* Header with Title and Badge */}
      <div style={statsStyle.header}>
        <h1 style={statsStyle.title}>Penghulu Dashboard</h1>
        <div style={statsStyle.badge}>
          👤 Penghulu View
        </div>
      </div>

      {/* Kampung Filter */}
      <div style={statsStyle.filterContainer}>
        <label style={statsStyle.filterLabel}>🏘️ Filter by Kampung:</label>
        <select
          style={statsStyle.select}
          value={selectedKampung}
          onChange={(e) => setSelectedKampung(e.target.value)}
        >
          <option value="all">All Kampungs</option>
          {kampungList.map((kampung) => (
            <option key={kampung} value={kampung}>
              {kampung}
            </option>
          ))}
        </select>
        {selectedKampung !== "all" && (
          <button
            onClick={() => setSelectedKampung("all")}
            style={statsStyle.clearButton}
          >
            Clear Filter
          </button>
        )}
        <div style={{ 
          marginLeft: "auto", 
          fontSize: 14, 
          color: "#666",
          fontWeight: "500"
        }}>
          {selectedKampung === "all" 
            ? "Viewing: All Kampungs" 
            : `Viewing: ${selectedKampung}`}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 20, textAlign: "center" }}>Loading statistics...</div>
      ) : (
        <>
          {/* Main Stats */}
          <div style={statsStyle.statsGrid}>
            <div style={statsStyle.statCard}>
              <div style={statsStyle.statNumber}>{stats.total_incidents}</div>
              <div style={statsStyle.statLabel}>Total Incidents</div>
            </div>
            <div style={statsStyle.statCard}>
              <div style={{ ...statsStyle.statNumber, color: "#d32f2f" }}>
                {stats.total_complaints}
              </div>
              <div style={statsStyle.statLabel}>Total Complaints</div>
            </div>
            <div style={statsStyle.statCard}>
              <div style={{ ...statsStyle.statNumber, color: "#ff6f00" }}>
                {stats.total_victims || 0}
              </div>
              <div style={statsStyle.statLabel}>Disaster Victims</div>
            </div>
            <div style={statsStyle.statCard}>
              <div style={{ ...statsStyle.statNumber, color: "#c62828" }}>
                {stats.total_affected || 0}
              </div>
              <div style={statsStyle.statLabel}>Total People Affected</div>
            </div>
          </div>

          {/* Charts Section */}
          <div style={statsStyle.sectionsGrid}>
            {/* By Type */}
            <div style={statsStyle.section}>
              <div style={statsStyle.sectionTitle}>Incidents by Type</div>
              {Object.keys(stats.by_type).length > 0 ? (
                Object.entries(stats.by_type).map(([type, count]) => (
                  <div key={type} style={statsStyle.listItem}>
                    <span style={{ textTransform: "capitalize" }}>{type}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              ) : (
                <div style={statsStyle.listItem}>No data</div>
              )}
            </div>

            {/* By Status */}
            <div style={statsStyle.section}>
              <div style={statsStyle.sectionTitle}>Incidents by Status</div>
              {Object.keys(stats.by_status).length > 0 ? (
                Object.entries(stats.by_status).map(([status, count]) => (
                  <div key={status} style={statsStyle.listItem}>
                    <span style={{ textTransform: "capitalize" }}>{status}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              ) : (
                <div style={statsStyle.listItem}>No data</div>
              )}
            </div>

            {/* Victims by Disaster Type */}
            <div style={statsStyle.section}>
              <div style={statsStyle.sectionTitle}>Victims by Disaster Type</div>
              {stats.victims_by_type && Object.keys(stats.victims_by_type).length > 0 ? (
                Object.entries(stats.victims_by_type).map(([type, count]) => (
                  <div key={type} style={statsStyle.listItem}>
                    <span>
                      {getDisasterTypeIcon(type)} {type}
                    </span>
                    <strong>{count}</strong>
                  </div>
                ))
              ) : (
                <div style={statsStyle.listItem}>No data</div>
              )}
            </div>

            {/* Victims by Marital Status */}
            <div style={statsStyle.section}>
              <div style={statsStyle.sectionTitle}>Victims by Marital Status</div>
              {stats.victims_by_marital_status && Object.keys(stats.victims_by_marital_status).length > 0 ? (
                Object.entries(stats.victims_by_marital_status).map(([status, count]) => (
                  <div key={status} style={statsStyle.listItem}>
                    <span style={{ textTransform: "capitalize" }}>
                      {status === 'married' ? '💑' : '👤'} {status}
                    </span>
                    <strong>{count}</strong>
                  </div>
                ))
              ) : (
                <div style={statsStyle.listItem}>No data</div>
              )}
            </div>
          </div>

          {/* Recent Incidents and Recent Victims Side by Side */}
          <div style={statsStyle.twoColumnGrid}>
            {/* Recent Incidents */}
            <div style={statsStyle.section}>
              <div style={statsStyle.sectionTitle}>Recent Incidents</div>
              {stats.recent && stats.recent.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={statsStyle.recentTable}>
                    <thead>
                      <tr>
                        <th style={statsStyle.tableHeader}>ID</th>
                        <th style={statsStyle.tableHeader}>Kampung</th>
                        <th style={statsStyle.tableHeader}>Type</th>
                        <th style={statsStyle.tableHeader}>Title</th>
                        <th style={statsStyle.tableHeader}>Status</th>
                        <th style={statsStyle.tableHeader}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent.slice(0, 5).map((incident) => (
                        <tr key={incident.id}>
                          <td style={statsStyle.tableCell}>#{incident.id}</td>
                          <td style={statsStyle.tableCell}>
                            <span style={{
                              backgroundColor: "#e3f2fd",
                              color: "#1565c0",
                              padding: "4px 8px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: "bold"
                            }}>
                              {incident.kampung || 'N/A'}
                            </span>
                          </td>
                          <td style={statsStyle.tableCell}>
                            <span style={{ textTransform: "capitalize" }}>{incident.type}</span>
                          </td>
                          <td style={statsStyle.tableCell}>
                            <div style={{ 
                              maxWidth: "150px", 
                              overflow: "hidden", 
                              textOverflow: "ellipsis", 
                              whiteSpace: "nowrap" 
                            }}>
                              {incident.title}
                            </div>
                          </td>
                          <td style={statsStyle.tableCell}>
                            <span
                              style={{
                                ...statsStyle.statusBadge,
                                backgroundColor: getStatusColor(incident.status)
                              }}
                            >
                              {incident.status}
                            </span>
                          </td>
                          <td style={statsStyle.tableCell}>
                            {new Date(incident.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={statsStyle.listItem}>No recent incidents</div>
              )}
            </div>

            {/* Recent Victims */}
            <div style={statsStyle.section}>
              <div style={statsStyle.sectionTitle}>Recent Disaster Victims</div>
              {stats.recent_victims && stats.recent_victims.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={statsStyle.recentTable}>
                    <thead>
                      <tr>
                        <th style={statsStyle.tableHeader}>ID</th>
                        <th style={statsStyle.tableHeader}>Name</th>
                        <th style={statsStyle.tableHeader}>Disaster</th>
                        <th style={statsStyle.tableHeader}>Status</th>
                        <th style={statsStyle.tableHeader}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_victims.slice(0, 5).map((victim) => (
                        <tr key={victim.id}>
                          <td style={statsStyle.tableCell}>#{victim.id}</td>
                          <td style={statsStyle.tableCell}>
                            <div style={{ 
                              maxWidth: "120px", 
                              overflow: "hidden", 
                              textOverflow: "ellipsis", 
                              whiteSpace: "nowrap",
                              fontWeight: "500"
                            }}>
                              {victim.victim_name}
                            </div>
                          </td>
                          <td style={statsStyle.tableCell}>
                            <span style={{
                              backgroundColor: "#fff3cd",
                              color: "#856404",
                              padding: "4px 8px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: "bold"
                            }}>
                              {getDisasterTypeIcon(victim.disaster_type)} {victim.disaster_type}
                            </span>
                          </td>
                          <td style={statsStyle.tableCell}>
                            <span style={{
                              backgroundColor: victim.marital_status === 'married' ? "#d1ecf1" : "#e2e3e5",
                              color: victim.marital_status === 'married' ? "#0c5460" : "#383d41",
                              padding: "4px 8px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: "bold",
                              textTransform: "capitalize"
                            }}>
                              {victim.marital_status === 'married' ? '💑' : '👤'} {victim.marital_status}
                            </span>
                          </td>
                          <td style={statsStyle.tableCell}>
                            {new Date(victim.registered_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={statsStyle.listItem}>No recent victims</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}