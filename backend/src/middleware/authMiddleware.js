export const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized. Please log in." });
  }
};

export const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "user") {
    return next();
  } else {
    res.status(403).json({ message: "Forbidden. User access required." });
  }
};
