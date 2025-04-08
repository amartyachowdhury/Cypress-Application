import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DashboardMap = () => {
    const [reports, setReports] = useState([]);
    const [status, setStatus] = useState('all');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const endpoint =
                status === 'all'
                    ? '/api/reports/mine'
                    : `/api/reports/status/${status}`;
            const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Fetch failed');
            const data = await res.json();
            setReports(data);
            setError('');
        } catch (err) {
            console.error('❌ Error fetching reports:', err);
            setError('Failed to load reports.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [status]);

    const statusOptions = ['all', 'pending', 'in-progress', 'resolved'];

    return (
        <div className="relative h-screen w-full">
            <select
                className="absolute top-4 right-4 z-[1000] bg-white border px-3 py-2 rounded shadow"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
            >
                {statusOptions.map((s) => (
                    <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                ))}
            </select>

            {loading ? (
                <p className="text-center mt-20 text-gray-500">Loading reports...</p>
            ) : error ? (
                <p className="text-center mt-20 text-red-500">{error}</p>
            ) : (
                <MapContainer
                    center={[43.65107, -79.347015]} // Toronto
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-full w-full z-0"
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {reports.map((r) => (
                        <Marker key={r._id} position={[r.latitude, r.longitude]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png' })}>
                            <Popup>
                                <strong>{r.title}</strong>
                                <br />
                                {r.description}
                                <br />
                                <span>Status: {r.status}</span>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}
        </div>
    );
};

export default DashboardMap;