import React from 'react';
import AssistantSidebar from './AssistantSidebar';
import { Bell, Search } from 'lucide-react';

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
                <header className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/50 shadow-sm w-full max-w-xl transition-all duration-300 focus-within:bg-white focus-within:shadow-md focus-within:border-white/80">
                        <Search className="text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm lịch hẹn, bệnh nhân..."
                            className="bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 w-full text-sm font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-sm text-gray-500 hover:text-blue-600 hover:bg-white transition-all duration-200 group">
                            <Bell size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        </button>
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
