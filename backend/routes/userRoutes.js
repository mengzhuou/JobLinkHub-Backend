const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const limiter = require('../middleware/rateLimiter');

router.get('/', limiter, userController.getUsers); // Route to get all users
router.post('/auth/google-login', limiter, userController.verifyGoogleLogin);

module.exports = router;
