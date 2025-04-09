import React, { useEffect, useState } from "react";
import axios from "axios";

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [editingReportId, setEditingReportId] = useState(null);
    const [editedReport, setEditedReport] = useState({
        title: "",
        description: "",
        severity: "",
        status: ""
    });

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5050/api/reports/mine", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(res.data);
        } catch (err) {
            console.error("Error fetching your reports:", err);
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
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">My Reports</h2>
            {reports.map((report) => (
                <div key={report._id} className="bg-white p-4 mb-4 rounded shadow-md">
                    {editingReportId === report._id ? (
                        <div className="space-y-2">
                            <input
                                className="w-full border p-2 rounded"
                                type="text"
                                name="title"
                                value={editedReport.title}
                                onChange={handleEditChange}
                            />
                            <textarea
                                className="w-full border p-2 rounded"
                                name="description"
                                value={editedReport.description}
                                onChange={handleEditChange}
                            />
                            <select
                                name="severity"
                                value={editedReport.severity}
                                onChange={handleEditChange}
                                className="w-full border p-2 rounded"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                            <select
                                name="status"
                                value={editedReport.status}
                                onChange={handleEditChange}
                                className="w-full border p-2 rounded"
                            >
                                <option value="open">Open</option>
                                <option value="in progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUpdate}
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingReportId(null)}
                                    className="bg-gray-400 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold">{report.title}</h3>
                            <p className="text-gray-700">{report.description}</p>
                            <p className="text-sm">
                                <strong>Severity:</strong> {report.severity}
                            </p>
                            <p className="text-sm">
                                <strong>Status:</strong> {report.status}
                            </p>
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => handleEditClick(report)}
                                    className="bg-blue-600 text-white px-4 py-1 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(report._id)}
                                    className="bg-red-600 text-white px-4 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MyReports;