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
            background: linear-gradient(135deg, ${colors[severity] || colors.low}, ${colors[severity] || colors.low}dd);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
            font-weight: bold;
        ">${severity === 'high' ? '!' : severity === 'medium' ? '•' : '•'}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

// Enhanced Quick Action Card Component
const QuickActionCard = ({ title, description, icon, onClick, color = "blue" }) => {
    const colorClasses = {
        blue: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200 text-blue-700 shadow-blue-100",
        green: "bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200 text-green-700 shadow-green-100",
        purple: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 text-purple-700 shadow-purple-100",
        orange: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200 text-orange-700 shadow-orange-100"
    };

    return (
        <button
            onClick={onClick}
            className={`w-full p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-105 hover:shadow-xl transform hover:-translate-y-1 ${colorClasses[color]} shadow-lg`}
        >
            <div className="text-center">
                <div className="text-4xl mb-4 transform transition-transform duration-300 hover:scale-110">{icon}</div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm opacity-80 leading-relaxed">{description}</p>
            </div>
        </button>
    );
};

// Enhanced Stats Card Component
const StatsCard = ({ title, value, icon, color = "blue", gradient = "from-blue-500 to-blue-600" }) => {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                        {value}
                    </p>
                </div>
                <div className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                    {icon}
                </div>
            </div>
        </div>
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

    const getStatusBadge = (status) => {
        const colors = {
            'open': 'bg-gray-100 text-gray-800 border-gray-200',
            'in progress': 'bg-blue-100 text-blue-800 border-blue-200',
            'resolved': 'bg-green-100 text-green-800 border-green-200'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[status] || colors.open}`}>
                {status}
            </span>
        );
    };

    const getSeverityBadge = (severity) => {
        const colors = {
            'low': 'bg-green-100 text-green-800 border-green-200',
            'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'high': 'bg-red-100 text-red-800 border-red-200'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[severity] || colors.low}`}>
                {severity}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping opacity-20"></div>
                    </div>
                    <p className="text-gray-600 text-lg font-medium">Loading your community reports...</p>
                    <p className="text-gray-400 text-sm mt-2">Preparing your dashboard</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 dashboard-content">
            {/* Welcome Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10 text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        Welcome to Your Community Hub
                    </h1>
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
                        Stay connected with your community. View reports, submit new issues, and track progress on local improvements that make our neighborhood better for everyone.
                    </p>
                </div>

                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <QuickActionCard
                        title="Submit Report"
                        description="Report a new community issue that needs attention"
                        icon={
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                        onClick={() => navigate('/dashboard/submit')}
                        color="blue"
                    />
                    <QuickActionCard
                        title="My Reports"
                        description="View and manage your submitted reports"
                        icon={
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        }
                        onClick={() => navigate('/dashboard/my-reports')}
                        color="green"
                    />
                    <QuickActionCard
                        title="Community Stats"
                        description="See community activity and engagement"
                        icon={
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                        onClick={() => setShowMap(!showMap)}
                        color="purple"
                    />
                    <QuickActionCard
                        title="Recent Activity"
                        description="Latest community updates and changes"
                        icon={
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        }
                        onClick={() => setShowFilters(!showFilters)}
                        color="orange"
                    />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                        title="Total Reports"
                        value={reports.length}
                        icon={
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                        gradient="from-blue-500 to-blue-600"
                    />
                    <StatsCard
                        title="Resolved"
                        value={reports.filter(r => r.status === 'resolved').length}
                        icon={
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        }
                        gradient="from-green-500 to-green-600"
                    />
                    <StatsCard
                        title="In Progress"
                        value={reports.filter(r => r.status === 'in progress').length}
                        icon={
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        }
                        gradient="from-orange-500 to-orange-600"
                    />
                </div>
            </div>

            {/* Map/List Toggle */}
            <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowMap(true)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                            showMap 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                                : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white shadow-md'
                        }`}
                    >
                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                        </svg>
                        Map View
                    </button>
                    <button
                        onClick={() => setShowMap(false)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                            !showMap 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                                : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white shadow-md'
                        }`}
                    >
                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        List View
                    </button>
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-600 rounded-xl hover:bg-white transition-all duration-300 font-semibold shadow-md transform hover:scale-105"
                >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                    Filters
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 animate-in slide-in-from-top-2 duration-300">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Filter Reports</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
                            <select
                                value={filteredStatus}
                                onChange={(e) => setFilteredStatus(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="open">Open</option>
                                <option value="in progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                            <select
                                value={filteredCategory}
                                onChange={(e) => setFilteredCategory(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
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
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Severity</label>
                            <select
                                value={filteredSeverity}
                                onChange={(e) => setFilteredSeverity(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
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
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                    <div className="p-6 border-b border-gray-200/50">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Community Map ({filteredReports.length} reports)
                        </h2>
                        <p className="text-gray-600">Click on markers to view detailed report information</p>
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
                                        <div className="p-4 max-w-sm">
                                            <h3 className="font-bold text-lg mb-3 text-gray-800">{report.title}</h3>
                                            <p className="text-gray-600 mb-4 leading-relaxed">{report.description}</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 font-medium">Status:</span>
                                                    {getStatusBadge(report.status)}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 font-medium">Severity:</span>
                                                    {getSeverityBadge(report.severity)}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 font-medium">Category:</span>
                                                    <span className="text-sm font-semibold capitalize text-gray-700">{report.category}</span>
                                                </div>
                                                {report.address && (
                                                    <div className="text-sm text-gray-500">
                                                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {report.address}
                                                    </div>
                                                )}
                                                {report.images && report.images.length > 0 && (
                                                    <div className="mt-4">
                                                        <img 
                                                            src={report.images[0]} 
                                                            alt="Report" 
                                                            className="w-full h-32 object-cover rounded-lg shadow-md"
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
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
                    <div className="p-6 border-b border-gray-200/50">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Report List ({filteredReports.length} reports)
                        </h2>
                        <p className="text-gray-600">Browse through all community reports</p>
                    </div>
                    <div className="divide-y divide-gray-200/50">
                        {filteredReports.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="w-16 h-16 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">No reports found</h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    {reports.length === 0 
                                        ? "You haven't submitted any reports yet. Start making a difference in your community!" 
                                        : "Try adjusting your filters to see more reports."
                                    }
                                </p>
                                <button
                                    onClick={() => navigate('/dashboard/submit')}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
                                >
                                    Submit Your First Report
                                </button>
                            </div>
                        ) : (
                            filteredReports.map((report) => (
                                <div key={report.id} className="p-6 hover:bg-white/50 transition-all duration-300">
                                    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{report.title}</h3>
                                                        <div className="flex items-center space-x-3">
                                                            {getStatusBadge(report.status)}
                                                            {getSeverityBadge(report.severity)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 mb-4 leading-relaxed">{report.description}</p>
                                            <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-500">
                                                <span className="flex items-center space-x-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    <span className="font-medium capitalize">{report.category}</span>
                                                </span>
                                                {report.address && (
                                                    <span className="flex items-center space-x-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span>{report.address}</span>
                                                    </span>
                                                )}
                                                <span className="flex items-center space-x-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                                </span>
                                            </div>
                                        </div>
                                        {report.images && report.images.length > 0 && (
                                            <div className="md:w-32 md:flex-shrink-0">
                                                <img 
                                                    src={report.images[0]} 
                                                    alt="Report" 
                                                    className="w-full h-24 md:h-32 object-cover rounded-xl shadow-md"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Community Guidelines */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 shadow-xl border border-blue-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Community Guidelines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="text-gray-700 leading-relaxed">
                                Thank you for using Cypress Community Hub! Here are some guidelines to help make our community better:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start space-x-3">
                                    <span className="text-blue-500 text-lg">•</span>
                                    <span className="text-gray-700">Be specific and detailed when describing issues</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="text-blue-500 text-lg">•</span>
                                    <span className="text-gray-700">Include clear photos when possible</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="text-blue-500 text-lg">•</span>
                                    <span className="text-gray-700">Provide accurate location information</span>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <ul className="space-y-3">
                                <li className="flex items-start space-x-3">
                                    <span className="text-blue-500 text-lg">•</span>
                                    <span className="text-gray-700">Be respectful and constructive in your reports</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="text-blue-500 text-lg">•</span>
                                    <span className="text-gray-700">Follow up on the status of your reports</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="text-blue-500 text-lg">•</span>
                                    <span className="text-gray-700">Encourage others to participate</span>
                                </li>
                            </ul>
                            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                                <p className="text-sm text-gray-600 text-center font-medium">
                                    Together, we can make our community a better place for everyone!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center space-x-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardMap;