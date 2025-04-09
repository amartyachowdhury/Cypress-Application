import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Fix for default marker icons not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function DashboardMap() {
    const [reports, setReports] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("all");

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5050/api/reports/mine", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setReports(response.data);
        } catch (err) {
            console.error("❌ Error loading reports:", err);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const filteredReports =
        selectedStatus === "all"
            ? reports
            : reports.filter((report) => report.status === selectedStatus);

    return (
        <div className="h-screen relative">
            <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-xl shadow-lg">
                <select
                    className="p-2 border border-gray-300 rounded-lg"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                >
                    <option value="all">All Reports</option>
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>

            <MapContainer center={[43.65107, -79.347015]} zoom={13} className="h-full w-full z-0">
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredReports.map((report) => (
                    <Marker
                        key={report._id}
                        position={[
                            report.location?.coordinates[1],
                            report.location?.coordinates[0],
                        ]}
                    >
                        <Popup>
                            <strong>{report.title}</strong>
                            <br />
                            {report.description}
                            <br />
                            <span>Status: {report.status}</span>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default DashboardMap;