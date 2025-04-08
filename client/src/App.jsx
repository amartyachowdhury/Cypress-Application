import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import SubmitReport from "./pages/SubmitReport";
import DashboardMap from "./components/DashboardMap";
import MyReports from "./pages/MyReports";

const App = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/login" element={<Login />} />
                <Route path="/submit-report" element={<SubmitReport />} />
                <Route path="/dashboard" element={<DashboardMap />} />
                <Route path="/my-reports" element={<MyReports />} />
                {/* Fallback: redirect to login if route doesn't match */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </div>
    );
};

export default App;