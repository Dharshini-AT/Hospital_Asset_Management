const User = require('../models/User');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const { generateSequenceId } = require('../utils/generateId');
const { ROLES, AVAILABILITY_STATUS, MAINTENANCE_STATUS } = require('../utils/constants');

// @desc    Get all users with filtering and pagination
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { role, department, accountStatus, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (department) filter.department = department;
    if (accountStatus) filter.accountStatus = accountStatus;
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { userId: searchRegex },
        { designation: searchRegex },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by id or userId
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: id } : { userId: id.toUpperCase() };

    const user = await User.findOne(filter);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user (Admin)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, designation, department, specialization } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const prefix = role === ROLES.ADMIN ? 'ADM' : role === ROLES.TECHNICIAN ? 'TEC' : 'STAFF';
    const userId = await generateSequenceId(User, 'userId', prefix, 3);

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
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: id } : { userId: id.toUpperCase() };

    const user = await User.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: id } : { userId: id.toUpperCase() };

    const user = await User.findOneAndDelete(filter);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all technicians with current active workloads
// @route   GET /api/users/technicians
// @access  Private
const getTechnicians = async (req, res, next) => {
  try {
    const technicians = await User.find({
      role: ROLES.TECHNICIAN,
      accountStatus: 'ACTIVE',
    }).select('-password');

    // Calculate active workload for each technician
    const techIds = technicians.map((t) => t._id);
    const activeJobs = await MaintenanceRequest.aggregate([
      {
        $match: {
          assignedTechnician: { $in: techIds },
          status: { $in: [MAINTENANCE_STATUS.ASSIGNED, MAINTENANCE_STATUS.IN_PROGRESS] },
        },
      },
      {
        $group: {
          _id: '$assignedTechnician',
          count: { $sum: 1 },
        },
      },
    ]);

    const workloadMap = {};
    activeJobs.forEach((job) => {
      workloadMap[job._id.toString()] = job.count;
    });

    const enrichedTechnicians = technicians.map((tech) => {
      const obj = tech.toObject();
      obj.activeWorkload = workloadMap[tech._id.toString()] || 0;
      return obj;
    });

    res.status(200).json({
      success: true,
      data: enrichedTechnicians,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available technicians (for assignment dropdown)
// @route   GET /api/users/technicians/available
// @access  Private
const getAvailableTechnicians = async (req, res, next) => {
  try {
    const technicians = await User.find({
      role: ROLES.TECHNICIAN,
      accountStatus: 'ACTIVE',
    }).select('userId name email phone specialization department availabilityStatus');

    // Attach workload
    const techIds = technicians.map((t) => t._id);
    const activeJobs = await MaintenanceRequest.aggregate([
      {
        $match: {
          assignedTechnician: { $in: techIds },
          status: { $in: [MAINTENANCE_STATUS.ASSIGNED, MAINTENANCE_STATUS.IN_PROGRESS] },
        },
      },
      {
        $group: {
          _id: '$assignedTechnician',
          count: { $sum: 1 },
        },
      },
    ]);

    const workloadMap = {};
    activeJobs.forEach((job) => {
      workloadMap[job._id.toString()] = job.count;
    });

    const enrichedTechnicians = technicians.map((tech) => {
      const obj = tech.toObject();
      obj.activeWorkload = workloadMap[tech._id.toString()] || 0;
      return obj;
    });

    // Sort: AVAILABLE first, then lowest workload
    enrichedTechnicians.sort((a, b) => {
      if (a.availabilityStatus === 'AVAILABLE' && b.availabilityStatus !== 'AVAILABLE') return -1;
      if (a.availabilityStatus !== 'AVAILABLE' && b.availabilityStatus === 'AVAILABLE') return 1;
      return a.activeWorkload - b.activeWorkload;
    });

    res.status(200).json({
      success: true,
      data: enrichedTechnicians,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getTechnicians,
  getAvailableTechnicians,
};
