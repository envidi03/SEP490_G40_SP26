import React from 'react';

const AssignDoctorModal = ({
    show,
    room,
    assignForm,
    setAssignForm,
    doctorsList,
    onClose,
    onSave
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                    <div className="relative bg-gradient-to-br from-purple-600 to-pink-700 text-white rounded-t-2xl p-6">
                        <h2 className="text-2xl font-bold">Gán bác sĩ</h2>
                        <p className="text-purple-100 mt-1">
                            Phòng {room?.room_number}
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Chọn bác sĩ <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={assignForm.doctor_id}
                                onChange={(e) => setAssignForm({ ...assignForm, doctor_id: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="">-- Chọn bác sĩ --</option>
                                {doctorsList.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Ngày bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={assignForm.working_start_Date}
                                onChange={(e) => setAssignForm({ ...assignForm, working_start_Date: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onSave}
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            Gán bác sĩ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignDoctorModal;
