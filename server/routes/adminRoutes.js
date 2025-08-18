import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import adminAuth from '../middleware/adminAuth.js';
import Report from '../models/Report.js';
import Admin from '../models/Admin.js';

dotenv.config();

const router = express.Router();

// Generate JWT Token
const generateToken = (admin) => {
    return jwt.sign(
        { _id: admin._id.toString() },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '24h' }
    );
};

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const token = generateToken(admin);
        res.json({
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                name: admin.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Verify Admin Token
router.get('/verify', adminAuth, async (req, res) => {
    try {
        res.json({ 
            admin: {
                id: req.admin._id,
                email: req.admin.email,
                name: req.admin.name
            }
        });
    } catch (error) {
        console.error('Error verifying admin:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
});

// 📊 Get all reports with filtering and pagination
router.get('/reports', adminAuth, async (req, res) => {
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
router.get('/stats', adminAuth, async (req, res) => {
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
router.patch('/reports/:id/status', adminAuth, async (req, res) => {
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
router.get('/reports/nearby', adminAuth, async (req, res) => {
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