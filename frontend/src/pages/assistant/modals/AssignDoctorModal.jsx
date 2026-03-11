import { X, User, ArrowRight, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

const AssignDoctorModal = ({ appointment, isOpen, onClose, onComplete, doctors }) => {
    const [selectedDoctor, setSelectedDoctor] = useState('');

    useEffect(() => {
        if (appointment) {
            setSelectedDoctor(appointment.doctor_id || '');
        }
    }, [appointment]);

    if (!isOpen || !appointment) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedDoctor) return;

        if (onComplete) {
            onComplete(appointment._id, { doctorId: selectedDoctor });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 flex flex-col overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Bắt Đầu Khám</h2>
                            <p className="text-sm text-gray-500">Gán bác sĩ & chuyển trạng thái</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 bg-white space-y-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">
                            Bệnh nhân: <span className="font-semibold text-gray-900">{appointment.full_name}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Dịch vụ: <span className="font-semibold text-gray-900">
                                {(appointment.book_service && appointment.book_service.length > 0)
                                    ? appointment.book_service.map(s => s.service_name || 'Khám chung').join(', ')
                                    : (appointment.reason || 'Khám chung')}
                            </span>
                        </p>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                            <User size={16} className="text-indigo-600" />
                            Phân công y bác sĩ:
                        </label>
                        <select
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="" disabled>-- Hãy chọn bác sĩ --</option>
                            {doctors?.map(doctor => (
                                <option key={doctor._id} value={doctor._id}>
                                    BS. {doctor.profile?.full_name || doctor.name}
                                </option>
                            ))}
                        </select>
                        {!selectedDoctor && (
                            <p className="text-red-500 text-xs mt-2">Vui lòng chọn một bác sĩ để bắt đầu ca khám.</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                            Đóng
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedDoctor}
                            className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${selectedDoctor
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Bắt đầu khám
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignDoctorModal;
