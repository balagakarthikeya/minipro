const User = require('../models/User');
const nodemailer = require('nodemailer');
const People = require('../models/People');
const Record = require('../models/Record');
const jwt = require('jsonwebtoken');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send email
const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
};

exports.getPendingSignups = async (req, res) => {
    try {
        const users = await User.find({ status: 'pending', role: 'user' });
        res.json(users);
    } catch (error) {
        console.error('Error fetching pending signups:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.approveSignup = async (req, res) => {
    try {
        console.log('Approving user:', req.params.userId);
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.status = 'approved';
        await user.save();
        console.log('Updated user:', user);

        // Send approval email
        await sendEmail(user.email, 'Signup Approved', 'Your signup has been approved.');

        res.json({ message: 'User approved successfully' });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.rejectSignup = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await sendEmail(
            user.email,
            'Account Rejection Notification',
            `Hello ${user.username},\n\nYour signup request has been rejected. If you have any questions, please contact support.\n\nRegards,\nTamper-Proof Record Management Team`
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getApprovedUsers = async (req, res) => {
    try {
        const users = await User.find({ status: 'approved', role: 'user' });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await sendEmail(
            user.email,
            'Account Deletion Notification',
            `Hello ${user.username},\n\nYour account has been deleted by an administrator. If this was a mistake, please contact support.\n\nRegards,\nTamper-Proof Record Management Team`
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};



exports.getUserRecords = async (req, res) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token missing' });
        }

        const token = req.headers.authorization.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
        }

        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { uniqueId } = req.params;
        const filter = req.query.filter || 'all';

        // Direct exact-match search (no regex)
        const people = await People.findOne({ uniqueId }).lean();
        if (!people) {
            return res.status(404).json({ success: false, message: 'People profile not found' });
        }

        // Calculate age if DOB exists
        let age = 'N/A';
        if (people.dob) {
            const dob = new Date(people.dob);
            const today = new Date();
            age = today.getFullYear() - dob.getFullYear();
            if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
                age--;
            }
        }

        // Direct exact-match search for records (no regex)
        let records = await Record.find({ uniqueId })
            .populate('createdBy', 'username industryType')
            .lean();

        // Apply industry filter if needed
        if (filter !== 'all') {
            records = records.filter(record => record.createdBy && record.createdBy.industryType === filter);
        }

        // Sort records by most recent
        records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Prepare response data
        const formattedRecords = records.map(record => ({
            createdAt: record.createdAt,
            issuerName: record.createdBy?.username || 'Unknown',
            issuerIndustry: record.createdBy?.industryType || 'Unknown',
            remarks: record.remarks || 'N/A',
            fileUrl: `/api/record/download/${record._id}`,
            _id: record._id
        }));

        res.json({ 
            success: true, 
            user: { 
                name: people.name || 'N/A', 
                dob: people.dob ? people.dob.toISOString() : 'N/A', 
                gender: people.gender || 'N/A', 
                age: age 
            }, 
            records: formattedRecords 
        });

    } catch (error) {
        console.error('Error fetching user records:', error);
        res.status(500).json({ success: false, message: 'Error retrieving records. Please try again.' });
    }
};