import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setMessage("");

      const { data } = await API.get("/bookings/my-bookings");
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const cancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancelingId(id);
      setMessage("");

      await API.delete(`/bookings/${id}`);

      setBookings((previous) =>
        previous.filter((booking) => booking._id !== id)
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Cancellation failed"
      );
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <main className="container trips-page">
      {/* HEADER */}

      <header className="trips-header">
        <div>
          <span className="trips-eyebrow">YOUR TRAVEL JOURNEY</span>
          <h1>My Trips</h1>
          <p>All your getaways, together in one place.</p>
        </div>

        <Link to="/" className="trips-explore-btn">
          Explore stays
        </Link>
      </header>

      {/* MESSAGE */}

      {message && (
        <div className="trips-message">
          {message}
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div className="trips-loading">
          <div className="trips-spinner"></div>
          <p>Loading your trips...</p>
        </div>
      ) : bookings.length > 0 ? (
        <>
          <div className="trips-summary">
            <span>
              {bookings.length}{" "}
              {bookings.length === 1 ? "trip" : "trips"} booked
            </span>
          </div>

          <div className="trips-list">
            {bookings.map((booking) => (
              <article className="trip-card" key={booking._id}>
                {/* IMAGE */}

                <div className="trip-image-wrap">
                  {booking.property?.image ? (
                    <img
                      src={booking.property.image}
                      alt={booking.property?.title || "Booked property"}
                      className="trip-image"
                    />
                  ) : (
                    <div className="trip-no-image">
                      <span>🏡</span>
                      <p>StayNest</p>
                    </div>
                  )}
                </div>

                {/* DETAILS */}

                <div className="trip-content">
                  <div className="trip-top-row">
                    <div>
                      <span className="trip-label">YOUR STAY</span>

                      <h2>
                        {booking.property?.title || "Property"}
                      </h2>

                      <p className="trip-location">
                        📍 {booking.property?.location || "Location unavailable"}
                      </p>
                    </div>

                    <span className="trip-status">
                      Booked
                    </span>
                  </div>

                  {/* DATE DETAILS */}

                  <div className="trip-details-grid">
                    <div className="trip-detail">
                      <span className="trip-detail-label">
                        CHECK-IN
                      </span>
                      <strong>{formatDate(booking.checkIn)}</strong>
                    </div>

                    <div className="trip-detail">
                      <span className="trip-detail-label">
                        CHECK-OUT
                      </span>
                      <strong>{formatDate(booking.checkOut)}</strong>
                    </div>

                    <div className="trip-detail">
                      <span className="trip-detail-label">
                        GUESTS
                      </span>
                      <strong>
                        {booking.guests}{" "}
                        {Number(booking.guests) === 1 ? "guest" : "guests"}
                      </strong>
                    </div>
                  </div>

                  {/* PRICE AND ACTION */}

                  <div className="trip-bottom-row">
                    <div className="trip-total">
                      <span>Total price</span>
                      <strong>
                        ₹{Number(booking.totalPrice || 0).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="trip-cancel-btn"
                      onClick={() => cancel(booking._id)}
                      disabled={cancelingId === booking._id}
                    >
                      {cancelingId === booking._id
                        ? "Cancelling..."
                        : "Cancel booking"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        /* EMPTY STATE */

        <section className="trips-empty">
          <div className="trips-empty-icon">✈️</div>

          <h2>No trips planned yet</h2>

          <p>
            Your next adventure is waiting. Find a beautiful stay and
            your booking will appear here.
          </p>

          <Link to="/" className="trips-explore-btn">
            Discover stays
          </Link>
        </section>
      )}
    </main>
  );
}