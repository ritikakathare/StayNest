import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Read user details safely from localStorage
  let user = null;

  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Unable to read user details:", error);
    user = null;
  }

  // Get the user's name safely
  const userName =
    user?.name?.trim() ||
    user?.fullName?.trim() ||
    user?.username?.trim() ||
    "Guest";

  const handleHostClick = () => {
    if (!token) {
      navigate("/login");
    } else {
      navigate("/add-property");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        StayNest
      </Link>

      <div className="nav-links">
        <Link to="/">Explore</Link>

        {token ? (
          <>
            <button
              type="button"
              className="host-link"
              onClick={handleHostClick}
            >
              Become a host
            </button>

            <Link to="/my-listings">My Listings</Link>

            <Link to="/dashboard">Trips</Link>

            <span className="welcome">
              Hi, {userName}
            </span>

            <button
              type="button"
              className="nav-btn"
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="host-link"
              onClick={handleHostClick}
            >
              Become a host
            </button>

            <Link to="/login">Login</Link>

            <Link className="nav-btn" to="/register">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}