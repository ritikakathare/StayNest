
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const { data } = await API.post("/auth/login", form);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to login. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-visual-content">
          <div className="login-brand">StayNest</div>

          <div className="login-badge">
            ✦ YOUR NEXT ESCAPE AWAITS
          </div>

          <h1>
            Come back to
            <br />
            <span>your happy place.</span>
          </h1>

          <p>
            Discover beautiful stays, save your favorite
            places and plan your next unforgettable trip.
          </p>

          <div className="login-decoration">
            <div className="floating-card card-one">
              <span>🏡</span>
              <div>
                <strong>Beautiful stays</strong>
                <small>Just for you</small>
              </div>
            </div>

            <div className="floating-card card-two">
              <span>♥</span>
              <div>
                <strong>4.9 ★</strong>
                <small>Guest rating</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-area">
        <form className="login-card" onSubmit={submit}>
          <div className="login-card-header">
            <div className="mobile-logo">StayNest</div>
            <div className="login-icon">✦</div>
            <h2>Welcome back</h2>
            <p>Log in to continue your journey.</p>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email address</label>

            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="password-label">
              <label htmlFor="password">Password</label>

              {/* Updated Forgot Password link */}
              <Link
                to="/forgot-password"
                className="forgot-btn"
              >
                Forgot password?
              </Link>
            </div>

            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {message && (
            <div className="login-error">
              ⚠ {message}
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <span>→</span>
              </>
            )}
          </button>

          <div className="login-divider">
            <span>or</span>
          </div>

          <p className="login-register">
            New to StayNest?{" "}
            <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
