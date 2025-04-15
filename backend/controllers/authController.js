const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.signup = async (req, res) => {
    console.log('Signup attempt:', req.body);
    const { username, email, password, industryType, industryName } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        console.log('Existing user:', existingUser);
        if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            industryType,
            industryName,
            role: 'user', // Default to user (staff)
            status: 'pending'
        });
        await user.save();
        console.log('User saved:', user);
        res.status(201).json({ success: true, message: 'Signup request submitted. Waiting for admin approval.' });
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.userLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, role: 'user', status: 'approved' });
        if (!user) return res.status(401).json({ message: 'Invalid credentials or not approved' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ 
            success: true, 
            token, 
            username: user.username, 
            industryType: user.industryType // Ensure this is included
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, role: 'admin' });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};