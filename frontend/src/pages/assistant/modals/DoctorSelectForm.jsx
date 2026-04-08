import { User } from 'lucide-react';
import { useState } from 'react';

const DoctorSelectForm = ({ treatment, doctors, onSelect }) => {
    // Chỉ lấy giá trị khởi tạo 1 lần duy nhất từ treatment, bỏ hẳn useEffect
    const [selectedDoctor, setSelectedDoctor] = useState(treatment?.doctor_id || '');

    const handleChange = (e) => {
        const value = e.target.value;
        setSelectedDoctor(value);
        if (onSelect) {
            onSelect(value);
        }
    };

    return (
        <div className="w-full">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                <User size={16} className="text-indigo-600" />
                Phân công y bác sĩ:
            </label>
            <select
                value={selectedDoctor}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all"
            >
                <option value="" disabled>-- Hãy chọn bác sĩ --</option>
                {doctors?.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                        BS. {doctor.profile?.full_name || doctor.name}
                    </option>
                ))}
            </select>
            {!selectedDoctor && (
                <p className="text-red-500 text-xs mt-2">
                    Vui lòng chọn một bác sĩ để phụ trách phiếu điều trị này.
                </p>
            )}
        </div>
    );
};

export default DoctorSelectForm;