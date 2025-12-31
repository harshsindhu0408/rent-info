import express from "express";
import { check } from "express-validator";
import {
  getCars,
  getCar,
  addCar,
  updateCar,
  deleteCar,
} from "../controllers/carController.js";
import { ensureAuth, ensureAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCars);
router.get("/:id", getCar);

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

router.delete("/:id", [ensureAuth, ensureAdmin], deleteCar);

export default router;
