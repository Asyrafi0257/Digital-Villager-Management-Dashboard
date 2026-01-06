import { useState, useEffect } from "react";
import api from "../backend/api/apiClient";

export default function AdminAnnouncementManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    date: new Date().toISOString().split('T')[0]
  });

  // Auto-fetch announcements when component loads
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Fetch announcements from API
  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("get_annoucement.php");
      setAnnouncements(data);
    } catch (error) {
      console.error("Failed to fetch announcements", error);
    }
  };

  // Create new announcement
  const createAnnouncement = async () => {
    try {
      await api.post("create_annoucement.php", formData);
      fetchAnnouncements();
      resetForm();
      alert("✅ Announcement created successfully!");
    } catch (error) {
      console.error("Failed to create announcement", error);
      alert("❌ Failed to create announcement");
    }
  };

  // Update announcement
  const updateAnnouncement = async () => {
    try {
      await api.put(`update_annoucement.php?id=${editingId}`, formData);
      fetchAnnouncements();
      resetForm();
      alert("✅ Announcement updated successfully!");
    } catch (error) {
      console.error("Failed to update announcement", error);
      alert("❌ Failed to update announcement");
    }
  };

  // Delete announcement
  const deleteAnnouncement = async (id) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    
    try {
      await api.delete(`delete_annoucement.php?id=${id}`);
      fetchAnnouncements();
      alert("✅ Announcement deleted successfully!");
    } catch (error) {
      console.error("Failed to delete announcement", error);
      alert("❌ Failed to delete announcement");
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (editingId) {
      await updateAnnouncement();
    } else {
      await createAnnouncement();
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  // Edit announcement
  const editAnnouncement = (announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      date: announcement.date
    });
    setEditingId(announcement.id);
    setIsFormOpen(true);
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 24px",
      width: 1280
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 16,
          padding: "32px 40px",
          marginBottom: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: 36, 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 800
            }}>
              📢 Announcement Manager
            </h1>
            <p style={{ 
              color: "#666", 
              margin: "8px 0 0 0",
              fontSize: 16
            }}>
              Create, edit, and manage system announcements
            </p>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)} 
            style={primaryBtn}
          >
            ➕ New Announcement
          </button>
        </div>

        {/* FORM MODAL */}
        {isFormOpen && (
          <div style={overlay} onClick={resetForm}>
            <div style={modal} onClick={(e) => e.stopPropagation()}>
              <div style={modalHeader}>
                <h2 style={modalTitle}>
                  {editingId ? "✏️ Edit Announcement" : "➕ New Announcement"}
                </h2>
                <button onClick={resetForm} style={closeBtn}>✕</button>
              </div>

              <div style={formStyle}>
                <div style={formGroup}>
                  <label style={label}>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 🚨 AMARAN BENCANA MALAYSIA"
                    style={inputStyle}
                  />
                </div>

                <div style={formGroup}>
                  <label style={label}>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Enter announcement details..."
                    style={{...inputStyle, resize: "vertical"}}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={formGroup}>
                    <label style={label}>Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      <option value="info">ℹ️ Info</option>
                      <option value="warning">⚠️ Warning</option>
                      <option value="urgent">🚨 Urgent</option>
                      <option value="success">✅ Success</option>
                    </select>
                  </div>

                  <div style={formGroup}>
                    <label style={label}>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button onClick={handleSubmit} style={submitBtn}>
                    {editingId ? "💾 Update" : "✅ Create"}
                  </button>
                  <button onClick={resetForm} style={cancelBtn}>
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS LIST */}
        <div style={cardStyle}>
          <h2 style={cardTitle}>📋 Active Announcements</h2>
          
          {announcements.length === 0 ? (
            <div style={emptyState}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
              <p style={{ fontSize: 18, color: "#999" }}>No announcements yet</p>
              <p style={{ fontSize: 14, color: "#bbb" }}>Click "New Announcement" to create one</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {announcements.map((announcement) => (
                <div key={announcement.id} style={announcementCard(announcement.type)}>
                  <div style={cardHeader}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <span style={typeBadge(announcement.type)}>
                          {getTypeEmoji(announcement.type)} {announcement.type.toUpperCase()}
                        </span>
                        <span style={dateText}>📅 {announcement.date}</span>
                      </div>
                      <h3 style={cardTitleStyle}>{announcement.title}</h3>
                      <p style={cardMessage}>{announcement.message}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button 
                        onClick={() => editAnnouncement(announcement)} 
                        style={editBtn}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => deleteAnnouncement(announcement.id)} 
                        style={deleteBtn}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== HELPER FUNCTIONS ===== */
const getTypeEmoji = (type) => {
  const emojis = {
    warning: "⚠️",
    info: "ℹ️",
    success: "✅",
    urgent: "🚨"
  };
  return emojis[type] || "📢";
};

const getTypeColor = (type) => {
  const colors = {
    warning: { bg: "#FFF3E0", border: "#FFA726", text: "#E65100" },
    info: { bg: "#E1F5FE", border: "#29B6F6", text: "#01579B" },
    success: { bg: "#E8F5E9", border: "#66BB6A", text: "#1B5E20" },
    urgent: { bg: "#FFEBEE", border: "#EF5350", text: "#C62828" }
  };
  return colors[type] || { bg: "#f5f5f5", border: "#ccc", text: "#666" };
};

/* ===== STYLES ===== */

const primaryBtn = {
  padding: "12px 24px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
  transition: "all 0.3s ease"
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000
};

const modal = {
  background: "white",
  borderRadius: 20,
  width: "90%",
  maxWidth: 700,
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
};

const modalHeader = {
  padding: "24px 32px",
  borderBottom: "2px solid #f0f0f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  borderRadius: "20px 20px 0 0"
};

const modalTitle = {
  margin: 0,
  fontSize: 24,
  fontWeight: 800,
  color: "white"
};

const closeBtn = {
  background: "rgba(255, 255, 255, 0.2)",
  border: "none",
  color: "white",
  fontSize: 24,
  width: 36,
  height: 36,
  borderRadius: "50%",
  cursor: "pointer",
  transition: "all 0.3s ease"
};

const formStyle = {
  padding: "32px"
};

const formGroup = {
  marginBottom: 20
};

const label = {
  display: "block",
  marginBottom: 8,
  fontWeight: 600,
  fontSize: 14,
  color: "#333"
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 10,
  border: "2px solid #e0e0e0",
  fontSize: 14,
  transition: "all 0.3s ease",
  outline: "none",
  fontFamily: "inherit"
};

const submitBtn = {
  flex: 1,
  padding: "12px 24px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
};

const cancelBtn = {
  flex: 1,
  padding: "12px 24px",
  background: "white",
  color: "#666",
  border: "2px solid #e0e0e0",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14
};

const cardStyle = {
  background: "rgba(255,255,255,0.95)",
  borderRadius: 16,
  padding: 32,
  boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
};

const cardTitle = {
  margin: "0 0 24px 0",
  fontSize: 24,
  fontWeight: 700,
  color: "#333"
};

const emptyState = {
  textAlign: "center",
  padding: "80px 20px",
  color: "#999"
};

const announcementCard = (type) => {
  const color = getTypeColor(type);
  return {
    background: color.bg,
    border: `2px solid ${color.border}`,
    borderRadius: 12,
    padding: 20,
    transition: "all 0.3s ease"
  };
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start"
};

const typeBadge = (type) => {
  const color = getTypeColor(type);
  return {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: "white",
    color: color.text,
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  };
};

const dateText = {
  fontSize: 12,
  color: "#666",
  fontWeight: 500
};

const cardTitleStyle = {
  margin: "8px 0",
  fontSize: 18,
  fontWeight: 700,
  color: "#333"
};

const cardMessage = {
  margin: "8px 0 0 0",
  fontSize: 14,
  lineHeight: 1.6,
  color: "#555",
  whiteSpace: "pre-wrap"
};

const editBtn = {
  width: 40,
  height: 40,
  background: "white",
  border: "2px solid #29B6F6",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 18,
  transition: "all 0.3s ease"
};

const deleteBtn = {
  width: 40,
  height: 40,
  background: "white",
  border: "2px solid #EF5350",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 18,
  transition: "all 0.3s ease"
};