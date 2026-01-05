import React, { useState, useEffect, useContext } from "react";
import api from "../backend/api/apiClient";
import { AuthContext } from "../auth/authContext";

export default function ManageIncidents() {
  const authContext = useContext(AuthContext);
  const { role, kampung: userKampung } = authContext;

  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [selectedKampung, setSelectedKampung] = useState("all");
  const [kampungList, setKampungList] = useState([]);

  // Protect: Only officials and admins can access
  if (role !== "ketua kampung" && role !== "kplbHQ" && role !== "penghulu") {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "red" }}>
        <h2>Access Denied</h2>
        <p>Only officials and administrators can manage incidents.</p>
        <p style={{ fontSize: 12, marginTop: 20 }}>
          Current role: "{role}" (must be "ketua kampung", "kplbHQ", or "penghulu")
        </p>
      </div>
    );
  }

  // Determine user role type
  const isAdmin = role === "kplbHQ";
  const isPenghulu = role === "penghulu";
  const isKetuaKampung = role === "ketua kampung";
  
  // Only Admin and Ketua Kampung can edit status
  const canEditStatus = isAdmin || isKetuaKampung;

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    filterIncidentsByKampung();
  }, [incidents, selectedKampung]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      console.log("📥 Fetching incidents...");
      console.log("  Role:", role);
      console.log("  User Kampung:", userKampung);
      console.log("  Is Admin:", isAdmin);
      console.log("  Is Penghulu:", isPenghulu);
      console.log("  Can Edit Status:", canEditStatus);

      const { data } = await api.get("/incidents_list.php");
      console.log("✅ All incidents fetched from API:", data.length, "incidents");

      let incidentsToShow = data || [];

      // ========================================
      // CRITICAL FILTERING LOGIC
      // ========================================
      console.log("🔍 FILTERING CHECK:");
      console.log("  isAdmin:", isAdmin);
      console.log("  isPenghulu:", isPenghulu);
      console.log("  isKetuaKampung:", isKetuaKampung);
      console.log("  userKampung:", userKampung);

      // Only Ketua Kampung needs filtering (not Admin or Penghulu)
      if (isKetuaKampung && userKampung) {
        console.log("🔽 FILTERING INCIDENTS FOR KETUA KAMPUNG");
        console.log("  Filtering for kampung:", userKampung);
        console.log("  Before filter:", incidentsToShow.length, "incidents");

        incidentsToShow = incidentsToShow.filter(incident => {
          const matches = incident.kampung === userKampung;
          return matches;
        });

        console.log("  After filter:", incidentsToShow.length, "incidents");
      } else if (isAdmin || isPenghulu) {
        console.log("⚠️ NOT FILTERING - Admin or Penghulu sees all kampungs");
      }

      setIncidents(incidentsToShow);

      // Extract unique kampung values for filter dropdown
      const uniqueKampungs = [...new Set(incidentsToShow.map(i => i.kampung).filter(Boolean))];
      console.log("Unique kampungs:", uniqueKampungs);
      setKampungList(uniqueKampungs.sort());

      // Set default filter for Ketua Kampung
      if (isKetuaKampung && userKampung) {
        setSelectedKampung(userKampung);
        console.log("Set default filter to:", userKampung);
      }

      setError("");
    } catch (err) {
      console.error("❌ Error fetching incidents:", err);
      setError("Failed to load incidents: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filterIncidentsByKampung = () => {
    if (selectedKampung === "all") {
      setFilteredIncidents(incidents);
    } else {
      const filtered = incidents.filter(
        incident => incident.kampung === selectedKampung
      );
      setFilteredIncidents(filtered);
    }
  };

  const handleUpdateStatus = async (incidentId) => {
    if (!canEditStatus) {
      setError("You don't have permission to update incident status");
      return;
    }

    if (!newStatus) {
      setError("Please select a status");
      return;
    }

    try {
      console.log("Updating incident", incidentId, "to status", newStatus);
      const { data } = await api.post("/incident_update_status.php", {
        id: incidentId,
        status: newStatus
      });

      if (data.updated) {
        setError("");
        setEditingId(null);
        setNewStatus("");
        await fetchIncidents();
      } else {
        setError("Failed to update incident");
      }
    } catch (err) {
      console.error("Error updating incident:", err);
      setError(err.response?.data?.error || "Failed to update incident");
    }
  };

  const containerStyle = {
    padding: 20,
    maxWidth: 1400,
    margin: "0 auto"
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: 20
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 20
  };

  const thStyle = {
    backgroundColor: "#f5f5f5",
    padding: 12,
    textAlign: "left",
    fontWeight: "bold",
    borderBottom: "2px solid #ddd"
  };

  const tdStyle = {
    padding: 12,
    borderBottom: "1px solid #eee"
  };

  const buttonStyle = {
    padding: "6px 12px",
    marginRight: 8,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12
  };

  const primaryButton = {
    ...buttonStyle,
    backgroundColor: "#007bff",
    color: "white"
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "critical":
        return "#d32f2f";
      case "pending":
        return "#f9a825";
      case "in_progress":
      case "investigating":
        return "#1976d2";
      case "resolved":
        return "#2e7d32";
      default:
        return "#666";
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'in_progress': 'In Progress',
      'investigating': 'Investigating'
    };
    return statusMap[status] || status;
  };

  return (
    <div style={containerStyle}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
      }}>
        <h1>Manage Incidents</h1>

        {isAdmin && (
          <div style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            borderRadius: 6,
            fontWeight: "bold",
            fontSize: "14px"
          }}>
            👨‍💼 Admin View - All Kampungs
          </div>
        )}

        {isPenghulu && (
          <div style={{
            padding: "8px 16px",
            backgroundColor: "#ffc107",
            color: "#333",
            borderRadius: 6,
            fontWeight: "bold",
            fontSize: "14px"
          }}>
            👤 Penghulu View - View Only
          </div>
        )}

        {isKetuaKampung && userKampung && (
          <div style={{
            padding: "8px 16px",
            backgroundColor: "#17a2b8",
            color: "white",
            borderRadius: 6,
            fontWeight: "bold",
            fontSize: "14px"
          }}>
            🏘️ {userKampung}
          </div>
        )}

        {isKetuaKampung && !userKampung && (
          <div style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            borderRadius: 6,
            fontWeight: "bold",
            fontSize: "14px"
          }}>
            ⚠️ No Kampung Assigned!
          </div>
        )}
      </div>

      {/* Info banner for Penghulu */}
      {isPenghulu && (
        <div style={{
          ...cardStyle,
          backgroundColor: "#fff3cd",
          color: "#856404",
          borderLeft: "4px solid #ffc107"
        }}>
          ℹ️ <strong>View-Only Access:</strong> As a Penghulu, you can view all incidents but cannot modify their status. Contact an administrator or Ketua Kampung to update incident statuses.
        </div>
      )}

      {error && (
        <div
          style={{
            ...cardStyle,
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderLeft: "4px solid #f5c6cb"
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div style={cardStyle}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        }}>
          <h2>
            {selectedKampung === "all"
              ? `All Incidents (${filteredIncidents.length})`
              : `${selectedKampung} - ${filteredIncidents.length} incident${filteredIncidents.length !== 1 ? 's' : ''}`
            }
          </h2>

          {/* Kampung Filter - Show for admin and penghulu */}
          {(isAdmin || isPenghulu) && kampungList.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ fontWeight: "bold", fontSize: "14px" }}>
                Filter by Kampung:
              </label>
              <select
                value={selectedKampung}
                onChange={(e) => setSelectedKampung(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "2px solid #007bff",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  backgroundColor: "white"
                }}
              >
                <option value="all">All Kampungs ({incidents.length})</option>
                {kampungList.map(kampung => (
                  <option key={kampung} value={kampung}>
                    {kampung} ({incidents.filter(i => i.kampung === kampung).length})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: "48px", marginBottom: 10 }}>⏳</div>
            <div style={{ fontSize: "16px", color: "#666" }}>Loading incidents...</div>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: "48px", marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: 5 }}>
              No incidents found
            </div>
            <div style={{ fontSize: "14px", color: "#666" }}>
              {!userKampung && isKetuaKampung
                ? "⚠️ No kampung assigned to your account"
                : selectedKampung === "all"
                  ? "There are no incidents to display"
                  : `No incidents found for ${selectedKampung}`
              }
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Location</th>
                  {(isAdmin || isPenghulu) && <th style={thStyle}>Kampung</th>}
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Reporter</th>
                  <th style={thStyle}>Date</th>
                  {canEditStatus && <th style={thStyle}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((incident) => (
                  <tr key={incident.id} style={{
                    backgroundColor: incident.status === 'critical' ? '#fff5f5' : 'white'
                  }}>
                    <td style={tdStyle}>
                      <strong>#{incident.id}</strong>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        textTransform: "capitalize",
                        fontSize: "16px"
                      }}>
                        {incident.type === 'flood' && '💧'}
                        {incident.type === 'fire' && '🔥'}
                        {incident.type === 'landslide' && '⚠️'}
                        {incident.type === 'complaint' && '📝'}
                        {incident.type === 'sos' && '🆘'}
                        {' '}
                        {incident.type}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <strong>{incident.title}</strong>
                      {incident.description && (
                        <div style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: 4,
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {incident.description}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: "13px" }}>
                        📍 {incident.location || "N/A"}
                      </div>
                      {incident.latitude && incident.longitude && (
                        <div style={{ fontSize: "11px", color: "#999", marginTop: 2 }}>
                          {parseFloat(incident.latitude).toFixed(4)}, {parseFloat(incident.longitude).toFixed(4)}
                        </div>
                      )}
                    </td>
                    {(isAdmin || isPenghulu) && (
                      <td style={tdStyle}>
                        <span style={{
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}>
                          {incident.kampung || "Unknown"}
                        </span>
                      </td>
                    )}
                    <td style={tdStyle}>
                      {editingId === incident.id && canEditStatus ? (
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 4,
                            border: "2px solid #007bff",
                            fontSize: "13px",
                            fontWeight: "500"
                          }}
                        >
                          <option value="">Select status...</option>
                          <option value="pending">Pending</option>
                          <option value="investigating">Investigating</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="critical">Critical</option>
                        </select>
                      ) : (
                        <span
                          style={{
                            backgroundColor: getStatusColor(incident.status),
                            color: "white",
                            padding: "6px 12px",
                            borderRadius: 4,
                            display: "inline-block",
                            textTransform: "capitalize",
                            fontSize: "12px",
                            fontWeight: "bold"
                          }}
                        >
                          {getStatusBadge(incident.status)}
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "500" }}>
                        {incident.reporter_name || "Anonymous"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666", marginTop: 2 }}>
                        📞 {incident.reporter_phone || "No phone"}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: "13px" }}>
                        {new Date(incident.created_at).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: "11px", color: "#666", marginTop: 2 }}>
                        {new Date(incident.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    {canEditStatus && (
                      <td style={tdStyle}>
                        {editingId === incident.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(incident.id)}
                              style={{
                                ...primaryButton,
                                backgroundColor: "#28a745"
                              }}
                            >
                              ✓ Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setNewStatus("");
                                setError("");
                              }}
                              style={{
                                ...buttonStyle,
                                backgroundColor: "#6c757d",
                                color: "white"
                              }}
                            >
                              ✕ Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(incident.id);
                              setNewStatus(incident.status);
                            }}
                            style={primaryButton}
                          >
                            📝 Update Status
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        {filteredIncidents.length > 0 && (
          <div style={{
            marginTop: 30,
            padding: 20,
            backgroundColor: "#f8f9fa",
            borderRadius: 8,
            display: "flex",
            gap: 20,
            flexWrap: "wrap"
          }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: 4 }}>Total</div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                {filteredIncidents.length}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: 4 }}>Critical</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#d32f2f" }}>
                {filteredIncidents.filter(i => i.status === 'critical' || i.type === 'sos').length}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: 4 }}>Pending</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f9a825" }}>
                {filteredIncidents.filter(i => i.status === 'pending').length}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: 4 }}>In Progress</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1976d2" }}>
                {filteredIncidents.filter(i => i.status === 'in_progress' || i.status === 'investigating').length}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: 4 }}>Resolved</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2e7d32" }}>
                {filteredIncidents.filter(i => i.status === 'resolved').length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}