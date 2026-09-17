const express = require("express");
const router = express.Router();
const {
  getStaffDashboard,
  getAdminDashboard,
  getTechnicianDashboard
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { ROLES } = require("../utils/constants");

router.get("/staff", protect, authorize(ROLES.STAFF), getStaffDashboard);
router.get("/admin", protect, authorize(ROLES.ADMIN), getAdminDashboard);
router.get("/technician", protect, authorize(ROLES.TECHNICIAN), getTechnicianDashboard);

module.exports = router;
