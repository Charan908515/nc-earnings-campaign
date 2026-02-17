const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from cookie instead of Authorization header
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
};

const adminMiddleware = (req, res, next) => {
    // Get token from cookie instead of Authorization header
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if token has admin role
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

module.exports = { authMiddleware, adminMiddleware };
