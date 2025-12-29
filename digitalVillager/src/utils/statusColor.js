export const getStatusColor = (status) => {
  switch(status) {
    case "critical": return "#c62828";
    case "pending": return "#f57c00";
    case "in_progress": return "#1976d2";
    case "resolved": return "#388e3c";
    default: return "#666";
  }
};