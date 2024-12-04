const mongoose = require('mongoose')

const recordSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true
    },
    // employment type
    type: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    appliedDate: {
        type: Date,
        required: true
    },
    websiteLink: {
        type: String,
        required: true
    },
    comment: {
        type: String
    },
    click: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receivedInterview: {
        type: Boolean
    },
    receivedOffer: {
        type: Boolean
    }
});
module.exports = mongoose.model('Record', recordSchema)