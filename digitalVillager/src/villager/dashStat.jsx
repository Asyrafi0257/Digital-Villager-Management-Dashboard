import React, { useState, useEffect } from "react";
import statsStyle from "../villager/dashStat.module.css";
import api from "../backend/api/apiClient";
import { getStatusColor } from "../utils/statusColor";

export default function DashboardStats() {
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
      console.log("Fetching dashboard stats...");
      const { data } = await api.get("/dashboard_stats.php");
      console.log("Dashboard stats received:", data);
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={statsStyle.loading}>Loading...</div>;


  return (
    <div className={statsStyle.container}>
      <h1 className={statsStyle.title}>Recent Incident</h1>


      {/* Recent Incidents */}
      <div className={statsStyle.sectionRecent}>
        <div className={statsStyle.sectionTitle}>Recent Incidents</div>
        <div  className={statsStyle.tableContain}>
          {stats.recent.length > 0 ? (
                    <table className={statsStyle.recentTable}>
                      <thead>
                        <tr>
                          <th className={statsStyle.tableHeader}>ID</th>
                          <th className={statsStyle.tableHeader}>Type</th>
                          <th className={statsStyle.tableHeader}>Title</th>
                          <th className={statsStyle.tableHeader}>Location</th>
                          <th className={statsStyle.tableHeader}>Status</th>
                          <th className={statsStyle.tableHeader}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recent.map((incident) => (
                          <tr key={incident.id}>
                            <td className={statsStyle.tableCell}>#{incident.id}</td>
                            <td className={statsStyle.tableCell}>
                              <span className={statsStyle.spanTableCell}>{incident.type}</span>
                            </td>
                            <td className={statsStyle.tableCell}>{incident.title}</td>
                            <td className={statsStyle.tableCell}>{incident.location || "N/A"}</td>
                            <td className={statsStyle.tableCell}>
                              <span
                                  className={statsStyle.statusBadge}
                                  style={{ backgroundColor: getStatusColor(incident.status) }}
                              >
                                {incident.status}
                              </span>
                            </td>
                            <td className={statsStyle.tableCell}>
                              {new Date(incident.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className={statsStyle.listItem}>No recent incidents</div>
                  )}
        </div>
        
      </div>
    </div>
  );
}