const express = require('express');
const router = express.Router();
const multer = require('multer');
const recordController = require('../controllers/recordController');
const userAuthMiddleware = require('../middleware/userAuth');

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route for adding a record with file upload
router.post('/add-record', userAuthMiddleware, upload.single('document'), recordController.addRecord);

module.exports = router;