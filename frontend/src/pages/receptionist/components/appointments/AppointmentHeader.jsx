import { RefreshCw } from 'lucide-react';

const AppointmentHeader = ({ loading, onRefresh }) => {
    return (
        <div className="mb-6 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản Lý Lịch Hẹn</h1>
                <p className="text-gray-600 mt-1">Đặt lịch và theo dõi cuộc hẹn</p>
            </div>
            <button
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
            >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Tải lại
            </button>
        </div>
    );
};

export default AppointmentHeader;
