const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    uniqueId: { type: String, required: true, ref: 'People' },
    remarks: { type: String, required: true },
    document: { 
        type: Buffer, 
        required: true 
    },
    docDescription: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

recordSchema.index({ uniqueId: 1, createdAt: -1 }); // Index for faster queries by uniqueId and recent records

module.exports = mongoose.model('Record', recordSchema);