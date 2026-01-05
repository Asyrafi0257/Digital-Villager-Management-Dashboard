import { useEffect, useState } from "react";
import api from "../backend/api/apiClient";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function DistrictOfficerReports() {
  const [incidents, setIncidents] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKampung, setFilterKampung] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await api.get("get_all_incidents_for_district.php");
      setIncidents(data);
    } catch (err) {
      console.error("Failed to load reports", err);
    }
  };

  /* ===== FILTERED DATA ===== */
  const filteredIncidents = incidents.filter(i =>
    (!filterStatus || i.status === filterStatus) &&
    (!filterKampung || i.kampung?.toLowerCase().includes(filterKampung.toLowerCase()))
  );

  /* ===== CHART DATA ===== */
  const statusData = [
    { name: "Pending", value: incidents.filter(i => i.status === "pending").length },
    { name: "In Progress", value: incidents.filter(i => i.status === "in_progress").length },
    { name: "Resolved", value: incidents.filter(i => i.status === "resolved").length },
  ];

  const kampungData = Object.values(
    incidents.reduce((acc, i) => {
      acc[i.kampung] = acc[i.kampung] || { kampung: i.kampung, total: 0 };
      acc[i.kampung].total++;
      return acc;
    }, {})
  );

  /* ===== EXPORT CSV ===== */
  const exportCSV = () => {
    if (!incidents.length) return;

    const headers = Object.keys(incidents[0]);
    const rows = incidents.map(i =>
      headers.map(h => `"${i[h] ?? ""}"`).join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "district_incident_report.csv";
    a.click();
  };

  const formatStatus = (status) => {
    const map = {
      pending: "⏳ Pending",
      in_progress: "🔄 In Progress",
      resolved: "✅ Resolved"
    };
    return map[status] || status;
  };

  const getStatusBadge = (status) => {
    const baseStyle = {
      padding: "6px 12px",
      borderRadius: 20,
      fontSize: 13,
      fontWeight: 600,
      display: "inline-block"
    };
    
    const colors = {
      pending: { bg: "#FFF3E0", color: "#E65100" },
      in_progress: { bg: "#E1F5FE", color: "#01579B" },
      resolved: { bg: "#E8F5E9", color: "#1B5E20" }
    };
    
    const color = colors[status] || { bg: "#f5f5f5", color: "#666" };
    return { ...baseStyle, background: color.bg, color: color.color };
  };

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
            📊 Incident Reports
          </h1>
          <p style={{ 
            color: "#666", 
            margin: "8px 0 0 0",
            fontSize: 16
          }}>
            District‑level reporting & analytics
          </p>
        </div>

        {/* FILTERS */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 16,
          padding: "24px 32px",
          marginBottom: 32,
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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

            <button onClick={() => { setFilterStatus(""); setFilterKampung(""); }} style={secondaryBtn}>
              🔄 Reset
            </button>

            <button onClick={exportCSV} style={primaryBtn}>
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: 20,
          marginBottom: 32
        }}>
          <div style={statsCard}>
            <div style={statsIcon}>📋</div>
            <div style={statsValue}>{incidents.length}</div>
            <div style={statsLabel}>Total Incidents</div>
          </div>
          <div style={{...statsCard, background: "linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)"}}>
            <div style={statsIcon}>⏳</div>
            <div style={statsValue}>{statusData[0].value}</div>
            <div style={statsLabel}>Pending</div>
          </div>
          <div style={{...statsCard, background: "linear-gradient(135deg, #29B6F6 0%, #039BE5 100%)"}}>
            <div style={statsIcon}>🔄</div>
            <div style={statsValue}>{statusData[1].value}</div>
            <div style={statsLabel}>In Progress</div>
          </div>
          <div style={{...statsCard, background: "linear-gradient(135deg, #66BB6A 0%, #43A047 100%)"}}>
            <div style={statsIcon}>✅</div>
            <div style={statsValue}>{statusData[2].value}</div>
            <div style={statsLabel}>Resolved</div>
          </div>
        </div>

        {/* CHARTS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          {/* STATUS PIE */}
          <div style={cardStyle}>
            <h3 style={cardTitle}>📊 Status Distribution</h3>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <PieChart width={300} height={300}>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={["#FFA726", "#29B6F6", "#66BB6A"][i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>

          {/* KAMPUNG BAR */}
          <div style={cardStyle}>
            <h3 style={cardTitle}>🏘️ Incidents by Kampung</h3>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <BarChart width={400} height={300} data={kampungData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="kampung" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#667eea" radius={[8, 8, 0, 0]} />
              </BarChart>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div style={cardStyle}>
          <h3 style={cardTitle}>📋 Incident List</h3>
          <div style={{ overflowX: "auto" }}>
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
                  <tr key={i.id} style={{
                    background: idx % 2 === 0 ? "#fafafa" : "white",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0f0ff"}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fafafa" : "white"}
                  >
                    <td style={tdStyle}>{i.id}</td>
                    <td style={tdStyle}>{i.title}</td>
                    <td style={tdStyle}>{i.kampung}</td>
                    <td style={tdStyle}>
                      <span style={getStatusBadge(i.status)}>{formatStatus(i.status)}</span>
                    </td>
                    <td style={tdStyle}>{i.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const inputStyle = {
  padding: "12px 16px",
  borderRadius: 10,
  border: "2px solid #e0e0e0",
  fontSize: 14,
  transition: "all 0.3s ease",
  outline: "none",
  minWidth: 180,
  fontFamily: "inherit",
};

const primaryBtn = {
  padding: "12px 24px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
};

const secondaryBtn = {
  padding: "12px 24px",
  background: "white",
  border: "2px solid #e0e0e0",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  transition: "all 0.3s ease",
  color: "#666"
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

const cardStyle = {
  background: "rgba(255,255,255,0.95)",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  backdropFilter: "blur(10px)"
};

const cardTitle = {
  margin: "0 0 20px 0",
  fontSize: 20,
  fontWeight: 700,
  color: "#333"
};

const statsCard = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  borderRadius: 16,
  padding: 24,
  textAlign: "center",
  color: "white",
  boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
  transition: "transform 0.3s ease"
};

const statsIcon = {
  fontSize: 32,
  marginBottom: 12
};

const statsValue = {
  fontSize: 36,
  fontWeight: 800,
  marginBottom: 8
};

const statsLabel = {
  fontSize: 14,
  opacity: 0.9,
  fontWeight: 500
};