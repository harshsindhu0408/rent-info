import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Get allowed origins from environment variable or use defaults for development
const getAllowedOrigins = () => {
  const envOrigins = process.env.FRONTEND_URL;

  if (envOrigins) {
    // Support comma-separated origins in FRONTEND_URL
    return envOrigins.split(',').map(origin => origin.trim());
  }

  // Default development origins (fallback only)
  if (process.env.NODE_ENV !== 'production') {
    return [
      "http://localhost:5173",
      "http://localhost:5174",
    ];
  }

  return [];
};

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
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
app.use(morgan("dev"));

// Session Config
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
  })
);

// Passport Config
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Use PORT from environment variable
const PORT = process.env.PORT || 8000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
