import React, { useEffect, useRef, useState } from "react";
import API from "../services/api";
import PropertyCard from "../components/PropertyCard";

const initialFilters = {
  location: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  guests: "",
};

const destinations = [
  {
    name: "Goa",
    subtitle: "Beach escapes",
    emoji: "🌴",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85",
    description:
      "Wake up to ocean views, golden beaches, and unforgettable sunsets.",
  },
  {
    name: "Coorg",
    subtitle: "Mountain retreats",
    emoji: "🌿",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85",
    description:
      "Escape into misty forests, coffee plantations, and peaceful retreats.",
  },
  {
    name: "Manali",
    subtitle: "Snow adventures",
    emoji: "🏔️",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85",
    description:
      "Discover mountain views, cozy cabins, and your next mountain adventure.",
  },
  {
    name: "Udupi",
    subtitle: "Coastal stays",
    emoji: "🌊",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=85",
    description:
      "Find peaceful coastal stays near beautiful beaches and seaside escapes.",
  },
];

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);

  const [selectedDestination, setSelectedDestination] = useState(null);
  const [destinationStays, setDestinationStays] = useState([]);
  const [destinationLoading, setDestinationLoading] = useState(false);

  // Reference to the property results section
  const staysSectionRef = useRef(null);

  // Scroll to property results after a user searches
  const scrollToResults = () => {
    setTimeout(() => {
      staysSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  };

  // Remove empty filters before sending them to the backend
  const cleanFilters = (searchFilters) => {
    const params = {};

    Object.entries(searchFilters).forEach(([key, value]) => {
      if (
        value !== "" &&
        value !== null &&
        value !== undefined
      ) {
        params[key] = value;
      }
    });

    return params;
  };

  // Search properties using the current filters
  const search = async (
    searchFilters = filters,
    shouldScroll = false
  ) => {
    try {
      setLoading(true);

      const params = cleanFilters(searchFilters);

      const { data } = await API.get("/properties", {
        params,
      });

      setProperties(Array.isArray(data) ? data : []);

      // Scroll only when the user clicks Search
      if (shouldScroll) {
        scrollToResults();
      }
    } catch (error) {
      console.error(
        "Error searching properties:",
        error.response?.data || error.message
      );

      setProperties([]);

      if (shouldScroll) {
        scrollToResults();
      }
    } finally {
      setLoading(false);
    }
  };

  // Load all properties when the page opens
  useEffect(() => {
    search(initialFilters);
  }, []);

  // Update search input values
  const update = (e) => {
    const { name, value } = e.target;

    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
  };

  // Open a destination popup and load stays for that destination
  const openDestination = async (destination) => {
    setSelectedDestination(destination);
    setDestinationStays([]);

    try {
      setDestinationLoading(true);

      const destinationFilters = {
        ...filters,
        location: destination.name,
      };

      const params = cleanFilters(destinationFilters);

      const { data } = await API.get("/properties", {
        params,
      });

      setDestinationStays(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Error loading destination stays:",
        error.response?.data || error.message
      );

      setDestinationStays([]);
    } finally {
      setDestinationLoading(false);
    }
  };

  // Search for the selected destination on the main page
  const exploreDestination = () => {
    if (!selectedDestination) return;

    const destinationFilters = {
      ...filters,
      location: selectedDestination.name,
    };

    setFilters(destinationFilters);
    setSelectedDestination(null);

    // Search and scroll to the results
    search(destinationFilters, true);
  };

  // Close destination popup
  const closeDestination = () => {
    setSelectedDestination(null);
  };

  return (
    <div className="home-page">
      {/* ================= HERO ================= */}

      <section className="hero">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-badge">
            ✦ YOUR NEXT ESCAPE AWAITS
          </div>

          <h1>
            Find a place
            <br />
            <span>you'll love to stay.</span>
          </h1>

          <p>
            Beautiful homes, unique stays and unforgettable
            experiences — all in one place.
          </p>

          {/* SEARCH PANEL */}

          <div className="search-panel">
            {/* LOCATION */}

            <div className="search-field">
              <span className="search-icon">📍</span>

              <div>
                <label htmlFor="search-location">Where</label>

                <input
                  id="search-location"
                  name="location"
                  placeholder="Search destinations"
                  value={filters.location}
                  onChange={update}
                />
              </div>
            </div>

            {/* PROPERTY CATEGORY */}

            <div className="search-field">
              <span className="search-icon">🏠</span>

              <div>
                <label htmlFor="search-category">Stay type</label>

                <select
                  id="search-category"
                  name="category"
                  value={filters.category}
                  onChange={update}
                >
                  <option value="">Any type</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Cabin">Cabin</option>
                </select>
              </div>
            </div>

            {/* BUDGET */}

            <div className="search-field">
              <span className="search-icon">₹</span>

              <div>
                <label htmlFor="search-budget">Budget</label>

                <input
                  id="search-budget"
                  name="maxPrice"
                  type="number"
                  min="0"
                  placeholder="Max price"
                  value={filters.maxPrice}
                  onChange={update}
                />
              </div>
            </div>

            {/* GUESTS */}

            <div className="search-field">
              <span className="search-icon">👥</span>

              <div>
                <label htmlFor="search-guests">Guests</label>

                <input
                  id="search-guests"
                  name="guests"
                  type="number"
                  min="1"
                  placeholder="Add guests"
                  value={filters.guests}
                  onChange={update}
                />
              </div>
            </div>

            {/* SEARCH BUTTON */}

            <button
              className="hero-search-btn"
              type="button"
              onClick={() => search(filters, true)}
            >
              <span>⌕</span>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ================= DESTINATIONS ================= */}

      <section className="container destinations-section">
        <div className="section-heading">
          <div>
            <span className="section-label">EXPLORE</span>
            <h2>Popular destinations</h2>
          </div>
        </div>

        <div className="destination-grid">
          {destinations.map((destination) => (
            <button
              key={destination.name}
              type="button"
              className={`destination-card destination-${destination.name.toLowerCase()}`}
              onClick={() => openDestination(destination)}
              style={{
                backgroundImage: `url("${destination.image}")`,
              }}
            >
              <div>
                <span>{destination.emoji}</span>
                <h3>{destination.name}</h3>
                <p>{destination.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ================= PROPERTY SECTION ================= */}

      <main
        ref={staysSectionRef}
        className="container stays-section"
      >
        <div className="section-heading">
          <div>
            <span className="section-label">DISCOVER</span>
            <h2>Explore stays</h2>
          </div>

          <span className="property-count">
            {properties.length} places
          </span>
        </div>

        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Finding beautiful stays...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="property-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
              />
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="empty-icon">🏡</div>

            <h3>No stays found</h3>

            <p>
              Try changing your search filters.
            </p>

            <button
              className="primary-btn"
              type="button"
              onClick={() => {
                setFilters(initialFilters);
                search(initialFilters, true);
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      {/* ================= DESTINATION POPUP ================= */}

      {selectedDestination && (
        <div
          className="destination-modal-backdrop"
          onClick={closeDestination}
        >
          <section
            className="destination-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedDestination.name} destination`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}

            <button
              type="button"
              className="destination-modal-close"
              aria-label="Close popup"
              onClick={closeDestination}
            >
              ×
            </button>

            {/* DESTINATION IMAGE */}

            <div
              className="destination-modal-hero"
              style={{
                backgroundImage: `url("${selectedDestination.image}")`,
              }}
            >
              <div className="destination-modal-hero-overlay"></div>

              <div className="destination-modal-hero-content">
                <span className="destination-modal-eyebrow">
                  YOUR NEXT GETAWAY
                </span>

                <h2>
                  {selectedDestination.emoji}{" "}
                  {selectedDestination.name}
                </h2>

                <p>{selectedDestination.description}</p>
              </div>
            </div>

            {/* DESTINATION CONTENT */}

            <div className="destination-modal-content">
              <div className="destination-modal-heading">
                <div>
                  <span className="section-label">
                    HANDPICKED FOR YOU
                  </span>

                  <h3>Find your perfect stay</h3>
                </div>

                <span className="destination-modal-count">
                  {destinationStays.length}{" "}
                  {destinationStays.length === 1
                    ? "stay"
                    : "stays"}
                </span>
              </div>

              {/* LOADING DESTINATION STAYS */}

              {destinationLoading ? (
                <div className="loading">
                  <div className="loading-spinner"></div>

                  <p>
                    Finding beautiful stays in{" "}
                    {selectedDestination.name}...
                  </p>
                </div>
              ) : destinationStays.length > 0 ? (
                <div className="destination-modal-property-grid">
                  {destinationStays.slice(0, 4).map((property) => (
                    <PropertyCard
                      key={property._id}
                      property={property}
                    />
                  ))}
                </div>
              ) : (
                <div className="destination-modal-empty">
                  <div className="destination-modal-empty-icon">
                    ✨
                  </div>

                  <h4>Your getaway is waiting</h4>

                  <p>
                    There are no listed stays in{" "}
                    {selectedDestination.name} yet. Explore the
                    destination and check back soon.
                  </p>
                </div>
              )}

              {/* EXPLORE DESTINATION BUTTON */}

              <button
                type="button"
                className="destination-modal-explore"
                onClick={exploreDestination}
              >
                Explore {selectedDestination.name} stays
                <span>→</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}   