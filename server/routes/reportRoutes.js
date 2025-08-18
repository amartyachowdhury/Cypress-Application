import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Report from '../models/Report.js';
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
        const report = new Report({ ...req.body, createdBy: req.userId });
        await report.save();
        res.status(201).json({ message: 'Report submitted successfully!', report });
    } catch (err) {
        console.error('❌ Error submitting report:', err);
        res.status(500).json({ message: 'Error submitting report' });
    }
});

// 📄 View reports submitted by the authenticated user
router.get('/mine', verifyToken, async (req, res) => {
    try {
        const reports = await Report.find({ createdBy: req.userId })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
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
        
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (category && category !== 'all') query.category = category;
        if (severity && severity !== 'all') query.severity = severity;

        const reports = await Report.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Report.countDocuments(query);

        res.status(200).json({
            reports,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (err) {
        console.error('❌ Error fetching all reports:', err);
        res.status(500).json({ message: 'Failed to load reports' });
    }
});

// 📊 Filter reports by status
router.get('/status/:status', verifyToken, async (req, res) => {
    try {
        const reports = await Report.find({ status: req.params.status })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
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
        
        const reports = await Report.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(radius)
                }
            }
        }).populate('createdBy', 'name email');

        res.status(200).json(reports);
    } catch (err) {
        console.error('❌ Error fetching nearby reports:', err);
        res.status(500).json({ message: 'Failed to load nearby reports' });
    }
});

// ✏️ Edit a report
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updatedReport = await Report.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.userId },
            req.body,
            { new: true }
        );
        if (!updatedReport) {
            return res.status(403).json({ message: 'Not authorized to update this report' });
        }
        res.status(200).json({ message: 'Report updated', report: updatedReport });
    } catch (err) {
        console.error('❌ Error updating report:', err);
        res.status(500).json({ message: 'Failed to update report' });
    }
});

// ❌ Delete a report
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const deletedReport = await Report.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.userId,
        });
        if (!deletedReport) {
            return res.status(403).json({ message: 'Not authorized to delete this report' });
        }
        res.status(200).json({ message: 'Report deleted' });
    } catch (err) {
        console.error('❌ Error deleting report:', err);
        res.status(500).json({ message: 'Failed to delete report' });
    }
});

export default router;