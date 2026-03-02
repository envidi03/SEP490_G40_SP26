import React from 'react';
import { X, Calendar, User, FileText, Clock } from 'lucide-react';
import RecordForm from './RecordForm';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

const CreateRecordModal = ({ isOpen, onClose, appointment, onSubmit, isSubmitting }) => {
    if (!isOpen || !appointment) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Tạo Hồ Sơ Nha Khoa</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Left Column: Appointment Details */}
                    <div className="w-full md:w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-blue-600" />
                            Thông tin lịch hẹn
                        </h3>

                        <div className="space-y-4">
                            <Card className="shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <User size={18} className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Bệnh nhân</p>
                                            <p className="font-medium text-gray-900">{appointment.patientName}</p>
                                            <p className="text-sm text-gray-600">{appointment.patientPhone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar size={18} className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Ngày khám</p>
                                            <p className="font-medium text-gray-900">{appointment.date}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Clock size={18} className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Giờ khám</p>
                                            <p className="font-medium text-gray-900">{appointment.time}</p>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-gray-100">
                                        <p className="text-sm text-gray-500 mb-1">Lý do khám:</p>
                                        <p className="text-gray-900 bg-white p-2 rounded border border-gray-200 text-sm">
                                            {appointment.reason}
                                        </p>
                                    </div>

                                    <div className="pt-2">
                                        <p className="text-sm text-gray-500 mb-1">Trạng thái:</p>
                                        <Badge variant={appointment.status === 'Completed' ? 'success' : 'default'}>
                                            {appointment.status}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>

                            {/* Additional Context or History could go here */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <p className="text-sm text-blue-800">
                                    <strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ thông tin trước khi lưu hồ sơ. Hồ sơ sau khi tạo sẽ được lưu vào hệ thống.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Record Form */}
                    <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-white">
                        <RecordForm
                            onSubmit={onSubmit}
                            onCancel={onClose}
                            isSubmitting={isSubmitting}
                            initialData={{
                                diagnosis: appointment.reason // Pre-fill diagnosis with reason as a starting point
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRecordModal;
