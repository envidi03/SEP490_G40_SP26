import React, { useState } from 'react';
import { X, Activity, ArrowRight } from 'lucide-react';
import DoctorSelectForm from './DoctorSelectForm';

const StartTreatmentModal = ({ isOpen, onClose, onComplete, treatment, doctors }) => {
    // Lưu ID bác sĩ được chọn từ form
    const [selectedDoctor, setSelectedDoctor] = useState(treatment?.doctor_id || '');

    if (!isOpen || !treatment) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedDoctor) return;
        if (onComplete) {
            onComplete(treatment._id, { doctorId: selectedDoctor });
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Lớp nền mờ */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            {/* Khung Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-blue-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Bắt Đầu Điều Trị</h2>
                            <p className="text-sm text-gray-500">Phân công bác sĩ phụ trách</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-gray-200 bg-white rounded-lg transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 bg-white space-y-6">
                    
                    {/* GỌI FORM CHỌN BÁC SĨ TẠI ĐÂY */}
                    <DoctorSelectForm
                        key={treatment._id} // Giúp reset form mỗi khi đổi treatment
                        treatment={treatment}
                        doctors={doctors}
                        onSelect={(id) => setSelectedDoctor(id)}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                            Hủy
                        </button>
                        <button type="submit" disabled={!selectedDoctor} className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${selectedDoctor ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                            Bắt đầu <ArrowRight size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StartTreatmentModal;