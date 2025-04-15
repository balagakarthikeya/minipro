const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/auth'); // Use the new middleware

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
// Preview Document (for both admin and user)
router.get('/preview/:recordId', authMiddleware, documentController.previewDocument);


module.exports = router;