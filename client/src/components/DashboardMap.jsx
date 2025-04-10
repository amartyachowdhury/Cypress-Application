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

const DashboardMap = () => {
    const [reports, setReports] = useState([]);
    const [filteredStatus, setFilteredStatus] = useState("All");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5050/api/reports/mine", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Add console.log to debug the response data
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

    const filteredReports = filteredStatus === "All"
        ? reports
        : reports.filter((report) => report.status === filteredStatus);

    // Default center coordinates for Toronto
    const defaultCenter = [43.65107, -79.347015];

    return (
        <div className="relative h-[calc(100vh-80px)]">
            {error && <p className="text-red-500 text-center pt-4">{error}</p>}
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                    <p className="text-lg">Loading reports...</p>
                </div>
            )}
            
            <select
                className="absolute z-[1000] right-4 top-4 bg-white border px-3 py-1 rounded shadow"
                value={filteredStatus}
                onChange={(e) => setFilteredStatus(e.target.value)}
            >
                <option value="All">All Reports</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
            </select>

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
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold text-lg">{report.title}</h3>
                                    <p className="text-gray-600">{report.description}</p>
                                    <p className="mt-2">
                                        <span className="font-semibold">Status:</span> {report.status}
                                    </p>
                                    {report.severity && (
                                        <p>
                                            <span className="font-semibold">Severity:</span> {report.severity}
                                        </p>
                                    )}
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