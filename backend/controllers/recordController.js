const asyncHandler = require("express-async-handler");
const Record = require('../models/Record');

// @desc Get all records for a specific user
// @route GET /user/:userId/records
// @access Private
const getRecordsByUser = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    try {
        // find records by userId
        const records = await Record.find({ userId: userId }); 
        console.log("records: ", records)

        res.status(200).json(records);
    } catch (error) {
        console.error('Error fetching user records:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc Create new Record
// @route POST /records
// @access Private
const createRecord = asyncHandler(async (req, res) => {
    const { company, type, jobTitle, date, receivedInterview, websiteLink, comment, click, appliedBy } = req.body;

    if (!company || !type || !jobTitle || !date || !websiteLink || click == null) {
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
        userId: req.user._id, // Use the logged-in user's ID
        appliedBy: [appliedBy]
    });

    const savedRecord = await newRecord.save();
    res.status(201).json(savedRecord);
});

// @desc Update an existing record for a user
// @route PUT /records/:id
// @access Private
const updateRecord = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the record ID from the URL

    // Check if the record belongs to the logged-in user
    const record = await Record.findOne({ _id: id, userId: req.user._id });
    if (!record) {
        res.status(404);
        throw new Error('Record not found or unauthorized');
    }

    // Update the record
    Object.assign(record, req.body);
    const updatedRecord = await record.save();

    res.status(200).json(updatedRecord);
});

// @desc Delete a record for a user
// @route DELETE /records/:id
// @access Private
const deleteRecord = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the record ID from the URL

    // Check if the record exists
    const record = await Record.findById(id);
    if (!record) {
        res.status(404);
        throw new Error('Record not found');
    }

    // Delete the record
    await Record.findByIdAndDelete(id);

    res.status(200).json({ message: 'Record deleted successfully' });
});

// @desc return statement includes a 'isApplied' attribute for the current user
// @route DELETE /records
// @access Private
const getRecords = asyncHandler(async (req, res) => {
    try {
        const records = await Record.find();
        const userId = req.user._id; 

        // Add an 'isApplied' field to indicate if the user applied
        const recordsWithStatus = records.map(record => {
            return {
                ...record._doc, // Spread the record data
                isApplied: record.appliedBy.includes(userId)
            };
        });

        res.status(200).json(recordsWithStatus);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

const countRecord = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the record ID from the URL

    // Find the record by its ID
    const record = await Record.findById(id);
    if (!record) {
        res.status(404);
        throw new Error('Record not found');
    }

    // Increment the click count
    record.click += 1;

    const updatedRecord = await record.save(); // Save the updated record
    res.status(200).json(updatedRecord);
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const record = await Record.findById(id);
    if (!record) {
        return res.status(404).json({ message: 'Record not found' });
    }

    if (status === 'Applied') {
        if (!record.appliedBy.includes(userId)) {
            record.appliedBy.push(userId); // Add the user to appliedBy array
        }
    } else {
        // Optionally, remove the user if they are no longer 'Applied'
        record.appliedBy = record.appliedBy.filter(id => id.toString() !== userId.toString());
    }

    await record.save();
    res.status(200).json(record);
});

// @desc Get one record by recordId
// @route GET /records/:recordId
// @access Private
const getOneRecordByRecordId = asyncHandler(async (req, res) => {
    const { recordId } = req.params;

    try {
        // Find the record by its ID and select only the specified fields
        const record = await Record.findById(recordId, 'company jobTitle type');

        if (!record) {
            res.status(404);
            throw new Error('Record not found');
        }

        res.status(200).json(record);
    } catch (error) {
        console.error('Error fetching record:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


const getRecordById = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the record ID from the URL
    const userId = req.user._id; // Get the logged-in user's ID
    const record = await Record.findOne({ _id: id, userId }); // Ensure the record belongs to the user
    if (!record) {
        res.status(404);
        throw new Error('Record not found or unauthorized');
    }

    res.status(200).json(record);
});

module.exports = { getRecords, createRecord, updateRecord, deleteRecord, getRecordsByUser,countRecord,updateApplicationStatus,getApplicationStatus,getRecordById, getOneRecordByRecordId };
