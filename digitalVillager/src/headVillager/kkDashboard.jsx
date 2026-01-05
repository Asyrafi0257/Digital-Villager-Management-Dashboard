import React, { useState, useEffect } from "react";
import api from "../backend/api/apiClient";

export default function KKDashboard() {
  const [stats, setStats] = useState({
    total_incidents: 0,
    total_complaints: 0,
    by_type: {},
    by_status: {},
    recent: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log("Fetching KK dashboard stats...");
      const { data } = await api.get('kk_dashboard.php');

      console.log("KK Dashboard stats received:", data);
      setStats(data);

    } catch (error) {
      console.error("Error fetching KK dashboard stats:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>;

  const statsStyle = {
    container: { padding: 20, backgroundColor: "#ffffff", borderRadius: 8, marginBottom: 20, width:1280, marginTop:20 },
    title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#333" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 30 },
    statCard: { backgroundColor: "white", padding: 20, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", textAlign: "center" },
    statNumber: { fontSize: 36, fontWeight: "bold", color: "#007bff" },
    statLabel: { fontSize: 14, color: "#666", marginTop: 8 },
    sectionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 },
    section: { backgroundColor: "white", padding: 20, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: "#333" },
    listItem: { display: "flex", justifyContent: "space-between", padding: 10, borderBottom: "1px solid #eee", fontSize: 14 },
    recentTable: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { backgroundColor: "#f9f9f9", padding: 10, textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #ddd" },
    tableCell: { padding: 10, borderBottom: "1px solid #eee" },
    statusBadge: { padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: "bold", color: "white" }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "critical": return "#c62828";
      case "pending": return "#f57c00";
      case "in_progress": return "#1976d2";
      case "resolved": return "#388e3c";
      default: return "#666";
    }
  };

  return (
    <div style={statsStyle.container}>
      <h1 style={statsStyle.title}>
        Kampung Dashboard – {stats.kampung}
      </h1>


      {/* Main Stats */}
      <div style={statsStyle.statsGrid}>
        <div style={statsStyle.statCard}>
          <div style={statsStyle.statNumber}>{stats.total_incidents}</div>
          <div style={statsStyle.statLabel}>Total Kampung Incidents</div>
        </div>
        <div style={statsStyle.statCard}>
          <div style={{ ...statsStyle.statNumber, color: "#d32f2f" }}>
            {stats.total_complaints}
          </div>
          <div style={statsStyle.statLabel}>Total Kampung Complaints</div>
        </div>
        <div style={statsStyle.statCard}>
          <div style={{ ...statsStyle.statNumber, color: "#d32f2f" }}>
            {stats.total_affected}
          </div>
          <div style={statsStyle.statLabel}>Total Affected People</div>
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
      </div>

      {/* Recent Incidents */}
      <div style={{ ...statsStyle.section, marginTop: 20 }}>
        <div style={statsStyle.sectionTitle}>Recent Kampung Incidents</div>
        {stats.recent.length > 0 ? (
          <table style={statsStyle.recentTable}>
            <thead>
              <tr>
                <th style={statsStyle.tableHeader}>ID</th>
                <th style={statsStyle.tableHeader}>Kampung</th>
                <th style={statsStyle.tableHeader}>Title</th>
                <th style={statsStyle.tableHeader}>Location</th>
                <th style={statsStyle.tableHeader}>Status</th>
                <th style={statsStyle.tableHeader}>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((incident) => (
                <tr key={incident.id}>
                  <td style={statsStyle.tableCell}>#{incident.id}</td>
                  <td style={statsStyle.tableCell}>{incident.type}</td>
                  <td style={statsStyle.tableCell}>{incident.title}</td>
                  <td style={statsStyle.tableCell}>{incident.location || "N/A"}</td>
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
        ) : (
          <div style={statsStyle.listItem}>No recent incidents</div>
        )}
      </div>
    </div>
  );
}