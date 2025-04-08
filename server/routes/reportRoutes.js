import express from 'express';
import Report from '../models/Report.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// 📌 Submit a report
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

// 📍 Get reports submitted by this user
router.get('/mine', verifyToken, async (req, res) => {
    try {
        const reports = await Report.find({ createdBy: req.userId });
        res.status(200).json(reports);
    } catch (err) {
        console.error('❌ Error fetching user reports:', err);
        res.status(500).json({ message: 'Failed to load your reports' });
    }
});

// 🟡 Get reports by status
router.get('/status/:status', verifyToken, async (req, res) => {
    try {
        const reports = await Report.find({ status: req.params.status });
        res.status(200).json(reports);
    } catch (err) {
        console.error('❌ Error fetching reports by status:', err);
        res.status(500).json({ message: 'Failed to load reports by status' });
    }
});

// ✏️ Update a report
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updated = await Report.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.userId },
            req.body,
            { new: true }
        );
        if (!updated) return res.status(403).json({ message: 'Not authorized to update this report' });
        res.status(200).json({ message: 'Report updated', report: updated });
    } catch (err) {
        console.error('❌ Error updating report:', err);
        res.status(500).json({ message: 'Failed to update report' });
    }
});

// ❌ Delete a report
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const deleted = await Report.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
        if (!deleted) return res.status(403).json({ message: 'Not authorized to delete this report' });
        res.status(200).json({ message: 'Report deleted' });
    } catch (err) {
        console.error('❌ Error deleting report:', err);
        res.status(500).json({ message: 'Failed to delete report' });
    }
});

export default router;