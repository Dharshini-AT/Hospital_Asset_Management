const express = require('express');
const router = express.Router();
const { getAllHistories, getHistoryById, getAssetHistory } = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllHistories);
router.get('/asset/:assetId', protect, getAssetHistory);
router.get('/:historyId', protect, getHistoryById);

module.exports = router;
