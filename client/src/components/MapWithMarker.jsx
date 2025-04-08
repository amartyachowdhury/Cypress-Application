// client/src/components/MapWithMarker.jsx

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';

const MapWithMarker = ({ onLocationSelect }) => {
    const [markerPosition, setMarkerPosition] = useState(null);

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setMarkerPosition([lat, lng]);
                onLocationSelect({ lat, lng }); // Send back to parent form
            }
        });
        return null;
    };

    return (
        <div className="h-96 w-full rounded-xl shadow">
            <MapContainer center={[43.65107, -79.347015]} zoom={13} className="h-full w-full z-0">
                <TileLayer
                    attribution='© OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler />
                {markerPosition && <Marker position={markerPosition} />}
            </MapContainer>
        </div>
    );
};

export default MapWithMarker;