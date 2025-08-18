import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [editingReportId, setEditingReportId] = useState(null);
    const [editedReport, setEditedReport] = useState({
        title: "",
        description: "",
        severity: "",
        status: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    const fetchReports = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate('/login');
                return;
            }
            
            const res = await axios.get("http://localhost:5050/api/reports/mine", {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Reports data:", res.data); // Debug log
            
            if (Array.isArray(res.data)) {
                setReports(res.data);
            } else if (Array.isArray(res.data.reports)) {
                setReports(res.data.reports);
            } else {
                throw new Error("Invalid data format received from server");
            }
        } catch (err) {
            console.error("Error fetching reports:", err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError(err.message || "Failed to load reports. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (report) => {
        setEditingReportId(report.id);
        setEditedReport({
            title: report.title,
            description: report.description,
            severity: report.severity,
            status: report.status
        });
    };

    const handleDelete = async (reportId) => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5050/api/reports/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(reports.filter((r) => r.id !== reportId));
        } catch (err) {
            console.error("Error deleting report:", err);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedReport((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:5050/api/reports/${editingReportId}`,
                editedReport,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setEditingReportId(null);
            setEditedReport({
                title: "",
                description: "",
                severity: "",
                status: ""
            });
            fetchReports();
        } catch (err) {
            console.error("Error updating report:", err);
        }
    };

    const handleCancelEdit = () => {
        setEditingReportId(null);
        setEditedReport({
            title: "",
            description: "",
            severity: "",
            status: ""
        });
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const getStatusBadge = (status) => {
        const colors = {
            'open': 'bg-gray-100 text-gray-800',
            'in progress': 'bg-blue-100 text-blue-800',
            'resolved': 'bg-green-100 text-green-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.open}`}>
                {status}
            </span>
        );
    };

    const getSeverityBadge = (severity) => {
        const colors = {
            'low': 'bg-green-100 text-green-800',
            'medium': 'bg-yellow-100 text-yellow-800',
            'high': 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[severity] || colors.low}`}>
                {severity}
            </span>
        );
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'infrastructure': '🏗️',
            'safety': '🛡️',
            'environment': '🌱',
            'noise': '🔊',
            'other': '📋'
        };
        return icons[category] || '📋';
    };

    const filteredReports = reports.filter(report => {
        const statusMatch = filterStatus === "all" || report.status === filterStatus;
        const categoryMatch = filterCategory === "all" || report.category === filterCategory;
        return statusMatch && categoryMatch;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            My Reports 📋
                        </h1>
                        <p className="text-gray-600">
                            Manage and track your community reports
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/submit')}
                        className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                    >
                        <span>📝</span>
                        <span>Submit New Report</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Reports</p>
                            <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
                        </div>
                        <div className="text-3xl">📊</div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Open</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {reports.filter(r => r.status === 'open').length}
                            </p>
                        </div>
                        <div className="text-3xl">📭</div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">In Progress</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {reports.filter(r => r.status === 'in progress').length}
                            </p>
                        </div>
                        <div className="text-3xl">🔄</div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Resolved</p>
                            <p className="text-2xl font-bold text-green-600">
                                {reports.filter(r => r.status === 'resolved').length}
                            </p>
                        </div>
                        <div className="text-3xl">✅</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
                            Your Reports ({filteredReports.length})
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center space-x-2"
                            >
                                <span>🔍</span>
                                <span>Filters</span>
                            </button>
                        </div>
                    </div>
                </div>

                {showFilters && (
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="open">Open</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="infrastructure">Infrastructure</option>
                                    <option value="safety">Safety</option>
                                    <option value="environment">Environment</option>
                                    <option value="noise">Noise</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reports List */}
                <div className="divide-y divide-gray-100">
                    {filteredReports.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-4">📭</div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No reports found</h3>
                            <p className="text-gray-600 mb-4">
                                {reports.length === 0 
                                    ? "You haven't submitted any reports yet." 
                                    : "Try adjusting your filters."
                                }
                            </p>
                            <button
                                onClick={() => navigate('/dashboard/submit')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Submit Your First Report
                            </button>
                        </div>
                    ) : (
                        filteredReports.map((report) => (
                            <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                                {editingReportId === report.id ? (
                                    /* Edit Mode */
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={editedReport.title}
                                                    onChange={handleEditChange}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                                <select
                                                    name="status"
                                                    value={editedReport.status}
                                                    onChange={handleEditChange}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="open">Open</option>
                                                    <option value="in progress">In Progress</option>
                                                    <option value="resolved">Resolved</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                            <textarea
                                                name="description"
                                                value={editedReport.description}
                                                onChange={handleEditChange}
                                                rows={3}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleUpdate}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* View Mode */
                                    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">{getCategoryIcon(report.category)}</span>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            {getStatusBadge(report.status)}
                                                            {getSeverityBadge(report.severity)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(report)}
                                                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(report.id)}
                                                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 mb-3">{report.description}</p>
                                            <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-500">
                                                <span>📂 {report.category}</span>
                                                {report.address && <span>📍 {report.address}</span>}
                                                <span>📅 {new Date(report.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        {report.images && report.images.length > 0 && (
                                            <div className="md:w-24 md:flex-shrink-0">
                                                <img 
                                                    src={report.images[0]} 
                                                    alt="Report" 
                                                    className="w-full h-20 md:h-24 object-cover rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                    {error}
                </div>
            )}
        </div>
    );
};

export default MyReports;