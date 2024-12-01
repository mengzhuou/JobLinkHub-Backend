const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        let user = await User.findOne({ googleId });

        if (!user) {
            // Check if a user with the same email already exists
            user = await User.findOne({ email });
            if (!user) {
                // If no user exists, create a new one
                user = await User.create({
                    googleId,
                    email,
                    name,
                });
            } else {
                // If a user with the same email exists, update their Google ID
                user.googleId = googleId;
                await user.save();
            }
        }

        req.user = user; // Attach the user object to the request
        next();
    } catch (error) {
        console.error('Error during Google login:', error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error: ' + error.message });
        }
        res.status(500).json({ message: 'Google login failed: ' + error.message });
    }
});

module.exports = { verifyGoogleToken };
