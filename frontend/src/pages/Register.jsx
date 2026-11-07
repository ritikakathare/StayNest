import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await API.post("/auth/register", form);

      navigate("/login");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}
      <section className="login-visual">
        <div className="login-visual-content">

          <div className="login-brand">
            StayNest
          </div>

          <div className="login-badge">
            YOUR NEXT STAY STARTS HERE
          </div>

          <h1>
            Make yourself
            <br />
            <span>at home.</span>
          </h1>

          <p>
            Create your StayNest account and discover beautiful
            places, unique homes and unforgettable stays.
          </p>

          <div className="login-decoration">

            <div className="floating-card card-one">
              <span>🏡</span>

              <div>
                <strong>Beautiful stays</strong>
                <small>Find your perfect place</small>
              </div>
            </div>

            <div className="floating-card card-two">
              <span>✨</span>

              <div>
                <strong>Travel better</strong>
                <small>Discover something new</small>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* RIGHT SIDE */}
      <section className="login-form-area">

        <form
          className="login-card"
          onSubmit={submit}
        >

          <div className="login-card-header">

            <div className="mobile-logo">
              StayNest
            </div>

            <div className="login-icon">
              ✨
            </div>

            <h2>Create account</h2>

            <p>
              Join StayNest and start exploring.
            </p>

          </div>


          {/* NAME */}
          <div className="input-group">

            <label>Full name</label>

            <div className="input-wrapper">

              <span className="input-icon">
                👤
              </span>

              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={update}
                required
              />

            </div>

          </div>


          {/* EMAIL */}
          <div className="input-group">

            <label>Email address</label>

            <div className="input-wrapper">

              <span className="input-icon">
                ✉
              </span>

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update}
                required
              />

            </div>

          </div>


          {/* PASSWORD */}
          <div className="input-group">

            <label>Password</label>

            <div className="input-wrapper">

              <span className="input-icon">
                🔒
              </span>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={update}
                required
                minLength="6"
              />

            </div>

          </div>


          {/* ERROR */}
          {message && (
            <div className="login-error">
              {message}
            </div>
          )}


          {/* REGISTER BUTTON */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>


          {/* DIVIDER */}
          <div className="login-divider">
            <span>or</span>
          </div>


          {/* LOGIN */}
          <p className="login-register">

            Already have an account?

            <Link to="/login">
              Login
            </Link>

          </p>

        </form>

      </section>

    </div>
  );
}