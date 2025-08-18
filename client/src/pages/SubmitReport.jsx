import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SubmitReport() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("low");
    const [category, setCategory] = useState("other");
    const [coordinates, setCoordinates] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [images, setImages] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);
    const [address, setAddress] = useState("");
    const [locationError, setLocationError] = useState("");
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

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            alert("Maximum 5 images allowed");
            return;
        }
        setImages(files);
        
        // Create preview URLs
        const urls = files.map(file => URL.createObjectURL(file));
        setImageUrls(urls);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newUrls = imageUrls.filter((_, i) => i !== index);
        setImages(newImages);
        setImageUrls(newUrls);
    };

    const handleManualAddress = async () => {
        if (!address.trim()) return;
        
        try {
            setLocationError("");
            // For demo purposes, using a simple geocoding service
            // In production, use Google Maps API or Mapbox
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            );
            
            if (response.data.length > 0) {
                const [lng, lat] = [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)];
                setCoordinates([lng, lat]);
                setLocationError("");
            } else {
                setLocationError("Address not found. Please try a different address.");
            }
        } catch (err) {
            setLocationError("Failed to geocode address. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in to submit a report.");
            return navigate("/login");
        }

        try {
            // Upload images first (if any)
            let uploadedImageUrls = [];
            if (images.length > 0) {
                const formData = new FormData();
                images.forEach(image => {
                    formData.append('images', image);
                });
                
                const uploadResponse = await axios.post(
                    "http://localhost:5050/api/reports/upload-images",
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                uploadedImageUrls = uploadResponse.data.imageUrls;
            }

            // Submit report with image URLs
            await axios.post(
                "http://localhost:5050/api/reports",
                {
                    title,
                    description,
                    severity,
                    category,
                    address,
                    images: uploadedImageUrls,
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
            navigate("/dashboard");
        } catch (err) {
            console.error("❌ Error submitting report:", err);
            alert("Failed to submit report. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
            <form
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-md space-y-5"
            >
                <h1 className="text-2xl font-semibold text-center text-gray-800">
                    Submit a Report
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="infrastructure">Infrastructure</option>
                        <option value="safety">Safety</option>
                        <option value="environment">Environment</option>
                        <option value="noise">Noise</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full border rounded-lg p-3 h-28 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="low">Low Severity</option>
                        <option value="medium">Medium Severity</option>
                        <option value="high">High Severity</option>
                    </select>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Address (optional)"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={handleManualAddress}
                            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                            Set
                        </button>
                    </div>
                </div>

                {locationError && (
                    <p className="text-sm text-red-600 text-center">{locationError}</p>
                )}

                {loading ? (
                    <p className="text-sm text-yellow-600 text-center">📡 Detecting your location...</p>
                ) : coordinates ? (
                    <p className="text-sm text-green-600 text-center">
                        📍 Location set to: {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
                    </p>
                ) : (
                    <p className="text-sm text-red-600 text-center">⚠️ Failed to get your location</p>
                )}

                {/* Image Upload Section */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Images (optional, max 5)
                    </label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    {imageUrls.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {imageUrls.map((url, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!coordinates || submitting}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {submitting ? "Submitting..." : "Submit Report"}
                </button>
            </form>
        </div>
    );
}

export default SubmitReport;