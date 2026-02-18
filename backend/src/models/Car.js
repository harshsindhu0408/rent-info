import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      index: true, // For search queries
    },
    model: {
      type: String,
      required: true,
      index: true, // For search queries
    },
    plateNumber: {
      type: String,
      required: true,
      unique: true, // Already creates unique index
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
      index: true, // Frequently filtered
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Additional car details
    color: {
      type: String,
      default: "",
    },
    year: {
      type: Number,
    },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid", ""],
      default: "",
    },
    transmission: {
      type: String,
      enum: ["Manual", "Automatic", ""],
      default: "",
    },
    seatingCapacity: {
      type: Number,
      default: 5,
    },
    insuranceExpiry: {
      type: Date,
    },
    pucExpiry: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
    lastServicedAt: {
      type: Date,
    },
    lastServicedKm: {
      type: Number,
    },
    maintenanceHistory: [
      {
        description: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        km: {
          type: Number,
        },
      },
    ],
    documents: {
      insurance: { type: String }, // Path to file
      rc: { type: String }, // Path to file
      puc: { type: String }, // Path to file
      drivingLicence: { type: String }, // Path to file
    },
    images: [{ type: String }], // Array of image paths for the gallery
  },
  { timestamps: true }
);

// ==================== INDEXES ====================

// Text index for searching cars by brand, model, or plate number
carSchema.index(
  { brand: "text", model: "text", plateNumber: "text" },
  {
    name: "car_search_index",
    weights: { plateNumber: 3, brand: 2, model: 1 }, // Plate number is most important for search
  }
);

// Compound index for filtering and sorting
carSchema.index({ status: 1, createdAt: -1 });

// Index for brand + model combination (common filter)
carSchema.index({ brand: 1, model: 1 });

const Car = mongoose.model("Car", carSchema);

export default Car;
