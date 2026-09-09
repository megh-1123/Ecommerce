import { useState } from "react";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginStart, loginSuccess, loginFailure } from "../features/auth/authSlice";
import { api } from "../services/api";
import "./Auth.css";
import "../styles/layout.css";
import "../styles/buttons.css";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const justRegistered = location.state?.registered;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const data = await api.post("/auth/login", formData);
      dispatch(loginSuccess(data));
      navigate("/");
    } catch (err) {
      dispatch(loginFailure(err.message));
    }
  };

  return (
    <div className="container auth-page">
      <div className="auth-card">
        <h2 className="section-title" style={{ padding: 0, marginBottom: "0.5rem" }}>
          Welcome Back
        </h2>
        <p className="section-subtitle" style={{ paddingBottom: "1.5rem" }}>
          Login to continue shopping.
        </p>

        {justRegistered && (
          <p className="auth-success">Account created! Please login.</p>
        )}
        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div style={{ margin: "1.5rem 0", textAlign: "center", color: "#888" }}>or</div>
        <GoogleSignInButton />

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;