import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import styles from "../pages/Login/Login.module.css";

export default function AuthHeader() {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.logo} onClick={() => navigate("/")}>
          <div className={styles.logoIcon}></div>
          <span>StudyQuest</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/")}
            type="button"
          >
            ← Về Trang Chủ
          </button>
          <button
            className={styles.themeToggleBtn}
            onClick={toggleTheme}
            type="button"
            aria-label="Chuyển chế độ sáng/tối"
            title="Chuyển chế độ sáng/tối"
          >
            {isDark ? "🌞 Sáng" : "🌙 Tối"}
          </button>
        </div>
      </nav>
    </header>
  );
}