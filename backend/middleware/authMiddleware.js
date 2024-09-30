const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for the token in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from header
            token = req.headers.authorization.split(' ')[1]; // "Bearer <token>"

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the user to the request object
            req.user = await User.findById(decoded.id).select('-password'); // Exclude the password

            next(); // Pass control to the next middleware
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protect };
