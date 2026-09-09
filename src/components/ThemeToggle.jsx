import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useTheme } from "../context/ThemeContext";
import "./ThemeToggle.css";

function ThemeToggle({ className = "", color }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`theme-toggle-btn ${className}`.trim()}
    >
      {theme === "dark" ? (
        <LightModeIcon fontSize="small" style={{ color: color || "currentColor" }} />
      ) : (
        <DarkModeIcon fontSize="small" style={{ color: color || "currentColor" }} />
      )}
    </button>
  );
}

export default ThemeToggle;