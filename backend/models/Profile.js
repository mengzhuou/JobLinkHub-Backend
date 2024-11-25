const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    appliedRecords: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Record'
        }
    ]
});

module.exports = mongoose.model('Profile', profileSchema);
