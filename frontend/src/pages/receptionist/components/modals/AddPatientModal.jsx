import React, { useState } from 'react';
import { X, Save, UserPlus, Loader2 } from 'lucide-react';
import patientService from '../../../../services/patientService';
import Toast from '../../../../components/ui/Toast';

const AddPatientModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await patientService.createPatient(formData);
            setToast({ show: true, message: 'Đăng ký bệnh nhân thành công!', type: 'success' });

            if (onSave) {
                onSave(response.data?.data || response.data);
            }

            // Reset form
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                dob: '',
                gender: '',
                address: ''
            });

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error creating patient:', error);
            setToast({
                show: true,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký bệnh nhân.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Optional light backdrop or blur if needed, or completely remove background */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <UserPlus className="text-primary-600" />
                            Thêm Bệnh Nhân Mới
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Đăng ký hồ sơ bệnh nhân mới vào hệ thống</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Create Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                                Thông tin cá nhân
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngày sinh <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giới tính
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                                Thông tin liên hệ
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="0901234567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                                Địa chỉ
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ chi tiết
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Nhập địa chỉ đầy đủ"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                        </button>
                    </div>
                </form>

                <Toast
                    show={toast.show}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            </div>
        </div>
    );
};

export default AddPatientModal;
