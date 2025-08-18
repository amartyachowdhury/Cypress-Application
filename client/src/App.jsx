import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Auth utility
import { isAuthenticated } from './utils/auth';

// Components
import DashboardLayout from './layouts/DashboardLayout';
import SubmitReport from './pages/SubmitReport';

// Simple test components
const TestLogin = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Test</h1>
      <p className="text-gray-600">Login page is working!</p>
      <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => {
          localStorage.setItem('token', 'test-token');
          window.location.reload();
        }}
      >
        Simulate Login
      </button>
    </div>
  </div>
);

function App() {
  console.log('App component rendering, isAuthenticated:', isAuthenticated());
  
  return (
    <div className="App">
      <Routes>
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={
          (() => {
            console.log('Dashboard route matched, isAuthenticated:', isAuthenticated());
            return isAuthenticated() ? (
              <DashboardLayout>
                <SubmitReport />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            );
          })()
        } />
        
        <Route path="/login" element={<TestLogin />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;