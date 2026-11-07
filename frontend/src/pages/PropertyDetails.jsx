import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";

export default function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1
  });
  const [review, setReview] = useState({
    rating: 5,
    comment: ""
  });
  const [message, setMessage] = useState("");
  const [favorited, setFavorited] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const load = async () => {
    const { data } = await API.get(`/properties/${id}`);

    setProperty(data.property);
    setReviews(data.reviews);

    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (user) {
      setFavorited(data.property.favorites?.includes(user.id));
    }
  };

  useEffect(() => {
    load().catch(() => setMessage("Property not found"));
  }, [id]);

  // Google Maps destination
  const propertyLocation = property?.location?.trim() || "";

  // Open Google Maps directions
  const openDirections = () => {
    if (!propertyLocation) {
      setMessage("Location is not available for this property.");
      return;
    }

    const destination = encodeURIComponent(propertyLocation);

    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Load Razorpay Checkout script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // Reserve property and start Razorpay payment
  const book = async (e) => {
    e.preventDefault();

    if (!localStorage.getItem("token")) {
      setMessage("Please login to reserve this stay.");
      return;
    }

    if (bookingLoading) return;

    setBookingLoading(true);
    setMessage("");

    try {
      // Load Razorpay Checkout
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        setMessage("Could not load Razorpay. Please try again.");
        setBookingLoading(false);
        return;
      }

      // Create order on the backend
      const { data: orderData } = await API.post(
        "/bookings/create-order",
        {
          propertyId: id,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          guests: Number(form.guests)
        }
      );

      const user = JSON.parse(localStorage.getItem("user") || "null");

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "StayNest",
        description: `Booking for ${property.title}`,
        order_id: orderData.orderId,

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },

        theme: {
          color: "#ef5a91"
        },

        // Razorpay calls this after successful checkout
        handler: async function (response) {
          try {
            setMessage("Verifying payment...");

            const { data: verificationData } = await API.post(
              "/bookings/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            );

            setMessage(
              `Payment successful! Your booking is confirmed. Total: ₹${verificationData.booking.totalPrice}`
            );
          } catch (error) {
            setMessage(
              error.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setBookingLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setMessage(
              "Payment was cancelled. Your booking is not confirmed."
            );
            setBookingLoading(false);
          }
        }
      };

      const razorpayCheckout = new window.Razorpay(options);

      razorpayCheckout.on("payment.failed", function (response) {
        setMessage(
          response.error?.description ||
            "Payment failed. Please try again."
        );
        setBookingLoading(false);
      });

      razorpayCheckout.open();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Could not start payment. Please try again."
      );
      setBookingLoading(false);
    }
  };

  const favorite = async () => {
    if (!localStorage.getItem("token")) {
      setMessage("Please login to favorite properties");
      return;
    }

    try {
      const { data } = await API.post(`/properties/${id}/favorite`);
      setFavorited(data.favorited);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Favorite failed"
      );
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();

    try {
      await API.post(`/reviews/${id}`, review);

      setReview({
        rating: 5,
        comment: ""
      });

      await load();
      setMessage("Review added");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Could not add review"
      );
    }
  };

  if (!property) {
    return (
      <div className="loading">
        {message || "Loading..."}
      </div>
    );
  }

  return (
    <main className="details-page">
      <div className="details-layout">
        <div>
          {property.image ? (
            <img
              className="details-image"
              src={property.image}
              alt={property.title}
            />
          ) : (
            <div className="details-image no-image">
              No image
            </div>
          )}
        </div>

        <div>
          <div className="title-line">
            <div>
              <h1>{property.title}</h1>

              <p className="muted">
                📍 {property.location}
              </p>
            </div>

            <button
              type="button"
              className="heart-btn"
              onClick={favorite}
            >
              {favorited ? "♥" : "♡"}
            </button>
          </div>

          <p>{property.description}</p>

          <p className="muted">
            {property.category} · {property.bedrooms} bedrooms ·
            up to {property.guests} guests
          </p>

          <h2>
            ₹{property.price.toLocaleString()}
            <span className="night"> / night</span>
          </h2>

          <form className="booking-box" onSubmit={book}>
            <h3>Reserve this stay</h3>

            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              required
              value={form.checkIn}
              onChange={(e) =>
                setForm({
                  ...form,
                  checkIn: e.target.value,
                  checkOut: ""
                })
              }
            />

            <input
              type="date"
              min={
                form.checkIn ||
                new Date().toISOString().split("T")[0]
              }
              required
              value={form.checkOut}
              onChange={(e) =>
                setForm({
                  ...form,
                  checkOut: e.target.value
                })
              }
            />

            <input
              type="number"
              min="1"
              max={property.guests}
              required
              value={form.guests}
              onChange={(e) =>
                setForm({
                  ...form,
                  guests: e.target.value
                })
              }
            />

            <button
              className="primary-btn"
              type="submit"
              disabled={bookingLoading}
            >
              {bookingLoading
                ? "Processing..."
                : "Reserve"}
            </button>

            {message && (
              <p className="message">{message}</p>
            )}
          </form>
        </div>
      </div>

      {/* Google Maps Location Section */}
      <section className="property-map-section">
        <div className="property-map-heading">
          <div>
            <h2>Where you'll be</h2>

            <p className="muted">
              📍 {propertyLocation || "Location unavailable"}
            </p>
          </div>

          {propertyLocation && (
            <button
              type="button"
              className="primary-btn map-directions-btn"
              onClick={openDirections}
            >
              Get Directions ↗
            </button>
          )}
        </div>

        {propertyLocation ? (
          <div className="property-map-container">
            <iframe
              title={`Map showing ${propertyLocation}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                propertyLocation
              )}&output=embed`}
              width="100%"
              height="400"
              style={{
                border: 0,
                display: "block"
              }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          <p className="muted">
            The host has not added a location for this property yet.
          </p>
        )}
      </section>

      {/* Reviews Section */}
      <section className="reviews">
        <h2>
          Reviews {property.rating > 0 && `· ★ ${property.rating}`}
        </h2>

        <div className="review-grid">
          {reviews.map((r) => (
            <div className="review-card" key={r._id}>
              <strong>{r.user?.name}</strong>
              <div>★ {r.rating}</div>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>

        {localStorage.getItem("token") ? (
          <form
            className="review-form"
            onSubmit={submitReview}
          >
            <h3>Leave a review</h3>

            <select
              value={review.rating}
              onChange={(e) =>
                setReview({
                  ...review,
                  rating: Number(e.target.value)
                })
              }
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </select>

            <textarea
              placeholder="Write your review"
              required
              value={review.comment}
              onChange={(e) =>
                setReview({
                  ...review,
                  comment: e.target.value
                })
              }
            />

            <button className="primary-btn" type="submit">
              Submit review
            </button>
          </form>
        ) : (
          <p>
            <Link to="/login">Login</Link> to leave a review.
          </p>
        )}
      </section>
    </main>
  );
}