import { ReportService } from '../services/reportService.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/index.js';

export const createReport = async (req, res) => {
    try {
        const report = await ReportService.createReport(req.body, req.user._id);
        
        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            report
        });
    } catch (error) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserReports = async (req, res) => {
    try {
        const reports = await ReportService.getUserReports(req.user._id);
        
        res.json({
            success: true,
            reports
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

export const getReportById = async (req, res) => {
    try {
        const report = await ReportService.getReportById(req.params.id);
        
        res.json({
            success: true,
            report
        });
    } catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteReport = async (req, res) => {
    try {
        await ReportService.deleteReport(req.params.id, req.user._id);
        
        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            message: error.message
        });
    }
};
