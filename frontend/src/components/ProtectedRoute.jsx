import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-blue-400">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium">Verifying Access...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required and user's role isn't matched
  if (allowedRoles && !allowedRoles.includes(role) && role !== 'admin') {
    // Admin always has access. If regular user fails role check:
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8">
        <div className="bg-[#111] border border-red-500/20 p-8 rounded-xl max-w-md text-center">
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 text-sm mb-6">
            Your current role ({role}) does not have permission to view this portal.
          </p>
          <a href="/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            Return to Login
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
