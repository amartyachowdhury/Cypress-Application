import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/supabase.js';
import verifyToken from '../middleware/verifyToken.js';
import { emailNotifications } from '../utils/emailService.js';

const router = express.Router();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Max 5 files
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Helper function to send notifications
const sendNotification = (req, userId, notification) => {
    if (req.app.locals.sendNotification) {
        req.app.locals.sendNotification(userId, notification);
    }
};

// ✅ Upload images
router.post('/upload-images', verifyToken, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        const imageUrls = req.files.map(file => {
            // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
            return `http://localhost:5050/uploads/${file.filename}`;
        });

        res.status(200).json({ 
            message: 'Images uploaded successfully', 
            imageUrls 
        });
    } catch (err) {
        console.error('❌ Error uploading images:', err);
        res.status(500).json({ message: 'Error uploading images' });
    }
});

// ✅ Submit a report
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, description, severity, category, address, images, location } = req.body;
        
        // Convert location coordinates to PostGIS format
        const locationData = location && location.coordinates ? 
            `POINT(${location.coordinates[0]} ${location.coordinates[1]})` : null;

        const reportData = {
            title,
            description,
            severity,
            category,
            address,
            images: images || [],
            location: locationData,
            created_by: req.userId
        };

        const report = await db.createReport(reportData);

        // Get user info for email notification
        const user = await db.getUserById(req.userId);

        // Send real-time notification
        sendNotification(req, req.userId, {
            type: "success",
            title: "Report Submitted Successfully",
            message: `Your report "${title}" has been submitted and is now under review.`,
            timestamp: new Date().toISOString(),
            reportId: report.id
        });

        // Send email notification
        if (user && user.email) {
            try {
                await emailNotifications.reportSubmitted(
                    user.email, 
                    user.name || 'Community Member', 
                    title
                );
            } catch (emailError) {
                console.error('Email notification failed:', emailError);
                // Don't fail the request if email fails
            }
        }

        res.status(201).json({ message: 'Report submitted successfully!', report });
    } catch (err) {
        console.error('❌ Error submitting report:', err);
        res.status(500).json({ message: 'Error submitting report' });
    }
});

// ✅ Get user's reports
router.get('/mine', verifyToken, async (req, res) => {
    try {
        const reports = await db.getReportsByUser(req.userId);
        res.status(200).json(reports);
    } catch (err) {
        console.error('❌ Error fetching user reports:', err);
        res.status(500).json({ message: 'Error fetching reports' });
    }
});

// ✅ Get all reports (for admin)
router.get('/all', verifyToken, async (req, res) => {
    try {
        const reports = await db.getAllReports();
        res.status(200).json(reports);
    } catch (err) {
        console.error('❌ Error fetching all reports:', err);
        res.status(500).json({ message: 'Error fetching reports' });
    }
});

// ✅ Get a specific report
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const report = await db.getReportById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (err) {
        console.error('❌ Error fetching report:', err);
        res.status(500).json({ message: 'Error fetching report' });
    }
});

// ✅ Update a report
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const existingReport = await db.getReportById(req.params.id);
        if (!existingReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Check if user owns the report
        if (existingReport.created_by !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this report' });
        }

        const updatedReport = await db.updateReport(req.params.id, req.body);

        // Send notification if status changed
        if (req.body.status && req.body.status !== existingReport.status) {
            const statusMessages = {
                'open': 'Your report has been opened for review',
                'in progress': 'Work has begun on your report',
                'resolved': 'Your report has been resolved!'
            };

            sendNotification(req, req.userId, {
                type: "info",
                title: "Report Status Updated",
                message: statusMessages[req.body.status] || `Your report status has been updated to ${req.body.status}`,
                timestamp: new Date().toISOString(),
                reportId: req.params.id,
                newStatus: req.body.status
            });

            // Send email notification for status changes
            const user = await db.getUserById(req.userId);
            if (user && user.email) {
                try {
                    await emailNotifications.statusUpdated(
                        user.email,
                        user.name || 'Community Member',
                        existingReport.title,
                        req.body.status,
                        req.body.admin_notes
                    );
                } catch (emailError) {
                    console.error('Email notification failed:', emailError);
                }
            }
        }

        res.status(200).json({ message: 'Report updated', report: updatedReport });
    } catch (err) {
        console.error('❌ Error updating report:', err);
        res.status(500).json({ message: 'Error updating report' });
    }
});

// ✅ Delete a report
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const existingReport = await db.getReportById(req.params.id);
        if (!existingReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Check if user owns the report
        if (existingReport.created_by !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this report' });
        }

        await db.deleteReport(req.params.id);

        // Send notification to user
        sendNotification(req, req.userId, {
            type: "warning",
            title: "Report Deleted",
            message: `Your report "${existingReport.title}" has been deleted.`,
            timestamp: new Date().toISOString(),
            reportId: req.params.id
        });

        res.status(200).json({ message: 'Report deleted' });
    } catch (err) {
        console.error('❌ Error deleting report:', err);
        res.status(500).json({ message: 'Error deleting report' });
    }
});

// Admin: Update report status
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const reportId = req.params.id;

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Admin access required" });
        }

        const originalReport = await db.getReportById(reportId);
        if (!originalReport) {
            return res.status(404).json({ error: "Report not found" });
        }

        const updatedReport = await db.updateReport(reportId, {
            status,
            admin_notes: adminNotes,
            updated_at: new Date().toISOString()
        });

        // Get user info for email notification
        const user = await db.getUserById(originalReport.created_by);

        // Send real-time notification to report owner
        const statusMessages = {
            'open': 'Your report has been opened for review',
            'in progress': 'Work has begun on your report',
            'resolved': 'Your report has been resolved!'
        };

        sendNotification(req, originalReport.created_by, {
            type: "info",
            title: "Report Status Updated",
            message: statusMessages[status] || `Your report status has been updated to ${status}`,
            timestamp: new Date().toISOString(),
            reportId: reportId,
            newStatus: status,
            adminNotes: adminNotes
        });

        // Send email notification
        if (user && user.email) {
            try {
                if (status === 'resolved') {
                    await emailNotifications.reportResolved(
                        user.email,
                        user.name || 'Community Member',
                        originalReport.title
                    );
                } else {
                    await emailNotifications.statusUpdated(
                        user.email,
                        user.name || 'Community Member',
                        originalReport.title,
                        status,
                        adminNotes
                    );
                }
            } catch (emailError) {
                console.error('Email notification failed:', emailError);
            }
        }

        res.status(200).json(updatedReport);
    } catch (error) {
        console.error("Error updating report status:", error);
        res.status(500).json({ error: "Failed to update report status" });
    }
});

export default router;