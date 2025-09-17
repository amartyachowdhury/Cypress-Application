import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api.js';
import { STORAGE_KEYS } from '../constants/index.js';

const AdminRoute = ({ children }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        await adminAPI.verify();
        setIsAdmin(true);
      } catch (err) {
        console.error('Admin verification failed:', err);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Verifying admin access...</div>
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/admin/login" replace />;
};

export default AdminRoute;
