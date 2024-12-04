const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of your app
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        let user = await User.findOne({ googleId });

        if (!user) {
            user = await User.create({ googleId, email, name });
        }

        req.user = user; // Attach the user to the request
        next(); // Pass control to the next middleware
    } catch (error) {
        console.error('Google token verification failed:', error);
        return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
});

module.exports = { verifyGoogleToken };
