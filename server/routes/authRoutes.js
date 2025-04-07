import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

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

        // ⏳ Email sending will go here later

        res.status(201).json({ message: 'User registered. Verification code sent to email.' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

export default router;