import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Copy, CheckCircle, Eye, EyeOff, FileText, Upload } from 'lucide-react';
import staffService from '../../../../../services/staffService';

/**
 * Generate a strong random password
 */
const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    // Fill the rest
    for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

const UserFormModal = ({ isOpen, onClose, onSubmit, user, mode }) => {
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        role_id: '',
        gender: 'OTHER',
        dob: '',
        address: '',
        password: '',
        certificate: null,
        certificateUrl: '',
        avatar: null,
        license_number: '',
        issued_by: '',
        issued_date: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [certificatePreview, setCertificatePreview] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Fetch roles khi mở form
    useEffect(() => {
        if (isOpen) {
            staffService.getRoles()
                .then(res => {
                    const data = res?.data || [];
                    setRoles(data);
                })
                .catch(() => setRoles([])); // fallback nếu API chưa có
        }
    }, [isOpen]);

    // Reset/Load form data when opening
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && user) {
                setFormData({
                    fullName: user.full_name || '',
                    username: user.username || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    role_id: roles.find(r => r.name === user.role)?._id || '',
                    password: '', // Không cần password khi edit
                    certificate: null,
                    certificateUrl: user.licenses?.[0]?.document_url || '',
                    avatar: null,
                    license_number: user.licenses?.[0]?.license_number || '',
                    issued_by: user.licenses?.[0]?.issued_by || '',
                    issued_date: user.licenses?.[0]?.issued_date ? new Date(user.licenses[0].issued_date).toISOString().split('T')[0] : '',
                });
                setCertificatePreview(user.licenses?.[0]?.document_url || null);
            } else {
                setFormData({
                    fullName: '',
                    username: '',
                    email: '',
                    phone: '',
                    role_id: '',
                    password: generatePassword(),
                    certificate: null,
                    certificateUrl: '',
                    avatar: null,
                    license_number: '',
                    issued_by: '',
                    issued_date: '',
                });
                setCertificatePreview(null);
            }
            setErrors({});
            setShowPassword(false);
            setCopied(false);
            setLoading(false);
        }
    }, [isOpen, mode, user, roles]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Client-side mandatory field checks
        if (!formData.fullName?.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
        if (!formData.username?.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập';
        if (!formData.email?.trim()) newErrors.email = 'Vui lòng nhập email';
        if (!formData.phone?.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
        if (!formData.role_id) newErrors.role_id = 'Vui lòng chọn vai trò';

        // Doctor specific validation
        if (roles.find(r => r._id === formData.role_id)?.name === 'DOCTOR') {
            if (!formData.license_number?.trim()) newErrors.license_number = 'Vui lòng nhập số chứng chỉ';
            if (!formData.issued_by?.trim()) newErrors.issued_by = 'Vui lòng nhập nơi cấp';
            if (!formData.issued_date) newErrors.issued_date = 'Vui lòng chọn ngày cấp';
        }

        if (mode === 'add' && !formData.password) newErrors.password = 'Vui lòng tạo mật khẩu';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            // Scroll to top of form if there are many fields
            return;
        }

        try {
            setLoading(true);
            await onSubmit(formData);
            // Parent handles closing on success
        } catch (err) {
            console.error('Form error:', err);
            const apiMessage = err.response?.data?.message || err.message || '';
            const fieldErrors = {};

            // Map common backend errors to fields
            if (apiMessage.includes('Email already exists')) {
                fieldErrors.email = 'Email này đã tồn tại trong hệ thống';
            } else if (apiMessage.includes('Username already exists')) {
                fieldErrors.username = 'Tên đăng nhập này đã tồn tại';
            } else if (apiMessage.includes('phone') || apiMessage.includes('Số điện thoại')) {
                fieldErrors.phone = 'Số điện thoại không hợp lệ hoặc đã tồn tại';
            } else if (apiMessage.includes('license number must not contain special characters')) {
                fieldErrors.license_number = 'Số chứng chỉ không được chứa ký tự đặc biệt';
            } else if (apiMessage.includes('Validation failed')) {
                // If backend returns structured errors
                const backendErrors = err.response?.data?.errors;
                if (backendErrors && typeof backendErrors === 'object') {
                    Object.keys(backendErrors).forEach(key => {
                        fieldErrors[key] = backendErrors[key];
                    });
                } else {
                    fieldErrors.general = apiMessage;
                }
            } else {
                fieldErrors.general = apiMessage || 'Có lỗi xảy ra, vui lòng thử lại';
            }

            setErrors(fieldErrors);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
        if (errors.general) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated.general;
                return updated;
            });
        }
    };

    const handleRegeneratePassword = () => {
        setFormData({
            ...formData,
            password: generatePassword()
        });
        setCopied(false);
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(formData.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCertificateChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setErrors({
                ...errors,
                certificate: 'Chỉ chấp nhận file ảnh (JPG, PNG) hoặc PDF'
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors({
                ...errors,
                certificate: 'File không được vượt quá 5MB'
            });
            return;
        }

        // Clear error
        if (errors.certificate) {
            const newErrors = { ...errors };
            delete newErrors.certificate;
            setErrors(newErrors);
        }

        // Set file to formData
        setFormData({
            ...formData,
            certificate: file
        });

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCertificatePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setCertificatePreview('PDF');
        }
    };

    const handleRemoveCertificate = () => {
        setFormData({
            ...formData,
            certificate: null,
            certificateUrl: ''
        });
        setCertificatePreview(null);
    };

    const getInputClass = (fieldName) => {
        const baseClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
        return `${baseClass} ${errors[fieldName] ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {mode === 'edit' ? 'Chỉnh sửa thông tin' : 'Thêm người dùng mới'}
                        </h2>
                        {mode === 'edit' && <p className="text-sm text-gray-500 mt-1">Username: {formData.username}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body - Scrollable */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto" noValidate>
                    <div className="p-6 space-y-6">
                        {errors.general && (
                            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                                {errors.general}
                            </div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={getInputClass('fullName')}
                                placeholder="Nguyễn Văn A"
                            />
                            {errors.fullName && <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">{errors.fullName}</p>}
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={mode === 'edit'}
                                className={`${getInputClass('username')} ${mode === 'edit' ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                                placeholder="username123"
                            />
                            {errors.username && <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">{errors.username}</p>}
                        </div>

                        {/* Role Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                                Vai trò <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="role_id"
                                value={formData.role_id}
                                onChange={handleChange}
                                disabled={mode === 'edit'}
                                className={`${getInputClass('role_id')} ${mode === 'edit' ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                            >
                                <option value="">-- Chọn vai trò --</option>
                                {roles.length > 0 ? (
                                    roles
                                        .filter(role => role.name !== 'ADMIN_CLINIC')
                                        .map(role => (
                                            <option key={role._id} value={role._id}>
                                                {{
                                                    'DOCTOR': 'Bác sĩ',
                                                    'RECEPTIONIST': 'Lễ tân',
                                                    'PHARMACIST': 'Dược sĩ',
                                                    'PHARMACY': 'Dược sĩ',
                                                    'ASSISTANT': 'Trợ lý'
                                                }[role.name] || role.name}
                                            </option>
                                        ))
                                ) : (
                                    <option value="" disabled>Đang tải danh sách vai trò...</option>
                                )}
                            </select>
                            {errors.role_id && <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">{errors.role_id}</p>}
                        </div>

                        {/* Password Section (Only Add Mode) */}
                        {mode === 'add' && (
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
                                <label className="block text-sm font-bold text-blue-900 mb-2">
                                    Mật khẩu tự động <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-blue-700/80 mb-4 font-medium leading-relaxed">
                                    Hệ thống đã tạo mật khẩu mạnh. Vui lòng copy và gửi cho nhân viên.
                                </p>

                                <div className="flex gap-2 items-center">
                                    <div className="flex-1 relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            readOnly
                                            className="w-full px-4 py-3 pr-12 bg-white border border-blue-200 rounded-lg font-mono text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCopyPassword}
                                        className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all shadow-sm ${copied
                                            ? 'bg-green-500 text-white border-transparent'
                                            : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                                            }`}
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle size={18} />
                                                <span>Đã copy</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={18} />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleRegeneratePassword}
                                        className="inline-flex items-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 font-semibold transition-all shadow-sm"
                                        title="Tạo lại mật khẩu"
                                    >
                                        <RefreshCw size={18} />
                                        <span>Tạo lại</span>
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-red-500 mt-2 ml-1 font-medium">{errors.password}</p>}

                                <div className="mt-4 p-3 bg-white/80 border border-blue-100 rounded-lg">
                                    <p className="text-xs text-blue-800 font-semibold flex items-center gap-2 italic">
                                        <span className="text-base">⚠️</span> Lưu ý: Nhân viên sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Email & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={getInputClass('email')}
                                    placeholder="email@example.com"
                                />
                                {errors.email && <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={getInputClass('phone')}
                                    placeholder="0912345678"
                                />
                                {errors.phone && <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium">{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Doctor License Section */}
                        {roles.find(r => r._id === formData.role_id)?.name === 'DOCTOR' && (
                            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-5 space-y-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText size={18} className="text-purple-600" />
                                    <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider">Thông tin chứng chỉ hành nghề</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-purple-700 uppercase mb-1 ml-1">
                                            Số chứng chỉ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="license_number"
                                            value={formData.license_number}
                                            onChange={handleChange}
                                            className={getInputClass('license_number')}
                                            placeholder="CCHN-12345"
                                        />
                                        {errors.license_number && <p className="text-[10px] text-red-500 mt-1 ml-1 font-semibold">{errors.license_number}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-purple-700 uppercase mb-1 ml-1">
                                            Ngày cấp <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="issued_date"
                                            value={formData.issued_date}
                                            onChange={handleChange}
                                            className={getInputClass('issued_date')}
                                        />
                                        {errors.issued_date && <p className="text-[10px] text-red-500 mt-1 ml-1 font-semibold">{errors.issued_date}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-purple-700 uppercase mb-1 ml-1">
                                        Nơi cấp <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="issued_by"
                                        value={formData.issued_by}
                                        onChange={handleChange}
                                        className={getInputClass('issued_by')}
                                        placeholder="Sở Y tế Hà Nội"
                                    />
                                    {errors.issued_by && <p className="text-[10px] text-red-500 mt-1 ml-1 font-semibold">{errors.issued_by}</p>}
                                </div>

                                {/* File Upload */}
                                <div className="pt-2 border-t border-purple-100">
                                    <label className="block text-[11px] font-bold text-purple-700 uppercase mb-3 ml-1">
                                        File đính kèm (Tùy chọn)
                                    </label>

                                    {!certificatePreview && !formData.certificateUrl ? (
                                        <div className="relative group/upload">
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                onChange={handleCertificateChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 flex flex-col items-center justify-center bg-white group-hover/upload:bg-purple-50 group-hover/upload:border-purple-400 transition-all">
                                                <Upload className="text-purple-400 mb-2 group-hover/upload:scale-110 transition-transform" size={32} />
                                                <p className="text-sm font-semibold text-purple-900">Nhấn để tải file lên</p>
                                                <p className="text-[10px] text-purple-500 mt-1 italic">Hỗ trợ JPG, PNG, PDF (Tối đa 5MB)</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-4 bg-white border border-purple-200 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                                    {certificatePreview === 'PDF' || (formData.certificateUrl && formData.certificateUrl.endsWith('.pdf')) ? (
                                                        <FileText size={20} />
                                                    ) : (
                                                        <img
                                                            src={certificatePreview || formData.certificateUrl}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover rounded-lg"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'placeholder-image-url';
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 truncate">
                                                        {formData.certificate ? formData.certificate.name : 'Tài liệu đã lưu'}
                                                    </p>
                                                    <div className="flex gap-2 mt-2">
                                                        <a
                                                            href={certificatePreview || formData.certificateUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800"
                                                        >
                                                            Xem file
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoveCertificate}
                                                            className="text-[10px] uppercase font-bold text-red-600 hover:text-red-800"
                                                        >
                                                            Gỡ bỏ
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {errors.certificate && <p className="text-[10px] text-red-500 mt-2 ml-1 font-semibold">{errors.certificate}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/30">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all active:scale-95"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
                        >
                            {loading && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            )}
                            <span>{mode === 'edit' ? 'Lưu thay đổi' : 'Thêm người dùng'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;
