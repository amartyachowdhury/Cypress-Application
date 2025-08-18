import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import NotificationToast from './components/NotificationToast';
import './App.css';

// Auth utility
import { isAuthenticated } from './utils/auth';

// Components
import DashboardLayout from './layouts/DashboardLayout';
import SubmitReport from './pages/SubmitReport';
import MyReports from './pages/MyReports';

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

// Dashboard Home Component
const DashboardHome = () => (
  <div className="max-w-6xl mx-auto">
    {/* Hero Section */}
    <div className="text-center mb-12">
      <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Welcome back! Ready to make a difference?
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
        Welcome to Cypress Community Hub
      </h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Help make our community better by reporting issues and tracking their progress. 
        Every report you submit brings us one step closer to a better neighborhood.
      </p>
    </div>
    
    {/* Quick Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Reports This Month</p>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-gray-500 text-sm font-medium">Connect to see data</p>
          </div>
          <div className="text-3xl text-blue-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Resolved Issues</p>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-gray-500 text-sm font-medium">Connect to see data</p>
          </div>
          <div className="text-3xl text-green-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Active Reports</p>
            <p className="text-3xl font-bold text-gray-900">-</p>
            <p className="text-gray-500 text-sm font-medium">Connect to see data</p>
          </div>
          <div className="text-3xl text-orange-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    {/* Main Action Cards */}
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-gray-900">Submit a Report</h2>
            <p className="text-gray-600">Report community issues</p>
          </div>
        </div>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Report community issues like potholes, street lights, safety concerns, or any other problems 
          that need attention. Your reports help us identify and fix issues quickly.
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Quick and easy submission process
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Real-time status updates
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Photo attachments supported
          </div>
        </div>
        <Link 
          to="/dashboard/submit-report"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Submit Report
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-gray-900">View My Reports</h2>
            <p className="text-gray-600">Track your submissions</p>
          </div>
        </div>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Track the status of your submitted reports and see updates in real-time. 
          Get notified when issues are resolved and see the impact of your contributions.
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Real-time status tracking
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Progress notifications
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Edit or update reports
          </div>
        </div>
        <Link 
          to="/dashboard/my-reports"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          View Reports
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
    
    {/* Recent Activity */}
    <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Community Activity</h2>
        <span className="text-sm text-gray-500">Last 7 days</span>
      </div>
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
        <p className="text-gray-600 mb-6">Community activity will appear here when reports are submitted and updated.</p>
        <Link
          to="/dashboard/submit-report"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Submit Your First Report
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  </div>
);

// Notification Toasts Component
const NotificationToasts = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
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
  console.log('App component rendering, isAuthenticated:', isAuthenticated());
  
  return (
    <NotificationProvider>
      <div className="App">
        <NotificationToasts />
        
        <Routes>
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={
            isAuthenticated() ? (
              <DashboardLayout>
                <DashboardHome />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          <Route path="/dashboard/submit-report" element={
            isAuthenticated() ? (
              <DashboardLayout>
                <SubmitReport />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          <Route path="/dashboard/my-reports" element={
            isAuthenticated() ? (
              <DashboardLayout>
                <MyReports />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          <Route path="/login" element={<TestLogin />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </NotificationProvider>
  );
}

export default App;