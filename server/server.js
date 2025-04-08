import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js'; // 🆕 added this line

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🔍 Debug Test Route
app.post('/test', (req, res) => {
    console.log('🔥 /test route hit');
    console.log('Request body:', req.body);
    res.status(200).json({ message: 'Test route success' });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// 🆕 Report Routes
app.use('/api/reports', reportRoutes); // 🆕 mount report routes here

// Root route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Cypress backend is running...' });
});

// Fallback for unhandled routes
app.use((req, res) => {
    res.status(404).json({ message: `No route for ${req.method} ${req.url}` });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("❌ MongoDB connection failed:", err));

// Start the server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});