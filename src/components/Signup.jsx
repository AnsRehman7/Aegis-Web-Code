import { useFirebase } from "../context/Firebase";
import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import styles from "./signup.module.css";

const Signup = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameFocused, setUsernameFocused] = useState(false); // Added this state
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      await firebase.registerWithEmailAndPassword(email, password, username);
      navigate("/dashboard");
    } catch (error) {
      setError("Already have account.Login Instead.");
      console.error("Error during signup:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>AEGIS</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.inputGroup}>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.input}
              onFocus={() => setUsernameFocused(true)}
              onBlur={(e) => setUsernameFocused(e.target.value !== "")}
            />
            <label className={`${styles.label} ${usernameFocused ? styles.active : ""}`} htmlFor="username">
              Username
            </label>
          </div>

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

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Signing Up..." : "Signup"}
          </button>
        </form>

        <p className={styles.signupText}>
          Already have an account? <NavLink to="/login">Login</NavLink>
        </p>
      </div>
    </div>
  );
};

export default Signup;
