import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../auth/authContext";

export default function Logout() {
  const navigate = useNavigate();
  const { setLoggedIn, setUsername } = useContext(AuthContext);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await axios.post("http://localhost/digital-villager-dashboard/backend/api/logout.php", {}, {
          withCredentials: true,
        });
        console.log("Logout successful");
        // Immediately update context
        setLoggedIn(false);
        setUsername("");
        // Wait a bit then navigate
        await new Promise(resolve => setTimeout(resolve, 300));
        navigate("/");
      } catch (error) {
        console.error("Logout error:", error);
        setLoggedIn(false);
        setUsername("");
        navigate("/");
      }
    };
    
    handleLogout();
  }, [navigate, setLoggedIn, setUsername]);

  return <p>Logging out...</p>;
}