import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import {
  loginAdmin,
  verifyAdmin,
  getAllReports,
  updateReportStatus,
} from '../controllers/adminController.js';

const router = express.Router();

// Admin routes
router.post('/login', loginAdmin);
router.get('/verify', adminAuth, verifyAdmin);
router.get('/reports', adminAuth, getAllReports);
router.patch('/reports/:reportId/status', adminAuth, updateReportStatus);

export default router;
