import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';

// Public pages
import HomePage from '../pages/home_page/HomePage';

// Auth pages
import Login from '../pages/auth/Login';

// Dashboard pages (already created by user)
import AdminClinicDashboard from '../pages/dashboard/AdminClinicDashboard';
import DoctorDashboard from '../pages/dashboard/DoctorDashboard';
import ReceptionistDashboard from '../pages/dashboard/ReceptionistDashboard';

import DoctorPatientList from "../pages/patients/DoctorPatientList"

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Dashboard Route - role-based
const DashboardRoute = () => {
    const { user } = useAuth();

    // Render dashboard based on role
    if (user?.role === 'Admin') {
        return <AdminClinicDashboard />;
    } else if (user?.role === 'Doctor') {
        return <DoctorDashboard />;
    } else if (user?.role === 'Receptionist') {
        return <ReceptionistDashboard />;
    }

    // Default fallback
    return <AdminClinicDashboard />;
};

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                {/* The root path "/" is now public, so this redirect is removed */}
                {/* <Route path="/" element={
                    <ProtectedRoute>
                        <Navigate to="/dashboard" replace />
                    </ProtectedRoute>
                } /> */}

                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <DashboardRoute />
                        </DashboardLayout>
                    </ProtectedRoute>
                } />

                {/* Placeholder routes for Sprint 1 - will implement later */}
                <Route path="/patients" element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <DoctorPatientList />
                        </DashboardLayout>
                    </ProtectedRoute>
                } />

                <Route path="/appointments" element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <div className="text-center py-12">
                                <h2 className="text-2xl font-bold text-gray-900">Quản lý Lịch hẹn</h2>
                                <p className="text-gray-600 mt-2">Tính năng đang được phát triển...</p>
                            </div>
                        </DashboardLayout>
                    </ProtectedRoute>
                } />

                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
