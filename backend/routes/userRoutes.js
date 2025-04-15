const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const People = require('../models/People'); // Check if this is needed or duplicated elsewhere
const userController = require('../controllers/userController');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const userAuthMiddleware = require('../middleware/userAuth');

// ✅ CREATE PEOPLE PROFILE (User-Only)
router.post('/create-people', userAuthMiddleware, userController.createPeopleProfile);

// ✅ SEND UNIQUE ID (User-Only)
router.post('/send-unique-id', userAuthMiddleware, userController.sendUniqueId);

// ✅ GET USER RECORDS (User-Only, New)
router.get('/get-user-records/:uniqueId', userAuthMiddleware, userController.getUserRecords);

module.exports = router;