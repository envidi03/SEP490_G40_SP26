import Card from '../../../components/ui/Card';

/**
 * DentalRecordFilter
 * Thanh tìm kiếm + bộ lọc của trang DentalRecordList (1 hàng ngang)
 *
 * Props:
 *   inputValue, onInputChange
 *   statusFilter, onStatusChange
 *   treatmentFilter, onTreatmentChange
 *   sortOrder, onSortChange
 *   onClear  – xóa tất cả filter
 */
const DentalRecordFilter = ({
    inputValue, onInputChange,
    statusFilter, onStatusChange,
    treatmentFilter, onTreatmentChange,
    sortOrder, onSortChange,
    onClear,
}) => {
    const hasFilter = inputValue || statusFilter || treatmentFilter || sortOrder;

    return (
        <Card>
            <div className="flex flex-wrap gap-3 items-center">
                {/* Search */}
                <input
                    type="text"
                    placeholder="Tìm theo tên hồ sơ, tên bác sĩ, vị trí răng..."
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />

                {/* filter_dental_record */}
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                    <option value="">Trạng thái hồ sơ</option>
                    <option value="IN_PROGRESS">Đang điều trị</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                </select>

                {/* filter_treatment */}
                <select
                    value={treatmentFilter}
                    onChange={(e) => onTreatmentChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                    <option value="">Trạng thái phiếu</option>
                    <option value="PENDING">Chờ phê duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                </select>

                {/* sort by start_date */}
                <select
                    value={sortOrder}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                    <option value="">Sắp xếp ngày bắt đầu</option>
                    <option value="asc">Cũ nhất trước</option>
                    <option value="desc">Mới nhất trước</option>
                </select>

                {hasFilter && (
                    <button
                        onClick={onClear}
                        className="text-sm text-red-500 hover:text-red-700 underline whitespace-nowrap"
                    >
                        Xóa lọc
                    </button>
                )}
            </div>
        </Card>
    );
};

export default DentalRecordFilter;
