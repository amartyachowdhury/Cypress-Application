import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Hardcoded admin credentials (for MVP)
// In production, replace with a proper Admin model stored in MongoDB
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cypressapp.io';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public (for now)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password' });
    }

    // Check email match
    if (email !== ADMIN_EMAIL) {
        return res.status(403).json({ message: 'Unauthorized: Invalid admin credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isMatch) {
        return res.status(403).json({ message: 'Unauthorized: Invalid admin credentials' });
    }

    // Create JWT
    const token = jwt.sign({ role: 'admin', email }, process.env.JWT_SECRET, {
        expiresIn: '2h',
    });

    res.status(200).json({ message: 'Admin login successful', token });
});

export default router;