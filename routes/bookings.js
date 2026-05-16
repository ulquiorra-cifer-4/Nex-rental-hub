const express  = require("express");
const mongoose = require("mongoose");
const Booking  = require("../models/Booking");
const Car      = require("../models/Car");

const router = express.Router();

// Helper: calculate total rental days (inclusive of start, exclusive of end)
function calcRentalDays(startDate, endDate) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((new Date(endDate) - new Date(startDate)) / msPerDay);
}

// ─── POST /api/bookings ────────────────────────────────────────────────────────
// Creates a booking and auto-calculates totalPrice
router.post("/", async (req, res, next) => {
  try {
    const { carId, userEmail, startDate, endDate } = req.body;

    // Validate required fields
    if (!carId || !userEmail || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "carId, userEmail, startDate, and endDate are required",
      });
    }

    // Validate carId format
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ success: false, message: "Invalid carId" });
    }

    // Parse dates
    const start = new Date(startDate);
    const end   = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    if (end <= start) {
      return res.status(400).json({ success: false, message: "endDate must be after startDate" });
    }

    if (start < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: "startDate cannot be in the past" });
    }

    // Check car exists and is available
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    if (!car.available) {
      return res.status(409).json({ success: false, message: "Car is not available for rental" });
    }

    // Check for overlapping confirmed/pending bookings on same car
    const overlap = await Booking.findOne({
      carId,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } },
      ],
    });

    if (overlap) {
      return res.status(409).json({
        success: false,
        message: "Car is already booked for the selected dates",
      });
    }

    // Calculate price
    const days       = calcRentalDays(start, end);
    const totalPrice = parseFloat((days * car.pricePerDay).toFixed(2));

    const booking = await Booking.create({
      carId,
      userEmail,
      startDate: start,
      endDate: end,
      totalPrice,
      status: "pending",
    });

    // Populate car details in response
    await booking.populate("carId", "name imageUrl pricePerDay carType");

    res.status(201).json({
      success: true,
      data: {
        ...booking.toJSON(),
        rentalDays: days,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/bookings ─────────────────────────────────────────────────────────
// Query: ?userEmail=xxx  (required)  &status=pending|confirmed|cancelled
router.get("/", async (req, res, next) => {
  try {
    const { userEmail, status } = req.query;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "userEmail query parameter is required",
      });
    }

    const filter = { userEmail: userEmail.toLowerCase() };

    if (status) {
      const validStatuses = ["pending", "confirmed", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate("carId", "name imageUrl carType pricePerDay fuelType seats")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/bookings/:id ─────────────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(req.params.id).populate(
      "carId",
      "name imageUrl carType pricePerDay fuelType seats"
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/bookings/:id/status ───────────────────────────────────────────
// Update booking status (confirm or cancel)
router.patch("/:id/status", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("carId", "name imageUrl carType pricePerDay");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
