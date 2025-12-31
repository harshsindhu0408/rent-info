import mongoose from "mongoose";

const rentalEntrySchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
      index: true, // Frequently queried and used in lookups
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // For user-specific queries
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    totalRent: {
      type: Number, // Calculated base rent
      default: 0,
    },
    deductions: {
      amount: {
        type: Number,
        default: 0,
      },
      reason: {
        type: String,
        default: "",
      },
    },
    finalAmountCollected: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
      index: true, // Frequently filtered
    },
    chot: {
      type: Number,
      default: 0,
    },
    advance: {
      type: Number,
      default: 0,
    },
    ghata: {
      amount: {
        type: Number,
        default: 0,
      },
      reason: {
        type: String,
        default: "",
      },
    },
    isSettled: {
      type: Boolean,
      default: false,
      index: true, // Frequently filtered for pending settlements
    },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      occupation: { type: String, default: "Student" },
    },
  },
  { timestamps: true }
);

// ==================== INDEXES ====================
// These indexes are critical for production performance with millions of records

// Compound index for pagination and sorting (most common query pattern)
// Supports: Sorting by createdAt descending (default), with status and settlement filters
rentalEntrySchema.index({ createdAt: -1 });
rentalEntrySchema.index({ startTime: -1 });
rentalEntrySchema.index({ endTime: -1 });

// Compound index for common filter combinations
// Supports: Filter by status + sort by createdAt
rentalEntrySchema.index({ status: 1, createdAt: -1 });

// Supports: Filter by isSettled + sort by createdAt
rentalEntrySchema.index({ isSettled: 1, createdAt: -1 });

// Supports: Filter by both status and isSettled + sort
rentalEntrySchema.index({ status: 1, isSettled: 1, createdAt: -1 });

// Compound index for car-specific queries
// Supports: All rentals for a specific car, sorted by date
rentalEntrySchema.index({ car: 1, createdAt: -1 });
rentalEntrySchema.index({ car: 1, status: 1, createdAt: -1 });

// Text index for search functionality
// Supports: Searching customer name and phone
rentalEntrySchema.index(
  { "customer.name": "text", "customer.phone": "text" },
  {
    name: "customer_search_index",
    weights: { "customer.name": 2, "customer.phone": 1 } // Name is more important
  }
);

// Index for date range queries (reports)
rentalEntrySchema.index({ startTime: 1, endTime: 1 });

// Index for revenue calculations
rentalEntrySchema.index({ finalAmountCollected: -1 });

// Index for user-specific rental history
rentalEntrySchema.index({ user: 1, createdAt: -1 });

const RentalEntry = mongoose.model("RentalEntry", rentalEntrySchema);

export default RentalEntry;

