const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const InfoRow = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 font-medium">{value || '—'}</p>
    </div>
);

/**
 * RecordInfoCard
 * Hiển thị thông tin hồ sơ nha khoa (bác sĩ, ngày, mô tả/chẩn đoán)
 * Props: record
 */
const RecordInfoCard = ({ record }) => {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 h-full">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 border-b border-gray-50 mb-4">
                Thông tin hồ sơ
            </h2>

            <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Bác sĩ phụ trách" value={record.created_by?.full_name} />
                <InfoRow label="Ngày tạo" value={formatDate(record.createdAt)} />
                <InfoRow label="Ngày bắt đầu" value={formatDate(record.start_date) || 'Chưa xác định'} />
                <InfoRow label="Ngày kết thúc" value={formatDate(record.end_date) || 'Chưa xác định'} />
            </div>

            {record.description && (
                <div className="mt-4 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Mô tả / Chẩn đoán</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{record.description}</p>
                </div>
            )}
        </div>
    );
};

export default RecordInfoCard;
