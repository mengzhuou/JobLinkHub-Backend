const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordController");
const limiter = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');  

router.get('/', limiter, protect, recordController.getRecords); 
router.get('/:recordId', limiter, protect, recordController.getOneRecordByRecordId);
router.post('/', limiter, protect, recordController.createRecord); 
router.post('/duplicate/:recordId', limiter, protect, recordController.createRecordByRecordId); 
router.put('/:id', limiter, protect, recordController.updateRecord); 
router.delete('/:id', limiter, protect, recordController.deleteRecord); 
router.put('/:id/click', limiter, recordController.countRecord);
module.exports = router;
