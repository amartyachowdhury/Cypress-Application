import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    console.log('📨 POST /register called'); // Debug log

    const { email, username, password } = req.body;

    // Check for missing fields
    if (!email || !username || !password) {
        console.warn('⚠️ Missing registration fields:', req.body);
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            console.warn('⚠️ User already exists:', email, username);
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const newUser = new User({
            email,
            username,
            password: hashedPassword,
            verificationCode,
            verificationExpiry
        });

        await newUser.save();

        console.log('✅ User registered:', username);
        res.status(201).json({ message: 'User registered. Verification code sent to email.' });
    } catch (error) {
        console.error('❌ Register error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

export default router;