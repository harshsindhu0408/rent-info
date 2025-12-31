import RentalEntry from "../models/RentalEntry.js";
import Car from "../models/Car.js";
import { validationResult } from "express-validator";

// @desc    Create a new rental
// @route   POST /rentals
// @access  Private
export const createRental = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    carId,
    startTime,
    endTime,
    deductionAmount,
    deductionReason,
    chot,
    ghataAmount,
    ghataReason,
    isSettled,
    manualTotalRent,
    customerName,
    customerPhone,
    customerOccupation,
  } = req.body;

  try {
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ msg: "Car not found" });
    }

    if (car.status !== "Available") {
      return res.status(400).json({ msg: "Car is not available" });
    }

    const start = new Date(startTime);
    let end = null;
    if (endTime) {
      end = new Date(endTime);
      if (end <= start) {
        return res
          .status(400)
          .json({ msg: "End time must be after start time" });
      }
    }

    let totalRent = 0;

    if (manualTotalRent !== undefined && manualTotalRent !== "") {
      totalRent = Number(manualTotalRent);
    } else if (end) {
      // Only calculate if end time exists
      const durationMs = end - start;
      const durationHours = durationMs / (1000 * 60 * 60);

      // Simple logic: If less than 24 hours, use hourly rate.
      // If 24 hours or more, use daily rate for full days + hourly for remaining.
      if (durationHours < 24) {
        totalRent = Math.ceil(durationHours) * car.hourlyRate;
      } else {
        const days = Math.floor(durationHours / 24);
        const remainingHours = Math.ceil(durationHours % 24);
        totalRent = days * car.dailyRate + remainingHours * car.hourlyRate;
      }
    }

    const deductions = {
      amount: deductionAmount || 0,
      reason: deductionReason || "",
    };

    const ghata = {
      amount: ghataAmount || 0,
      reason: ghataReason || "",
    };

    const chotAmount = chot || 0;
    // If no totalRent (e.g. infinite rental so far), final might be negative if we subtract.
    // Allow negative? No, usually 0.
    const finalAmountCollected = Math.max(
      0,
      totalRent - deductions.amount - chotAmount - ghata.amount
    );

    const rental = new RentalEntry({
      car: carId,
      user: req.user.id,
      customer: {
        name: customerName,
        phone: customerPhone,
        occupation: customerOccupation || "Student",
      },
      startTime,
      endTime: end, // Can be null
      totalRent,
      deductions,
      chot: chotAmount,
      ghata,
      finalAmountCollected,
      isSettled: isSettled || false,
      status: "Active",
    });

    await rental.save();

    // Update car status to Rented
    car.status = "Rented";
    await car.save();

    res.json(rental);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get all rentals
// @route   GET /rentals
// @access  Private/Admin
export const getRentals = async (req, res) => {
  try {
    const rentals = await RentalEntry.find()
      .populate("car")
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get single rental by ID
// @route   GET /rentals/:id
// @access  Private/Admin
export const getRentalById = async (req, res) => {
  try {
    const rental = await RentalEntry.findById(req.params.id)
      .populate("car")
      .populate("user", "name email");

    if (!rental) {
      return res.status(404).json({ msg: "Rental not found" });
    }

    res.json(rental);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Rental not found" });
    }
    res.status(500).send("Server Error");
  }
};

// @desc    Update a rental
// @route   PUT /rentals/:id
// @access  Private/Admin
export const updateRental = async (req, res) => {
  const {
    startTime,
    endTime,
    deductionAmount,
    deductionReason,
    chot,
    ghataAmount,
    ghataReason,
    isSettled,
    manualTotalRent,
    customerName,
    customerPhone,
    customerOccupation,
    status,
  } = req.body;

  try {
    let rental = await RentalEntry.findById(req.params.id);
    if (!rental) return res.status(404).json({ msg: "Rental not found" });

    // Update fields if provided
    if (startTime) rental.startTime = startTime;
    if (endTime) rental.endTime = endTime;
    if (isSettled !== undefined) rental.isSettled = isSettled;
    if (status) rental.status = status;

    if (customerName) rental.customer.name = customerName;
    if (customerPhone) rental.customer.phone = customerPhone;
    if (customerOccupation) rental.customer.occupation = customerOccupation;

    // Recalculate Logic
    if (manualTotalRent !== undefined) {
      rental.totalRent = Number(manualTotalRent);
    } else if (rental.endTime && rental.startTime && !manualTotalRent) {
      // If we have both times and NO manual override is set (or being set), we might want to recalc?
      // NOTE: Current logic doesn't clear manualTotalRent if user updates time.
      // Assuming if user didn't send manualTotalRent, we should recalc IF manual override wasn't used before.
      // But we don't store "isManual" flag.
      // Strategy: If times changed, and user didn't provide a manual total in this Request,
      // we can try to re-calculate.
      // Ideally, the frontend sends the new calculated total as 'manualTotalRent' or we calculate here.
      // Let's recalculate here if times exist.
      const s = new Date(rental.startTime);
      const e = new Date(rental.endTime);
      const durationMs = e - s;
      const durationHours = durationMs / (1000 * 60 * 60);

      const car = await Car.findById(rental.car);
      if (durationHours < 24) {
        rental.totalRent = Math.ceil(durationHours) * car.hourlyRate;
      } else {
        const d = Math.floor(durationHours / 24);
        const rem = Math.ceil(durationHours % 24);
        rental.totalRent = d * car.dailyRate + rem * car.hourlyRate;
      }
    }

    if (deductionAmount !== undefined)
      rental.deductions.amount = deductionAmount;
    if (deductionReason !== undefined)
      rental.deductions.reason = deductionReason;

    if (ghataAmount !== undefined) rental.ghata.amount = ghataAmount;
    if (ghataReason !== undefined) rental.ghata.reason = ghataReason;

    if (chot !== undefined) rental.chot = chot;

    // Recalculate Final
    rental.finalAmountCollected = Math.max(
      0,
      rental.totalRent -
        rental.deductions.amount -
        rental.chot -
        rental.ghata.amount
    );

    await rental.save();

    if (status === "Completed") {
      await Car.findByIdAndUpdate(rental.car, { status: "Available" });
    } else if (status === "Active") {
      await Car.findByIdAndUpdate(rental.car, { status: "Rented" });
    }

    res.json(rental);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Delete a rental
// @route   DELETE /rentals/:id
// @access  Private/Admin
export const deleteRental = async (req, res) => {
  try {
    const rental = await RentalEntry.findById(req.params.id);
    if (!rental) return res.status(404).json({ msg: "Rental not found" });

    if (rental.status === "Active") {
      await Car.findByIdAndUpdate(rental.car, { status: "Available" });
    }

    await rental.deleteOne();
    res.json({ msg: "Rental removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
