import React from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ProgressTracker = ({ report }) => {
    const getStatusInfo = (status) => {
        switch (status) {
            case 'open':
                return {
                    title: 'Report Submitted',
                    description: 'Your report has been received and is under review',
                    icon: ClockIcon,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    completed: true
                };
            case 'in progress':
                return {
                    title: 'Work in Progress',
                    description: 'Our team is actively working on resolving this issue',
                    icon: ExclamationTriangleIcon,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    completed: true
                };
            case 'resolved':
                return {
                    title: 'Issue Resolved',
                    description: 'The reported issue has been successfully resolved',
                    icon: CheckCircleIcon,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    completed: true
                };
            default:
                return {
                    title: 'Pending Review',
                    description: 'Your report is waiting to be reviewed',
                    icon: ClockIcon,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    completed: false
                };
        }
    };

    const getEstimatedTime = (category, severity) => {
        const baseTimes = {
            'infrastructure': {
                'low': '2-3 days',
                'medium': '1-2 weeks',
                'high': '3-5 days'
            },
            'safety': {
                'low': '1-2 days',
                'medium': '3-5 days',
                'high': '24-48 hours'
            },
            'environmental': {
                'low': '1-2 weeks',
                'medium': '2-3 weeks',
                'high': '1 week'
            },
            'other': {
                'low': '3-5 days',
                'medium': '1-2 weeks',
                'high': '1 week'
            }
        };

        return baseTimes[category]?.[severity] || '1-2 weeks';
    };

    const getProgressPercentage = (status) => {
        switch (status) {
            case 'open':
                return 25;
            case 'in progress':
                return 75;
            case 'resolved':
                return 100;
            default:
                return 0;
        }
    };

    const statusInfo = getStatusInfo(report.status);
    const estimatedTime = getEstimatedTime(report.category, report.severity);
    const progressPercentage = getProgressPercentage(report.status);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Report Progress
                </h3>
                <p className="text-sm text-gray-600">
                    Track the status of your report and estimated resolution time
                </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        Progress
                    </span>
                    <span className="text-sm text-gray-500">
                        {progressPercentage}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Current Status */}
            <div className={`mb-6 p-4 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 ${statusInfo.color}`}>
                        <statusInfo.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h4 className={`text-sm font-semibold ${statusInfo.color}`}>
                            {statusInfo.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                            {statusInfo.description}
                        </p>
                        {report.updated_at && (
                            <p className="text-xs text-gray-500 mt-2">
                                Last updated: {new Date(report.updated_at).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Estimated Resolution Time */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <ClockIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-blue-900">
                            Estimated Resolution Time
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">
                            {estimatedTime} based on {report.category} category and {report.severity} severity
                        </p>
                    </div>
                </div>
            </div>

            {/* Admin Notes */}
            {report.admin_notes && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="text-sm font-semibold text-yellow-900 mb-2">
                        Admin Notes
                    </h4>
                    <p className="text-sm text-yellow-800">
                        {report.admin_notes}
                    </p>
                </div>
            )}

            {/* Next Steps */}
            <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    What happens next?
                </h4>
                <div className="space-y-2">
                    {report.status === 'open' && (
                        <>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Your report will be reviewed within 24-48 hours</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>You'll receive updates on the status of your report</span>
                            </div>
                        </>
                    )}
                    {report.status === 'in progress' && (
                        <>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span>Our team is actively working on resolving this issue</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span>You'll be notified when the work is completed</span>
                            </div>
                        </>
                    )}
                    {report.status === 'resolved' && (
                        <>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>The issue has been successfully resolved</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Thank you for helping improve our community!</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;
