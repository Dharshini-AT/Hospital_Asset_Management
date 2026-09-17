const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateSequenceId } = require("../utils/generateId");
const config = require("../config/environment");
const { ROLES } = require("../utils/constants");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      userId: user.userId,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = ROLES.STAFF,
      phone,
      designation,
      department,
      specialization,
    } = req.body;

    // Check whether email already exists
    const userExists = await User.findOne({
      email: email.toLowerCase(),
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate role-based user ID
    const prefix =
      role === ROLES.ADMIN
        ? "ADM"
        : role === ROLES.TECHNICIAN
        ? "TEC"
        : "STAFF";

    const userId = await generateSequenceId(
      User,
      "userId",
      prefix,
      3
    );

    // Create user
    const user = await User.create({
      userId,
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      designation,
      department,
      specialization,
      lastLogin: new Date(),
    });

    // Generate JWT
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const identifier = String(email || '').trim();

    // Find user by email or userId
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { userId: identifier.toUpperCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (user.accountStatus === "INACTIVE") {
      return res.status(403).json({
        success: false,
        message:
          "Account is deactivated. Contact Administrator.",
      });
    }

    // Update last login
    user.lastLogin = new Date();

    await user.save({
      validateBeforeSave: false,
    });

    // Generate JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      designation,
      department,
      specialization,
      availabilityStatus,
    } = req.body;

    const fieldsToUpdate = {};

    if (name !== undefined) {
      fieldsToUpdate.name = name;
    }

    if (phone !== undefined) {
      fieldsToUpdate.phone = phone;
    }

    if (designation !== undefined) {
      fieldsToUpdate.designation = designation;
    }

    if (department !== undefined) {
      fieldsToUpdate.department = department;
    }

    if (specialization !== undefined) {
      fieldsToUpdate.specialization = specialization;
    }

    // Only technicians can update their availability
    if (
      availabilityStatus !== undefined &&
      req.user.role === ROLES.TECHNICIAN
    ) {
      fieldsToUpdate.availabilityStatus = availabilityStatus;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};