const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: [true, "Car reference is required"],
    },
    userEmail: {
      type: String,
      required: [true, "User email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "cancelled"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: number of rental days
bookingSchema.virtual("rentalDays").get(function () {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((this.endDate - this.startDate) / msPerDay);
});

// Validate endDate > startDate before save
bookingSchema.pre("validate", function (next) {
  if (this.endDate <= this.startDate) {
    this.invalidate("endDate", "End date must be after start date");
  }
  next();
});

// Index for user email lookups
bookingSchema.index({ userEmail: 1, createdAt: -1 });
bookingSchema.index({ carId: 1, status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
