import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

const DashboardLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="h-screen flex flex-col">
            <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
                <h1 className="text-xl font-bold">Cypress Dashboard</h1>
                <div className="space-x-4">
                    <Link to="/dashboard" className="hover:underline">Map</Link>
                    <Link to="/submit-report" className="hover:underline">Submit Report</Link>
                    <Link to="/my-reports" className="hover:underline">My Reports</Link>
                    <button onClick={handleLogout} className="hover:underline text-red-400">
                        Logout
                    </button>
                </div>
            </nav>

            <main className="flex-grow bg-gray-100 p-4 overflow-auto">
                <Outlet /> {/* This renders the current route's child component */}
            </main>
        </div>
    );
};

export default DashboardLayout;