import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const admin = await Admin.findOne({ _id: decoded._id });

        if (!admin) {
            throw new Error('Admin not found');
        }

        req.token = token;
        req.admin = admin;
        next();
    } catch (error) {
        console.error('Admin auth error:', error.message);
        res.status(401).json({ message: 'Please authenticate as admin' });
    }
};

export default adminAuth; 