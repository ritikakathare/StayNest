import React from "react";
import { Link } from "react-router-dom";

export default function PropertyCard({ property }) {
  return (
    <article className="property-card">
      <Link to={`/property/${property._id}`}>
        {property.image ? (
          <img className="property-image" src={property.image} alt={property.title} />
        ) : (
          <div className="property-image no-image">No image</div>
        )}
      </Link>

      <div className="property-content">
        <div className="card-title-row">
          <h3>{property.title}</h3>
          {property.rating > 0 && <span>★ {property.rating}</span>}
        </div>

        <p className="muted">{property.location}</p>
        <p className="muted">{property.category} · {property.guests} guests</p>
        <p className="price">₹{property.price.toLocaleString()} <span>/ night</span></p>
      </div>
    </article>
  );
}
