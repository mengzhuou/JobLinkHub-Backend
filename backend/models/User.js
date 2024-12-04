const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Google login users may not have a googleId, so this field can be null
    },
    name: {
        type: String, // Provided during Google login or registration
        required: false,
    },
    email: {
        type: String,
        unique: true, // Ensures email uniqueness
        sparse: true, // Google users might not have an email, but local users require one
    },
    username: {
        type: String,
        unique: true, // Local registered users require a unique username
        required: function () {
            return !this.googleId; // If the user is not using Google login, username is required
        },
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // If the user is not using Google login, password is required
        },
    },
});

// Hash the password before saving it to the database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Add a method to compare the entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
