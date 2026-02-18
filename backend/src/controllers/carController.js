import Car from "../models/Car.js";
import { validationResult } from "express-validator";
import fs from "fs";
import path from "path";

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

    const carData = {
      brand,
      model,
      plateNumber,
      hourlyRate,
      dailyRate,
      status,
      lastServicedKm,
      user: req.user._id,
      images: [],
      documents: {}
    };

    if (req.files) {
      if (req.files.insurance) carData.documents.insurance = req.files.insurance[0].path.replace(/\\/g, "/");
      if (req.files.rc) carData.documents.rc = req.files.rc[0].path.replace(/\\/g, "/");
      if (req.files.puc) carData.documents.puc = req.files.puc[0].path.replace(/\\/g, "/");
      if (req.files.drivingLicence) carData.documents.drivingLicence = req.files.drivingLicence[0].path.replace(/\\/g, "/");

      if (req.files.images) {
        carData.images = req.files.images.map(file => file.path.replace(/\\/g, "/"));
      }
    }

    car = new Car(carData);

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
    lastServicedKm,
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
      carFields["documents.insurance"] = req.files.insurance[0].path.replace(/\\/g, "/");
    }
    if (req.files.rc) {
      carFields["documents.rc"] = req.files.rc[0].path.replace(/\\/g, "/");
    }
    if (req.files.puc) {
      carFields["documents.puc"] = req.files.puc[0].path.replace(/\\/g, "/");
    }
    if (req.files.drivingLicence) {
      carFields["documents.drivingLicence"] = req.files.drivingLicence[0].path.replace(/\\/g, "/");
    }
    if (req.files.images) {
      // Append new images to the list
      // We need to fetch the current car first or use $push update operator.
      // But since we are doing $set with carFields, we can't easily mix $set and $push in one go comfortably without potentially overwriting if we are not careful.
      // However, we are not setting 'images' in carFields from req.body.
      // Let's handle images update separately or fetching the car first is safer.
      // See below in the try block.
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

    if (req.files && req.files.images) {
      const newImages = req.files.images.map((file) => file.path.replace(/\\/g, "/"));
      car.images.push(...newImages);
      await car.save();
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

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private
export const deleteCar = async (req, res) => {
  try {
    // Ensure car belongs to user
    const car = await Car.findOne({ _id: req.params.id, user: req.user._id });
    if (!car) return res.status(404).json({ msg: "Car not found" });

    // Delete associated images
    if (car.images && car.images.length > 0) {
      car.images.forEach((imagePath) => {
        fs.unlink(imagePath, (err) => {
          if (err) console.error(`Failed to delete image: ${imagePath}`, err);
        });
      });
    }

    // Delete associated documents
    if (car.documents) {
      Object.values(car.documents).forEach((docPath) => {
        if (docPath) {
          fs.unlink(docPath, (err) => {
            if (err) console.error(`Failed to delete document: ${docPath}`, err);
          });
        }
      });
    }

    await Car.deleteOne({ _id: req.params.id });
    res.json({ msg: "Car and associated files removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Car not found" });
    }
    res.status(500).send("Server Error");
  }
};

// @desc    Delete car image
// @route   DELETE /api/cars/:id/images
// @access  Private
export const deleteCarImage = async (req, res) => {
  const { imagePath } = req.body; // Expecting the full path as stored in DB

  if (!imagePath) {
    return res.status(400).json({ msg: "Image path is required" });
  }

  try {
    const car = await Car.findOne({ _id: req.params.id, user: req.user._id });
    if (!car) return res.status(404).json({ msg: "Car not found" });

    // Check if image exists in car's record
    if (!car.images.includes(imagePath)) {
      return res.status(404).json({ msg: "Image not found in car record" });
    }

    // Remove from array
    car.images = car.images.filter((img) => img !== imagePath);
    await car.save();

    // Delete from filesystem
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error(`Failed to delete image file: ${imagePath}`, err);
        // We still return success as it's removed from DB, but log error
      }
    });

    res.json(car);
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

  const { description, amount, date, km } = req.body;

  try {
    const car = await Car.findOne({ _id: req.params.id, user: req.user._id });
    if (!car) {
      return res.status(404).json({ msg: "Car not found" });
    }

    const newMaintenance = {
      description,
      amount,
      date: date || Date.now(),
      km: km ? Number(km) : undefined,
    };

    car.maintenanceHistory.push(newMaintenance);

    // Update lastServicedAt if the new date is more recent
    const recordDate = new Date(newMaintenance.date);
    if (!car.lastServicedAt || recordDate > new Date(car.lastServicedAt)) {
      car.lastServicedAt = recordDate;
    }

    // Update lastServicedKm if provided and (no previous record or this is the latest based on date)
    // We assume if you are adding a maintenance record with a date > current lastServicedAt, it is the new service.
    if (km && (recordDate >= new Date(car.lastServicedAt))) {
      car.lastServicedKm = Number(km);
    } else if (km && !car.lastServicedKm) {
      // If no lastServicedKm exists, set it
      car.lastServicedKm = Number(km);
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

  const { description, amount, date, km } = req.body;

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
    if (km !== undefined) record.km = Number(km);

    // Recalculate lastServicedAt and lastServicedKm
    if (date || km !== undefined) {
      let maxDate = new Date(0);
      let associatedKm = 0;

      car.maintenanceHistory.forEach((rec) => {
        const recDate = new Date(rec.date);
        if (recDate >= maxDate) {
          maxDate = recDate;
          if (rec.km) associatedKm = rec.km;
        }
      });
      // Only update if we found a valid date
      if (maxDate.getTime() > 0) {
        car.lastServicedAt = maxDate;
        if (associatedKm) car.lastServicedKm = associatedKm;
      }
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
// @desc    Get all public cars for fleet gallery (by owner ID)
// @route   GET /api/cars/public/fleet/:userId
// @access  Public
export const getPublicCars = async (req, res) => {
  try {
    const cars = await Car.find({ user: req.params.userId });
    res.json(cars);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "User fleet not found" });
    }
    res.status(500).send("Server Error");
  }
};

// @desc    Get public car details - public access
// @route   GET /api/cars/public/:id
// @access  Public
export const getPublicCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
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
