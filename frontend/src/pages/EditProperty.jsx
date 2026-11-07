import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { PropertyForm } from "./AddProperty";

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const { data } = await API.get(`/properties/${id}`);
        setForm(data.property);
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Could not load property"
        );
      }
    };

    loadProperty();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    [
      "title",
      "description",
      "location",
      "price",
      "category",
      "bedrooms",
      "guests",
    ].forEach((key) => {
      data.append(key, form[key]);
    });

    if (image) {
      data.append("image", image);
    }

    try {
      await API.put(`/properties/${id}`, data);
      navigate("/my-listings");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Update failed"
      );
    }
  };

  if (!form) {
    return (
      <div className="edit-property-page">
        <div className="loading">
          {message || "Loading property..."}
        </div>
      </div>
    );
  }

  return (
    <main className="edit-property-page">
      <PropertyForm
        title="Edit property"
        form={form}
        setForm={setForm}
        image={image}
        setImage={setImage}
        onSubmit={submit}
        message={message}
      />
    </main>
  );
}
