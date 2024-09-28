const asyncHandler = require("express-async-handler");
const Record = require('../models/Record');

// @desc Get all Records
// @route GET /Records
// @access Private
const getRecords = asyncHandler(async (req, res) => {
    const records = await Record.find();
    res.status(200).json(records);
});

// @desc Create new Record
// @route POST /Records
// @access Private
const createRecord = asyncHandler(async (req, res) => {
    const { company, type, jobTitle, date, receivedInterview, websiteLink, comment, click, userId } = req.body;

    if (!company || !type || !jobTitle || !date || receivedInterview == null || !websiteLink || click == null) {
        res.status(400);
        throw new Error('Please provide all required record fields');
    }

    const newRecord = new Record({
        company, 
        type, 
        jobTitle, 
        date, 
        receivedInterview, 
        websiteLink, 
        comment, 
        click,
        userId,
    });

    const savedRecord = await newRecord.save();
    res.status(201).json(savedRecord);
});

// @desc Update an existing Record
// @route PUT /Records/:id
// @access Private
const updateRecord = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the record ID from the URL
    const updatedData = req.body; // Get the new data for the record

    // Find the record by ID and update it with the new data
    const updatedRecord = await Record.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedRecord) {
        res.status(404);
        throw new Error('Record not found');
    }

    res.status(200).json(updatedRecord);
});

// @desc Delete a Record
// @route DELETE /Records/:id
// @access Private
const deleteRecord = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the record ID from the URL

    // Find the record by ID and delete it
    const deletedRecord = await Record.findByIdAndDelete(id);

    if (!deletedRecord) {
        res.status(404);
        throw new Error('Record not found');
    }

    res.status(200).json({ message: 'Record deleted successfully' });
});

const getRecordsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const records = await Record.find({ userId });

    if (!records) {
        return res.status(404).json({ message: 'No records found' });
    }

    res.status(200).json(records);
});

module.exports = { getRecords, createRecord, updateRecord, deleteRecord, getRecordsByUser };
