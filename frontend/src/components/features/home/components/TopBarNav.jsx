import { Phone, Clock } from 'lucide-react';
const TopBarNav = () => {
    return (
        <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-9 text-xs">
                    <div className="flex items-center gap-4 text-gray-600">
                        <a href="tel:02812345678" className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
                            <Phone size={12} />
                            <span>(028) 1234 5678</span>
                        </a>
                        <span className="hidden md:flex items-center gap-1.5">
                            <Clock size={12} />
                            Giờ làm việc: T2-T7: 8:00-18:00
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBarNav;