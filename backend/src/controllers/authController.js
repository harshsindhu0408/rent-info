import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
};

// @desc    Register a new user
// @route   POST /auth/register
export const registerUser = async (req, res) => {
  const { name, email, password, creationKey } = req.body;
  const accountCreationKey = process.env.ACCOUNT_CREATION_KEY;
  try {
    // Validate required fields
    if (!name || !email || !password || !creationKey) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Validate Account Creation Key
    if (creationKey !== accountCreationKey) {
      return res.status(403).json({ message: "Invalid Account Creation Key" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("User does not exist", userExists);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      const token = generateToken(user._id);

      // Send token in response
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error.message, error.stack);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// @desc    Auth user & get token
// @route   POST /auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);

      // Send token in response
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Logout user
// @route   POST /auth/logout
export const logoutUser = (req, res) => {
  // Client is responsible for deleting the token
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /auth/me
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
