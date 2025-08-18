import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import adminAuth from '../middleware/adminAuth.js';
import {
    loginAdmin,
    verifyAdmin,
    getAllReports,
    updateReportStatus
} from '../controllers/adminController.js';
import Report from '../models/Report.js';

dotenv.config();

const router = express.Router();

// Hardcoded admin credentials (for MVP)
// In production, replace with a proper Admin model stored in MongoDB
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cypressapp.io';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);

// Public routes
router.post('/login', loginAdmin);

// Protected routes
router.get('/verify', adminAuth, verifyAdmin);

// 📊 Get all reports with filtering and pagination
router.get('/reports', verifyAdmin, async (req, res) => {
    try {
        const { status, category, severity, page = 1, limit = 10 } = req.query;
        
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (category && category !== 'all') query.category = category;
        if (severity && severity !== 'all') query.severity = severity;

        const reports = await Report.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Report.countDocuments(query);

        res.status(200).json({
            reports,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (err) {
        console.error('❌ Error fetching reports:', err);
        res.status(500).json({ message: 'Failed to load reports' });
    }
});

// 📈 Get dashboard statistics
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        const [total, open, inProgress, resolved] = await Promise.all([
            Report.countDocuments(),
            Report.countDocuments({ status: 'open' }),
            Report.countDocuments({ status: 'in progress' }),
            Report.countDocuments({ status: 'resolved' })
        ]);

        res.status(200).json({
            total,
            open,
            inProgress,
            resolved
        });
    } catch (err) {
        console.error('❌ Error fetching stats:', err);
        res.status(500).json({ message: 'Failed to load statistics' });
    }
});

// 🔄 Update report status
router.patch('/reports/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        res.status(200).json({ message: 'Status updated successfully', report });
    } catch (err) {
        console.error('❌ Error updating report status:', err);
        res.status(500).json({ message: 'Failed to update status' });
    }
});

// 📍 Get reports by location (within radius)
router.get('/reports/nearby', verifyAdmin, async (req, res) => {
    try {
        const { longitude, latitude, radius = 5000 } = req.query; // radius in meters
        
        const reports = await Report.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(radius)
                }
            }
        }).populate('createdBy', 'name email');

        res.status(200).json(reports);
    } catch (err) {
        console.error('❌ Error fetching nearby reports:', err);
        res.status(500).json({ message: 'Failed to load nearby reports' });
    }
});

export default router;