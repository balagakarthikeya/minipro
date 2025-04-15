const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token missing' });
        }

        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('Middleware - Decoded user:', decoded);
        next();
    } catch (error) {
        console.error('Middleware error:', error.stack);
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};