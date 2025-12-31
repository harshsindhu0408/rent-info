import express from "express";
import { getRentalReports, getStats } from "../controllers/reportController.js";
import { ensureAuth, ensureAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/rent", [ensureAuth, ensureAdmin], getRentalReports);
router.get("/stats", [ensureAuth, ensureAdmin], getStats);

export default router;
