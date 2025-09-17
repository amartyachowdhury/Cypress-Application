import express from 'express';
import {
  registerUser,
  loginUser,
  verifyToken,
} from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { registerSchema, loginSchema } from '../validations/index.js';

const router = express.Router();

// Auth routes
router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.get('/verify', auth, verifyToken);

export default router;
