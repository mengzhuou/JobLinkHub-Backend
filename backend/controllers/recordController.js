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




// Optional: You can also keep a method to get all records (admin-only, for example)
const getRecords = asyncHandler(async (req, res) => {
    const records = await Record.find();
    res.status(200).json(records);
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

    record.appliedStatus.set(userId.toString(), status);
    await record.save();

    res.status(200).json(record);
})


const getApplicationStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    
    const record = await Record.findById(id);
    if (!record) {
        res.status(404);
        throw new Error('Record not found');
    }
    
    const appliedStatus = record.appliedStatus.get(userId.toString()) || false;
    res.status(200).json({ appliedStatus });
});


module.exports = { getRecords, createRecord, updateRecord, deleteRecord, getRecordsByUser,countRecord,updateApplicationStatus,getApplicationStatus };
