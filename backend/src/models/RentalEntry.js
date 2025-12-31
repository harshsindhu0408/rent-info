import mongoose from "mongoose";

const rentalEntrySchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    },
    chot: {
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
    },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      occupation: { type: String, default: "Student" },
    },
  },
  { timestamps: true }
);

const RentalEntry = mongoose.model("RentalEntry", rentalEntrySchema);

export default RentalEntry;
