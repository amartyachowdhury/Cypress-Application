import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize socket connection with error handling
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const newSocket = io('http://localhost:5050', {
                    timeout: 5000, // 5 second timeout
                    forceNew: true
                });
                
                setSocket(newSocket);

                // Socket event listeners
                newSocket.on('connect', () => {
                    console.log('Connected to notification server');
                    setIsConnected(true);
                    
                    // Authenticate with user ID
                    const userId = localStorage.getItem('userId');
                    if (userId) {
                        newSocket.emit('authenticate', userId);
                    }
                });

                newSocket.on('disconnect', () => {
                    console.log('Disconnected from notification server');
                    setIsConnected(false);
                });

                newSocket.on('notification', (notification) => {
                    console.log('Received notification:', notification);
                    addNotification(notification);
                });

                newSocket.on('connect_error', (error) => {
                    console.warn('Socket connection error:', error);
                    setIsConnected(false);
                });

                return () => {
                    if (newSocket) {
                        newSocket.close();
                    }
                };
            } catch (error) {
                console.warn('Failed to initialize socket connection:', error);
                // Don't crash the app if socket fails
            }
        }
    }, []);

    const addNotification = (notification) => {
        const newNotification = {
            id: Date.now(),
            ...notification,
            timestamp: notification.timestamp || new Date().toISOString()
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            removeNotification(newNotification.id);
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const getUnreadCount = () => {
        return notifications.filter(notification => !notification.read).length;
    };

    const markAsRead = (id) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === id 
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    const value = {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        getUnreadCount,
        markAsRead,
        markAllAsRead,
        isConnected
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
