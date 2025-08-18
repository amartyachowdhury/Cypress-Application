import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import adminAuth from '../middleware/adminAuth.js';
import db from '../config/supabase.js';

dotenv.config();

const router = express.Router();

// Generate JWT Token
const generateToken = (admin) => {
    return jwt.sign(
        { _id: admin.id.toString() },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '24h' }
    );
};

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        const admin = await db.getAdminByEmail(email);
        if (!admin) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const token = generateToken(admin);
        res.json({
            token,
            admin: {
                id: admin.id,
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
                id: req.admin.id,
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
        
        const filters = {};
        if (status && status !== 'all') filters.status = status;
        if (category && category !== 'all') filters.category = category;
        if (severity && severity !== 'all') filters.severity = severity;
        if (page && limit) {
            filters.page = parseInt(page);
            filters.limit = parseInt(limit);
        }

        const { reports, count } = await db.getReports(filters);
        
        res.status(200).json({
            reports,
            totalPages: Math.ceil(count / (limit || 10)),
            currentPage: parseInt(page),
            total: count
        });
    } catch (err) {
        console.error('❌ Error fetching reports:', err);
        res.status(500).json({ message: 'Failed to load reports' });
    }
});

// 📈 Get dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const stats = await db.getStats();
        res.status(200).json(stats);
    } catch (err) {
        console.error('❌ Error fetching stats:', err);
        res.status(500).json({ message: 'Failed to load statistics' });
    }
});

// 🔄 Update report status
router.patch('/reports/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const report = await db.updateReport(req.params.id, { status });
        
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
        
        const reports = await db.getNearbyReports(
            parseFloat(latitude), 
            parseFloat(longitude), 
            parseInt(radius)
        );

        res.status(200).json(reports);
    } catch (err) {
        console.error('❌ Error fetching nearby reports:', err);
        res.status(500).json({ message: 'Failed to load nearby reports' });
    }
});

export default router;