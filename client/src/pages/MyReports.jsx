import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { reportsAPI } from '../services/api.js';
import { STORAGE_KEYS, ROUTES } from '../utils/constants.js';

function MyReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReportId, setEditingReportId] = useState(null);
  const [editedReport, setEditedReport] = useState({
    title: '',
    description: '',
    severity: '',
    status: '',
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.getUserReports();
      setReports(response.data.reports || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Redirect to login after a delay
        setTimeout(() => {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          navigate(ROUTES.LOGIN);
        }, 2000);
      } else {
        setError('Failed to load reports. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = report => {
    setEditingReportId(report.id);
    setEditedReport({
      title: report.title,
      description: report.description,
      severity: report.severity,
      status: report.status,
    });
  };

  const handleDelete = async reportId => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    const token = localStorage.getItem('token');
    if (token === 'test-token') {
      // Show message for test token
      alert(
        'This is a demo account. Delete functionality requires a real account.'
      );
      return;
    }

    try {
      await axios.delete(`http://localhost:5050/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(reports.filter(r => r.id !== reportId));
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report. Please try again.');
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    if (token === 'test-token') {
      // Show message for test token
      alert(
        'This is a demo account. Update functionality requires a real account.'
      );
      return;
    }

    try {
      await axios.put(
        `http://localhost:5050/api/reports/${editingReportId}`,
        editedReport,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReports(
        reports.map(r =>
          r.id === editingReportId ? { ...r, ...editedReport } : r
        )
      );
      setEditingReportId(null);
    } catch (err) {
      console.error('Error updating report:', err);
      alert('Failed to update report. Please try again.');
    }
  };

  const handleEditChange = e => {
    setEditedReport({
      ...editedReport,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancelEdit = () => {
    setEditingReportId(null);
    setEditedReport({
      title: '',
      description: '',
      severity: '',
      status: '',
    });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusBadge = status => {
    const colors = {
      open: 'bg-gray-100 text-gray-800',
      'in progress': 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors['open']}`}
      >
        {status}
      </span>
    );
  };

  const getSeverityBadge = severity => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[severity] || colors['low']}`}
      >
        {severity}
      </span>
    );
  };

  const getCategoryIcon = category => {
    const icons = {
      infrastructure: '🏗️',
      safety: '⚠️',
      environment: '🌱',
      noise: '🔊',
      other: '📋',
    };
    return icons[category] || icons['other'];
  };

  const filteredReports = reports.filter(report => {
    const statusMatch =
      filterStatus === 'all' || report.status === filterStatus;
    const categoryMatch =
      filterCategory === 'all' || report.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Reports
            </h1>
            <p className="text-gray-600">
              Track and manage your community reports
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Live updates</span>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Reports</p>
              <p className="text-3xl font-bold text-gray-800">
                {reports.length}
              </p>
            </div>
            <div className="text-3xl text-blue-600">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Open</p>
              <p className="text-3xl font-bold text-gray-800">
                {reports.filter(r => r.status === 'open').length}
              </p>
            </div>
            <div className="text-3xl text-gray-600">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">
                {reports.filter(r => r.status === 'in progress').length}
              </p>
            </div>
            <div className="text-3xl text-blue-600">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Resolved</p>
              <p className="text-3xl font-bold text-green-600">
                {reports.filter(r => r.status === 'resolved').length}
              </p>
            </div>
            <div className="text-3xl text-green-600">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
              Your Reports ({filteredReports.length})
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium flex items-center space-x-2 hover:shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                  />
                </svg>
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  <option value="all">All Categories</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="safety">Safety</option>
                  <option value="environment">Environment</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Report List */}
      <div className="space-y-6">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reports found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or submit your first report.
            </p>
            <Link
              to="/dashboard/submit-report"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Submit Your First Report
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        ) : (
          filteredReports.map(report => (
            <div
              key={report.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              {editingReportId === report.id ? (
                /* Enhanced Edit Mode */
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={editedReport.title}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editedReport.description}
                        onChange={handleEditChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Severity
                        </label>
                        <select
                          name="severity"
                          value={editedReport.severity}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={editedReport.status}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        >
                          <option value="open">Open</option>
                          <option value="in progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-medium"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-300 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Enhanced View Mode */
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {report.title}
                          </h3>
                          <div className="flex items-center space-x-3 mb-3">
                            {getStatusBadge(report.status)}
                            {getSeverityBadge(report.severity)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditClick(report)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {report.description}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                          {report.category}
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyReports;
