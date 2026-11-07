
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const initial = {
  title: "",
  description: "",
  location: "",
  price: "",
  category: "House",
  bedrooms: 1,
  guests: 1,
};

export default function AddProperty() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) =>
      data.append(key, value)
    );

    if (image) data.append("image", image);

    try {
      await API.post("/properties", data);
      navigate("/my-listings");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not add property"
      );
    }
  };

  return (
    <div className="add-property-page">
      <PropertyForm
        title="List your property"
        form={form}
        setForm={setForm}
        image={image}
        setImage={setImage}
        onSubmit={submit}
        message={message}
      />
    </div>
  );
}

export function PropertyForm({
  title,
  form,
  setForm,
  image,
  setImage,
  onSubmit,
  message,
}) {
  const update = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <main className="form-page">
      <form className="wide-form" onSubmit={onSubmit}>
        <h1>{title}</h1>

        <div className="input-group">
          <label htmlFor="property-title">Property title</label>
          <input
            id="property-title"
            name="title"
            placeholder="e.g. Cozy mountain villa"
            value={form.title}
            onChange={update}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="property-description">Description</label>
          <textarea
            id="property-description"
            name="description"
            placeholder="Describe your property"
            value={form.description}
            onChange={update}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="property-location">Location</label>
          <input
            id="property-location"
            name="location"
            placeholder="City or destination"
            value={form.location}
            onChange={update}
            required
          />
        </div>

        <div className="two-col">
          <div className="input-group">
            <label htmlFor="property-price">Price per night (₹)</label>
            <input
              id="property-price"
              name="price"
              type="number"
              min="1"
              placeholder="Price per night"
              value={form.price}
              onChange={update}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="property-category">Property type</label>
            <select
              id="property-category"
              name="category"
              value={form.category}
              onChange={update}
            >
              <option>House</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Hotel</option>
              <option>Cabin</option>
            </select>
          </div>
        </div>

        <div className="two-col">
          <div className="input-group">
            <label htmlFor="property-bedrooms">Bedrooms</label>
            <input
              id="property-bedrooms"
              name="bedrooms"
              type="number"
              min="1"
              value={form.bedrooms}
              onChange={update}
            />
          </div>

          <div className="input-group">
            <label htmlFor="property-guests">Maximum guests</label>
            <input
              id="property-guests"
              name="guests"
              type="number"
              min="1"
              value={form.guests}
              onChange={update}
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="property-image">Property image</label>
          <input
            id="property-image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0] || null)}
          />
          {image && (
            <p className="selected-image">
              Selected: {image.name}
            </p>
          )}
        </div>

        <button type="submit" className="primary-btn">
          Save property
        </button>

        {message && (
          <p className="error" role="alert">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
