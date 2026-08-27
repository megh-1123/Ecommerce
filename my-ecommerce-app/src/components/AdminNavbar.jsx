import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import "./AdminNavbar.css";

function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  return (
    <nav className="admin-navbar">
      <Link to="/admin" className="admin-navbar-logo">
        MyShop Admin
      </Link>
      <div className="admin-navbar-actions">
        <ThemeToggle color="#fff" />
        <button className="admin-navbar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AdminNavbar;