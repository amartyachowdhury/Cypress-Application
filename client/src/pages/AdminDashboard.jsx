import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsAPI } from '../services/api.js';
import { STORAGE_KEYS } from '../utils/constants.js';

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await reportsAPI.getAll();
      setReports(response.data.reports || []);
    } catch (err) {
      console.error('Error fetching reports:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        navigate('/admin/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load reports.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from reports data
      const total = reports.length;
      const open = reports.filter(r => r.status === 'pending').length;
      const inProgress = reports.filter(r => r.status === 'in progress').length;
      const resolved = reports.filter(r => r.status === 'resolved').length;

      setStats({ total, open, inProgress, resolved });
    } catch (err) {
      console.error('Error calculating stats:', err);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await reportsAPI.updateStatus(reportId, newStatus);
      fetchReports();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    navigate('/admin/login');
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [reports]);

  const filteredReports = reports.filter(
    report =>
      searchTerm === '' ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.address &&
        report.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = status => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'open':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = severity => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md py-4 px-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-blue-800 font-semibold">Total Reports</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-gray-800 font-semibold">Open</h3>
            <p className="text-2xl font-bold text-gray-600">{stats.open}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-yellow-800 font-semibold">In Progress</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.inProgress}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-green-800 font-semibold">Resolved</h3>
            <p className="text-2xl font-bold text-green-600">
              {stats.resolved}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Categories</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="safety">Safety</option>
            <option value="environment">Environment</option>
            <option value="noise">Noise</option>
            <option value="other">Other</option>
          </select>
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
              setSelectedCategory('all');
              setSelectedSeverity('all');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Clear Filters
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
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-600">No reports found.</p>
          </div>
        ) : (
          <>
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
                      Category
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
                  {filteredReports.map(report => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {report.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {report.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">
                          {report.category || 'other'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(report.severity)}`}
                        >
                          {report.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {report.address || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <select
                          value={report.status}
                          onChange={e =>
                            handleStatusUpdate(report._id, e.target.value)
                          }
                          className="px-2 py-1 border rounded-md text-sm"
                        >
                          <option value="open">Open</option>
                          <option value="in progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 border rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
