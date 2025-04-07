import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express(); // ✅ This must come BEFORE any app.use() or app.post()

// Middleware
app.use(cors());
app.use(express.json());

// 🔍 Add test route BELOW app is declared
app.post('/test', (req, res) => {
    res.status(200).json({ message: 'Test route working ✅' });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Root
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Cypress backend is running...' });
});

// DB + Server
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("❌ MongoDB connection failed:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));