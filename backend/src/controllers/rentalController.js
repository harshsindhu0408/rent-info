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
    advance,
    ghataAmount,
    ghataReason,
    isSettled,
    manualTotalRent,
    customerName,
    customerPhone,
    customerOccupation,
  } = req.body;

  try {
    // Ensure car belongs to user
    const car = await Car.findOne({ _id: carId, user: req.user._id });
    if (!car) {
      return res.status(404).json({ msg: "Car not found or access denied" });
    }

    if (car.status !== "Available") {
      return res.status(400).json({ msg: "Car is not available" });
    }

    const start = new Date(startTime);
    let end = null;
    let status = "Active";

    if (endTime) {
      end = new Date(endTime);
      if (end <= start) {
        return res
          .status(400)
          .json({ msg: "End time must be after start time" });
      }
      status = "Completed";
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
    const advanceAmount = advance || 0;

    let finalAmountCollected = 0;

    if (status === "Active") {
      finalAmountCollected = advanceAmount;
    } else {
      finalAmountCollected = Math.max(
        0,
        totalRent - deductions.amount + chotAmount - ghata.amount
      );
    }

    const rental = new RentalEntry({
      car: carId,
      user: req.user._id, // Assign to logged-in user
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
      advance: advanceAmount,
      ghata,
      finalAmountCollected,
      isSettled: isSettled || false,
      status: status,
    });

    await rental.save();

    // Update car status
    if (status === "Completed") {
      // car stays available (or becomes available)
    } else {
      car.status = "Rented";
      await car.save();
    }

    res.json(rental);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get all rentals with pagination, search, and filters
// @route   GET /rentals
// @access  Private
export const getRentals = async (req, res) => {
  try {
    // Parse query parameters with defaults
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10)); // Cap at 100
    const skip = (page - 1) * limit;

    const {
      search, // Search term for car plate, customer name, car model/brand
      status, // Filter by status: 'Active' | 'Completed'
      isSettled, // Filter by settlement: 'true' | 'false'
      carId, // Filter by specific car
      sortBy = "createdAt", // Sort field
      sortOrder = "desc", // Sort order: 'asc' | 'desc'
    } = req.query;

    // Build aggregation pipeline
    const pipeline = [];

    // Stage 0: Filter by User FIRST (crucial for security)
    pipeline.push({
      $match: {
        user: req.user._id,
      },
    });

    // Stage 1: Lookup car details (for searching by car info)
    pipeline.push({
      $lookup: {
        from: "cars",
        localField: "car",
        foreignField: "_id",
        as: "car",
      },
    });

    // Unwind car array to object (preserving nulls)
    pipeline.push({
      $unwind: {
        path: "$car",
        preserveNullAndEmptyArrays: true,
      },
    });

    // Stage 2: Lookup user details (optional, since we filter by user)
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    });

    // Stage 3: Build match conditions
    const matchConditions = [];

    // Search filter (case-insensitive regex search)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      matchConditions.push({
        $or: [
          { "car.plateNumber": searchRegex },
          { "car.brand": searchRegex },
          { "car.model": searchRegex },
          { "customer.name": searchRegex },
          { "customer.phone": searchRegex },
        ],
      });
    }

    // Status filter
    if (status && ["Active", "Completed"].includes(status)) {
      matchConditions.push({ status: status });
    }

    // Settlement filter
    if (isSettled !== undefined && isSettled !== "") {
      const settledBool = isSettled === "true";
      matchConditions.push({ isSettled: settledBool });
    }

    // Car filter (by ID)
    if (carId) {
      const mongoose = await import("mongoose");
      if (mongoose.default.Types.ObjectId.isValid(carId)) {
        matchConditions.push({
          "car._id": new mongoose.default.Types.ObjectId(carId),
        });
      }
    }

    // Apply match conditions if any
    if (matchConditions.length > 0) {
      pipeline.push({
        $match: {
          $and: matchConditions,
        },
      });
    }

    // Stage 4: Project user fields to limit exposed data
    pipeline.push({
      $project: {
        car: 1,
        customer: 1,
        startTime: 1,
        endTime: 1,
        totalRent: 1,
        deductions: 1,
        chot: 1,
        advance: 1,
        ghata: 1,
        finalAmountCollected: 1,
        isSettled: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        "user._id": 1,
        "user.name": 1,
        "user.email": 1,
      },
    });

    // Stage 5: Facet for pagination metadata and data
    const sortField = [
      "createdAt",
      "startTime",
      "endTime",
      "finalAmountCollected",
      "totalRent",
    ].includes(sortBy)
      ? sortBy
      : "createdAt";
    const sortDir = sortOrder === "asc" ? 1 : -1;

    pipeline.push({
      $facet: {
        // Metadata: total count
        metadata: [{ $count: "totalCount" }],
        // Data: sorted and paginated
        data: [
          { $sort: { [sortField]: sortDir } },
          { $skip: skip },
          { $limit: limit },
        ],
      },
    });

    // Execute aggregation
    const result = await RentalEntry.aggregate(pipeline);

    // Extract results
    const totalCount = result[0]?.metadata[0]?.totalCount || 0;
    const rentals = result[0]?.data || [];
    const totalPages = Math.ceil(totalCount / limit);

    // Response with pagination metadata
    res.json({
      success: true,
      data: rentals,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("getRentals Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// @desc    Get all rentals without pagination (for dashboard/stats)
// @route   GET /rentals/all
// @access  Private
export const getAllRentalsUnpaginated = async (req, res) => {
  try {
    const rentals = await RentalEntry.find({ user: req.user._id })
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
// @access  Private
export const getRentalById = async (req, res) => {
  try {
    const rental = await RentalEntry.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("car")
      .populate("user", "name email")
      .lean();

    if (!rental) {
      return res.status(404).json({ success: false, msg: "Rental not found" });
    }

    // Compute duration fields
    let durationHours = null;
    let durationDays = 0;
    let remainingHours = 0;

    if (rental.startTime && rental.endTime) {
      const durationMs = new Date(rental.endTime) - new Date(rental.startTime);
      durationHours = durationMs / (1000 * 60 * 60);
      durationDays = Math.floor(durationHours / 24);
      remainingHours = Math.ceil(durationHours % 24);
    }

    // Calculate remaining amount after advance
    const remainingAmount =
      (rental.finalAmountCollected || 0) - (rental.advance || 0);

    res.json({
      success: true,
      data: {
        ...rental,
        // Computed fields
        durationHours,
        durationDays,
        remainingHours,
        remainingAmount,
      },
    });
  } catch (err) {
    console.error("getRentalById Error:", err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ success: false, msg: "Rental not found" });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// @desc    Update a rental
// @route   PUT /rentals/:id
// @access  Private
export const updateRental = async (req, res) => {
  const {
    startTime,
    endTime,
    deductionAmount,
    deductionReason,
    chot,
    advance,
    ghataAmount,
    ghataReason,
    isSettled,
    manualTotalRent,
    customerName,
    customerPhone,
    customerOccupation,
  } = req.body;

  try {
    // Ensure rental belongs to user
    let rental = await RentalEntry.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!rental)
      return res.status(404).json({ msg: "Rental not found or access denied" });

    // Update fields if provided
    if (startTime) rental.startTime = startTime;
    // Handle EndTime and Status Logic
    if (endTime !== undefined) {
      rental.endTime = endTime;
      if (endTime) {
        rental.status = "Completed";
      } else {
        rental.status = "Active";
      }
    }

    if (rental.endTime) {
      rental.status = "Completed";
    } else {
      rental.status = "Active";
    }

    if (isSettled !== undefined) rental.isSettled = isSettled;

    if (customerName) rental.customer.name = customerName;
    if (customerPhone) rental.customer.phone = customerPhone;
    if (customerOccupation) rental.customer.occupation = customerOccupation;

    // Recalculate Logic
    if (manualTotalRent !== undefined) {
      rental.totalRent = Number(manualTotalRent);
    } else if (rental.endTime && rental.startTime && !manualTotalRent) {
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
    if (advance !== undefined) rental.advance = advance;

    // Recalculate Final
    if (rental.status === "Active") {
      rental.finalAmountCollected = rental.advance || 0;
    } else {
      rental.finalAmountCollected = Math.max(
        0,
        rental.totalRent -
          rental.deductions.amount +
          rental.chot -
          rental.ghata.amount
      );
    }

    await rental.save();

    // Sync Car status
    if (rental.status === "Completed") {
      await Car.findByIdAndUpdate(rental.car, { status: "Available" });
    } else if (rental.status === "Active") {
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
// @access  Private
export const deleteRental = async (req, res) => {
  try {
    const rental = await RentalEntry.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
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
