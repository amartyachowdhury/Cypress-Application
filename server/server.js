import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { fileURLToPath } from 'url';

// Import configurations
import connectDB from './config/database.js';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables first
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:3002",
        methods: ["GET", "POST"]
    }
});

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle user authentication
    socket.on("authenticate", (userId) => {
        connectedUsers.set(userId, socket.id);
        console.log(`User ${userId} authenticated with socket ${socket.id}`);
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        // Remove user from connected users
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});

// Notification helper function
const sendNotification = (userId, notification) => {
    const socketId = connectedUsers.get(userId);
    if (socketId) {
        io.to(socketId).emit("notification", notification);
        console.log(`Notification sent to user ${userId}:`, notification);
    }
};

// Make notification function available to routes
app.locals.sendNotification = sendNotification;

// Routes
app.use("/api/auth", (await import("./routes/authRoutes.js")).default);
app.use("/api/reports", (await import("./routes/reportRoutes.js")).default);
app.use("/api/admin", (await import("./routes/adminRoutes.js")).default);

// Test database connection
app.get("/test-db", async (req, res) => {
    try {
        const { db } = await import("./config/supabase.js");
        await db.getStats();
        res.json({ message: "Database connection successful!" });
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({ error: "Database connection failed" });
    }
});

// Test notification endpoint
app.post("/api/test-notification", (req, res) => {
    const { userId, message } = req.body;
    if (userId && message) {
        sendNotification(userId, {
            type: "info",
            title: "Test Notification",
            message: message,
            timestamp: new Date().toISOString()
        });
        res.json({ success: true, message: "Test notification sent" });
    } else {
        res.status(400).json({ error: "userId and message are required" });
    }
});

// Connect to database
connectDB();

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = config.port;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready for real-time notifications`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
});