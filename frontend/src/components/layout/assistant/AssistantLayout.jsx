import React from 'react';
import AssistantSidebar from './AssistantSidebar';
import NotificationBell from '../../features/notifications/NotificationBell';

const AssistantLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#F0F2F5] relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Ambient Background Accents */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-200/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />

            {/* Sidebar */}
            <AssistantSidebar />

            {/* Main Content Area */}
            <main className="ml-80 mr-4 py-4 min-h-screen relative z-10 flex flex-col">
                {/* Floating Header */}
                <header className="mb-6 flex items-center justify-end">
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm p-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/70">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AssistantLayout;
