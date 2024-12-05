const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const limiter = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');  

router.get('/:userId', limiter, protect, profileController.getProfileByUserId);
router.put('/:userId/existing-record', limiter, protect, profileController.updateProfileByExistingRecord);

module.exports = router;
