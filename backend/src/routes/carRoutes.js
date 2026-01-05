import express from "express";
import { check } from "express-validator";
import {
  addCar,
  updateCar,
  deleteCar,
  addMaintenanceRecord,
  getCars,
  getCar,
} from "../controllers/carController.js";
import { ensureAuth, ensureAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
// GET all cars - protected
router.get("/", [ensureAuth, ensureAdmin], getCars);

// GET single car - protected
router.get("/:id", [ensureAuth, ensureAdmin], getCar);

// POST create car - protected
router.post(
  "/",
  [
    ensureAuth,
    ensureAdmin,
    check("brand", "Brand is required").not().isEmpty(),
    check("model", "Model is required").not().isEmpty(),
    check("plateNumber", "Plate Number is required").not().isEmpty(),
    check(
      "hourlyRate",
      "Hourly Rate is required and must be a number"
    ).isNumeric(),
    check(
      "dailyRate",
      "Daily Rate is required and must be a number"
    ).isNumeric(),
  ],
  addCar
);

// PATCH update car - protected
router.patch(
  "/:id",
  [
    ensureAuth,
    ensureAdmin,
    check("hourlyRate", "Hourly Rate must be a number").optional().isNumeric(),
    check("dailyRate", "Daily Rate must be a number").optional().isNumeric(),
  ],
  updateCar
);

// DELETE car - protected
router.delete("/:id", [ensureAuth, ensureAdmin], deleteCar);

// POST maintenance record - protected
router.post(
  "/:id/maintenance",
  [
    ensureAuth,
    ensureAdmin,
    check("description", "Description is required").not().isEmpty(),
    check("amount", "Amount is required and must be a number").isNumeric(),
  ],
  addMaintenanceRecord
);

export default router;
