const asyncHandler = require("express-async-handler");
const Record = require('../models/Record');
const Profile = require('../models/Profile');

// @desc Create new Record and update Profile
// @route POST /records
// @access Private
const createRecord = asyncHandler(async (req, res) => {
    const { company, type, jobTitle, appliedDate, receivedInterview, websiteLink, comment, click, receivedOffer } = req.body;

    // Validate required fields
    if (!company || !type || !jobTitle || !appliedDate || !websiteLink || click == null) {
        res.status(400);
        throw new Error('Please provide all required record fields');
    }

    try {
        // Create a new record
        const newRecord = new Record({
            company,
            type,
            jobTitle,
            appliedDate,
            receivedInterview,
            websiteLink,
            comment,
            click,
            userId: req.user._id, // Use the logged-in user's ID
            receivedOffer
        });

        const savedRecord = await newRecord.save();

        let profile = await Profile.findOne({ userId: req.user._id });

        if (!profile) {
            // If no profile exists, create one
            profile = new Profile({
                userId: req.user._id,
                appliedRecords: []
            });
        }

        if (!profile.appliedRecords.includes(savedRecord._id)) {
            profile.appliedRecords.push(savedRecord._id);
            await profile.save();
        }

        res.status(201).json({
            message: 'Record created and profile updated successfully',
            record: savedRecord,
            profile
        });
    } catch (error) {
        console.error('Error creating record and updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
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

// @desc for main record table: return statement includes a 'isApplied' attribute for the current user
// @route GET /records
// @access Private
const getRecords = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const records = await Record.find();
        let profile = await Profile.findOne({ userId }); // Use `let` here

        if (!profile) {
            // Create a new profile if it doesn't exist
            profile = new Profile({
                userId: req.user._id,
                appliedRecords: []
            });
            await profile.save(); // Save the new profile
        }

        const appliedRecord = profile.appliedRecords || [];

        // Add an 'isApplied' field to indicate if the user applied
        const recordsWithStatus = records.map(record => {
            return {
                ...record._doc, // Spread the record data
                isApplied: appliedRecord.includes(record._id.toString())
            };
        });
        console.log("recordsWithStatus: ", recordsWithStatus)

        

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

// @desc Get one record by recordId
// @route GET /records/:recordId
// @access Private
const getOneRecordByRecordId = asyncHandler(async (req, res) => {
    const { recordId } = req.params;

    try {
        // Find the record by its ID and select only the specified fields
        const record = await Record.findById(recordId);

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

module.exports = { getRecords, createRecord, updateRecord, deleteRecord, countRecord, getOneRecordByRecordId };
