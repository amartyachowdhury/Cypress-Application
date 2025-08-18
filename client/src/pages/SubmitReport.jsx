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
        { number: 1, title: "Basic Info", description: "Title and description", icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        )},
        { number: 2, title: "Details", description: "Category and severity", icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )},
        { number: 3, title: "Location", description: "Set location", icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )},
        { number: 4, title: "Images", description: "Add photos (optional)", icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        )},
        { number: 5, title: "Review", description: "Submit report", icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        )}
    ];

    if (showSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl text-center max-w-md mx-4 relative z-10 transform animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                        Report Submitted!
                    </h2>
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                        Thank you for helping improve our community. Your report has been successfully submitted and is now being reviewed.
                    </p>
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 border border-green-200/50">
                        <div className="flex items-center justify-center space-x-3 text-green-600">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                            <span className="font-medium">Redirecting to dashboard...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        Submit a Community Report
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                        Help make our community better by reporting issues that need attention. Your contribution makes a real difference!
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-8 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-center">
                                    <div className={`flex items-center justify-center w-14 h-14 rounded-2xl border-2 font-bold text-lg transition-all duration-500 ${
                                        currentStep >= step.number 
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-500 border-blue-500 text-white shadow-lg' 
                                            : 'bg-white/50 border-gray-300 text-gray-400'
                                    }`}>
                                        {step.icon}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-20 h-1 mx-4 rounded-full transition-all duration-500 ${
                                            currentStep > step.number ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gray-300'
                                        }`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                {steps[currentStep - 1].title}
                            </h3>
                            <p className="text-gray-600 text-lg">{steps[currentStep - 1].description}</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 md:p-12 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10">
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                                        Report Title *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Pothole on Main Street"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="w-full border-2 border-gray-200 rounded-2xl p-5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg bg-white/50 backdrop-blur-sm transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                                        Description *
                                    </label>
                                    <textarea
                                        placeholder="Please provide a detailed description of the issue..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        rows={5}
                                        className="w-full border-2 border-gray-200 rounded-2xl p-5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg bg-white/50 backdrop-blur-sm resize-none transition-all duration-300"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        disabled={!title.trim() || !description.trim()}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold text-lg shadow-lg transform hover:scale-105 disabled:hover:scale-100"
                                    >
                                        Next Step →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Details */}
                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                                            Category
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-2xl p-5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg bg-white/50 backdrop-blur-sm transition-all duration-300"
                                        >
                                            <option value="infrastructure">Infrastructure</option>
                                            <option value="safety">Safety</option>
                                            <option value="environment">Environment</option>
                                            <option value="noise">Noise</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                                            Severity Level
                                        </label>
                                        <select
                                            value={severity}
                                            onChange={(e) => setSeverity(e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-2xl p-5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg bg-white/50 backdrop-blur-sm transition-all duration-300"
                                        >
                                            <option value="low">Low - Minor issue</option>
                                            <option value="medium">Medium - Moderate concern</option>
                                            <option value="high">High - Urgent attention needed</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-semibold text-lg transform hover:scale-105"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(3)}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
                                    >
                                        Next Step →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Location */}
                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                                        Address (Optional)
                                    </label>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="Enter address to set location"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="flex-1 border-2 border-gray-200 rounded-2xl p-5 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg bg-white/50 backdrop-blur-sm transition-all duration-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleManualAddress}
                                            className="px-8 py-5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
                                        >
                                            Set
                                        </button>
                                    </div>
                                </div>

                                {locationError && (
                                    <div className="p-6 bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl">
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <span className="font-medium">{locationError}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                                    {loading ? (
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping opacity-20"></div>
                                            </div>
                                            <span className="text-blue-700 text-lg font-medium">Detecting your location...</span>
                                        </div>
                                    ) : coordinates ? (
                                        <div className="flex items-center space-x-4">
                                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <div>
                                                <p className="text-blue-700 font-semibold text-lg">Location set successfully!</p>
                                                <p className="text-blue-600 text-base">
                                                    {coordinates[1].toFixed(4)}, {coordinates[0].toFixed(4)}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-4">
                                            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <span className="text-blue-700 text-lg">Failed to get your location. Please enter an address above.</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-semibold text-lg transform hover:scale-105"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(4)}
                                        disabled={!coordinates}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold text-lg shadow-lg transform hover:scale-105 disabled:hover:scale-100"
                                    >
                                        Next Step →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Images */}
                        {currentStep === 4 && (
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                                        Add Photos (Optional)
                                    </label>
                                    <p className="text-gray-600 text-base mb-6 leading-relaxed">
                                        Upload up to 5 images to help illustrate the issue. Clear photos can help authorities better understand and address the problem quickly.
                                    </p>
                                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-all duration-300 bg-white/30 backdrop-blur-sm">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-lg font-medium text-gray-700 mb-2">Click to upload images</p>
                                            <p className="text-gray-500">or drag and drop</p>
                                        </label>
                                    </div>
                                </div>
                                
                                {imageUrls.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Preview ({imageUrls.length}/5)</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {imageUrls.map((url, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={url}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
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
                                        className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-semibold text-lg transform hover:scale-105"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(5)}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-semibold text-lg shadow-lg transform hover:scale-105"
                                    >
                                        Next Step →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Review & Submit */}
                        {currentStep === 5 && (
                            <div className="space-y-8">
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border-2 border-gray-200">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Review Your Report</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Title:</span>
                                            <p className="text-gray-800 text-lg font-medium mt-1">{title}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Description:</span>
                                            <p className="text-gray-800 text-lg mt-1 leading-relaxed">{description}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Category:</span>
                                                <p className="text-gray-800 text-lg font-medium mt-1 capitalize">{category}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Severity:</span>
                                                <p className="text-gray-800 text-lg font-medium mt-1 capitalize">{severity}</p>
                                            </div>
                                        </div>
                                        {address && (
                                            <div>
                                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Address:</span>
                                                <p className="text-gray-800 text-lg font-medium mt-1">{address}</p>
                                            </div>
                                        )}
                                        {images.length > 0 && (
                                            <div>
                                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Images:</span>
                                                <p className="text-gray-800 text-lg font-medium mt-1">{images.length} photo(s) attached</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(4)}
                                        className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-semibold text-lg transform hover:scale-105"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || !coordinates}
                                        className="px-10 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold text-lg shadow-lg transform hover:scale-105 disabled:hover:scale-100 flex items-center space-x-3"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                                <span>Submitting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                <span>Submit Report</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SubmitReport;