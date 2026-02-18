import Car from "../models/Car.js";
import { validationResult } from "express-validator";

// @desc    Get all cars for the logged-in user
// @route   GET /api/cars
// @access  Private
export const getCars = async (req, res) => {
  try {
    const cars = await Car.find({ user: req.user._id });
    res.json(cars);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Private
export const getCar = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, user: req.user._id });
    if (!car) {
      return res.status(404).json({ msg: "Car not found" });
    }
    res.json(car);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Car not found" });
    }
    res.status(500).send("Server Error");
  }
};

// @desc    Add new car
// @route   POST /api/cars
// @access  Private
export const addCar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { brand, model, plateNumber, hourlyRate, dailyRate, status, lastServicedKm } = req.body;

  try {
    let car = await Car.findOne({ plateNumber });
    if (car) {
      return res
        .status(400)
        .json({ msg: "Car with this plate number already exists" });
    }

    car = new Car({
      brand,
      model,
      plateNumber,
      hourlyRate,
      dailyRate,
      status,
      lastServicedKm,
      user: req.user._id, // Assign to logged-in user
    });

    await car.save();
    res.json(car);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Update car
// @route   PATCH /api/cars/:id
// @access  Private
export const updateCar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { brand, model, plateNumber, hourlyRate, dailyRate, status, color, year, fuelType, transmission, seatingCapacity, insuranceExpiry, pucExpiry, notes, lastServicedKm } = req.body;
  const {
    brand,
    model,
    plateNumber,
    hourlyRate,
    dailyRate,
    status,
    color,
    year,
    fuelType,
    transmission,
    seatingCapacity,
    insuranceExpiry,
    pucExpiry,
    notes,
  } = req.body;

  // Build car object - only include fields that are explicitly provided
  const carFields = {};
  if (brand !== undefined) carFields.brand = brand;
  if (model !== undefined) carFields.model = model;
  if (plateNumber !== undefined) carFields.plateNumber = plateNumber;
  if (hourlyRate !== undefined) carFields.hourlyRate = hourlyRate;
  if (dailyRate !== undefined) carFields.dailyRate = dailyRate;
  if (status !== undefined) carFields.status = status;
  if (color !== undefined) carFields.color = color;
  if (year !== undefined) carFields.year = year;
  if (fuelType !== undefined) carFields.fuelType = fuelType;
  if (transmission !== undefined) carFields.transmission = transmission;
  if (seatingCapacity !== undefined)
    carFields.seatingCapacity = seatingCapacity;
  if (insuranceExpiry !== undefined)
    carFields.insuranceExpiry = insuranceExpiry;
  if (pucExpiry !== undefined) carFields.pucExpiry = pucExpiry;
  if (notes !== undefined) carFields.notes = notes;
  if (lastServicedKm !== undefined) carFields.lastServicedKm = lastServicedKm;

  // Handle file uploads
  if (req.files) {
    if (req.files.insurance) {
      carFields["documents.insurance"] = req.files.insurance[0].path;
    }
    if (req.files.rc) {
      carFields["documents.rc"] = req.files.rc[0].path;
    }
    if (req.files.puc) {
      carFields["documents.puc"] = req.files.puc[0].path;
    }
    if (req.files.drivingLicence) {
      carFields["documents.drivingLicence"] = req.files.drivingLicence[0].path;
    }
  }

  try {
    // Ensure car belongs to user
    let car = await Car.findOne({ _id: req.params.id, user: req.user._id });
    if (!car) return res.status(404).json({ msg: "Car not found" });

    car = await Car.findByIdAndUpdate(
      req.params.id,
      { $set: carFields },
      { new: true }
    );

    res.json(car);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Car not found" });
    }
    res.status(500).send("Server Error");
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private
export const deleteCar = async (req, res) => {
  try {
    // Ensure car belongs to user
    const car = await Car.findOne({ _id: req.params.id, user: req.user._id });
    if (!car) return res.status(404).json({ msg: "Car not found" });

    await Car.deleteOne({ _id: req.params.id });
    res.json({ msg: "Car removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Car not found" });
    }
    res.status(500).send("Server Error");
  }
};

// @desc    Add maintenance record
// @route   POST /api/cars/:id/maintenance
// @access  Private
export const addMaintenanceRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { description, amount, date } = req.body;

  try {
    const car = await Car.findOne({ _id: req.params.id, user: req.user._id });
    if (!car) {
      return res.status(404).json({ msg: "Car not found" });
    }

    const newMaintenance = {
      description,
      amount,
      date: date || Date.now(),
    };

    car.maintenanceHistory.push(newMaintenance);

    // Update lastServicedAt if the new date is more recent
    const recordDate = new Date(newMaintenance.date);
    if (!car.lastServicedAt || recordDate > new Date(car.lastServicedAt)) {
      car.lastServicedAt = recordDate;
    }

    await car.save();
    res.json(car);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Car not found" });
    }
    res.status(500).send("Server Error");
  }
};

// @desc    Update maintenance record
// @route   PATCH /api/cars/:id/maintenance/:recordId
// @access  Private
export const updateMaintenanceRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { description, amount, date } = req.body;

  try {
    const car = await Car.findOne({ _id: req.params.id, user: req.user._id });
    if (!car) {
      return res.status(404).json({ msg: "Car not found" });
    }

    const record = car.maintenanceHistory.id(req.params.recordId);
    if (!record) {
      return res.status(404).json({ msg: "Maintenance record not found" });
    }

    if (description) record.description = description;
    if (amount) record.amount = amount;
    if (date) record.date = date;

    // Recalculate lastServicedAt
    if (date) {
      let maxDate = new Date(0);
      car.maintenanceHistory.forEach((rec) => {
        if (new Date(rec.date) > maxDate) maxDate = new Date(rec.date);
      });
      // Only update if we found a valid date, otherwise keep current or null if empty (though we just updated one so it's not empty)
      if (maxDate.getTime() > 0) car.lastServicedAt = maxDate;
    }

    await car.save();
    res.json(car);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Resource not found" });
    }
    res.status(500).send("Server Error");
  }
};

// @desc    Delete maintenance record
// @route   DELETE /api/cars/:id/maintenance/:recordId
// @access  Private
export const deleteMaintenanceRecord = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, user: req.user._id });
    if (!car) {
      return res.status(404).json({ msg: "Car not found" });
    }

    // Pull the subdocument
    car.maintenanceHistory.pull({ _id: req.params.recordId });

    // Recalculate lastServicedAt
    if (car.maintenanceHistory.length > 0) {
      let maxDate = new Date(0);
      car.maintenanceHistory.forEach((rec) => {
        if (new Date(rec.date) > maxDate) maxDate = new Date(rec.date);
      });
      if (maxDate.getTime() > 0) car.lastServicedAt = maxDate;
    } else {
      car.lastServicedAt = null;
    }

    await car.save();
    res.json(car);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Resource not found" });
    }
    res.status(500).send("Server Error");
  }
};
