import express from 'express';
import Report from '../models/Report.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ✅ JWT Authentication Middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user info to request
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};

// 🌍 GET /api/reports - Public route to fetch all reports
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error('❌ Error fetching all reports:', error.message);
        res.status(500).json({ message: 'Server error while fetching all reports' });
    }
});

// 🧑‍💼 GET /api/reports/mine - Fetch reports for logged-in user
router.get('/mine', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const reports = await Report.find({ createdBy: userId }).sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error('❌ Error fetching user reports:', error);
        res.status(500).json({ message: 'Server error while fetching reports' });
    }
});

// 📝 POST /api/reports - Submit a new report
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

// 🔄 PATCH /api/reports/:id/status - Update the status of a report
router.patch('/:id/status', authenticate, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'in progress', 'resolved'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (report.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this report' });
        }

        report.status = status;
        await report.save();

        res.status(200).json({ message: 'Status updated successfully', report });
    } catch (error) {
        console.error('❌ Error updating report status:', error);
        res.status(500).json({ message: 'Server error while updating status' });
    }
});

export default router;