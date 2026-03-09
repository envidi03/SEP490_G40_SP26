const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * PatientCard
 * Hiển thị 1 bệnh nhân trong danh sách tìm kiếm
 * Props: patient { patient_id, full_name, phone, email, dob }, isSelected, onSelect
 */
const PatientCard = ({ patient, isSelected, onSelect }) => (
    <button
        onClick={() => onSelect(patient)}
        className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${isSelected
                ? 'border-teal-400 bg-teal-50 shadow-sm'
                : 'border-gray-100 bg-white hover:border-teal-200 hover:bg-teal-50/40'
            }`}
    >
        <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{patient.full_name}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                    {patient.phone && <span>SĐT: {patient.phone}</span>}
                    {patient.email && <span>{patient.email}</span>}
                    {patient.dob && <span>NS: {formatDate(patient.dob)}</span>}
                </div>
            </div>
            {isSelected && (
                <span className="shrink-0 text-xs text-teal-600 font-medium pt-0.5">Đã chọn</span>
            )}
        </div>
    </button>
);

export default PatientCard;
