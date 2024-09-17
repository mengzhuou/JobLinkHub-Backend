const mongoose = require('mongoose')

const recordSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    receivedInterview: {
        type: Boolean,
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
    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'
    // }
})

module.exports = mongoose.model('Record', recordSchema)