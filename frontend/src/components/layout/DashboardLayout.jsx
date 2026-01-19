import React from 'react';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar role={user?.role} />
            <DashboardHeader />
            <main className="ml-64 pt-16">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
