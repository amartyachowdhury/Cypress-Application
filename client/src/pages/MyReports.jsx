import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [editingReport, setEditingReport] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', severity: '', status: '' });

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5050/api/reports/mine', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReports(res.data);
        } catch (err) {
            console.error('❌ Failed to fetch reports', err);
        }
    };

    const handleEditClick = (report) => {
        setEditingReport(report._id);
        setForm({
            title: report.title,
            description: report.description,
            severity: report.severity,
            status: report.status,
        });
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5050/api/reports/${editingReport}`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEditingReport(null);
            fetchReports();
        } catch (err) {
            console.error('❌ Failed to update report', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5050/api/reports/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchReports();
        } catch (err) {
            console.error('❌ Failed to delete report', err);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">My Submitted Reports</h2>
            {reports.length === 0 ? (
                <p>No reports submitted yet.</p>
            ) : (
                <div className="space-y-6">
                    {reports.map((report) =>
                        editingReport === report._id ? (
                            <div key={report._id} className="border p-4 rounded shadow bg-white">
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    className="w-full mb-2 p-2 border rounded"
                                    placeholder="Title"
                                />
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full mb-2 p-2 border rounded"
                                    placeholder="Description"
                                />
                                <select
                                    name="severity"
                                    value={form.severity}
                                    onChange={handleChange}
                                    className="w-full mb-2 p-2 border rounded"
                                >
                                    <option value="">Select severity</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full mb-2 p-2 border rounded"
                                >
                                    <option value="open">Open</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdate}
                                        className="bg-blue-500 text-white px-4 py-1 rounded"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingReport(null)}
                                        className="bg-gray-300 px-4 py-1 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div key={report._id} className="border p-4 rounded shadow bg-white">
                                <h3 className="font-bold text-lg">{report.title}</h3>
                                <p className="text-sm text-gray-600">{report.description}</p>
                                <p className="text-sm mt-1">
                                    <span className="font-semibold">Severity:</span> {report.severity}
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold">Status:</span> {report.status}
                                </p>
                                <div className="flex gap-3 mt-3">
                                    <button
                                        onClick={() => handleEditClick(report)}
                                        className="bg-yellow-400 text-white px-4 py-1 rounded"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(report._id)}
                                        className="bg-red-500 text-white px-4 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default MyReports;