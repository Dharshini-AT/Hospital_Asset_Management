const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, AVAILABILITY_STATUS, ACCOUNT_STATUS } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, 'Role is required'],
      default: ROLES.STAFF,
    },
    designation: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: 'General',
    },
    specialization: {
      type: String,
      trim: true,
      default: '', // For technicians (e.g., Biomedical, Radiology, Electrical)
    },
    availabilityStatus: {
      type: String,
      enum: Object.values(AVAILABILITY_STATUS),
      default: AVAILABILITY_STATUS.AVAILABLE,
    },
    accountStatus: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Exclude password when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
