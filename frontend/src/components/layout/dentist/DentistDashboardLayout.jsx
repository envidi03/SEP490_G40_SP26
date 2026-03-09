import React from 'react';
import DentistSidebar from './DentistSidebar';
import DashboardHeader from '../DashboardHeader';

const DentistDashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <DentistSidebar />
            <div className="flex-1 md:ml-64 flex flex-col min-h-0 bg-slate-50/50">
                <DashboardHeader />
                <main className="flex-1 p-6 md:p-8 pt-20 md:pt-24 mt-2 mb-8 mx-0 w-full transition-all">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DentistDashboardLayout;
