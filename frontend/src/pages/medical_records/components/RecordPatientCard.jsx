const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const InfoRow = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 font-medium">{value || '—'}</p>
    </div>
);

/**
 * RecordPatientCard
 * Hiển thị thông tin bệnh nhân (snapshot khi tạo hồ sơ + data patient_id nếu có)
 * Props: record
 */
const RecordPatientCard = ({ record }) => {
    const patient = record.patient_id && typeof record.patient_id === 'object'
        ? record.patient_id
        : null;

    const genderLabel =
        patient?.gender === 'MALE' ? 'Nam' :
            patient?.gender === 'FEMALE' ? 'Nữ' :
                patient?.gender ? patient.gender : null;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 h-full">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide pb-3 border-b border-gray-50 mb-4">
                Thông tin bệnh nhân
            </h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <InfoRow label="Họ và tên" value={record.full_name} />
                </div>
                <InfoRow label="Số điện thoại" value={record.phone} />
                {patient?.email && <InfoRow label="Email" value={patient.email} />}
                {genderLabel && <InfoRow label="Giới tính" value={genderLabel} />}
                {patient?.dob && <InfoRow label="Ngày sinh" value={formatDate(patient.dob)} />}
            </div>
        </div>
    );
};

export default RecordPatientCard;
