// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState(""); // Add role state

  const checkSession = () => {
    axios.get("http://localhost/digital-villager-dashboard/backend/api/checkSession.php", {
      withCredentials: true,
    }).then(res => {
      console.log("Session check response:", res.data);
      setLoggedIn(res.data.loggedIn || false);
      setUsername(res.data.username || "");
      setRole(res.data.role || ""); // Set role from session
    }).catch(err => {
      console.error("Session check error:", err);
      setLoggedIn(false);
      setUsername("");
      setRole("");
    });
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Helper function to check if user has a specific role
  const hasRole = (requiredRole) => {
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    return role === requiredRole;
  };

  // Helper function to check if user has a specific permission (requires checkPermission.php)
  const hasPermission = async (permissionName) => {
    try {
      const res = await axios.post(
        "http://localhost/Digital-Villager-Management-Dashboard/digitalVillager/src/api/checkPermission.php",
        { permission: permissionName },
        { withCredentials: true }
      );
      return res.data.hasPermission || false;
    } catch (error) {
      console.error("Permission check error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      loggedIn, 
      username, 
      role,
      setLoggedIn, 
      setUsername, 
      setRole,
      checkSession,
      hasRole,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
}