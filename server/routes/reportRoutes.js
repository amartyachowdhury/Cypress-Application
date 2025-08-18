import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/supabase.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

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
        res.status(201).json({ message: 'Report submitted successfully!', report });
    } catch (err) {
        console.error('❌ Error submitting report:', err);
        res.status(500).json({ message: 'Error submitting report' });
    }
});

// 📄 View reports submitted by the authenticated user
router.get('/mine', verifyToken, async (req, res) => {
    try {
        const { reports } = await db.getReports({ createdBy: req.userId });
        res.status(200).json(reports);
    } catch (err) {
        console.error('❌ Error fetching user reports:', err);
        res.status(500).json({ message: 'Failed to load your reports' });
    }
});

// 📊 Get all reports (for admin)
router.get('/all', verifyToken, async (req, res) => {
    try {
        const { status, category, severity, page = 1, limit = 10 } = req.query;
        
        const filters = {};
        if (status && status !== 'all') filters.status = status;
        if (category && category !== 'all') filters.category = category;
        if (severity && severity !== 'all') filters.severity = severity;
        if (page && limit) {
            filters.page = parseInt(page);
            filters.limit = parseInt(limit);
        }

        const { reports, count } = await db.getReports(filters);
        
        res.status(200).json({
            reports,
            totalPages: Math.ceil(count / (limit || 10)),
            currentPage: parseInt(page),
            total: count
        });
    } catch (err) {
        console.error('❌ Error fetching all reports:', err);
        res.status(500).json({ message: 'Failed to load reports' });
    }
});

// 📊 Filter reports by status
router.get('/status/:status', verifyToken, async (req, res) => {
    try {
        const { reports } = await db.getReports({ status: req.params.status });
        res.status(200).json(reports);
    } catch (err) {
        console.error('❌ Error fetching reports by status:', err);
        res.status(500).json({ message: 'Failed to load reports by status' });
    }
});

// 📍 Get reports by location (within radius)
router.get('/nearby', verifyToken, async (req, res) => {
    try {
        const { longitude, latitude, radius = 5000 } = req.query; // radius in meters
        
        const reports = await db.getNearbyReports(
            parseFloat(latitude), 
            parseFloat(longitude), 
            parseInt(radius)
        );

        res.status(200).json(reports);
    } catch (err) {
        console.error('❌ Error fetching nearby reports:', err);
        res.status(500).json({ message: 'Failed to load nearby reports' });
    }
});

// ✏️ Edit a report
router.put('/:id', verifyToken, async (req, res) => {
    try {
        // First check if the report belongs to the user
        const existingReport = await db.getReportById(req.params.id);
        if (!existingReport) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        if (existingReport.created_by !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this report' });
        }

        const updatedReport = await db.updateReport(req.params.id, req.body);
        res.status(200).json({ message: 'Report updated', report: updatedReport });
    } catch (err) {
        console.error('❌ Error updating report:', err);
        res.status(500).json({ message: 'Failed to update report' });
    }
});

// ❌ Delete a report
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        // First check if the report belongs to the user
        const existingReport = await db.getReportById(req.params.id);
        if (!existingReport) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        if (existingReport.created_by !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this report' });
        }

        await db.deleteReport(req.params.id);
        res.status(200).json({ message: 'Report deleted' });
    } catch (err) {
        console.error('❌ Error deleting report:', err);
        res.status(500).json({ message: 'Failed to delete report' });
    }
});

export default router;