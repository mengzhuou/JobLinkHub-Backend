const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const limiter = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');  

// Route to get a profile by userId
router.get('/:userId', limiter, protect, profileController.getProfileByUserId);

// Route to update a profile by adding a recordId
router.put('/:userId', limiter, protect, profileController.updateProfileByUserId);

module.exports = router;
