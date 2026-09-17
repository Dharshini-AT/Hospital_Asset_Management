const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getTechnicians,
  getAvailableTechnicians,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

// Technician directory endpoints accessible by authenticated staff/technician/admin
router.get('/technicians', protect, getTechnicians);
router.get('/technicians/available', protect, getAvailableTechnicians);

// User management endpoints accessible by ADMIN
router.get('/', protect, authorize(ROLES.ADMIN), getUsers);
router.get('/:id', protect, getUserById);
router.post('/', protect, authorize(ROLES.ADMIN), createUser);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateUser);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteUser);

module.exports = router;
