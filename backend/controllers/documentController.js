const mongoose = require('mongoose');
const Record = require('../models/Record');
// documentController.js
const { fromBuffer } = require('file-type'); // Adjust based on your project structure

exports.previewDocument = async (req, res) => {
    try {
        const recordId = req.params.recordId;
        const record = await Record.findById(recordId);

        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        let buffer = record.document; // Assuming document is stored as a Buffer
        console.log('Retrieved file:', buffer, 'Type:', typeof buffer, 'Is Buffer:', Buffer.isBuffer(buffer));

        // Validate the buffer
        if (!buffer || !Buffer.isBuffer(buffer)) {
            console.error('Invalid buffer:', buffer);
            return res.status(400).json({ success: false, message: 'Invalid document data' });
        }

        // Validate the file type
        const fileType = await fromBuffer(buffer);
        if (!fileType || fileType.ext !== 'pdf') {
            return res.status(400).json({ success: false, message: 'Invalid document type', error: 'Only PDF files are supported' });
        }

        res.set('Content-Type', 'application/pdf');
        res.send(buffer);
    } catch (err) {
        console.error(`Error processing document for recordId: ${req.params.recordId}`, err);
        res.status(500).json({ success: false, message: 'Error processing document', error: err.message });
    }
};