import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Import marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Set up the default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom icons for different severities
const createCustomIcon = (severity) => {
    const colors = {
        low: '#10B981', // green
        medium: '#F59E0B', // yellow
        high: '#EF4444' // red
    };
    
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${colors[severity] || colors.low};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

// Quick Action Card Component
const QuickActionCard = ({ title, description, icon, onClick, color = "blue" }) => {
    const colorClasses = {
        blue: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700",
        green: "bg-green-50 border-green-200 hover:bg-green-100 text-green-700",
        purple: "bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700",
        orange: "bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700"
    };

    return (
        <button
            onClick={onClick}
            className={`w-full p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${colorClasses[color]}`}
        >
            <div className="text-center">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm opacity-80">{description}</p>
            </div>
        </button>
    );
};

const DashboardMap = () => {
    const [reports, setReports] = useState([]);
    const [filteredStatus, setFilteredStatus] = useState("all");
    const [filteredCategory, setFilteredCategory] = useState("all");
    const [filteredSeverity, setFilteredSeverity] = useState("all");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [showMap, setShowMap] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5050/api/reports/mine", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("Fetched reports:", response.data);
                setReports(response.data);
            } catch (err) {
                console.error("❌ Error loading reports:", err);
                setError("Failed to load reports.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    const filteredReports = reports.filter((report) => {
        const statusMatch = filteredStatus === "all" || report.status === filteredStatus;
        const categoryMatch = filteredCategory === "all" || report.category === filteredCategory;
        const severityMatch = filteredSeverity === "all" || report.severity === filteredSeverity;
        return statusMatch && categoryMatch && severityMatch;
    });

    // Default center coordinates for Toronto
    const defaultCenter = [43.65107, -79.347015];

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'text-green-600';
            case 'in progress': return 'text-blue-600';
            case 'open': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your community reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 dashboard-content">
            {/* Welcome Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome to Your Community Hub! 🌳
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Stay connected with your community. View reports, submit new issues, and track progress on local improvements.
                    </p>
                </div>

                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <QuickActionCard
                        title="Submit Report"
                        description="Report a new community issue"
                        icon="📝"
                        onClick={() => navigate('/dashboard/submit')}
                        color="blue"
                    />
                    <QuickActionCard
                        title="My Reports"
                        description="View and manage your reports"
                        icon="📋"
                        onClick={() => navigate('/dashboard/my-reports')}
                        color="green"
                    />
                    <QuickActionCard
                        title="Community Stats"
                        description="See community activity"
                        icon="📊"
                        onClick={() => setShowMap(!showMap)}
                        color="purple"
                    />
                    <QuickActionCard
                        title="Recent Activity"
                        description="Latest community updates"
                        icon="🔄"
                        onClick={() => setShowFilters(!showFilters)}
                        color="orange"
                    />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600 text-sm font-medium">Total Reports</p>
                                <p className="text-2xl font-bold text-blue-800">{reports.length}</p>
                            </div>
                            <div className="text-3xl">📊</div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 text-sm font-medium">Resolved</p>
                                <p className="text-2xl font-bold text-green-800">
                                    {reports.filter(r => r.status === 'resolved').length}
                                </p>
                            </div>
                            <div className="text-3xl">✅</div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-600 text-sm font-medium">In Progress</p>
                                <p className="text-2xl font-bold text-orange-800">
                                    {reports.filter(r => r.status === 'in progress').length}
                                </p>
                            </div>
                            <div className="text-3xl">🔄</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map/List Toggle */}
            <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowMap(true)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            showMap 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        🗺️ Map View
                    </button>
                    <button
                        onClick={() => setShowMap(false)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            !showMap 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        📋 List View
                    </button>
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                    🔍 Filters
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Filter Reports</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filteredStatus}
                                onChange={(e) => setFilteredStatus(e.target.value)}
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
                                value={filteredCategory}
                                onChange={(e) => setFilteredCategory(e.target.value)}
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                            <select
                                value={filteredSeverity}
                                onChange={(e) => setFilteredSeverity(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Severities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Map View */}
            {showMap ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Community Map ({filteredReports.length} reports)
                        </h2>
                        <p className="text-gray-600 text-sm">Click on markers to view report details</p>
                    </div>
                    <div className="h-96 md:h-[500px] relative">
                        <MapContainer
                            center={defaultCenter}
                            zoom={13}
                            className="w-full h-full"
                            style={{ height: '100%', minHeight: '400px' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {filteredReports.map((report) => (
                                <Marker
                                    key={report.id}
                                    position={[report.location.coordinates[1], report.location.coordinates[0]]}
                                    icon={createCustomIcon(report.severity)}
                                >
                                    <Popup className="custom-popup">
                                        <div className="p-2">
                                            <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
                                            <p className="text-gray-600 mb-3">{report.description}</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">Status:</span>
                                                    {getStatusBadge(report.status)}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">Severity:</span>
                                                    {getSeverityBadge(report.severity)}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">Category:</span>
                                                    <span className="text-sm font-medium capitalize">{report.category}</span>
                                                </div>
                                                {report.address && (
                                                    <div className="text-sm text-gray-500">
                                                        📍 {report.address}
                                                    </div>
                                                )}
                                                {report.images && report.images.length > 0 && (
                                                    <div className="mt-3">
                                                        <img 
                                                            src={report.images[0]} 
                                                            alt="Report" 
                                                            className="w-full h-24 object-cover rounded-lg"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            ) : (
                /* List View */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Report List ({filteredReports.length} reports)
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {filteredReports.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="text-4xl mb-4">📭</div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">No reports found</h3>
                                <p className="text-gray-600 mb-4">Try adjusting your filters or submit a new report.</p>
                                <button
                                    onClick={() => navigate('/dashboard/submit')}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Submit Report
                                </button>
                            </div>
                        ) : (
                            filteredReports.map((report) => (
                                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                                                {getStatusBadge(report.status)}
                                                {getSeverityBadge(report.severity)}
                                            </div>
                                            <p className="text-gray-600 mb-3">{report.description}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>📂 {report.category}</span>
                                                {report.address && <span>📍 {report.address}</span>}
                                                <span>📅 {new Date(report.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        {report.images && report.images.length > 0 && (
                                            <img 
                                                src={report.images[0]} 
                                                alt="Report" 
                                                className="w-20 h-20 object-cover rounded-lg ml-4"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Test content to ensure scrolling works */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Community Guidelines</h3>
                <div className="space-y-4 text-gray-600">
                    <p>Thank you for using Cypress Community Hub! Here are some guidelines to help make our community better:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Be specific and detailed when describing issues</li>
                        <li>Include clear photos when possible</li>
                        <li>Provide accurate location information</li>
                        <li>Be respectful and constructive in your reports</li>
                        <li>Follow up on the status of your reports</li>
                    </ul>
                    <p className="text-sm text-gray-500 mt-4">
                        Together, we can make our community a better place for everyone! 🌟
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DashboardMap;