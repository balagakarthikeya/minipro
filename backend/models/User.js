const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hash with bcrypt
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Simplified roles
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
    industryType: { type: String },
    industryName: { type: String }
});

module.exports = mongoose.model('User', userSchema);