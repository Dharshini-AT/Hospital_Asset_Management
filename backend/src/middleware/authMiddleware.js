const jwt = require("jsonwebtoken");
const config = require("../config/environment");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // No token
  if (!token) {
    return res.status(401).json({
      success: false,
      message:
        "Not authorized to access this route. No token provided.",
    });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(
      token,
      config.jwtSecret
    );

    // Find user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "The user belonging to this token no longer exists.",
      });
    }

    // Check account status
    if (user.accountStatus === "INACTIVE") {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated. Please contact administrator.",
      });
    }

    // Attach authenticated user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Not authorized. Invalid or expired token.",
    });
  }
};

module.exports = {
  protect,
};