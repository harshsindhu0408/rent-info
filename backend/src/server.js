import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
// import passport from "./config/passport.js"; // Removed
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file");
  // Don't exit process in development to allow easy setup, but warn loudly
  // process.exit(1);
}

if (!process.env.ACCOUNT_CREATION_KEY) {
  console.warn(
    "WARNING: ACCOUNT_CREATION_KEY is not defined in .env file. Registration may fail."
  );
}

// Connect to Database
connectDB();

const app = express();

// Trust proxy for Vercel deployment
app.set("trust proxy", 1);

// Allowed origins for CORS - add your domains here
const allowedOrigins = [
  "http://localhost:5173",
  "https://rent-info.vercel.app",
  "https://rent.sindhustudio.in",
  "http://rent.sindhustudio.in",
  "https://apirent.sindhustudio.in",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      // Normalize origin (remove trailing slash if present)
      const normalizedOrigin = origin.replace(/\/$/, "");

      // Check if origin is allowed or if it's a local network IP (for mobile testing)
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.startsWith("http://192.168.") ||
        normalizedOrigin.startsWith("http://10.") ||
        normalizedOrigin.startsWith("http://localhost")
      ) {
        return callback(null, true);
      }

      console.warn(`CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

app.use(express.json());
app.use(cookieParser()); // Add cookie parser

// Only use morgan in development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Session and Passport removed

// Routes
app.use("/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/reports", reportRoutes);

// Serve static files from uploads directory
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Assuming uploads is in the root backend directory, which is one level up from src
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API is running..." });
});

// Use PORT from environment variable
const PORT = process.env.PORT || 8080;

// Only listen when not in Vercel serverless environment
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// Export for Vercel serverless
export default app;
