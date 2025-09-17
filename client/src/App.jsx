import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  NotificationProvider,
  useNotifications,
} from './utils/NotificationContext';
import NotificationToast from './components/ui/NotificationToast';
import './App.css';

// Components
import Register from './pages/Register';
import Verify from './pages/Verify';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardMap from './components/ui/DashboardMap';
import SubmitReport from './pages/SubmitReport';
import MyReports from './pages/MyReports';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './pages/AdminRoute';
import { STORAGE_KEYS, ROUTES } from './utils/constants.js';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    console.log('Protected route - token check:', !!token);

    if (!token) {
      console.log('No token found, redirecting to login');
      navigate(ROUTES.LOGIN, { replace: true });
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

// Notification Toasts Component
const NotificationToasts = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

function App() {
  console.log('App rendering');

  return (
    <NotificationProvider>
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
                    <Route path="submit-report" element={<SubmitReport />} />
                    <Route path="my-reports" element={<MyReports />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
        <NotificationToasts />
      </div>
    </NotificationProvider>
  );
}

export default App;
