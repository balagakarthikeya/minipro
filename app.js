const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./backend/routes/authRoutes');
const adminRoutes = require('./backend/routes/adminRoutes');
const userRoutes = require('./backend/routes/userRoutes');
const recordRoutes = require('./backend/routes/recordRoutes');
const documentRoutes = require('./backend/routes/documentRoutes');
const adminAuthMiddleware = require('./backend/middleware/adminAuth');
const userAuthMiddleware = require('./backend/middleware/userAuth');
const path = require('path');
const mongoose = require('mongoose');
dotenv.config();
const app = express();

// Connect to record-management database (users, people, and records)
connectDB().then(() => {
    console.log('Connected to record-management database');
}).catch(err => console.error('Failed to connect to record-management DB:', err));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Protect dashboard pages with role-based middleware
app.get('/dashboard.html', adminAuthMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/dashboard2.html', userAuthMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard2.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes); // Ensure staff routes are included
app.use('/api/record', recordRoutes);
app.use('/api/document', documentRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
app.get('/health', async (req, res) => {
    try {
        const isConnected = mongoose.connection.readyState === 1; // 1 means connected
        if (isConnected) {
            res.status(200).json({ success: true, message: 'MongoDB is connected' });
        } else {
            res.status(500).json({ success: false, message: 'MongoDB is not connected' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error checking MongoDB connection', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));