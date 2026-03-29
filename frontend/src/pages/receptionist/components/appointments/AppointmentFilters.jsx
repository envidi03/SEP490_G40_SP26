import { Plus } from 'lucide-react';
import Card from '../../../../components/ui/Card';

const AppointmentFilters = ({
    selectedDate,
    setSelectedDate,
    filterStatus,
    setFilterStatus,
    onBookNew
}) => {
    return (
        <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Date Filter */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn ngày
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái
                    </label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">Tất cả</option>
                        <option value="SCHEDULED">Chờ khám</option>
                        <option value="CHECKED_IN">Đã đến</option>
                        <option value="IN_CONSULTATION">Đang khám</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>

                {/* Add Button */}
                <div className="flex items-end">
                    <button
                        onClick={onBookNew}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Đặt lịch mới
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default AppointmentFilters;
