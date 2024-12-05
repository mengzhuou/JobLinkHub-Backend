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



module.exports = { 
    getProfileByUserId, 
    updateProfileByExistingRecord, 
};
