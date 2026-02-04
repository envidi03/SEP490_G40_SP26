import React from 'react';
import PharmacyTopNav from './PharmacyTopNav';

const PharmacyLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50/50 font-sans selection:bg-teal-100 selection:text-teal-900">
            {/* Top Navigation */}
            <PharmacyTopNav />

            {/* Main Content Area */}
            <main className="max-w-[1600px] mx-auto p-6 md:p-8 animate-fade-in">
                {children}
            </main>
        </div>
    );
};

export default PharmacyLayout;
