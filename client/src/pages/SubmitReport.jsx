import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SubmitReport() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("low");
    const [coordinates, setCoordinates] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setCoordinates([longitude, latitude]);
                setLoading(false);
            },
            (err) => {
                console.error("Geolocation error:", err);
                setLoading(false);
            }
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in to submit a report.");
            return navigate("/login");
        }

        try {
            await axios.post(
                "http://localhost:5050/api/reports",
                {
                    title,
                    description,
                    severity,
                    location: {
                        type: "Point",
                        coordinates,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("✅ Report submitted successfully!");
            navigate("/");
        } catch (err) {
            console.error("❌ Error submitting report:", err);
            alert("Failed to submit report. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-md p-6 rounded-2xl shadow-md space-y-5"
            >
                <h1 className="text-2xl font-semibold text-center text-gray-800">
                    Submit a Report
                </h1>

                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full border rounded-lg p-2"
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full border rounded-lg p-2 h-28"
                />

                <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full border rounded-lg p-2"
                >
                    <option value="low">Low Severity</option>
                    <option value="medium">Medium Severity</option>
                    <option value="high">High Severity</option>
                </select>

                {loading ? (
                    <p className="text-sm text-yellow-600 text-center">📡 Detecting your location...</p>
                ) : coordinates ? (
                    <p className="text-sm text-green-600 text-center">
                        📍 Location set to: {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
                    </p>
                ) : (
                    <p className="text-sm text-red-600 text-center">⚠️ Failed to get your location</p>
                )}

                <button
                    type="submit"
                    disabled={!coordinates}
                    className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Submit Report
                </button>
            </form>
        </div>
    );
}

export default SubmitReport;