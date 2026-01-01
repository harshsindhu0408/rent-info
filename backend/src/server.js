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

// Connect to Database
connectDB();

const app = express();

// Trust proxy for Vercel deployment
app.set("trust proxy", 1);

// Allowed origins for CORS - add your domains here
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://rent-info.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      // Check if origin is allowed or if it's a local network IP (for mobile testing)
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://192.168.") ||
        origin.startsWith("http://10.") ||
        origin.startsWith("http://localhost")
      ) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // IMPORTANT for sessions/cookies
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

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API is running..." });
});

// Use PORT from environment variable
const PORT = process.env.PORT || 8000;

// Only listen when not in Vercel serverless environment
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  });
}

// Export for Vercel serverless
export default app;
