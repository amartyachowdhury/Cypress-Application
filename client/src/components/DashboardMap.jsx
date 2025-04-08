import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Fix marker icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function DashboardMap() {
    const [reports, setReports] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5050/api/reports/mine", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setReports(response.data);
            } catch (error) {
                console.error("❌ Error loading reports:", error);
            }
        };

        fetchReports();
    }, []);

    const filteredReports =
        statusFilter === "all"
            ? reports
            : reports.filter((report) => report.status === statusFilter);

    return (
        <div className="relative w-screen h-screen">
            {/* Filter Dropdown */}
            <div className="absolute top-4 right-4 z-[1000] bg-white shadow-lg rounded-md p-2">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>

            {/* Map Display */}
            <MapContainer
                center={[43.65107, -79.347015]}
                zoom={13}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredReports.map((report) => (
                    <Marker
                        key={report._id}
                        position={[
                            report.location.coordinates[1],
                            report.location.coordinates[0],
                        ]}
                    >
                        <Popup>
                            <strong>{report.title}</strong>
                            <br />
                            {report.description}
                            <br />
                            <em>Status: {report.status}</em>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default DashboardMap;