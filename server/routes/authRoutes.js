import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import db from '../config/supabase.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });

        if (authError) {
            console.error('Auth error:', authError);
            return res.status(400).json({ message: authError.message });
        }

        if (authData.user) {
            // Create user profile in our users table
            try {
                await db.createUser({
                    id: authData.user.id,
                    email: authData.user.email,
                    name: name
                });
            } catch (profileError) {
                console.error('Profile creation error:', profileError);
                // If profile creation fails, we should clean up the auth user
                // For now, we'll just log the error
            }

            res.status(201).json({
                message: 'User registered successfully! Please check your email to verify your account.',
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                    name: name
                }
            });
        } else {
            res.status(400).json({ message: 'Registration failed' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login error:', error);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (data.user) {
            // Get user profile
            const userProfile = await db.getUserById(data.user.id);
            
            // Generate JWT token for our API
            const token = jwt.sign(
                { userId: data.user.id },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful!',
                token,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    name: userProfile?.name || data.user.user_metadata?.name
                }
            });
        } else {
            res.status(401).json({ message: 'Login failed' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Verify token middleware
export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await db.getUserById(req.userId);
        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, email } = req.body;
        const updatedUser = await db.updateUser(req.userId, { name, email });
        res.json(updatedUser);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error during logout' });
    }
});

export default router;