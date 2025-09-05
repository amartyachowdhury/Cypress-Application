import express from 'express';
import { createReport, getUserReports, getReportById, deleteReport } from '../controllers/reportController.js';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { reportSchema } from '../validations/index.js';

const router = express.Router();

// Report routes
router.post('/', auth, validateRequest(reportSchema), createReport);
router.get('/mine', auth, getUserReports);
router.get('/:id', auth, getReportById);
router.delete('/:id', auth, deleteReport);

export default router;