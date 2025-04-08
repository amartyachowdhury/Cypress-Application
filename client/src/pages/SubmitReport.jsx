import { useState } from 'react';
import axios from 'axios';
import MapWithMarker from '../components/MapWithMarker';

const SubmitReport = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        severity: 'low',
        location: null
    });

    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.location) {
            setMessage('📍 Please select a location on the map.');
            return;
        }

        try {
            const token = localStorage.getItem('token'); // adjust based on your auth flow
            const response = await axios.post(
                'http://localhost:5050/api/reports',
                {
                    ...formData,
                    location: {
                        type: 'Point',
                        coordinates: [formData.location.lng, formData.location.lat]
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setMessage('✅ Report submitted!');
            setFormData({
                title: '',
                description: '',
                severity: 'low',
                location: null
            });
        } catch (error) {
            console.error(error);
            setMessage('❌ Error submitting report.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-4">
            <h2 className="text-2xl font-bold">Submit a Report</h2>

            <MapWithMarker onLocationSelect={(loc) => setFormData({ ...formData, location: loc })} />

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Title"
                    className="w-full p-2 border rounded"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />

                <textarea
                    placeholder="Description"
                    className="w-full p-2 border rounded"
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />

                <select
                    className="w-full p-2 border rounded"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>

                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Submit
                </button>
            </form>

            {message && <p className="text-center mt-4">{message}</p>}
        </div>
    );
};

export default SubmitReport;