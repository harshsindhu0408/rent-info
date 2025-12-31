import Car from "../models/Car.js";
import { validationResult } from "express-validator";

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
export const getCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
export const getCar = async (req, res) => {
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

// @desc    Add new car
// @route   POST /api/cars
// @access  Private/Admin
export const addCar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { brand, model, plateNumber, hourlyRate, dailyRate, status } = req.body;

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
// @access  Private/Admin
export const updateCar = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { brand, model, plateNumber, hourlyRate, dailyRate, status } = req.body;

  // Build car object
  const carFields = {};
  if (brand) carFields.brand = brand;
  if (model) carFields.model = model;
  if (plateNumber) carFields.plateNumber = plateNumber;
  if (hourlyRate) carFields.hourlyRate = hourlyRate;
  if (dailyRate) carFields.dailyRate = dailyRate;
  if (status) carFields.status = status;

  try {
    let car = await Car.findById(req.params.id);
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
// @access  Private/Admin
export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
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
