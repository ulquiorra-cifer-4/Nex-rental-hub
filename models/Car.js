const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Car name is required"],
      trim: true,
      maxlength: [100, "Car name cannot exceed 100 characters"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    carType: {
      type: String,
      required: [true, "Car type is required"],
      enum: {
        values: ["sedan", "SUV", "luxury", "compact", "minivan"],
        message: "{VALUE} is not a valid car type",
      },
    },
    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: [1, "Price must be at least $1"],
    },
    available: {
      type: Boolean,
      default: true,
    },
    fuelType: {
      type: String,
      required: [true, "Fuel type is required"],
      enum: {
        values: ["petrol", "diesel", "electric"],
        message: "{VALUE} is not a valid fuel type",
      },
    },
    seats: {
      type: Number,
      required: [true, "Number of seats is required"],
      min: [1, "Seats must be at least 1"],
      max: [15, "Seats cannot exceed 15"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for common query patterns
carSchema.index({ carType: 1, available: 1 });
carSchema.index({ pricePerDay: 1 });

module.exports = mongoose.model("Car", carSchema);
