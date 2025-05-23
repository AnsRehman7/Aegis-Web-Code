import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = ({ childList, loading, onSelectChild, selectedChild }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();


  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h3 className={styles.logo}>AEGIS</h3>

        <input
          type="text"
          placeholder="Search children..."
          className={styles["search-bar"]}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
        />

        {loading ? (
          <p>Loading children...</p>
        ) : (
          <ul className={styles["child-list"]}>
            {childList
              .filter((child) =>
                child.name?.toLowerCase().includes(search.toLowerCase())
              )
              .map((child) => (
                <li
                  key={child.id}
                  onClick={() => onSelectChild(child)} // Only call onSelectChild
                  className={`${styles["child-item"]} ${selectedChild?.id === child.id ? styles.active : ""}`}
                  title={`ID: ${child.id}`}
                >
                  {child.name}
                </li>
              ))}
          </ul>
        )}

        <button
          className={styles["add-btn"]}
          onClick={() => navigate("/connectApp")}
        >
          Connect App
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
