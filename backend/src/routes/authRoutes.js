const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { validate } = require('../middleware/validationMiddleware');

router.post('/register', validateRegister, validate, register);
router.post('/login', validateLogin, validate, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
