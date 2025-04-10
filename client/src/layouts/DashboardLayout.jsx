import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';

export default function DashboardLayout({ children }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
                <Link 
                    to="/dashboard" 
                    className="group cursor-pointer"
                >
                    <h1 className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                        Cypress Citizen Issue Tracker
                    </h1>
                    <span className="block text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                        Click to return to dashboard
                    </span>
                </Link>
                
                <nav className="flex items-center space-x-6">
                    <Link 
                        to="/dashboard" 
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        Home
                    </Link>
                    <Link 
                        to="/dashboard/submit" 
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        Submit Report
                    </Link>
                    <Link 
                        to="/dashboard/my-reports" 
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        My Reports
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-md transition-colors"
                    >
                        Logout
                    </button>
                </nav>
            </header>

            <main className="flex-1 p-6">
                {children || <Outlet />}
            </main>
        </div>
    );
}