const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Booking = require("../models/Booking");
const Property = require("../models/Property");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Validate booking details and calculate price on the backend
async function validateBookingDetails({
  propertyId,
  checkIn,
  checkOut,
  guests
}) {
  const property = await Property.findById(propertyId);

  if (!property) {
    throw new Error("Property not found");
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const guestCount = Number(guests);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new Error("Invalid dates");
  }

  if (start >= end) {
    throw new Error("Check-out must be after check-in");
  }

  if (start < new Date(new Date().setHours(0, 0, 0, 0))) {
    throw new Error("Check-in cannot be in the past");
  }

  if (
    !Number.isInteger(guestCount) ||
    guestCount < 1 ||
    guestCount > property.guests
  ) {
    throw new Error(`Maximum guests: ${property.guests}`);
  }

  const days = Math.ceil(
    (end.getTime() - start.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const totalPrice = days * property.price;

  return {
    property,
    start,
    end,
    guestCount,
    totalPrice
  };
}

// Create Razorpay order
router.post("/create-order", protect, async (req, res) => {
  try {
    const {
      propertyId,
      checkIn,
      checkOut,
      guests
    } = req.body;

    const details = await validateBookingDetails({
      propertyId,
      checkIn,
      checkOut,
      guests
    });

    const {
      property,
      start,
      end,
      guestCount,
      totalPrice
    } = details;

    // Check existing paid bookings for overlapping dates
    const conflict = await Booking.findOne({
      property: property._id,
      paymentStatus: "paid",
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    });

    if (conflict) {
      return res.status(400).json({
        message: "Property is not available for these dates"
      });
    }

    const amountInPaise = Math.round(totalPrice * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `staynest_${Date.now()}`,
      notes: {
        propertyId: property._id.toString(),
        userId: req.user.toString(),
        checkIn: start.toISOString(),
        checkOut: end.toISOString(),
        guests: guestCount.toString()
      }
    });

    res.status(201).json({
      message: "Razorpay order created",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      totalPrice,
      property: {
        title: property.title,
        location: property.location
      }
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Verify Razorpay payment and create booking
router.post("/verify-payment", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment details are incomplete"
      });
    }

    // Generate expected payment signature
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const generatedBuffer = Buffer.from(
      generatedSignature,
      "hex"
    );

    const receivedBuffer = Buffer.from(
      razorpay_signature,
      "hex"
    );

    if (
      generatedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      )
    ) {
      return res.status(400).json({
        message: "Payment verification failed"
      });
    }

    // Fetch order details from Razorpay
    const order = await razorpay.orders.fetch(
      razorpay_order_id
    );

    if (!order || order.id !== razorpay_order_id) {
      return res.status(400).json({
        message: "Invalid Razorpay order"
      });
    }

    if (order.status !== "paid") {
      return res.status(400).json({
        message: "Payment has not been completed"
      });
    }

    if (order.notes.userId !== req.user.toString()) {
      return res.status(403).json({
        message: "Payment does not belong to your account"
      });
    }

    // Prevent duplicate bookings for the same payment
    const existingBooking = await Booking.findOne({
      razorpayPaymentId: razorpay_payment_id
    });

    if (existingBooking) {
      return res.json({
        message: "Payment already verified",
        booking: existingBooking
      });
    }

    const details = await validateBookingDetails({
      propertyId: order.notes.propertyId,
      checkIn: order.notes.checkIn,
      checkOut: order.notes.checkOut,
      guests: order.notes.guests
    });

    const {
      property,
      start,
      end,
      guestCount,
      totalPrice
    } = details;

    // Confirm the order amount matches the calculated price
    if (order.amount !== Math.round(totalPrice * 100)) {
      return res.status(400).json({
        message: "Payment amount does not match booking amount"
      });
    }

    // Check availability again before confirming booking
    const conflict = await Booking.findOne({
      property: property._id,
      paymentStatus: "paid",
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    });

    if (conflict) {
      return res.status(409).json({
        message:
          "Property is no longer available. Please contact support regarding your payment."
      });
    }

    const booking = await Booking.create({
      property: property._id,
      user: req.user,
      checkIn: start,
      checkOut: end,
      guests: guestCount,
      totalPrice,
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    });

    res.status(201).json({
      message: "Payment verified and booking confirmed",
      booking
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Get logged-in user's bookings
router.get("/my-bookings", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user
    })
      .populate("property")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Cancel booking
router.delete("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    if (
      booking.user.toString() !== req.user.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    await booking.deleteOne();

    res.json({
      message: "Booking cancelled"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});
module.exports = router;