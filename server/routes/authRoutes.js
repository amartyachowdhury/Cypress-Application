import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js'; // ✅ new import

const router = express.Router();

// 🔐 Register Route
router.post('/register', async (req, res) => {
    console.log('📨 POST /register called');

    const { email, username, password } = req.body;

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

        // ✅ Send the verification email
        await sendEmail(
            email,
            'Cypress Verification Code',
            `Hi ${username},\n\nYour verification code is: ${verificationCode}\nThis code will expire in 10 minutes.`
        );

        console.log('✅ User registered and verification email sent:', username);
        res.status(201).json({ message: 'User registered. Verification code sent to email.' });
    } catch (error) {
        console.error('❌ Register error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
    console.log('🧠 POST /login called');

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        console.log(`✅ Login successful for ${user.username}`);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

export default router;