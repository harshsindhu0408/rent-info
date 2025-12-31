// Authentication middleware for protected routes

/**
 * Ensures user is authenticated (logged in)
 * Returns 401 Unauthorized if not authenticated
 */
export const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({
      success: false,
      message: "Unauthorized. Please log in."
    });
  }
};

/**
 * Ensures user is authenticated AND has user role
 * Returns 403 Forbidden if not authorized
 * Note: This checks for 'user' or 'admin' role
 */
export const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && (req.user.role === "user" || req.user.role === "admin")) {
    return next();
  } else {
    res.status(403).json({
      success: false,
      message: "Forbidden. Insufficient permissions."
    });
  }
};

/**
 * Ensures user is authenticated and has admin role specifically
 * Returns 403 Forbidden if not admin
 */
export const ensureAdminOnly = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  } else {
    res.status(403).json({
      success: false,
      message: "Forbidden. Admin access required."
    });
  }
};
