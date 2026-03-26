import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PublicLayout from '../../components/layout/PublicLayout';
import { UserPlus, User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';

const Register = () => {
    const [formData, setFormData] = React.useState({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [fieldErrors, setFieldErrors] = React.useState({});
    const [step, setStep] = React.useState('form');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        const errors = {};

        // Username validation
        if (!formData.username) {
            errors.username = 'Tên đăng nhập là bắt buộc';
        } else {
            if (formData.username.length < 3) {
                errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
            } else if (formData.username.length > 20) {
                errors.username = 'Tên đăng nhập không được vượt quá 20 ký tự';
            } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.username)) {
                errors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới và không được bắt đầu bằng số';
            }
        }

        // Full Name validation
        if (!formData.fullName) {
            errors.fullName = 'Họ và tên là bắt buộc';
        }

        // Email validation
        if (!formData.email) {
            errors.email = 'Email là bắt buộc';
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
            errors.email = 'Email không hợp lệ';
        }

        // Phone validation
        if (!formData.phone) {
            errors.phone = 'Số điện thoại là bắt buộc';
        } else if (!/^(0|\+84)[0-9]{9}$/.test(formData.phone)) {
            errors.phone = 'Số điện thoại không hợp lệ (phải là 10 số)';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Mật khẩu là bắt buộc';
        } else {
            const passErrors = [];
            if (formData.password.length < 8) passErrors.push('Ít nhất 8 ký tự');
            if (!/[a-z]/.test(formData.password)) passErrors.push('cần chữ thường');
            if (!/[A-Z]/.test(formData.password)) passErrors.push('cần chữ hoa');
            if (!/\d/.test(formData.password)) passErrors.push('cần số');
            if (!/[@$!%*?&]/.test(formData.password)) passErrors.push('cần ký tự đặc biệt');
            
            if (passErrors.length > 0) {
                errors.password = 'Mật khẩu chưa đủ mạnh: ' + passErrors.join(', ');
            }
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        // Validation
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setLoading(true);

        try {
            // API call
            const response = await authService.register({
                username: formData.username,
                full_name: formData.fullName,
                email: formData.email,
                phone_number: formData.phone,
                password: formData.password
            });

            setTimeout(() => {
                setStep('success');
                setLoading(false);
            }, 1000);

        } catch (err) {
            console.error('Registration error details:', err);
            
            const errorData = err.data || err.response?.data;
            let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
            
            if (errorData) {
                if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                    // Combine validation errors
                    errorMessage = errorData.errors.map(e => e.message).join('. ');
                } else if (errorData.message) {
                    let msg = errorData.message;
                    if (msg.includes('validation failed:')) {
                        const parts = msg.split('validation failed:')[1];
                        if (parts) {
                            errorMessage = parts.split(',').map(part => {
                                const subParts = part.split(':');
                                return subParts[subParts.length - 1].trim();
                            }).join('. ');
                        }
                    } else {
                        errorMessage = msg;
                    }
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4 py-12">
                <div className="max-w-md w-full">
                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        {step === 'form' ? (
                            <>
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                        <UserPlus size={32} className="text-green-600" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng ký tài khoản</h1>
                                    <p className="text-gray-600">
                                        Tạo tài khoản để đặt lịch khám nhanh chóng
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Username */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <User size={16} className="inline mr-1" />
                                            Tên đăng nhập
                                        </label>
                                        <Input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder="username123"
                                            error={fieldErrors.username}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Tên đăng nhập để đăng nhập hệ thống</p>
                                    </div>

                                    {/* Họ và tên */}
                                    <Input
                                        label={
                                            <>
                                                <User size={16} className="inline mr-1" />
                                                Họ và tên đầy đủ
                                            </>
                                        }
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Nguyễn Văn A"
                                        error={fieldErrors.fullName}
                                        className="w-full"
                                    />

                                    {/* Email */}
                                    <Input
                                        label={
                                            <>
                                                <Mail size={16} className="inline mr-1" />
                                                Email
                                            </>
                                        }
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="example@email.com"
                                        error={fieldErrors.email}
                                        className="w-full"
                                    />

                                    {/* Phone */}
                                    <Input
                                        label={
                                            <>
                                                <Phone size={16} className="inline mr-1" />
                                                Số điện thoại
                                            </>
                                        }
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="0123456789"
                                        error={fieldErrors.phone}
                                        className="w-full"
                                    />

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Lock size={16} className="inline mr-1" />
                                            Mật khẩu
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Ít nhất 8 ký tự"
                                                error={fieldErrors.password}
                                                className="w-full pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-[38px] -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                style={{ top: fieldErrors.password ? '26px' : '21px' }}
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Phải có chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)
                                        </p>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="relative">
                                        <Input
                                            label={
                                                <>
                                                    <Lock size={16} className="inline mr-1" />
                                                    Xác nhận mật khẩu
                                                </>
                                            }
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Nhập lại mật khẩu"
                                            error={fieldErrors.confirmPassword}
                                            className="w-full pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-[38px] -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            style={{ top: fieldErrors.confirmPassword ? '50px' : '44px' }}
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                            {error}
                                        </div>
                                    )}

                                    {/* Terms & Conditions */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-xs text-blue-800">
                                            Bằng việc đăng ký, bạn đồng ý với{' '}
                                            <a href="#" className="font-semibold underline">Điều khoản sử dụng</a>
                                            {' '}và{' '}
                                            <a href="#" className="font-semibold underline">Chính sách bảo mật</a>
                                            {' '}của chúng tôi.
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                                    </Button>

                                    {/* Login Link */}
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">
                                            Đã có tài khoản?{' '}
                                            <button
                                                type="button"
                                                onClick={() => navigate('/login')}
                                                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                                            >
                                                Đăng nhập ngay
                                            </button>
                                        </p>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                {/* Success State */}
                                <div className="text-center py-4">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <UserPlus size={40} className="text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        Đăng ký thành công!
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Tài khoản của bạn đã được tạo thành công.
                                    </p>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                        <p className="text-sm text-green-800 mb-2">
                                            <strong>Email:</strong> {formData.email}
                                        </p>
                                        <p className="text-sm text-green-800 mb-2">
                                            Bạn có thể đăng nhập ngay bây giờ!
                                        </p>
                                        <p className="text-sm text-green-800 font-semibold">
                                            <strong> Vui lòng kiểm tra và xác nhận email của bạn! </strong>
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => navigate('/login')}
                                        className="w-full"
                                    >
                                        Đăng nhập ngay
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-600 mt-6">
                        © 2026 DCMS - Dental Clinic Management System
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Register;
