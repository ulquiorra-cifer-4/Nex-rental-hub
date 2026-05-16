const express = require("express");
const mongoose = require("mongoose");
const Car = require("../models/Car");

const router = express.Router();

// ─── GET /api/cars ─────────────────────────────────────────────────────────────
// Returns all cars with optional filters: carType, minPrice, maxPrice, available
router.get("/", async (req, res, next) => {
  try {
    const { carType, minPrice, maxPrice, available, fuelType } = req.query;
    const filter = {};

    if (carType) {
      const validTypes = ["sedan", "SUV", "luxury", "compact", "minivan"];
      if (!validTypes.includes(carType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid carType. Must be one of: ${validTypes.join(", ")}`,
        });
      }
      filter.carType = carType;
    }

    if (fuelType) {
      const validFuels = ["petrol", "diesel", "electric"];
      if (!validFuels.includes(fuelType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid fuelType. Must be one of: ${validFuels.join(", ")}`,
        });
      }
      filter.fuelType = fuelType;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerDay = {};
      if (minPrice !== undefined) {
        const min = Number(minPrice);
        if (isNaN(min) || min < 0) {
          return res.status(400).json({ success: false, message: "minPrice must be a non-negative number" });
        }
        filter.pricePerDay.$gte = min;
      }
      if (maxPrice !== undefined) {
        const max = Number(maxPrice);
        if (isNaN(max) || max < 0) {
          return res.status(400).json({ success: false, message: "maxPrice must be a non-negative number" });
        }
        filter.pricePerDay.$lte = max;
      }
    }

    if (available !== undefined) {
      filter.available = available === "true";
    }

    const cars = await Car.find(filter).sort({ pricePerDay: 1 });

    res.json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/cars/:id ─────────────────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid car ID" });
    }

    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    res.json({ success: true, data: car });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/cars ────────────────────────────────────────────────────────────
// (Admin use — create a car)
router.post("/", async (req, res, next) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json({ success: true, data: car });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/cars/:id ───────────────────────────────────────────────────────
router.patch("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid car ID" });
    }

    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    res.json({ success: true, data: car });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/cars/:id ──────────────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid car ID" });
    }

    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    res.json({ success: true, message: "Car deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
