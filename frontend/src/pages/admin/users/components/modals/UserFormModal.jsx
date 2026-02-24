import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Copy, CheckCircle, Eye, EyeOff, FileText, Upload, Trash2 } from 'lucide-react';

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

const UserFormModal = ({ isOpen, onClose, onSubmit, user, mode = 'add' }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        role: 'Receptionist',
        status: 'active',
        password: '',
        certificate: null,
        certificateUrl: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [certificatePreview, setCertificatePreview] = useState(null);

    // Generate password when opening add mode
    useEffect(() => {
        if (user && mode === 'edit') {
            setFormData({
                fullName: user.fullName || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'Receptionist',
                status: user.status || 'active',
                password: '',
                certificate: null,
                certificateUrl: user.certificateUrl || '',
            });
            setCertificatePreview(user.certificateUrl || null);
        } else if (mode === 'add') {
            setFormData({
                fullName: '',
                username: '',
                email: '',
                phone: '',
                role: 'Receptionist',
                status: 'active',
                password: generatePassword(),
                certificate: null,
                certificateUrl: '',
            });
            setCertificatePreview(null);
        }
        setErrors({});
        setShowPassword(false);
        setCopied(false);
    }, [user, mode, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};

        if (mode === 'add' && !formData.password) {
            newErrors.password = 'Vui lòng tạo mật khẩu';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {mode === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                disabled={mode === 'edit'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="username123"
                            />
                            {mode === 'edit' && (
                                <p className="text-xs text-gray-500 mt-1">Username không thể thay đổi</p>
                            )}
                        </div>

                        {/* Auto-generated Password - Only for Add mode */}
                        {mode === 'add' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mật khẩu tự động <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-gray-600 mb-3">
                                    Hệ thống đã tạo mật khẩu mạnh. Vui lòng copy và gửi cho nhân viên.
                                </p>

                                <div className="flex gap-2 items-center">
                                    <div className="flex-1 relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            readOnly
                                            className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-lg font-mono text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCopyPassword}
                                        className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${copied
                                            ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600'
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
                                        className="inline-flex items-center gap-2 px-4 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 font-medium transition-all"
                                        title="Tạo lại mật khẩu"
                                    >
                                        <RefreshCw size={18} />
                                        <span>Tạo lại</span>
                                    </button>
                                </div>

                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-xs text-yellow-800 font-medium">
                                        ⚠️ Lưu ý: Nhân viên sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Email & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="0912345678"
                                />
                            </div>
                        </div>

                        {/* Role & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vai trò <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="Admin">Quản trị viên</option>
                                    <option value="Doctor">Bác sĩ</option>
                                    <option value="Receptionist">Lễ tân</option>
                                    <option value="Pharmacy">Dược sĩ</option>
                                    <option value="Assistant">Trợ lý</option>
                                    <option value="Patient">Bệnh nhân</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Tạm khóa</option>
                                    <option value="pending">Chờ xác thực</option>
                                </select>
                            </div>
                        </div>

                        {/* Certificate Upload - Only for Doctor */}
                        {formData.role === 'Doctor' && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Chứng chỉ hành nghề {mode === 'add' && <span className="text-gray-500 text-xs">(Tùy chọn)</span>}
                                </label>
                                <p className="text-xs text-gray-600 mb-3">
                                    Upload chứng chỉ hành nghề bác sĩ (JPG, PNG hoặc PDF, tối đa 5MB)
                                </p>

                                {!certificatePreview ? (
                                    <div>
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-purple-50 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-10 h-10 mb-2 text-purple-500" />
                                                <p className="mb-2 text-sm text-gray-600">
                                                    <span className="font-semibold">Click để upload</span> hoặc kéo thả file
                                                </p>
                                                <p className="text-xs text-gray-500">JPG, PNG hoặc PDF (Max 5MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                                onChange={handleCertificateChange}
                                            />
                                        </label>
                                        {errors.certificate && (
                                            <p className="text-xs text-red-500 mt-2">{errors.certificate}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            {certificatePreview === 'PDF' ? (
                                                <div className="flex-shrink-0 w-16 h-16 bg-red-100 rounded flex items-center justify-center">
                                                    <FileText className="text-red-600" size={32} />
                                                </div>
                                            ) : (
                                                <img
                                                    src={certificatePreview}
                                                    alt="Certificate preview"
                                                    className="flex-shrink-0 w-16 h-16 object-cover rounded border border-gray-200"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {formData.certificate?.name || 'Chứng chỉ đã upload'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formData.certificate?.size
                                                        ? `${(formData.certificate.size / 1024).toFixed(1)} KB`
                                                        : 'File đã lưu'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveCertificate}
                                                className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa file"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            {mode === 'add' ? 'Thêm người dùng' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;
