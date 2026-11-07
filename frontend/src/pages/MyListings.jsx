import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function MyListings() {
  const [properties, setProperties] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setMessage("");

      const { data } = await API.get("/properties/my-listings");
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load listings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      setDeletingId(id);
      setMessage("");

      await API.delete(`/properties/${id}`);

      setProperties((previous) =>
        previous.filter((property) => property._id !== id)
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to delete this property"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="container my-listings-page">
      {/* PAGE HEADER */}

      <div className="my-listings-header">
        <div>
          <span className="my-listings-eyebrow">HOST DASHBOARD</span>
          <h1>My Listings</h1>
          <p>Manage the properties you've shared with travelers.</p>
        </div>

        <Link className="my-listings-add-btn" to="/add-property">
          <span>＋</span>
          Add property
        </Link>
      </div>

      {/* ERROR MESSAGE */}

      {message && (
        <div className="my-listings-message">
          {message}
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div className="my-listings-loading">
          <div className="my-listings-spinner"></div>
          <p>Loading your properties...</p>
        </div>
      ) : properties.length > 0 ? (
        <>
          <div className="my-listings-summary">
            <span>
              {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"} listed
            </span>
          </div>

          <div className="my-listings-grid">
            {properties.map((property) => (
              <article
                className="my-listing-card"
                key={property._id}
              >
                {/* PROPERTY IMAGE */}

                <Link
                  to={`/property/${property._id}`}
                  className="my-listing-image-link"
                >
                  {property.image ? (
                    <img
                      className="my-listing-image"
                      src={property.image}
                      alt={property.title}
                    />
                  ) : (
                    <div className="my-listing-no-image">
                      <span>🏡</span>
                      <p>No image available</p>
                    </div>
                  )}

                  <span className="my-listing-image-label">
                    Your listing
                  </span>
                </Link>

                {/* PROPERTY DETAILS */}

                <div className="my-listing-content">
                  <div className="my-listing-title-row">
                    <h2>{property.title}</h2>
                    <span className="my-listing-category">
                      {property.category || "Stay"}
                    </span>
                  </div>

                  <p className="my-listing-location">
                    <span>📍</span>
                    {property.location}
                  </p>

                  <div className="my-listing-info">
                    <span>🛏 {property.bedrooms || 1} bedrooms</span>
                    <span>👥 {property.guests || 1} guests</span>
                  </div>

                  <div className="my-listing-price">
                    <strong>₹{Number(property.price).toLocaleString("en-IN")}</strong>
                    <span>/ night</span>
                  </div>

                  {/* ACTIONS */}

                  <div className="my-listing-actions">
                    <Link
                      className="my-listing-edit-btn"
                      to={`/edit-property/${property._id}`}
                    >
                      ✎ Edit listing
                    </Link>

                    <button
                      type="button"
                      className="my-listing-delete-btn"
                      onClick={() => remove(property._id)}
                      disabled={deletingId === property._id}
                    >
                      {deletingId === property._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="my-listings-empty">
          <div className="my-listings-empty-icon">🏡</div>
          <h2>No properties listed yet</h2>
          <p>
            Your properties will appear here after you add your first stay.
          </p>

          <Link className="my-listings-add-btn" to="/add-property">
            ＋ Add your first property
          </Link>
        </div>
      )}
    </main>
  );
}