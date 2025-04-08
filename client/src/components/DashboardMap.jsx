import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue in Leaflet + Webpack
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl,
    shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function DashboardMap() {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('http://localhost:5050/api/reports/mine', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!res.ok) throw new Error('Failed to fetch reports');

                const data = await res.json();
                setReports(data);
            } catch (err) {
                console.error('❌ Error loading reports:', err);
            }
        };

        fetchReports();
    }, []);

    return (
        <div className="h-screen w-full">
            <MapContainer center={[43.6532, -79.3832]} zoom={13} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {reports.map((report) => (
                    <Marker
                        key={report._id}
                        position={[report.location.coordinates[1], report.location.coordinates[0]]}
                    >
                        <Popup>
                            <strong>{report.title}</strong>
                            <br />
                            {report.description}
                            <br />
                            <span className="text-sm italic">Severity: {report.severity}</span>
                            <br />
                            <span className="text-xs text-gray-400">
                {new Date(report.createdAt).toLocaleString()}
              </span>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
