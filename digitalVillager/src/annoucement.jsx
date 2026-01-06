import { useState, useEffect } from "react";
import AnnoucementImage from "./assets/images/annoucement.jpeg";
import styles from "./annoucement.module.css";
import api from "./backend/api/apiClient";

export default function AnnouncementPopup() {
  
  const [isOpen, setIsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

 useEffect(() => {
  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("get_annoucement.php");
      if (res.data && res.data.length > 0) {
        setAnnouncements(prev => {
          const merged = [...prev, ...res.data];
          // remove duplicates by id
          return merged.filter(
            (a, index, self) => index === self.findIndex(t => t.id === a.id)
          );
        });
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };
  fetchAnnouncements();
}, []);


  return (

        <div className={styles.contain}>
        <div className={styles.image}>
            <img src={AnnoucementImage} alt="" />
        </div>
        {/* TRIGGER BUTTON */}
        <button onClick={() => setIsOpen(true)} style={triggerBtn}>
            📢 Announcements
            {announcements.length > 0 && (
            <span style={badge}>{announcements.length}</span>
            )}
        </button>

        {/* POPUP OVERLAY */}
        {isOpen && (
            <div style={overlay} onClick={() => setIsOpen(false)}>
            <div style={popup} onClick={(e) => e.stopPropagation()}>
                {/* HEADER */}
                <div style={header}>
                <h2 style={title}>📢 Announcements</h2>
                <button onClick={() => setIsOpen(false)} style={closeBtn}>
                    ✕
                </button>
                </div>

                {/* CONTENT */}
                <div style={content}>
                {announcements.length === 0 ? (
                    <div style={emptyState}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                    <p style={{ color: "#999" }}>No announcements at the moment</p>
                    </div>
                ) : (
                    announcements.map((announcement) => (
                    <div key={announcement.id} style={announcementCard}>
                        <div style={cardHeader}>
                        <span style={getTypeIcon(announcement.type)}>
                            {getTypeEmoji(announcement.type)}
                        </span>
                        <h3 style={cardTitle}>{announcement.title}</h3>
                        </div>
                        <p style={cardMessage}>{announcement.message}</p>
                        <div style={cardFooter}>
                        <span style={dateText}>📅 {announcement.date}</span>
                        </div>
                    </div>
                    ))
                )}
                </div>

                {/* FOOTER */}
                <div style={footer}>
                <button onClick={() => setIsOpen(false)} style={actionBtn}>
                    Close
                </button>
                </div>
            </div>
            </div>
        )}
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

const getTypeIcon = (type) => {
  const colors = {
    warning: { bg: "#FFF3E0", color: "#E65100" },
    info: { bg: "#E1F5FE", color: "#01579B" },
    success: { bg: "#E8F5E9", color: "#1B5E20" },
    urgent: { bg: "#FFEBEE", color: "#C62828" }
  };
  
  const color = colors[type] || { bg: "#f5f5f5", color: "#666" };
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: color.bg,
    fontSize: 20,
    marginRight: 12
  };
};

/* ===== STYLES ===== */

const triggerBtn = {
  //position: "fixed",
  top: 20,
  right: 20,
  padding: "12px 24px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
  transition: "all 0.3s ease",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  gap: 8
};

const badge = {
  background: "#FF5252",
  color: "white",
  borderRadius: "50%",
  width: 24,
  height: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 700,
  marginLeft: 4
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
  zIndex: 2000,
  animation: "fadeIn 0.3s ease"
};

const popup = {
  background: "white",
  borderRadius: 20,
  width: "90%",
  maxWidth: 600,
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  animation: "slideUp 0.3s ease"
};

const header = {
  padding: "24px 32px",
  borderBottom: "2px solid #f0f0f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  borderRadius: "20px 20px 0 0"
};

const title = {
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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease"
};

const content = {
  padding: "24px 32px",
  overflowY: "auto",
  flex: 1
};

const emptyState = {
  textAlign: "center",
  padding: "60px 20px",
  color: "#999"
};

const announcementCard = {
  background: "linear-gradient(135deg, #f8f9ff 0%, #fafbff 100%)",
  border: "2px solid #e0e0e0",
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
  transition: "all 0.3s ease",
  cursor: "pointer"
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  marginBottom: 12
};

const cardTitle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#333"
};

const cardMessage = {
  margin: "0 0 12px 0",
  fontSize: 14,
  lineHeight: 1.6,
  color: "#555"
};

const cardFooter = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const dateText = {
  fontSize: 12,
  color: "#999",
  fontWeight: 500
};

const footer = {
  padding: "16px 32px",
  borderTop: "2px solid #f0f0f0",
  display: "flex",
  justifyContent: "flex-end"
};

const actionBtn = {
  padding: "10px 24px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  transition: "all 0.3s ease"
};