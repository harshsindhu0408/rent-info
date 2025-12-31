import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    plateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    hourlyRate: {
      type: Number, // In INR
      required: true,
    },
    dailyRate: {
      type: Number, // In INR
      required: true,
    },
    status: {
      type: String,
      enum: ["Available", "Rented", "Maintenance"],
      default: "Available",
    },
  },
  { timestamps: true }
);

const Car = mongoose.model("Car", carSchema);

export default Car;
