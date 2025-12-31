import express from "express";
import { getRentalReports, getStats } from "../controllers/reportController.js";
import { ensureAuth, ensureAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication

// GET rental reports with filters - protected
router.get("/rent", [ensureAuth, ensureAdmin], getRentalReports);

// GET aggregated stats - protected
router.get("/stats", [ensureAuth, ensureAdmin], getStats);

export default router;
