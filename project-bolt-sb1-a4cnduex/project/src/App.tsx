import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDonations from './pages/admin/ManageDonations';
import ManageRequests from './pages/admin/ManageRequests';
import ManageStock from './pages/admin/ManageStock';
import ManageSupplies from './pages/admin/ManageSupplies';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/donations" 
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageDonations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/requests" 
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/stock" 
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageStock />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/supplies" 
            element={
              <ProtectedRoute allowedRole="admin">
                <ManageSupplies />
              </ProtectedRoute>
            } 
          />
          
          {/* User Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRole="user">
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;