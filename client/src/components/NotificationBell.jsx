import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationBell = () => {
    const { notifications, getUnreadCount, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = getUnreadCount();

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            default:
                return 'ℹ️';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const handleNotificationClick = (notification) => {
        if (notification.reportId) {
            window.location.href = `/dashboard/my-reports`;
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Enhanced Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 transform hover:scale-105 group"
            >
                <BellIcon className="w-6 h-6" />
                
                {/* Enhanced Notification Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-blue-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Enhanced Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transform transition-all duration-300 ease-out">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BellIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">No notifications yet</p>
                                <p className="text-gray-400 text-sm mt-1">We'll notify you when there are updates</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`
                                            p-4 hover:bg-gray-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
                                            ${!notification.read ? 'bg-blue-50/50' : ''}
                                        `}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold text-gray-900">
                                                        {notification.title}
                                                    </h4>
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(notification.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                {notification.reportId && (
                                                    <div className="mt-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            View Report
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Enhanced Footer */}
                    {notifications.length > 0 && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default NotificationBell;
