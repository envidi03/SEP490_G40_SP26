import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = 2; // Mock unread count

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 rounded-2xl transition-all duration-300 relative group ${
                    isOpen 
                    ? 'bg-primary-50 text-primary-600 shadow-inner' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
            >
                <Bell 
                    size={22} 
                    className={`transition-transform duration-300 ${isOpen ? 'scale-110' : 'group-hover:rotate-12'}`} 
                />
                
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white font-bold items-center justify-center">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <NotificationDropdown onClose={() => setIsOpen(false)} />
            )}
        </div>
    );
};

export default NotificationBell;
