const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// ✅ Routes calling functions from authController
router.post('/signup', authController.signup);
router.post('/user-login', authController.userLogin);
router.post('/admin-login', authController.adminLogin);

module.exports = router;