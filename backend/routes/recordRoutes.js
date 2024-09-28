const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordController");
const limiter = require('../middleware/rateLimiter');

router.get('/', limiter, recordController.getRecords);
router.post('/', limiter, recordController.createRecord);
router.put('/:id', limiter, recordController.updateRecord);
router.delete('/:id', limiter, recordController.deleteRecord);
router.get('/user/:userId', recordController.getRecordsByUser);

module.exports = router;
