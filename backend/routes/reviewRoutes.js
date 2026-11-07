const express = require("express");
const Review = require("../models/Review");
const Property = require("../models/Property");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:propertyId", async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:propertyId", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const property = await Property.findById(req.params.propertyId);

    if (!property) return res.status(404).json({ message: "Property not found" });

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const review = await Review.create({
      property: property._id,
      user: req.user,
      rating: Number(rating),
      comment
    });

    const stats = await Review.aggregate([
      { $match: { property: property._id } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    property.rating = Number(stats[0].avg.toFixed(1));
    property.reviewCount = stats[0].count;
    await property.save();

    await review.populate("user", "name");

    res.status(201).json({ message: "Review added", review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this property" });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
