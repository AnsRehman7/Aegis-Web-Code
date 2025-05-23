import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useFirebase } from "../context/Firebase";
import styles from "./login.module.css";

const Login = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError("");
    setLoading(true); 

    try {
      await firebase.loginWithEmailAndPassword(email, password); 
      navigate("/dashboard"); 
    } catch (error) {
      setError("Invalid email or password. Please try again."); 
      console.error("Error during sign-in:", error);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>AEGIS</h2>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>} {/* Display error messages */}
          <div className={styles.inputGroup}>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              onFocus={() => setEmailFocused(true)}
              onBlur={(e) => setEmailFocused(e.target.value !== "")}
            />
            <label className={`${styles.label} ${emailFocused ? styles.active : ""}`} htmlFor="email">
              Email
            </label>
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              onFocus={() => setPasswordFocused(true)}
              onBlur={(e) => setPasswordFocused(e.target.value !== "")}
            />
            <label className={`${styles.label} ${passwordFocused ? styles.active : ""}`} htmlFor="password">
              Password
            </label>
          </div>

          <NavLink to="/forgot-password" className={styles.forgotPassword}>
            Forgot Password?
          </NavLink>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Logging In..." : "Login"} {/* Display loading state */}
          </button>
        </form>

        <p className={styles.signupText}>
          Don't have an account? <NavLink to="/signup">Sign Up</NavLink>
        </p>
      </div>
    </div>
  );
};

export default Login;
