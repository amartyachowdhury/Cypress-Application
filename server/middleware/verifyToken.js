import jwt from 'jsonwebtoken';

// Middleware to verify JWT token from Authorization header
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId; // Attach user ID to request
        next(); // Continue to the next middleware or route
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};