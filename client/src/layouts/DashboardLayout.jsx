import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';

export default function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('User');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Get user name from localStorage or token
        const token = localStorage.getItem('token');
        if (token) {
            // In a real app, you'd decode the JWT to get user info
            // For now, we'll use a placeholder
            setUserName('Community Member');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Logo/Brand */}
                        <Link 
                            to="/dashboard" 
                            className="group cursor-pointer"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">🌳</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                                        Cypress Community Hub
                                    </h1>
                                    <span className="block text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                                        Making our community better together
                                    </span>
                                </div>
                            </div>
                        </Link>
                        
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link 
                                to="/dashboard" 
                                className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center space-x-2"
                            >
                                <span>🏠</span>
                                <span>Home</span>
                            </Link>
                            <Link 
                                to="/dashboard/submit" 
                                className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center space-x-2"
                            >
                                <span>📝</span>
                                <span>Submit Report</span>
                            </Link>
                            <Link 
                                to="/dashboard/my-reports" 
                                className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center space-x-2"
                            >
                                <span>📋</span>
                                <span>My Reports</span>
                            </Link>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">👋 {userName}</span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        </nav>

                        {/* Mobile menu button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-200">
                            <nav className="flex flex-col space-y-4">
                                <Link 
                                    to="/dashboard" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50"
                                >
                                    <span>🏠</span>
                                    <span>Home</span>
                                </Link>
                                <Link 
                                    to="/dashboard/submit" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50"
                                >
                                    <span>📝</span>
                                    <span>Submit Report</span>
                                </Link>
                                <Link 
                                    to="/dashboard/my-reports" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50"
                                >
                                    <span>📋</span>
                                    <span>My Reports</span>
                                </Link>
                                <div className="px-4 py-2 border-t border-gray-200 pt-4">
                                    <span className="text-sm text-gray-500 block mb-2">👋 {userName}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 font-medium"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children || <Outlet />}
            </main>
        </div>
    );
}