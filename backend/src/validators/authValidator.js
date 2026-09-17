const { body } = require('express-validator');
const { ROLES } = require('../utils/constants');

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage('Role must be STAFF, ADMIN, or TECHNICIAN'),
  body('phone').optional().trim(),
  body('department').optional().trim(),
  body('designation').optional().trim(),
];

const validateLogin = [
  body('email').trim().notEmpty().withMessage('Please provide an email or User ID'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  validateRegister,
  validateLogin,
};
