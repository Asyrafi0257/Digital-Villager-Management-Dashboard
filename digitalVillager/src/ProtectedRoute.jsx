import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "./backend/api/apiClient";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    api.get("/checkSession.php").then(res => {
      setLoggedIn(res.data.loggedIn);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Checking session...</p>;
  return loggedIn ? children : <Navigate to="/login" />;
}