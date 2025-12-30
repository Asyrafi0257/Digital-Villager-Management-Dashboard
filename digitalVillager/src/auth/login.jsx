import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./authContext";
import styles from "./login.module.css";

export default function Login() {
  const [username, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { checkSession } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost/digital-villager-dashboard/backend/api/login.php",
        { username, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        setMessage("Login successful!");
        await checkSession();
        navigate("/dashboard");
      } else {
        setMessage(res.data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setMessage(error.response?.data?.error || "Error during login.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            className={styles.input}
            value={username}
            onChange={e => setUsernameInput(e.target.value)}
            placeholder="Username"
          />
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button className={styles.button} type="submit">Login</button>
        </form>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}