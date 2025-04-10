import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const navigate = useNavigate();

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            console.log('Fetching reports...'); // Debug log
            
            const response = await axios.get('http://localhost:5050/api/admin/reports', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Reports response:', response.data); // Debug log
            
            setReports(response.data);
        } catch (err) {
            console.error('Error fetching reports:', err); // Debug log
            
            if (err.response?.status === 401) {
                localStorage.removeItem('adminToken');
                navigate('/admin/login');
            } else {
                setError(err.response?.data?.message || 'Failed to load reports.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (reportId, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.patch(
                `http://localhost:5050/api/admin/reports/${reportId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            fetchReports(); // Refresh the list
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status. Please try again.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const filteredReports = selectedStatus === 'all' 
        ? reports 
        : reports.filter(report => report.status === selectedStatus);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading reports...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="all">All Reports</option>
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-md transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                        <button
                            onClick={fetchReports}
                            className="ml-4 text-sm underline hover:no-underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg shadow">
                        <p className="text-gray-600">No reports found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Severity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredReports.map((report) => (
                                    <tr key={report._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {report.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">
                                                {report.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                report.severity === 'high' ? 'bg-red-100 text-red-800' :
                                                report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {report.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                report.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {report.location?.coordinates?.join(', ') || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <select
                                                value={report.status}
                                                onChange={(e) => handleStatusUpdate(report._id, e.target.value)}
                                                className="px-2 py-1 border rounded-md text-sm"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;