const express = require("express");
const Property = require("../models/Property");
const Review = require("../models/Review");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

function imageUrl(req, file) {
  if (!file) return "";
  if (file.path && file.path.startsWith("http")) return file.path;
  return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
}

// All properties + search/filter
// All properties + search/filter
router.get("/", async (req, res) => {
  try {
    const { location, category, minPrice, maxPrice, guests } = req.query;

    const filter = {};

    // Search by location (case-insensitive)
    if (location && location.trim()) {
      filter.location = {
        $regex: location.trim(),
        $options: "i",
      };
    }

    // Filter by property category
    if (category && category.trim()) {
      filter.category = category.trim();
    }

    // Filter by price range
    const priceFilter = {};

    if (minPrice !== undefined && minPrice !== "") {
      priceFilter.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined && maxPrice !== "") {
      priceFilter.$lte = Number(maxPrice);
    }

    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }

    // Show properties that can accommodate the requested guests
    if (guests !== undefined && guests !== "") {
      filter.guests = {
        $gte: Number(guests),
      };
    }

    console.log("Property search filters:", filter);

    const properties = await Property.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(properties);
  } catch (error) {
    console.error("Property search error:", error);

    res.status(500).json({
      message: "Failed to search properties",
      error: error.message,
    });
  }
});

// Current user's listings — must be before /:id
router.get("/my-listings", protect, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("owner", "name email");
    if (!property) return res.status(404).json({ message: "Property not found" });

    const reviews = await Review.find({ property: property._id })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ property, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const property = await Property.create({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      price: Number(req.body.price),
      category: req.body.category,
      bedrooms: Number(req.body.bedrooms),
      guests: Number(req.body.guests),
      image: imageUrl(req, req.file),
      owner: req.user
    });

    res.status(201).json({ message: "Property added successfully", property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user.toString()) {
      return res.status(403).json({ message: "You can only edit your own property" });
    }

    const fields = ["title", "description", "location", "category"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) property[field] = req.body[field];
    });

    if (req.body.price !== undefined) property.price = Number(req.body.price);
    if (req.body.bedrooms !== undefined) property.bedrooms = Number(req.body.bedrooms);
    if (req.body.guests !== undefined) property.guests = Number(req.body.guests);
    if (req.file) property.image = imageUrl(req, req.file);

    await property.save();
    res.json({ message: "Property updated successfully", property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user.toString()) {
      return res.status(403).json({ message: "You can only delete your own property" });
    }

    await Review.deleteMany({ property: property._id });
    await property.deleteOne();

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favorite/unfavorite
router.post("/:id/favorite", protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    const index = property.favorites.findIndex((id) => id.toString() === req.user.toString());

    if (index >= 0) {
      property.favorites.splice(index, 1);
    } else {
      property.favorites.push(req.user);
    }

    await property.save();

    res.json({
      favorited: index < 0,
      count: property.favorites.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
