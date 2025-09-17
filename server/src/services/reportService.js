import Report from '../models/Report.js';
// import { REPORT_STATUS } from '../constants/index.js';

export class ReportService {
  static async createReport(reportData, userId) {
    const report = new Report({
      ...reportData,
      createdBy: userId,
    });

    await report.save();
    return report.populate('createdBy', 'name email');
  }

  static async getUserReports(userId) {
    return Report.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
  }

  static async getAllReports() {
    return Report.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
  }

  static async updateReportStatus(reportId, status, adminId) {
    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        updatedBy: adminId,
        updatedAt: Date.now(),
      },
      { new: true },
    ).populate('createdBy', 'name email');

    if (!report) {
      throw new Error('Report not found');
    }

    return report;
  }

  static async deleteReport(reportId, userId) {
    const report = await Report.findOneAndDelete({
      _id: reportId,
      createdBy: userId,
    });

    if (!report) {
      throw new Error('Report not found or unauthorized');
    }

    return report;
  }

  static async getReportById(reportId) {
    const report = await Report.findById(reportId).populate(
      'createdBy',
      'name email',
    );

    if (!report) {
      throw new Error('Report not found');
    }

    return report;
  }
}
