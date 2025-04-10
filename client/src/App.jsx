import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';  // Make sure CSS is imported

import Register from './pages/Register';
import Verify from './pages/Verify';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardMap from './components/DashboardMap';
import SubmitReport from './pages/SubmitReport';
import MyReports from './pages/MyReports';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminRoute from './admin/AdminRoute';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("Protected route - token check:", !!token);
        
        if (!token) {
            console.log("No token found, redirecting to login");
            navigate("/login", { replace: true });
        } else {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, [navigate]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? children : null;
};

function App() {
    console.log('App rendering'); // Add debug log

    return (
        <div className="app-container">
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected User Dashboard */}
                <Route
                    path="/dashboard/*"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Routes>
                                    <Route index element={<DashboardMap />} />
                                    <Route path="submit" element={<SubmitReport />} />
                                    <Route path="my-reports" element={<MyReports />} />
                                </Routes>
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;