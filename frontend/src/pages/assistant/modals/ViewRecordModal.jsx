import { X, FileText, User, Phone, Calendar, Stethoscope, Pill, ClipboardList } from 'lucide-react';

const ViewRecordModal = ({ record, isOpen, onClose }) => {
    if (!isOpen || !record) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Hồ Sơ Bệnh Án</h2>
                            <p className="text-sm text-gray-500">Chi tiết khám bệnh</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Patient Information */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-blue-600 rounded"></div>
                        Thông Tin Bệnh Nhân
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-blue-700 mb-1">
                                <User size={16} />
                                <span className="text-sm font-medium">Họ và tên</span>
                            </div>
                            <p className="text-blue-900 font-semibold">{record.patientName}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-blue-700 mb-1">
                                <Phone size={16} />
                                <span className="text-sm font-medium">Số điện thoại</span>
                            </div>
                            <p className="text-blue-900 font-semibold">{record.patientPhone}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-blue-700 mb-1">
                                <Calendar size={16} />
                                <span className="text-sm font-medium">Ngày khám</span>
                            </div>
                            <p className="text-blue-900 font-semibold">{record.date}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-blue-700 mb-1">
                                <Stethoscope size={16} />
                                <span className="text-sm font-medium">Bác sĩ điều trị</span>
                            </div>
                            <p className="text-blue-900 font-semibold">{record.doctorName}</p>
                        </div>
                    </div>
                </div>

                {/* Diagnosis */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-green-600 rounded"></div>
                        Chẩn Đoán
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">
                            {record.diagnosis || 'Chưa có thông tin chẩn đoán'}
                        </p>
                    </div>
                </div>

                {/* Treatment */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-purple-600 rounded"></div>
                        Điều Trị
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">
                            {record.treatment || 'Chưa có thông tin điều trị'}
                        </p>
                    </div>
                </div>

                {/* Prescription */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-orange-600 rounded"></div>
                        <Pill size={18} />
                        Đơn Thuốc
                    </h3>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <p className="text-gray-900 whitespace-pre-wrap">
                            {record.prescription || 'Không có đơn thuốc'}
                        </p>
                    </div>
                </div>

                {/* Notes */}
                {record.notes && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <div className="w-1 h-5 bg-gray-600 rounded"></div>
                            <ClipboardList size={18} />
                            Ghi Chú
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-900 whitespace-pre-wrap">{record.notes}</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewRecordModal;
