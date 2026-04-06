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
    AlertCircle,
    ArrowLeft
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
    const [formErrors, setFormErrors] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageError, setImageError] = useState(false);
    const fileInputRef = React.useRef(null);

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
        setFormErrors({}); // Xóa lỗi khi hủy
    };

    /**
     * Handler: Thay đổi form data
     */
    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Xóa lỗi cho trường này khi người dùng thay đổi dữ liệu
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    /**
     * Handler: Thay đổi file logo
     */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validation for file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setToast({
                    show: true,
                    type: 'error',
                    message: 'File quá lớn. Vui lòng chọn file dưới 5MB.'
                });
                return;
            }

            // [VALIDATION] Check for allowed file formats (images)
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setToast({
                    show: true,
                    type: 'error',
                    message: 'Định dạng file không được hỗ trợ!'
                });
                // Reset input value to allow selecting the same file again (after fixing)
                e.target.value = null;
                return;
            }

            setSelectedFile(file);
            setImageError(false); // Reset error when new file is selected
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * Handler: Kích hoạt chọn file
     */
    const triggerFileInput = () => {
        fileInputRef.current.click();
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
                message: 'Không xác định được ID phòng khám để cập nhật'
            });
            return;
        }

        try {
            // ========== FRONTEND VALIDATION (INLINE ERRORS) ==========
            const errors = {};

            if (!formData.clinic_name?.trim()) errors.clinic_name = 'Tên phòng khám không được để trống';
            if (!formData.clinic_address?.trim()) errors.clinic_address = 'Địa chỉ không được để trống';
            if (!formData.phone?.trim()) errors.phone = 'Số điện thoại không được để trống';
            if (!formData.email?.trim()) errors.email = 'Email không được để trống';
            if (!formData.working_house?.trim()) errors.working_house = 'Giờ làm việc không được để trống';
            if (!formData.tax_code?.trim()) errors.tax_code = 'Mã số thuế không được để trống';
            if (!formData.license_number?.trim()) errors.license_number = 'Số giấy phép không được để trống';

            // Validate Phone format (10 digits starting with 0 or +84)
            const phoneRegex = /^(0|\+84)[0-9]{9}$/;
            if (formData.phone && !phoneRegex.test(formData.phone)) {
                errors.phone = 'Số điện thoại không hợp lệ (phải đủ 10 số bắt đầu bằng 0 hoặc +84)';
            }

            // Validate Email format
            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            if (formData.email && !emailRegex.test(formData.email)) {
                errors.email = 'Email không đúng định dạng';
            }

            // Validate Tax Code format (10-13 digits)
            const taxRegex = /^[0-9]{10,13}$/;
            if (formData.tax_code && !taxRegex.test(formData.tax_code)) {
                errors.tax_code = 'Mã số thuế không hợp lệ (phải từ 10 đến 13 chữ số)';
            }

            // Validate License Number format
            const licenseRegex = /^[A-Z0-9]{5,50}$/;
            if (formData.license_number && !licenseRegex.test(formData.license_number)) {
                errors.license_number = 'Số giấy phép không hợp lệ (5-50 ký tự in hoa và chữ số)';
            }

            // Nếu có lỗi, cập nhật state và dừng lại
            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                setToast({
                    show: true,
                    type: 'error',
                    message: 'Vui lòng kiểm tra lại các thông tin bị lỗi!'
                });
                return;
            }

            // [VALIDATION] Final check for file format before sending to server
            if (selectedFile) {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                if (!allowedTypes.includes(selectedFile.type)) {
                    setToast({
                        show: true,
                        type: 'error',
                        message: 'Định dạng file không được hỗ trợ!'
                    });
                    return;
                }
            }

            setLoading(true);

            // Sử dụng FormData để gửi cả text và file
            const data = new FormData();
            const allowedFields = [
                'clinic_name', 'clinic_address', 'phone', 'email',
                'working_house', 'tax_code', 'license_number',
                'latitude', 'longitude', 'status'
            ];

            allowedFields.forEach(key => {
                if (formData[key] !== undefined && formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });

            if (selectedFile) {
                data.append('logo', selectedFile);
            }

            const response = await clinicService.updateClinic(targetClinicId, data);
            const updatedData = response?.data || (response?.clinic_name ? response : null);

            if (updatedData) {
                setClinicData(updatedData);
                setFormData(updatedData);
                setSelectedFile(null);
                setPreviewUrl(null);
                setIsEditMode(false);
                setFormErrors({});

                setToast({
                    show: true,
                    type: 'success',
                    message: 'Cập nhật thông tin phòng khám thành công!'
                });
            } else {
                setIsEditMode(false);
                setToast({
                    show: true,
                    type: 'success',
                    message: 'Đã lưu thay đổi!'
                });
            }
        } catch (err) {
            console.error('Error updating clinic:', err);
            
            // Xử lý thông báo lỗi từ backend
            let errorMessage = err.data?.message || err.message || 'Lỗi khi cập nhật thông tin';
            
            // [TRANSLATE] Map generic backend error to user-friendly Vietnamese
            if (errorMessage === 'An error occurred while updating the clinic') {
                if (selectedFile) {
                    errorMessage = 'Định dạng file không được hỗ trợ hoặc có lỗi khi tải ảnh lên!';
                } else {
                    errorMessage = 'Có lỗi xảy ra khi cập nhật thông tin phòng khám. Vui lòng thử lại sau.';
                }
            }
            
            setToast({
                show: true,
                type: 'error',
                message: errorMessage
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
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/clinics')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-blue-600"
                            title="Quay lại danh sách"
                        >
                            <ArrowLeft size={28} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                <Building2 className="text-blue-600" size={40} />
                                Thông tin Phòng khám
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Quản lý thông tin phòng khám nha khoa
                            </p>
                        </div>
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
                                        <>
                                            <input
                                                type="text"
                                                value={formData.clinic_name || ''}
                                                onChange={(e) => handleChange('clinic_name', e.target.value)}
                                                className={`w-full px-4 py-3 border ${formErrors.clinic_name ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                                placeholder="Tên phòng khám"
                                            />
                                            {formErrors.clinic_name && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.clinic_name}</p>}
                                        </>
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
                                        <>
                                            <textarea
                                                value={formData.clinic_address || ''}
                                                onChange={(e) => handleChange('clinic_address', e.target.value)}
                                                rows={3}
                                                className={`w-full px-4 py-3 border ${formErrors.clinic_address ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none`}
                                                placeholder="Địa chỉ phòng khám"
                                            />
                                            {formErrors.clinic_address && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.clinic_address}</p>}
                                        </>
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
                                        <>
                                            <input
                                                type="tel"
                                                value={formData.phone || ''}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                                className={`w-full px-4 py-3 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                                placeholder="028-3822-1234"
                                            />
                                            {formErrors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.phone}</p>}
                                        </>
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
                                        <>
                                            <input
                                                type="email"
                                                value={formData.email || ''}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                className={`w-full px-4 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                                placeholder="contact@dcms.vn"
                                            />
                                            {formErrors.email && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.email}</p>}
                                        </>
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
                                        <>
                                            <input
                                                type="text"
                                                value={formData.working_house || ''} // Backend uses working_house
                                                onChange={(e) => handleChange('working_house', e.target.value)}
                                                className={`w-full px-4 py-3 border ${formErrors.working_house ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                                placeholder="T2-T7: 8:00-20:00, CN: 8:00-17:00"
                                            />
                                            {formErrors.working_house && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.working_house}</p>}
                                        </>
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
                                        <>
                                            <input
                                                type="text"
                                                value={formData.tax_code || ''}
                                                onChange={(e) => handleChange('tax_code', e.target.value)}
                                                className={`w-full px-4 py-3 border ${formErrors.tax_code ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                                placeholder="0123456789"
                                            />
                                            {formErrors.tax_code && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.tax_code}</p>}
                                        </>
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
                                        <>
                                            <input
                                                type="text"
                                                value={formData.license_number || ''}
                                                onChange={(e) => handleChange('license_number', e.target.value)}
                                                className={`w-full px-4 py-3 border ${formErrors.license_number ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                                placeholder="BYT-Q1-2020-001"
                                            />
                                            {formErrors.license_number && <p className="text-red-500 text-xs mt-1 ml-1">{formErrors.license_number}</p>}
                                        </>
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
                            <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 overflow-hidden relative">
                                {(previewUrl || formData.logo) && !imageError ? (
                                    <img
                                        src={previewUrl || formData.logo}
                                        alt="Clinic Logo"
                                        className="w-full h-full object-cover"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Building2 className="text-gray-400" size={64} />
                                        <p className="text-gray-500 mt-4 font-medium">
                                            {imageError ? 'Lỗi tải ảnh' : 'Chưa có logo'}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {isEditMode && (
                                <>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={triggerFileInput}
                                        className="w-full px-4 py-3 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-all duration-200"
                                    >
                                        {selectedFile ? 'Chọn ảnh khác' : 'Tải lên logo mới'}
                                    </button>
                                    {selectedFile && (
                                        <p className="text-xs text-gray-500 mt-2 text-center truncate">
                                            Đã chọn: {selectedFile.name}
                                        </p>
                                    )}
                                </>
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
                                    <CheckCircle size={20} />
                                    <span className="text-sm">
                                        Trạng thái: {formData.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngừng'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast.show && (
                <Toast
                    show={toast.show}
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
