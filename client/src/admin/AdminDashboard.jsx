import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem('adminToken'); // Make sure adminToken is set at login
                const response = await axios.get('http://localhost:5050/api/admin/reports', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setReports(response.data);
            } catch (err) {
                console.error("❌ Error loading reports:", err);
                setError('Failed to load reports.');
            }
        };

        fetchReports();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
            {error && <p className="text-red-600">{error}</p>}
            <table className="min-w-full bg-gray-100 border rounded">
                <thead>
                <tr className="bg-gray-200">
                    <th className="py-2 px-4 border">Title</th>
                    <th className="py-2 px-4 border">Description</th>
                    <th className="py-2 px-4 border">Status</th>
                    <th className="py-2 px-4 border">Update</th>
                </tr>
                </thead>
                <tbody>
                {reports.map((report) => (
                    <tr key={report._id} className="text-center">
                        <td className="py-2 px-4 border">{report.title}</td>
                        <td className="py-2 px-4 border">{report.description}</td>
                        <td className="py-2 px-4 border">{report.status}</td>
                        <td className="py-2 px-4 border">
                            {/* Status update form or button can go here */}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;