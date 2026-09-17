const express = require('express');
const router = express.Router();
const { getOperationalReports } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

router.get('/operational', protect, authorize(ROLES.ADMIN), getOperationalReports);

module.exports = router;
