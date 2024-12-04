const asyncHandler = require("express-async-handler");
const Profile = require('../models/Profile');
const Record = require('../models/Record');

// @desc Get Profile by User ID
// @route GET /profiles/:userId
// @access Private
const getProfileByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        const profile = await Profile.findOne({ userId });

        if (!profile) {
            res.status(404);
            throw new Error('Profile not found');
        }

        const populatedRecords = await Record.find({
            _id: { $in: profile.appliedRecords } // Find all records with IDs in appliedRecords
        });

        res.status(200).json({
            ...profile._doc, // Spread the profile data
            appliedRecords: populatedRecords // Replace appliedRecords with full Record documents
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// @desc Update Profile by adding an existing recordId
// @route PUT /profiles/:userId
// @access Private
const updateProfileByExistingRecord = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { recordId } = req.body;

    if (!recordId) {
        res.status(400);
        throw new Error('Record ID is required');
    }

    try {
        // Find the user's profile
        let profile = await Profile.findOne({ userId });

        if (!profile) {
            // If no profile exists, create one
            profile = new Profile({ userId, appliedRecords: [] });
        }

        // Add the recordId to the appliedRecords array if it's not already present
        if (!profile.appliedRecords.includes(recordId)) {
            profile.appliedRecords.push(recordId);
            await profile.save();
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc Create a new record and add it to the user's profile
// @route POST /profiles/:userId/createRecord
// @access Private
const updateProfileByNewRecord = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { company, type, jobTitle, appliedDate, receivedInterview, websiteLink, comment, click, receivedOffer } = req.body;

    if (!company || !type || !jobTitle || !appliedDate || receivedInterview == null || !websiteLink || click == null) {
        res.status(400);
        throw new Error('All record fields are required');
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
            userId,
            receivedOffer
        });

        const savedRecord = await newRecord.save();

        // Find the user's profile or create one if it doesn't exist
        let profile = await Profile.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId, appliedRecords: [] } },
            { new: true, upsert: true } // Return the updated or newly created profile
        );

        // Add the new record's ID to the user's profile
        profile.appliedRecords.push(savedRecord._id);
        await profile.save();

        res.status(201).json({
            message: 'Record created and added to profile successfully',
            profile,
            record: savedRecord
        });
    } catch (error) {
        console.error('Error creating record on profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = { getProfileByUserId, updateProfileByExistingRecord, updateProfileByNewRecord };
