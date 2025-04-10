import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; // ✅ Admin routes added

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug route
app.post('/test', (req, res) => {
    console.log('🔥 /test route hit');
    console.log('Request body:', req.body);
    res.status(200).json({ message: 'Test route success' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes); // ✅ Admin route

// Health check
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Cypress backend is running...' });
});

// 404 fallback
app.use((req, res) => {
    res.status(404).json({ message: `No route for ${req.method} ${req.url}` });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ Connected to MongoDB Atlas");
}).catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});