import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test Supabase connection
app.get('/test-db', async (req, res) => {
    try {
        const { db } = await import('./config/supabase.js');
        const stats = await db.getStats();
        res.status(200).json({ 
            message: 'Supabase connection successful!', 
            stats 
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ 
            message: 'Database connection failed', 
            error: error.message 
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Cypress backend is running with Supabase...' });
});

// 404 fallback
app.use((req, res) => {
    res.status(404).json({ message: `No route for ${req.method} ${req.url}` });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Using Supabase as database`);
});