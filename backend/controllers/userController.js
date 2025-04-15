const User = require('../models/User');
const People = require('../models/People');
const Record = require('../models/Record');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

exports.getUserRecords = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'user') {
            return res.status(403).json({ success: false, message: 'User access required' });
        }

        const { uniqueId } = req.params; // Extract uniqueId from params (string)

        // Use case-insensitive regex for uniqueId// Case-insensitive matching

        // Find the people profile by uniqueId
        const people = await People.findOne({ uniqueId }).lean();
        if (!people) {
            return res.status(404).json({ success: false, message: 'People profile not found' });
        }

        // Calculate age based on DOB
        let age = 'N/A';
        if (people.dob) {
            const dob = new Date(people.dob);
            const today = new Date();
            age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
        }

        // Get the logged-in user's industryType
        const loggedInUser = await User.findById(decoded.id).select('industryType');
        if (!loggedInUser || !loggedInUser.industryType) {
            return res.status(500).json({ success: false, message: 'User industry type not found' });
        }
        const staffIndustryType = loggedInUser.industryType;

        // Fetch all records for this uniqueId, filtering by the staff's industryType
        let records = await Record.find({ uniqueId})
            .populate('createdBy', 'username industryType')
            .lean();

        // Filter records to include only those created by users with the same industryType
        records = records.filter(record => 
            record.createdBy && record.createdBy.industryType === staffIndustryType
        );

        // Apply date range filter if provided
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

        if (startDate || endDate) {
            records = records.filter(record => {
                const recordDate = new Date(record.createdAt);
                const isAfterStart = !startDate || recordDate >= startDate;
                const isBeforeEnd = !endDate || recordDate <= endDate;
                return isAfterStart && isBeforeEnd;
            });
        }

        // Sort records by createdAt (recent first)
        records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Prepare records data for response
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
        res.status(500).json({ success: false, message: 'Error retrieving records' });
    }
};

exports.createPeopleProfile = async (req, res) => {
    try {
        const { name, dob, gender, email, phone, address } = req.body;
        const token = req.headers.authorization.split(' ')[1]; // Extract token from Bearer

        // Verify token to ensure the user has role "user" (staff)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'user') {
            return res.status(403).json({ success: false, message: 'User access required' });
        }

        // Check if email already exists to avoid duplicates
        const existingPeople = await People.findOne({ email });
        if (existingPeople) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Generate a unique 6-digit alphanumeric and symbolic ID
        let uniqueId;
        let isUnique = false;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        while (!isUnique) {
            uniqueId = '';
            for (let i = 0; i < 6; i++) {
                uniqueId += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const existingId = await People.findOne({ uniqueId });
            if (!existingId) isUnique = true;
        }

        const newPeople = new People({
            name,
            dob,
            gender,
            email,
            phone,
            address,
            uniqueId,
            createdBy: decoded.id // Reference to the user (staff)'s ID
        });

        await newPeople.save();
        console.log('New people profile saved:', newPeople);

        // Send email with unique ID
        await sendEmail(email, 'Your Unique ID for Tamper-Proof Record Management', `Hello ${name},\n\nYour unique ID is ${uniqueId}. Please keep this ID safe for accessing your profile.\n\nRegards,\nTamper-Proof Record Management Team`);

        console.log(`Unique ID email sent to ${email}`);
        res.json({ success: true, message: 'People profile created successfully' });
    } catch (error) {
        console.error('Error creating people profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.sendUniqueId = async (req, res) => {
    try {
        const { email, uniqueId } = req.body;
        const people = await People.findOne({ email, uniqueId });

        if (!people) {
            return res.status(404).json({ success: false, message: 'People profile not found' });
        }

        await sendEmail(email, 'Your Unique ID for Tamper-Proof Record Management', `Hello ${people.name},\n\nYour unique ID is ${uniqueId}. Please keep this ID safe for accessing your profile.\n\nRegards,\nTamper-Proof Record Management Team`);

        console.log(`Unique ID email sent to ${email}`);
        res.json({ success: true, message: 'Unique ID emailed successfully' });
    } catch (error) {
        console.error('Error sending unique ID email:', error);
        res.status(500).json({ success: false, message: 'Failed to send unique ID email' });
    }
};