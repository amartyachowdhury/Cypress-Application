import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';

export default function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [userName, setUserName] = useState('User');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        // Get user name from localStorage or token
        const token = localStorage.getItem('token');
        if (token) {
            // In a real app, you'd decode the JWT to get user info
            // For now, we'll use a placeholder
            setUserName('Community Member');
        }

        // Handle scroll effect for header
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Enhanced Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
            </div>

            {/* Enhanced Header */}
            <header className={`relative z-50 transition-all duration-500 ${
                isScrolled 
                    ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50' 
                    : 'bg-white/80 backdrop-blur-md border-b border-gray-200/30'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        {/* Enhanced Logo/Brand */}
                        <Link 
                            to="/dashboard" 
                            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:rotate-3">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                                        Cypress Community Hub
                                    </h1>
                                    <span className="block text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                                        Making our community better together
                                    </span>
                                </div>
                            </div>
                        </Link>
                        
                        {/* Enhanced Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link 
                                to="/dashboard" 
                                className={`relative transition-all duration-300 font-medium flex items-center space-x-2 group ${
                                    isActiveRoute('/dashboard') 
                                        ? 'text-blue-600' 
                                        : 'text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Home</span>
                                <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ${
                                    isActiveRoute('/dashboard') ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></div>
                            </Link>
                            <Link 
                                to="/dashboard/submit-report" 
                                className={`relative transition-all duration-300 font-medium flex items-center space-x-2 group ${
                                    isActiveRoute('/dashboard/submit-report') 
                                        ? 'text-blue-600' 
                                        : 'text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Submit Report</span>
                                <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ${
                                    isActiveRoute('/dashboard/submit-report') ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></div>
                            </Link>
                            <Link 
                                to="/dashboard/my-reports" 
                                className={`relative transition-all duration-300 font-medium flex items-center space-x-2 group ${
                                    isActiveRoute('/dashboard/my-reports') 
                                        ? 'text-blue-600' 
                                        : 'text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span>My Reports</span>
                                <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ${
                                    isActiveRoute('/dashboard/my-reports') ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></div>
                            </Link>
                            <div className="flex items-center space-x-4">
                                <NotificationBell />
                                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-gray-600 font-medium">Welcome, {userName}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="relative px-4 py-2 text-red-600 hover:text-white rounded-xl transition-all duration-300 font-medium overflow-hidden group shadow-sm hover:shadow-md"
                                >
                                    <span className="relative z-10">Logout</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                </button>
                            </div>
                        </nav>

                        {/* Enhanced Mobile menu button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Enhanced Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-200/50 animate-in slide-in-from-top-2 duration-300">
                            <nav className="flex flex-col space-y-4">
                                <Link 
                                    to="/dashboard" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`transition-all duration-300 font-medium flex items-center space-x-3 px-4 py-3 rounded-xl transform hover:scale-105 ${
                                        isActiveRoute('/dashboard')
                                            ? 'text-blue-600 bg-blue-50'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Home</span>
                                </Link>
                                <Link 
                                    to="/dashboard/submit-report" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`transition-all duration-300 font-medium flex items-center space-x-3 px-4 py-3 rounded-xl transform hover:scale-105 ${
                                        isActiveRoute('/dashboard/submit-report')
                                            ? 'text-blue-600 bg-blue-50'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Submit Report</span>
                                </Link>
                                <Link 
                                    to="/dashboard/my-reports" 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`transition-all duration-300 font-medium flex items-center space-x-3 px-4 py-3 rounded-xl transform hover:scale-105 ${
                                        isActiveRoute('/dashboard/my-reports')
                                            ? 'text-blue-600 bg-blue-50'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span>My Reports</span>
                                </Link>
                                <div className="px-4 py-3 border-t border-gray-200/50 pt-4">
                                    <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-100 mb-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600 font-medium">Welcome, {userName}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-red-600 hover:text-white rounded-xl transition-all duration-300 font-medium overflow-hidden group relative"
                                    >
                                        <span className="relative z-10">Logout</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </header>
            <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {children || <Outlet />}
            </main>
        </div>
    );
}