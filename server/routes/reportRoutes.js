import express from 'express';
import Report from '../models/Report.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // attaches user info to the request
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};

// 🔽 Submit a report
router.post('/', authenticate, async (req, res) => {
    const { title, description, severity, location } = req.body;

    if (!title || !description || !severity || !location) {
        return res.status(400).json({ message: 'All fields including location are required.' });
    }

    try {
        const newReport = new Report({
            title,
            description,
            severity,
            location,
            createdBy: req.user.userId
        });

        await newReport.save();

        res.status(201).json({ message: 'Report submitted successfully!' });
    } catch (error) {
        console.error('❌ Error saving report:', error);
        res.status(500).json({ message: 'Server error while saving report' });
    }
});

export default router;