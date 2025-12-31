import express from "express";
import { check } from "express-validator";
import {
  createRental,
  getRentals,
  getAllRentalsUnpaginated,
  getRentalById,
  updateRental,
  deleteRental,
} from "../controllers/rentalController.js";
import { ensureAuth, ensureAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication

// POST create rental - protected
router.post(
  "/",
  [
    ensureAuth,
    ensureAdmin,
    check("carId", "Car ID is required").not().isEmpty(),
    check("startTime", "Start Time is required").isISO8601(),
    check("deductionAmount", "Deduction amount must be a number")
      .optional()
      .isNumeric(),
  ],
  createRental
);

// GET paginated rentals with search/filter - protected
router.get("/", [ensureAuth, ensureAdmin], getRentals);

// GET all rentals without pagination (for dashboard stats) - protected
router.get("/all", [ensureAuth, ensureAdmin], getAllRentalsUnpaginated);

// GET single rental by ID - protected
router.get("/:id", [ensureAuth, ensureAdmin], getRentalById);

// PUT update rental - protected
router.put("/:id", [ensureAuth, ensureAdmin], updateRental);

// DELETE rental - protected
router.delete("/:id", [ensureAuth, ensureAdmin], deleteRental);

export default router;
