import React from 'react';
import { X, Phone, Mail, Calendar, Edit } from 'lucide-react';
import Badge from '../../../../components/ui/Badge';

/**
 * ViewPatientModal - Display patient details
 * Uses explicit props instead of full patient object (Interface Segregation Principle)
 * 
 * @param {Object} props
 * @param {string} props.patientId - Patient ID
 * @param {string} props.patientName - Patient name
 * @param {string} props.patientPhone - Patient phone
 * @param {string} props.patientEmail - Patient email
 * @param {string} props.patientDob - Patient date of birth
 * @param {string} props.patientGender - Patient gender
 * @param {string} props.patientAddress - Patient address
 * @param {string} props.patientStatus - Patient status (ACTIVE/INACTIVE)
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close modal callback
 */
const ViewPatientModal = ({
    patientId,
    patientName,
    patientPhone,
    patientEmail,
    patientDob,
    patientGender,
    patientAddress,
    patientStatus,
    isOpen,
    onClose
}) => {
    if (!isOpen || !patientName) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Thông Tin Bệnh Nhân</h2>
                        <p className="text-sm text-gray-500 mt-1">Chi tiết đầy đủ về bệnh nhân</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Patient Avatar & Name */}
                <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
                    <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                        <span className="text-primary-600 font-bold text-3xl">
                            {patientName.charAt(0)}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{patientName}</h3>
                        <p className="text-sm text-gray-500">ID: {patientId}</p>
                        <div className="mt-2">
                            <Badge variant={patientStatus === 'ACTIVE' ? 'success' : 'danger'}>
                                {patientStatus === 'ACTIVE' ? 'Hoạt động' : 'Ngưng hoạt động'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Patient Details */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                            Thông tin liên hệ
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <Phone size={16} className="text-gray-400 mr-2" />
                                    <label className="text-xs font-medium text-gray-600 uppercase">Số điện thoại</label>
                                </div>
                                <p className="text-gray-900 font-medium">{patientPhone}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <Mail size={16} className="text-gray-400 mr-2" />
                                    <label className="text-xs font-medium text-gray-600 uppercase">Email</label>
                                </div>
                                <p className="text-gray-900 font-medium">{patientEmail}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                            Thông tin cá nhân
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <Calendar size={16} className="text-gray-400 mr-2" />
                                    <label className="text-xs font-medium text-gray-600 uppercase">Ngày sinh</label>
                                </div>
                                <p className="text-gray-900 font-medium">{patientDob}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="text-xs font-medium text-gray-600 uppercase block mb-2">Giới tính</label>
                                <p className="text-gray-900 font-medium">{patientGender || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                            Địa chỉ
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-900">{patientAddress || 'Chưa cập nhật địa chỉ'}</p>
                        </div>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Đóng
                    </button>
                    <button className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors flex items-center gap-2">
                        <Edit size={18} />
                        Chỉnh sửa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewPatientModal;
