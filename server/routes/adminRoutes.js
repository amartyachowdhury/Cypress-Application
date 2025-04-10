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
router.get('/reports', adminAuth, getAllReports);
router.patch('/reports/:reportId/status', adminAuth, updateReportStatus);

export default router;