const jwt = require('jsonwebtoken');

const userAuthMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer <token>"
    if (!token) {
        return res.status(401).send(`
            <div style="text-align: center; padding: 20px; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <p>Please log in to access this page.</p>
                <button onclick="window.location.href='/login.html'">Close</button>
            </div>
        `); // Matches your "Please log in" dialog
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        if (decoded.role !== 'user') return res.status(403).json({ message: 'User access required' });
        req.user = decoded; // Attach decoded user data to request
        next(); // Proceed to the protected route
    });
};

module.exports = userAuthMiddleware;