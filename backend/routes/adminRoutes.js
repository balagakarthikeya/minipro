const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuthMiddleware = require('../middleware/adminAuth');

router.get('/pending-signups', adminAuthMiddleware, adminController.getPendingSignups);
router.post('/approve-signup/:userId', adminAuthMiddleware, adminController.approveSignup);
router.delete('/reject-signup/:userId', adminAuthMiddleware, adminController.rejectSignup);
router.get('/approved-users', adminAuthMiddleware, adminController.getApprovedUsers);
router.delete('/delete-user/:userId', adminAuthMiddleware, adminController.deleteUser);
router.get('/get-admin-records/:uniqueId', adminAuthMiddleware, adminController.getUserRecords); // Reintroduce middleware

module.exports = router;