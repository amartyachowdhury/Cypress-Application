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
    const [currentStep, setCurrentStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
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

            setShowSuccess(true);
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        } catch (err) {
            console.error("❌ Error submitting report:", err);
            alert("Failed to submit report. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const steps = [
        { number: 1, title: "Basic Info", description: "Title and description" },
        { number: 2, title: "Details", description: "Category and severity" },
        { number: 3, title: "Location", description: "Set location" },
        { number: 4, title: "Images", description: "Add photos (optional)" },
        { number: 5, title: "Review", description: "Submit report" }
    ];

    if (showSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md mx-4">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Submitted!</h2>
                    <p className="text-gray-600 mb-6">Thank you for helping improve our community.</p>
                    <div className="animate-pulse">
                        <div className="text-sm text-gray-500">Redirecting to dashboard...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Submit a Community Report 📝
                    </h1>
                    <p className="text-gray-600">
                        Help make our community better by reporting issues that need attention.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm ${
                                    currentStep >= step.number 
                                        ? 'bg-blue-600 border-blue-600 text-white' 
                                        : 'bg-gray-100 border-gray-300 text-gray-500'
                                }`}>
                                    {step.number}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-0.5 mx-2 ${
                                        currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {steps[currentStep - 1].title}
                        </h3>
                        <p className="text-gray-600">{steps[currentStep - 1].description}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Report Title *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Pothole on Main Street"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    placeholder="Please provide a detailed description of the issue..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg resize-none"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(2)}
                                    disabled={!title.trim() || !description.trim()}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                                >
                                    Next Step →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                    >
                                        <option value="infrastructure">🏗️ Infrastructure</option>
                                        <option value="safety">🛡️ Safety</option>
                                        <option value="environment">🌱 Environment</option>
                                        <option value="noise">🔊 Noise</option>
                                        <option value="other">📋 Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Severity Level
                                    </label>
                                    <select
                                        value={severity}
                                        onChange={(e) => setSeverity(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                    >
                                        <option value="low">🟢 Low - Minor issue</option>
                                        <option value="medium">🟡 Medium - Moderate concern</option>
                                        <option value="high">🔴 High - Urgent attention needed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                >
                                    ← Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(3)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Next Step →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Location */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address (Optional)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter address to set location"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleManualAddress}
                                        className="px-6 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
                                    >
                                        Set
                                    </button>
                                </div>
                            </div>

                            {locationError && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
                                    {locationError}
                                </div>
                            )}

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                {loading ? (
                                    <div className="flex items-center space-x-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span className="text-blue-700">📡 Detecting your location...</span>
                                    </div>
                                ) : coordinates ? (
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">✅</span>
                                        <div>
                                            <p className="text-blue-700 font-medium">Location set successfully!</p>
                                            <p className="text-blue-600 text-sm">
                                                📍 {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">⚠️</span>
                                        <span className="text-blue-700">Failed to get your location. Please enter an address above.</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(2)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                >
                                    ← Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(4)}
                                    disabled={!coordinates}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                                >
                                    Next Step →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Images */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Add Photos (Optional)
                                </label>
                                <p className="text-gray-600 text-sm mb-4">
                                    Upload up to 5 images to help illustrate the issue. This can help authorities better understand the problem.
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center hover:border-blue-400 transition-colors"
                                />
                            </div>
                            
                            {imageUrls.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Preview ({imageUrls.length}/5)</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(3)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                >
                                    ← Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(5)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Next Step →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review & Submit */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Review Your Report</h3>
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Title:</span>
                                        <p className="text-gray-800">{title}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Description:</span>
                                        <p className="text-gray-800">{description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Category:</span>
                                            <p className="text-gray-800 capitalize">{category}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Severity:</span>
                                            <p className="text-gray-800 capitalize">{severity}</p>
                                        </div>
                                    </div>
                                    {address && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Address:</span>
                                            <p className="text-gray-800">{address}</p>
                                        </div>
                                    )}
                                    {images.length > 0 && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Images:</span>
                                            <p className="text-gray-800">{images.length} photo(s) attached</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(4)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                >
                                    ← Previous
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !coordinates}
                                    className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>🚀</span>
                                            <span>Submit Report</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default SubmitReport;