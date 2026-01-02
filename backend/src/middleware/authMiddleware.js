import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Ensures user is authenticated (logged in) by verifying JWT from cookie
 * Returns 401 Unauthorized if not authenticated
 */
export const ensureAuth = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token, exclude password
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  } else {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};

/**
 * Ensures user is authenticated and has admin role specifically
 * Returns 403 Forbidden if not admin
 */
export const ensureAdminOnly = (req, res, next) => {
  // ensureAuth must be called before this to set req.user
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Forbidden. Admin access required.",
    });
  }
};

/**
 * Ensures user is authenticated AND has user role (or admin)
 * Returns 403 Forbidden if not authorized
 */
export const ensureAdmin = (req, res, next) => {
  // Legacy name, but effectively checks if authed user has basic access (user/admin)
  // Since ensureAuth already ensures valid user, we mostly just pass through
  // But if you had other roles, you'd check here.
  if (req.user && (req.user.role === "user" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Forbidden. Insufficient permissions.",
    });
  }
};
