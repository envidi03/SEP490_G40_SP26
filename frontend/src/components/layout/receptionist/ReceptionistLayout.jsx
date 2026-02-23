import React from 'react';
import ReceptionistSidebar from './ReceptionistSidebar';
import { Bell, Search, Calendar, ChevronDown } from 'lucide-react';

const ReceptionistLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#F5F8F9] relative overflow-hidden font-sans selection:bg-teal-100 selection:text-teal-900">
            {/* Ambient Background Accents */}
            <div className="fixed top-[-10%] left-[-5%] w-[30%] h-[30%] bg-teal-200/30 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />
            <div className="fixed bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-emerald-100/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />
            <div className="fixed top-[20%] right-[20%] w-[20%] h-[20%] bg-cyan-100/30 rounded-full blur-[80px] mix-blend-multiply pointer-events-none" />

            {/* Sidebar */}
            <ReceptionistSidebar />

            {/* Main Content Area */}
            <main className="ml-80 mr-6 py-5 min-h-screen relative z-10 flex flex-col">
                {/* Floating Header */}
                <header className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4 bg-white/70 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/60 shadow-sm w-full max-w-lg transition-all duration-300 focus-within:bg-white focus-within:shadow-md focus-within:border-teal-100 focus-within:ring-2 focus-within:ring-teal-50">
                        <Search className="text-teal-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bệnh nhân, lịch hẹn..."
                            className="bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 w-full text-sm font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/60 shadow-sm text-sm font-medium text-gray-600">
                            <Calendar size={18} className="text-teal-500" />
                            <span>{new Date().toLocaleDateString('vi-VN')}</span>
                        </div>

                        <button className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm text-gray-500 hover:text-teal-600 hover:bg-white transition-all duration-200 group">
                            <Bell size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="absolute top-3 right-3.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-sm p-8 transition-all duration-300 hover:bg-white/70 hover:shadow-[0_8px_30px_rgba(0,128,128,0.03)]">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default ReceptionistLayout;
