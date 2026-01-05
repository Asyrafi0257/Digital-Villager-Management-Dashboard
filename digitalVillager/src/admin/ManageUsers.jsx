import React, { useState, useEffect, useContext } from "react";
import api from "../backend/api/apiClient";
import { AuthContext } from "../auth/authContext";


export default function ManageUsers() {
  const { role } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "ketua kampung",
    kampung_name: ""
  });

  // List of available kampungs
  const kampungOptions = [
    "Kampung A",
    "Kampung B",
    "Kampung C",
    "Kampung D"
  ];

  // Protect: Only admins can access this page
  if (role !== "kplbHQ") {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "red" }}>
        <h2>Access Denied</h2>
        <p>Only kplbHQ can manage users.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users...");
      const { data } = await api.get("/get_users.php");
      console.log("Users fetched successfully:", data);
      setUsers(data.users || []);
      setError("");
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      if (!formData.username || !formData.password) {
        setError("Username and password are required");
        return;
      }

      // Validate kampung for Ketua Kampung role
      if (formData.role === "ketua kampung" && !formData.kampung_name) {
        setError("Please select a kampung for Ketua Kampung");
        return;
      }

      console.log("Creating user with data:", formData);
      const { data } = await api.post("/create_user.php", formData);
      console.log("User created successfully:", data);
      
      if (data.success) {
        setFormData({ username: "", password: "", role: "ketua kampung", kampung_name: "" });
        setShowCreateForm(false);
        setError("");
        console.log("Refreshing user list after creation...");
        await fetchUsers();
      }
    } catch (err) {
      console.error("Error creating user:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to create user");
    }
  };

  const handleUpdateUser = async (userId) => {
    try {
      const updateData = { user_id: userId };
      
      // Only send changed fields
      const user = users.find(u => u.id === userId);
      if (formData.role !== user.role) {
        updateData.role = formData.role;
      }
      if (formData.kampung_name !== user.kampung_name) {
        updateData.kampung_name = formData.kampung_name;
      }
      if (formData.password) {
        updateData.password = formData.password;
      }

      if (Object.keys(updateData).length === 1) {
        setError("No changes to save");
        return;
      }

      // Validate kampung for Ketua Kampung role
      if (formData.role === "ketua kampung" && !formData.kampung_name) {
        setError("Please select a kampung for Ketua Kampung");
        return;
      }

      console.log("Updating user with data:", updateData);
      const { data } = await api.post("/update_user.php", updateData);
      
      if (data.success) {
        setEditingUserId(null);
        setFormData({ username: "", password: "", role: "ketua kampung", kampung_name: "" });
        setError("");
        await fetchUsers();
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.response?.data?.error || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const { data } = await api.post("/delete_user.php", { user_id: userId });
      
      if (data.success) {
        setError("");
        await fetchUsers();
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.error || "Failed to delete user");
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setFormData({ 
      username: user.username, 
      password: "", 
      role: user.role,
      kampung_name: user.kampung_name || "" 
    });
  };

  const handleRoleChange = (newRole) => {
    setFormData({ 
      ...formData, 
      role: newRole,
      kampung_name: newRole === "ketua kampung" ? formData.kampung_name : "" 
    });
  };

  // Helper function to display role nicely
  const getRoleDisplay = (role) => {
    const roleMap = {
      'ketua kampung': 'Ketua Kampung',
      'kplbHQ': 'kplbHQ',
      'penghulu': 'Penghulu',
      'district officer': 'District Officer'
    };
    return roleMap[role?.toLowerCase()] || role;
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
    borderBottom: "2px solid #ddd"
  };

  const tdStyle = {
    padding: 12,
    borderBottom: "1px solid #eee"
  };

  const buttonStyle = {
    padding: "8px 16px",
    marginRight: 8,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14
  };

  const primaryButton = {
    ...buttonStyle,
    backgroundColor: "#007bff",
    color: "white"
  };

  const dangerButton = {
    ...buttonStyle,
    backgroundColor: "#dc3545",
    color: "white"
  };

  const successButton = {
    ...buttonStyle,
    backgroundColor: "#28a745",
    color: "white"
  };

  return (
    <div style={containerStyle}>
      <h1>Manage Users</h1>

      {error && (
        <div style={{ ...cardStyle, backgroundColor: "#f8d7da", color: "#721c24", borderLeft: "4px solid #f5c6cb" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Create New User Form */}
      {!showCreateForm ? (
        <button style={successButton} onClick={() => setShowCreateForm(true)}>
          + Create New User
        </button>
      ) : (
        <div style={cardStyle}>
          <h2>Create New User</h2>
          <form onSubmit={handleCreateUser}>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd" }}
                required
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd" }}
                required
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>Role</label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ddd" }}
              >
                <option value="ketua kampung">Ketua Kampung</option>
                <option value="district officer">District Officer</option>
                <option value="penghulu">Penghulu</option>
                <option value="kplbHQ">kplbHQ</option>
              </select>
            </div>

            {/* Kampung Dropdown - Only show for Ketua Kampung */}
            {formData.role === "ketua kampung" && (
              <div style={{ 
                marginBottom: 15,
                padding: 15,
                backgroundColor: "#e7f3ff",
                borderRadius: 6,
                border: "2px solid #2196f3"
              }}>
                <label style={{ display: "block", marginBottom: 5, fontWeight: "bold", color: "#1976d2" }}>
                  🏘️ Kampung Assignment *
                </label>
                <select
                  value={formData.kampung_name}
                  onChange={(e) => setFormData({ ...formData, kampung_name: e.target.value })}
                  style={{ 
                    width: "100%", 
                    padding: 10, 
                    borderRadius: 4, 
                    border: "2px solid #2196f3",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                  required
                >
                  <option value="">-- Select Kampung --</option>
                  {kampungOptions.map(kampung => (
                    <option key={kampung} value={kampung}>
                      {kampung}
                    </option>
                  ))}
                </select>
                <small style={{ display: "block", marginTop: 5, color: "#666", fontSize: "12px" }}>
                  This Ketua Kampung will only see incidents from the selected kampung
                </small>
              </div>
            )}

            <div>
              <button type="submit" style={successButton}>Create User</button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ username: "", password: "", role: "ketua kampung", kampung_name: "" });
                }}
                style={{ ...buttonStyle, backgroundColor: "#6c757d", color: "white" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div style={cardStyle}>
        <h2>Users ({users.length})</h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: 20 }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: "#666" }}>No users found</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Kampung</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={tdStyle}>{user.id}</td>
                  <td style={tdStyle}>
                    <strong>{user.username}</strong>
                  </td>
                  <td style={tdStyle}>
                    {editingUserId === user.id ? (
                      <select
                        value={formData.role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        style={{ padding: 6, borderRadius: 4, border: "1px solid #ddd", fontSize: "13px" }}
                      >
                        <option value="ketua kampung">Ketua Kampung</option>
                        <option value="district officer">District Officer</option>
                        <option value="penghulu">Penghulu</option>
                        <option value="kplbHQ">kplbHQ</option>
                      </select>
                    ) : (
                      <span style={{ 
                        backgroundColor: user.role === "kplbHQ" ? "#28a745" : "#e7f3ff", 
                        color: user.role === "kplbHQ" ? "white" : "#1976d2",
                        padding: "6px 12px", 
                        borderRadius: 4,
                        fontWeight: "500",
                        fontSize: "13px"
                      }}>
                        {getRoleDisplay(user.role)}
                      </span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {editingUserId === user.id && formData.role === "ketua kampung" ? (
                      <select
                        value={formData.kampung_name}
                        onChange={(e) => setFormData({ ...formData, kampung_name: e.target.value })}
                        style={{ 
                          padding: 6, 
                          borderRadius: 4, 
                          border: "2px solid #2196f3",
                          fontSize: "13px",
                          fontWeight: "500"
                        }}
                        required
                      >
                        <option value="">-- Select Kampung --</option>
                        {kampungOptions.map(kampung => (
                          <option key={kampung} value={kampung}>
                            {kampung}
                          </option>
                        ))}
                      </select>
                    ) : (user.role === "ketua kampung" || user.role === "Ketua Kampung") ? (
                      <span style={{
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        padding: "6px 12px",
                        borderRadius: 4,
                        fontSize: "13px",
                        fontWeight: "bold",
                        display: "inline-block"
                      }}>
                        🏘️ {user.kampung_name || "Not assigned"}
                      </span>
                    ) : (
                      <span style={{ color: "#999", fontSize: "13px" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {editingUserId === user.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateUser(user.id)}
                          style={successButton}
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingUserId(null);
                            setFormData({ username: "", password: "", role: "ketua kampung", kampung_name: "" });
                          }}
                          style={{ ...buttonStyle, backgroundColor: "#6c757d", color: "white" }}
                        >
                          ✕ Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(user)}
                          style={primaryButton}
                        >
                          📝 Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={dangerButton}
                          disabled={user.id === parseInt(localStorage.getItem('user_id') || '0')}
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}