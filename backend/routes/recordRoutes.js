const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordController");
const limiter = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');  

router.get('/', limiter, protect, recordController.getRecords); 
router.post('/', limiter, protect, recordController.createRecord); 
router.put('/:id', limiter, protect, recordController.updateRecord); 
router.delete('/:id', limiter, protect, recordController.deleteRecord); 
router.get('/user/:userId', limiter, protect, recordController.getRecordsByUser); 
router.put('/:id/click', limiter, recordController.countRecord);
router.patch('/:id/status', limiter, protect, recordController.updateApplicationStatus); 
router.get('/:id/status', limiter, protect, recordController.getApplicationStatus);
module.exports = router;
