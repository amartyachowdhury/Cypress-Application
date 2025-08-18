import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

const DashboardMap = () => {
    const [reports, setReports] = useState([]);
    const [filteredStatus, setFilteredStatus] = useState("all");
    const [filteredCategory, setFilteredCategory] = useState("all");
    const [filteredSeverity, setFilteredSeverity] = useState("all");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

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

    return (
        <div className="relative h-[calc(100vh-80px)]">
            {error && (
                <div className="absolute top-4 left-4 right-4 z-[1000] bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}
            
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-lg text-gray-600">Loading reports...</p>
                    </div>
                </div>
            )}

            {/* Filter Controls */}
            <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-gray-800">Filters</h3>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        {showFilters ? 'Hide' : 'Show'}
                    </button>
                </div>
                
                {showFilters && (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={filteredStatus}
                                onChange={(e) => setFilteredStatus(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="open">Open</option>
                                <option value="in progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={filteredCategory}
                                onChange={(e) => setFilteredCategory(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                            <select
                                value={filteredSeverity}
                                onChange={(e) => setFilteredSeverity(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm"
                            >
                                <option value="all">All Severities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Report Count */}
            <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg px-4 py-2">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredReports.length}</span> of <span className="font-semibold">{reports.length}</span> reports
                </p>
            </div>

            <MapContainer 
                center={defaultCenter} 
                zoom={13} 
                className="h-full w-full z-0"
            >
                <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {filteredReports.map((report) => {
                    // Add validation for location data
                    if (!report.location || !report.location.coordinates || 
                        !Array.isArray(report.location.coordinates) || 
                        report.location.coordinates.length !== 2) {
                        console.warn('Invalid location data for report:', report);
                        return null;
                    }

                    // MongoDB stores coordinates as [longitude, latitude]
                    // Leaflet expects [latitude, longitude]
                    const [longitude, latitude] = report.location.coordinates;
                    
                    return (
                        <Marker
                            key={report._id}
                            position={[latitude, longitude]}
                            icon={createCustomIcon(report.severity)}
                        >
                            <Popup className="custom-popup">
                                <div className="p-3 max-w-sm">
                                    <h3 className="font-bold text-lg text-gray-800 mb-2">{report.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{report.description}</p>
                                    
                                    <div className="space-y-2 mb-3">
                                        <p className="text-sm">
                                            <span className="font-semibold">Status:</span> 
                                            <span className={`ml-1 ${getStatusColor(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-semibold">Severity:</span> 
                                            <span className={`ml-1 ${getSeverityColor(report.severity)}`}>
                                                {report.severity}
                                            </span>
                                        </p>
                                        {report.category && (
                                            <p className="text-sm">
                                                <span className="font-semibold">Category:</span> 
                                                <span className="ml-1 text-gray-600 capitalize">
                                                    {report.category}
                                                </span>
                                            </p>
                                        )}
                                        {report.address && (
                                            <p className="text-sm">
                                                <span className="font-semibold">Address:</span> 
                                                <span className="ml-1 text-gray-600">
                                                    {report.address}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Display images if available */}
                                    {report.images && report.images.length > 0 && (
                                        <div className="mb-3">
                                            <p className="font-semibold text-sm mb-2">Images:</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {report.images.slice(0, 4).map((image, index) => (
                                                    <img
                                                        key={index}
                                                        src={image}
                                                        alt={`Report ${index + 1}`}
                                                        className="w-full h-16 object-cover rounded"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500">
                                        Created: {new Date(report.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default DashboardMap;