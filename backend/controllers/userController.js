const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken'); 
const User = require('../models/User');

// @desc Get all Users
// @route GET /Users
// @access Private
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
});

// @desc Verify Google Login and Create/Authenticate User
// @route POST /auth/google-login
// @access Public
const verifyGoogleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body; // Extract the token from the request body

    if (!token) {
        res.status(400);
        throw new Error('No token provided');
    }

    try {
        // Decode the token to get user information (sub, name, email, etc.)
        // You might use a library like `jwt-decode` or Google's client library
        const decodedToken = jwt.decode(token); 

        if (!decodedToken) {
            res.status(400);
            throw new Error('Invalid token');
        }

        // Get relevant user info from the token (sub = googleId)
        const { sub, name, email } = decodedToken; 

        // Check if the user already exists in the database
        let user = await User.findOne({ googleId: sub });

        if (!user) {
            // If the user doesn't exist, create a new user
            user = new User({
                googleId: sub,
                name,
                email
            });

            await user.save(); // Save the new user in the database
        }

        // If user exists, they are authenticated, return user details or a token for session management
        res.status(200).json({
            success: true,
            message: 'User authenticated',
            user
        });
    } catch (error) {
        res.status(500);
        throw new Error('Google login failed: ' + error.message);
    }
});

module.exports = { getUsers, verifyGoogleLogin };
