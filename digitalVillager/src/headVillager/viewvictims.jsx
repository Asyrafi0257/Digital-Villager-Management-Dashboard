import React, { useState, useEffect, useContext } from "react";
import api from "../backend/api/apiClient";
import { AuthContext } from "../auth/authContext";

export default function ViewVictims() {
  const { role, kampung } = useContext(AuthContext);
  const [victims, setVictims] = useState([]);
  const [filteredVictims, setFilteredVictims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDisasterType, setFilterDisasterType] = useState("all");
  const [filterMaritalStatus, setFilterMaritalStatus] = useState("all");
  const [selectedVictim, setSelectedVictim] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const isAdmin = role === "kplbHQ";
  const isPenghulu = role === "penghulu";

  // Protect: Only Ketua Kampung and admin can access
  if (role !== "ketua kampung" && role !== "kplbHQ" && role !== "penghulu") {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "red" }}>
        <h2>Access Denied</h2>
        <p>Only Ketua Kampung , Penghulu and HQ can view disaster victims.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchVictims();
  }, []);

  useEffect(() => {
    filterVictims();
  }, [victims, searchTerm, filterDisasterType, filterMaritalStatus]);

  const fetchVictims = async () => {
    try {
      setLoading(true);
      console.log("Fetching victims...");
      const { data } = await api.get("/get_victims.php");
      console.log("Victims fetched:", data);
      setVictims(data.victims || []);
      setError("");
    } catch (err) {
      console.error("Error fetching victims:", err);
      setError(err.response?.data?.error || "Failed to load victims");
    } finally {
      setLoading(false);
    }
  };

  const filterVictims = () => {
    let filtered = [...victims];

    // Search by name or IC
    if (searchTerm) {
      filtered = filtered.filter(v => 
        v.victim_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.ic_number && v.ic_number.includes(searchTerm))
      );
    }

    // Filter by disaster type
    if (filterDisasterType !== "all") {
      filtered = filtered.filter(v => v.disaster_type === filterDisasterType);
    }

    // Filter by marital status
    if (filterMaritalStatus !== "all") {
      filtered = filtered.filter(v => v.marital_status === filterMaritalStatus);
    }

    setFilteredVictims(filtered);
  };

  const getUniqueDisasterTypes = () => {
    return [...new Set(victims.map(v => v.disaster_type))].sort();
  };

  const viewDetails = (victim) => {
    setSelectedVictim(victim);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVictim(null);
  };

  const containerStyle = {
    padding: 20,
    width: 1280,
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
    borderBottom: "2px solid #ddd",
    fontSize: "13px"
  };

  const tdStyle = {
    padding: 12,
    borderBottom: "1px solid #eee",
    fontSize: "14px"
  };

  const buttonStyle = {
    padding: "6px 12px",
    marginRight: 8,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: "500"
  };

  const primaryButton = {
    ...buttonStyle,
    backgroundColor: "#007bff",
    color: "white"
  };

  const inputStyle = {
    padding: "8px 12px",
    borderRadius: 4,
    border: "1px solid #ddd",
    fontSize: "14px"
  };

  return (
    <div style={containerStyle}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 20
      }}>
        <h1>Disaster Victims</h1>
        
        {isAdmin? (
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
        ) : isPenghulu ? (
            <div style={{
              padding: "8px 16px",
              backgroundColor: "#17a2b8",
              color: "white",
              borderRadius: 6,
              fontWeight: "bold",
              fontSize: "14px"
            }}>
              👨‍💼 Penghulu View - {kampung}
            </div>
        ) : (
          <div style={{
            padding: "8px 16px",
            backgroundColor: "#17a2b8",
            color: "white",
            borderRadius: 6,
            fontWeight: "bold",
            fontSize: "14px"
          }}>
            🏘️ {kampung}
          </div>
        )}
      </div>

      {error && (
        <div style={{
          ...cardStyle,
          backgroundColor: "#f8d7da",
          color: "#721c24",
          borderLeft: "4px solid #f5c6cb"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Filters */}
      <div style={cardStyle}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: 15,
          marginBottom: 10
        }}>
          <div>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold", fontSize: "13px" }}>
              🔍 Search by Name or IC
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter name or IC number..."
              style={{ ...inputStyle, width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold", fontSize: "13px" }}>
              Disaster Type
            </label>
            <select
              value={filterDisasterType}
              onChange={(e) => setFilterDisasterType(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            >
              <option value="all">All Types ({victims.length})</option>
              {getUniqueDisasterTypes().map(type => (
                <option key={type} value={type}>
                  {type} ({victims.filter(v => v.disaster_type === type).length})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 5, fontWeight: "bold", fontSize: "13px" }}>
              Marital Status
            </label>
            <select
              value={filterMaritalStatus}
              onChange={(e) => setFilterMaritalStatus(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            >
              <option value="all">All Status</option>
              <option value="single">Single ({victims.filter(v => v.marital_status === 'single').length})</option>
              <option value="married">Married ({victims.filter(v => v.marital_status === 'married').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 15,
        marginBottom: 20
      }}>
        <div style={{
          ...cardStyle,
          textAlign: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white"
        }}>
          <div style={{ fontSize: "36px", fontWeight: "bold" }}>{victims.length}</div>
          <div style={{ fontSize: "14px", marginTop: 5 }}>Total Victims</div>
        </div>

        <div style={{
          ...cardStyle,
          textAlign: "center",
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "white"
        }}>
          <div style={{ fontSize: "36px", fontWeight: "bold" }}>
            {victims.filter(v => v.marital_status === 'married').length}
          </div>
          <div style={{ fontSize: "14px", marginTop: 5 }}>Married Victims</div>
        </div>

        <div style={{
          ...cardStyle,
          textAlign: "center",
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: "white"
        }}>
          <div style={{ fontSize: "36px", fontWeight: "bold" }}>
            {victims.reduce((sum, v) => sum + (v.household_members?.length || 0), 0)}
          </div>
          <div style={{ fontSize: "14px", marginTop: 5 }}>Household Members</div>
        </div>

        <div style={{
          ...cardStyle,
          textAlign: "center",
          background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          color: "white"
        }}>
          <div style={{ fontSize: "36px", fontWeight: "bold" }}>
            {victims.length + victims.reduce((sum, v) => sum + (v.household_members?.length || 0), 0)}
          </div>
          <div style={{ fontSize: "14px", marginTop: 5 }}>Total People Affected</div>
        </div>
      </div>

      {/* Victims Table */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: 15 }}>
          Registered Victims ({filteredVictims.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: "48px", marginBottom: 10 }}>⏳</div>
            <div style={{ fontSize: "16px", color: "#666" }}>Loading victims...</div>
          </div>
        ) : filteredVictims.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: "48px", marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: 5 }}>
              No victims found
            </div>
            <div style={{ fontSize: "14px", color: "#666" }}>
              {victims.length === 0 
                ? "No disaster victims have been registered yet"
                : "Try adjusting your filters"
              }
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>IC Number</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Disaster Type</th>
                  <th style={thStyle}>Marital Status</th>
                  {isAdmin && <th style={thStyle}>Kampung</th>}
                  <th style={thStyle}>Household</th>
                  <th style={thStyle}>Registered By</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVictims.map((victim) => (
                  <tr key={victim.id} style={{ 
                    backgroundColor: victim.marital_status === 'married' ? '#f8f9fa' : 'white'
                  }}>
                    <td style={tdStyle}>
                      <strong>#{victim.id}</strong>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "600", color: "#333" }}>
                        {victim.victim_name}
                      </div>
                      {victim.address && (
                        <div style={{ fontSize: "12px", color: "#666", marginTop: 2 }}>
                          📍 {victim.address.substring(0, 30)}...
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {victim.ic_number || <span style={{ color: "#999" }}>—</span>}
                    </td>
                    <td style={tdStyle}>
                      {victim.phone_number || <span style={{ color: "#999" }}>—</span>}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        backgroundColor: "#fff3cd",
                        color: "#856404",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        {victim.disaster_type}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        backgroundColor: victim.marital_status === 'married' ? "#d1ecf1" : "#e2e3e5",
                        color: victim.marital_status === 'married' ? "#0c5460" : "#383d41",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "capitalize"
                      }}>
                        {victim.marital_status === 'married' ? '💑 Married' : '👤 Single'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={tdStyle}>
                        <span style={{
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}>
                          {victim.kampung_name}
                        </span>
                      </td>
                    )}
                    <td style={tdStyle}>
                      {victim.marital_status === 'married' ? (
                        <span style={{
                          backgroundColor: "#d4edda",
                          color: "#155724",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}>
                          👨‍👩‍👧‍👦 {victim.household_members.length} members
                        </span>
                      ) : (
                        <span style={{ color: "#999", fontSize: "12px" }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: "13px" }}>
                        {victim.registered_by_name || "Unknown"}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: "13px" }}>
                        {new Date(victim.registered_at).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: "11px", color: "#666" }}>
                        {new Date(victim.registered_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => viewDetails(victim)}
                        style={primaryButton}
                      >
                        👁️ View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for viewing details */}
      {showModal && selectedVictim && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: 8,
            maxWidth: 700,
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <div style={{
              padding: 20,
              borderBottom: "2px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f8f9fa"
            }}>
              <h2 style={{ margin: 0 }}>Victim Details #{selectedVictim.id}</h2>
              <button
                onClick={closeModal}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#6c757d",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 15, color: "#333" }}>Personal Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 }}>
                  <strong>Name:</strong>
                  <span>{selectedVictim.victim_name}</span>

                  <strong>IC Number:</strong>
                  <span>{selectedVictim.ic_number || "—"}</span>

                  <strong>Phone:</strong>
                  <span>{selectedVictim.phone_number || "—"}</span>

                  <strong>Address:</strong>
                  <span>{selectedVictim.address || "—"}</span>

                  <strong>Marital Status:</strong>
                  <span style={{ textTransform: "capitalize" }}>{selectedVictim.marital_status}</span>

                  <strong>Disaster Type:</strong>
                  <span>{selectedVictim.disaster_type}</span>

                  <strong>Kampung:</strong>
                  <span>{selectedVictim.kampung_name}</span>

                  <strong>Registered By:</strong>
                  <span>{selectedVictim.registered_by_name}</span>

                  <strong>Registered At:</strong>
                  <span>{new Date(selectedVictim.registered_at).toLocaleString()}</span>
                </div>

                {selectedVictim.notes && (
                  <div style={{ marginTop: 15 }}>
                    <strong>Notes:</strong>
                    <div style={{
                      marginTop: 5,
                      padding: 10,
                      backgroundColor: "#f8f9fa",
                      borderRadius: 4,
                      fontSize: "14px"
                    }}>
                      {selectedVictim.notes}
                    </div>
                  </div>
                )}
              </div>

              {selectedVictim.marital_status === 'married' && selectedVictim.household_members.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: 15, color: "#333" }}>
                    Household Members ({selectedVictim.household_members.length})
                  </h3>
                  <div style={{ display: "grid", gap: 10 }}>
                    {selectedVictim.household_members.map((member, index) => (
                      <div
                        key={member.id}
                        style={{
                          padding: 15,
                          backgroundColor: "#f8f9fa",
                          borderRadius: 6,
                          border: "1px solid #dee2e6"
                        }}
                      >
                        <div style={{ 
                          display: "grid", 
                          gridTemplateColumns: "120px 1fr",
                          gap: 8,
                          fontSize: "14px"
                        }}>
                          <strong>Name:</strong>
                          <span>{member.member_name}</span>

                          <strong>Relationship:</strong>
                          <span>{member.relationship}</span>

                          <strong>IC Number:</strong>
                          <span>{member.ic_number || "—"}</span>

                          <strong>Age:</strong>
                          <span>{member.age || "—"} years old</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}