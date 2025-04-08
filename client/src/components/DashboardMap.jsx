import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const DashboardMap = () => {
    const [reports, setReports] = useState([]);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                console.warn("No token found in localStorage");
                return;
            }

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

    useEffect(() => {
        fetchReports();
    }, []);

    const icon = new L.Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    return (
        <MapContainer center={[43.6532, -79.3832]} zoom={13} style={{ height: "100vh", width: "100vw" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reports.map((report) => (
                <Marker
                    key={report._id}
                    position={[report.location.coordinates[1], report.location.coordinates[0]]}
                    icon={icon}
                >
                    <Popup>
                        <strong>{report.title}</strong>
                        <br />
                        {report.description}
                        <br />
                        <em>Severity: {report.severity}</em>
                        <br />
                        {new Date(report.createdAt).toLocaleString()}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default DashboardMap;