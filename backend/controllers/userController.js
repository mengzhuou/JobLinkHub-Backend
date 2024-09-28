const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken'); 
const User = require('../models/User');
const bcrypt = require('bcryptjs');

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

        // Return user details or a token for session management
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

// @desc Register new user (username + password)
// @route POST /auth/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const newUser = new User({ 
            username, 
            password 
        });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {

        if (error.code === 11000) { 
            const duplicatedField = Object.keys(error.keyValue)[0]; 
            return res.status(400).json({ message: `Duplicate key error. ${duplicatedField} already exists.` });
        }

        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});



// @desc Log in a user by username and password
// @route POST /auth/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    
    if (!user) {
        return res.status(400).json({ message: 'Username does not exist' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password' });
    }

    res.status(200).json({ message: 'Login successful', user });
});


module.exports = { getUsers, verifyGoogleLogin, registerUser, loginUser };
