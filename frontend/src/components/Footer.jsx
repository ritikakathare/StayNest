
import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="staynest-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>
            Stay<span>Nest</span>
          </h2>

          <p>
            Find your perfect stay, create unforgettable
            memories, and feel at home wherever you go.
          </p>
        </div>

        <div className="footer-links">
          <h3>Explore</h3>
          <a href="/">Home</a>
          <a href="/properties">Explore Stays</a>
          <a href="/my-trips">My Trips</a>
          <a href="/my-listings">My Listings</a>
        </div>

        <div className="footer-links">
          <h3>Support</h3>
          <a href="/help">Help Center</a>
          <a href="/contact">Contact Us</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms & Conditions</a>
        </div>

        <div className="footer-social">
          <h3>Follow Us</h3>

          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} StayNest. All rights reserved.</p>
        <p>Made with ♥ for travelers</p>
      </div>
    </footer>
  );
};

export default Footer;
