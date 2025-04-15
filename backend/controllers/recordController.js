const Record = require('../models/Record');
const People = require('../models/People');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { fromBuffer } = require('file-type');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.addRecord = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'user') {
            return res.status(403).json({ success: false, message: 'User access required' });
        }

        const { userId: uniqueId, remarks, docDescription } = req.body;
        console.log('Uploaded file:', req.file);

        const document = req.file ? req.file.buffer : null; // Assuming multer for file upload
        if (!document) {
            return res.status(400).json({ success: false, message: 'Document is required' });
        }

        console.log('Uploaded file buffer length:', document.length, 'First few bytes:', document.slice(0, 10).toString('hex'));
        const fileType = await fromBuffer(document);
        if (!fileType || fileType.mime !== 'application/pdf') {
            console.log('Uploaded file is not a valid PDF. Detected type:', fileType?.mime);
            return res.status(400).json({ success: false, message: 'Uploaded file must be a valid PDF' });
        }

        const people = await People.findOne({ uniqueId }).lean();
        if (!people) {
            return res.status(404).json({ success: false, message: 'People profile not found' });
        }

        const newRecord = new Record({
            uniqueId,
            remarks,
            document,
            docDescription,
            createdBy: decoded.id
        });

        await newRecord.save();
        console.log('New record saved:', newRecord);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: people.email,
            subject: 'New Record Added to Your Profile',
            text: `Hello ${people.name},\n\nA new record has been added to your profile with the following details:\n\nRemarks: ${remarks}\nDescription: ${docDescription}\n\nPlease find the attached document.\n\nRegards,\nTamper-Proof Record Management Team`,
            attachments: [{
                filename: `record_${uniqueId}.pdf`,
                content: document,
                encoding: 'base64'
            }]
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email with attachment sent to ${people.email}`);

        res.json({ success: true, message: 'Record added successfully!' });
    } catch (error) {
        console.error('Error adding record:', error);
        res.status(500).json({ success: false, message: 'Error adding record', error: error.message });
    }
};