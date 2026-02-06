import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import clinicService from '../../../services/clinicService';
import Toast from '../../../components/ui/Toast';
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    Clock,
    FileText,
    Award,
    Edit2,
    Save,
    X,
    Image as ImageIcon,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

/**
 * ClinicInfo - Trang quản lý thông tin phòng khám
 * 
 * Chức năng:
 * - Xem thông tin phòng khám
 * - Cập nhật thông tin phòng khám
 * 
 * @component
 */
const ClinicInfo = () => {
    const navigate = useNavigate();
    const { clinicId } = useParams(); // Get clinicId from URL
    const { user } = useAuth();

    // ========== STATE ==========
    const [clinicData, setClinicData] = useState(null);
    const [formData, setFormData] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // ========== EFFECTS ==========
    useEffect(() => {
        const fetchClinicData = async () => {
            // Use clinicId from URL params
            if (!clinicId) {
                setError('Không xác định được ID phòng khám từ URL.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await clinicService.getClinicDetail(clinicId);

                if (response && response.data) {
                    setClinicData(response.data);
                    setFormData(response.data);
                } else {
                    setError('Không thể tải dữ liệu phòng khám');
                }
            } catch (err) {
                console.error('Error fetching clinic info:', err);
                setError(err.message || 'Lỗi khi tải thông tin phòng khám');
            } finally {
                setLoading(false);
            }
        };

        fetchClinicData();
    }, [clinicId]); // Re-fetch if clinicId changes

    // ========== HANDLERS ==========

    /**
     * Handler: Bật chế độ chỉnh sửa
     */
    const handleEdit = () => {
        setIsEditMode(true);
    };

    /**
     * Handler: Hủy chỉnh sửa
     */
    const handleCancel = () => {
        setFormData(clinicData);
        setIsEditMode(false);
    };

    /**
     * Handler: Thay đổi form data
     */
    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    /**
     * Handler: Lưu thông tin
     */
    const handleSave = async () => {
        // Use ID from loaded data if user.clinic_id is missing
        const targetClinicId = user?.clinic_id || clinicData?._id || clinicData?.id;

        if (!targetClinicId) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Không xác định được ID phòng khám để cập nhật'
            });
            return;
        }

        try {
            setLoading(true);
            const response = await clinicService.updateClinic(targetClinicId, formData);

            // Backend returns: { success: true, statusCode: 200, message: "...", data: updatedClinicObj }
            // api.js interceptor unwraps response.data, so we get the whole object
            if (response && response.data) {
                setClinicData(response.data);
                setFormData(response.data); // Update form data with confirmed server data
                setIsEditMode(false);
                setToast({
                    show: true,
                    type: 'success',
                    message: '✅ Cập nhật thông tin phòng khám thành công!'
                });
            } else {
                setToast({
                    show: true,
                    type: 'error',
                    message: '❌ Cập nhật thất bại: Không có dữ liệu trả về'
                });
            }
        } catch (err) {
            console.error('Error updating clinic:', err);
            setToast({
                show: true,
                type: 'error',
                message: `❌ ${err.message || 'Lỗi khi cập nhật thông tin'} `
            });
        } finally {
            setLoading(false);
        }
    };

    // ========== RENDER ==========

    if (loading && !clinicData) {
        return (
            <div className="p-6 flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center h-96">
                <div className="text-center bg-red-50 p-8 rounded-2xl border border-red-100">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-red-700 mb-2">Đã xảy ra lỗi</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!clinicData) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Building2 className="text-blue-600" size={40} />
                            Thông tin Phòng khám
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Quản lý thông tin phòng khám nha khoa
                        </p>
                    </div>

                    {/* Action Buttons */}
                    {!isEditMode ? (
                        <button
                            onClick={handleEdit}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Edit2 size={20} />
                            <span>Chỉnh sửa</span>
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
                            >
                                <X size={20} />
                                <span>Hủy</span>
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <Save size={20} />
                                )}
                                <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Status Banner */}
                <div className={`rounded - 2xl p - 4 mb - 6 flex items - center gap - 3 ${formData.status === 'ACTIVE'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    } `}>
                    {formData.status === 'ACTIVE' ? (
                        <>
                            <CheckCircle className="text-green-600" size={24} />
                            <span className="text-green-800 font-semibold">Phòng khám đang hoạt động</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="text-red-600" size={24} />
                            <span className="text-red-800 font-semibold">Phòng khám tạm ngừng hoạt động</span>
                        </>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Basic Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Clinic Name & Logo */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Building2 className="text-blue-600" size={24} />
                                Thông tin cơ bản
                            </h2>

                            <div className="space-y-6">
                                {/* Clinic Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tên phòng khám <span className="text-red-500">*</span>
                                    </label>
                                    {isEditMode ? (
                                        <input
                                            type="text"
                                            value={formData.clinic_name || ''}
                                            onChange={(e) => handleChange('clinic_name', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Tên phòng khám"
                                        />
                                    ) : (
                                        <p className="text-2xl font-bold text-gray-900">{formData.clinic_name}</p>
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <MapPin size={16} className="text-blue-600" />
                                        Địa chỉ <span className="text-red-500">*</span>
                                    </label>
                                    {isEditMode ? (
                                        <textarea
                                            value={formData.clinic_address || ''}
                                            onChange={(e) => handleChange('clinic_address', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="Địa chỉ phòng khám"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{formData.clinic_address}</p>
                                    )}
                                </div>

                                {/* Coordinates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Vĩ độ (Latitude)
                                        </label>
                                        {isEditMode ? (
                                            <input
                                                type="text"
                                                value={formData.latitude || ''}
                                                onChange={(e) => handleChange('latitude', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="10.7769"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium font-mono">{formData.latitude}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Kinh độ (Longitude)
                                        </label>
                                        {isEditMode ? (
                                            <input
                                                type="text"
                                                value={formData.longitude || ''}
                                                onChange={(e) => handleChange('longitude', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="106.7009"
                                            />
                                        ) : (
                                            <p className="text-gray-900 font-medium font-mono">{formData.longitude}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Phone className="text-green-600" size={24} />
                                Thông tin liên hệ
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Phone size={16} className="text-green-600" />
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    {isEditMode ? (
                                        <input
                                            type="tel"
                                            value={formData.phone || ''}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="028-3822-1234"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{formData.phone}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Mail size={16} className="text-purple-600" />
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    {isEditMode ? (
                                        <input
                                            type="email"
                                            value={formData.email || ''}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="contact@dcms.vn"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{formData.email}</p>
                                    )}
                                </div>

                                {/* Working Hours */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Clock size={16} className="text-orange-600" />
                                        Giờ làm việc <span className="text-red-500">*</span>
                                    </label>
                                    {isEditMode ? (
                                        <input
                                            type="text"
                                            value={formData.working_house || ''} // Backend uses working_house
                                            onChange={(e) => handleChange('working_house', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="T2-T7: 8:00-20:00, CN: 8:00-17:00"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{formData.working_house}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Legal Information */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Award className="text-yellow-600" size={24} />
                                Thông tin pháp lý
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Tax Code */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <FileText size={16} className="text-indigo-600" />
                                        Mã số thuế <span className="text-red-500">*</span>
                                    </label>
                                    {isEditMode ? (
                                        <input
                                            type="text"
                                            value={formData.tax_code || ''}
                                            onChange={(e) => handleChange('tax_code', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="0123456789"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium font-mono">{formData.tax_code}</p>
                                    )}
                                </div>

                                {/* License Number */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Award size={16} className="text-yellow-600" />
                                        Số giấy phép <span className="text-red-500">*</span>
                                    </label>
                                    {isEditMode ? (
                                        <input
                                            type="text"
                                            value={formData.license_number || ''}
                                            onChange={(e) => handleChange('license_number', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="BYT-Q1-2020-001"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium font-mono">{formData.license_number}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Logo & Status */}
                    <div className="space-y-6">
                        {/* Logo */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ImageIcon className="text-pink-600" size={20} />
                                Logo phòng khám
                            </h3>
                            <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                                {formData.logo ? (
                                    <img
                                        src={formData.logo}
                                        alt="Clinic Logo"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div class="flex flex-col items-center justify-center h-full"><ImageIcon class="text-gray-400" size="64" /><p class="text-gray-500 mt-4">No Logo</p></div>';
                                        }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Building2 className="text-gray-400" size={64} />
                                        <p className="text-gray-500 mt-4 font-medium">Chưa có logo</p>
                                    </div>
                                )}
                            </div>
                            {isEditMode && (
                                <button className="w-full px-4 py-3 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-all duration-200">
                                    Tải lên logo mới
                                </button>
                            )}
                        </div>

                        {/* Status Control */}
                        {isEditMode && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Trạng thái hoạt động
                                </h3>
                                <select
                                    value={formData.status || 'ACTIVE'}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                >
                                    <option value="ACTIVE">Đang hoạt động</option>
                                    <option value="INACTIVE">Tạm ngừng</option>
                                </select>
                            </div>
                        )}

                        {/* Quick Info */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-bold mb-4">Thông tin nhanh</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Building2 size={20} />
                                    <span className="text-sm">ID: {formData._id || formData.id || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={20} />
                                    <span className="text-sm">
                                        {formData.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngừng'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                    duration={3000}
                />
            )}
        </div>
    );
};

export default ClinicInfo;

