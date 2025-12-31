import express from "express";
import { check } from "express-validator";
import {
  createRental,
  getRentals,
  getRentalById,
  updateRental,
  deleteRental,
} from "../controllers/rentalController.js";
import { ensureAuth, ensureAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  [
    ensureAuth,
    check("carId", "Car ID is required").not().isEmpty(),
    check("startTime", "Start Time is required").isISO8601(),
    // check("endTime", "End Time is required").isISO8601(), // Now optional
    check("deductionAmount", "Deduction amount must be a number")
      .optional()
      .isNumeric(),
  ],
  createRental
);

router.get("/", [ensureAuth, ensureAdmin], getRentals);

router.get("/:id", [ensureAuth, ensureAdmin], getRentalById);

router.put("/:id", [ensureAuth, ensureAdmin], updateRental);

router.delete("/:id", [ensureAuth, ensureAdmin], deleteRental);

export default router;
