import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Report from '../models/Report.js';
import { config } from '../config/index.js';

// Generate JWT Token
const generateToken = admin => {
  return jwt.sign({ _id: admin._id.toString() }, config.jwtSecret, {
    expiresIn: '24h',
  });
};

// Admin Login
export const loginAdmin = async(req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('Admin not found');
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = generateToken(admin);
    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get All Reports
export const getAllReports = async(req, res) => {
  try {
    console.log('Fetching all reports...');

    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean();

    console.log(`Found ${reports.length} reports`);

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

// Update Report Status
export const updateReportStatus = async(req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    console.log(`Updating report ${reportId} to status: ${status}`);

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        updatedBy: req.admin._id,
        updatedAt: Date.now(),
      },
      { new: true },
    ).populate('createdBy', 'name email');

    if (!report) {
      console.log(`Report ${reportId} not found`);
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ message: 'Error updating report status' });
  }
};

// Verify Admin Token
export const verifyAdmin = async(req, res) => {
  try {
    res.json({
      admin: {
        id: req.admin._id,
        email: req.admin.email,
        name: req.admin.name,
      },
    });
  } catch (error) {
    console.error('Error verifying admin:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};
