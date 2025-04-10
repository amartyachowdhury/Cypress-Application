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
        setEditingReportId(report._id);
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
            setReports(reports.filter((r) => r._id !== reportId));
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

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Reports</h2>
                <button
                    onClick={() => navigate('/dashboard/submit')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Submit New Report
                </button>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-600">Loading reports...</div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {!isLoading && !error && reports.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-medium text-gray-600 mb-2">No Reports Yet</h3>
                    <p className="text-gray-500 mb-4">You haven't submitted any reports yet.</p>
                    <button
                        onClick={() => navigate('/dashboard/submit')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Submit Your First Report
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {reports.map((report) => (
                    <div key={report._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        {editingReportId === report._id ? (
                            <div className="space-y-4">
                                <input
                                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    type="text"
                                    name="title"
                                    value={editedReport.title}
                                    onChange={handleEditChange}
                                    placeholder="Report Title"
                                />
                                <textarea
                                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    name="description"
                                    value={editedReport.description}
                                    onChange={handleEditChange}
                                    rows="3"
                                    placeholder="Report Description"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        name="severity"
                                        value={editedReport.severity}
                                        onChange={handleEditChange}
                                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Severity</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    <select
                                        name="status"
                                        value={editedReport.status}
                                        onChange={handleEditChange}
                                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="open">Open</option>
                                        <option value="in progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setEditingReportId(null)}
                                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-semibold text-gray-800">{report.title}</h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditClick(report)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(report._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <p className="mt-2 text-gray-600">{report.description}</p>
                                <div className="mt-4 flex items-center space-x-4">
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                        report.severity === 'high' ? 'bg-red-100 text-red-800' :
                                        report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {report.severity?.charAt(0).toUpperCase() + report.severity?.slice(1)} Priority
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                        report.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {report.status?.charAt(0).toUpperCase() + report.status?.slice(1)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyReports;