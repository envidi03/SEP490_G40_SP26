import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { getDashboardRoute } from '../../utils/roleConfig';
import Input from '../../components/ui/Input';
import PublicLayout from '../../components/layout/PublicLayout';
import { LogIn, User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [rememberMe, setRememberMe] = React.useState(false);
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [focusedField, setFocusedField] = React.useState(null);
    const [fieldErrors, setFieldErrors] = React.useState({ username: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const savedUsername = localStorage.getItem('remembered_username');
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleLoginSuccess = (response) => {
        // Backend returns: { status, message, data: { account, user, role, token, refreshToken } }
        const responseData = response.data || response;
        const { account, user, role } = responseData;

        if (user && account && role) {
            // Combine user data with account and role info
            const userData = {
                ...user,
                account_id: account.id,
                username: account.username,
                email: account.email,
                phone: account.phone || '',
                status: account.status,
                email_verified: account.email_verified,
                role: role.name,
                role_id: role.id,
                permissions: role.permissions
            };

            // Update auth context with user data
            login(userData, rememberMe);

            // Save tokens
            if (responseData.token) {
                const accessToken = responseData.token;
                const refreshToken = responseData.refreshToken;

                const targetStorage = rememberMe ? localStorage : sessionStorage;
                targetStorage.setItem('access_token', JSON.stringify(accessToken));
                targetStorage.setItem('refresh_token', JSON.stringify(refreshToken));
            }

            // Save username if remember me is checked
            if (rememberMe) {
                localStorage.setItem('remembered_username', username);
            } else {
                localStorage.removeItem('remembered_username');
            }

            const from = location.state?.from;
            const bookingData = location.state?.bookingData;

            // Define the success toast object
            const successToast = {
                message: 'Đăng nhập thành công! Chào mừng bạn trở lại.',
                type: 'success',
                duration: 5000
            };

            // Bulletproof delivery via sessionStorage
            sessionStorage.setItem('pendingToast', JSON.stringify(successToast));

            // Update auth context with user data (this triggers PublicRoute redirect)
            login(userData, rememberMe);
        } else {
            setError('Không thể lấy thông tin người dùng');
        }
    };

    const handleLoginError = (error) => {
        console.error('Login error:', error);
        const errorMapping = {
            'AUTH_TOO_MANY_ATTEMPTS': 'Bạn đã nhập sai quá 5 lần. Vui lòng thử lại sau 3 phút.',
            'AUTH_REQUIRED_FIELDS': 'Email/Tên đăng nhập và mật khẩu là bắt buộc',
            'AUTH_INVALID_CREDENTIALS': 'Email hoặc mật khẩu không chính xác',
            'AUTH_ACCOUNT_INACTIVE': 'Tài khoản đã bị khóa hoặc ngừng hoạt động',
            'AUTH_EMAIL_NOT_VERIFIED': 'Vui lòng xác thực email của bạn trước khi đăng nhập',
            'AUTH_USER_NOT_FOUND': 'Không tìm thấy thông tin người dùng',
            'NOT_FOUND_ERROR': 'Tài khoản không tồn tại',
        };

        if (error.data) {
            const code = error.data.errorCode;
            const msg = error.data.message || error.data.error;
            let errorMessage = errorMapping[code] || errorMapping[msg] || msg;

            if (error.status === 401 && error.data.errors?.remainingAttempts !== undefined) {
                errorMessage += `. Bạn còn ${error.data.errors.remainingAttempts} lần thử trước khi tài khoản bị khóa 3 phút.`;
            }
            setError(errorMessage || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } else {
            setError('Đăng nhập thất bại. Vui lòng thử lại.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Manual validation
        const errors = {
            username: !username ? 'Vui lòng nhập email hoặc tên đăng nhập' : '',
            password: !password ? 'Vui lòng nhập mật khẩu' : ''
        };
        setFieldErrors(errors);

        if (errors.username || errors.password) return;

        setLoading(true);

        try {
            // Call the login API
            const response = await authService.login(username, password, rememberMe);
            handleLoginSuccess(response);
        } catch (error) {
            const errorMapping = {
                'AUTH_TOO_MANY_ATTEMPTS': 'Bạn đã nhập sai quá 5 lần. Vui lòng thử lại sau 3 phút.',
                'AUTH_REQUIRED_FIELDS': 'Email/Tên đăng nhập và mật khẩu là bắt buộc',
                'AUTH_INVALID_CREDENTIALS': 'Email hoặc mật khẩu không chính xác',
                'AUTH_ACCOUNT_INACTIVE': 'Tài khoản đã bị khóa hoặc ngừng hoạt động',
                'AUTH_EMAIL_NOT_VERIFIED': 'Vui lòng xác thực email của bạn trước khi đăng nhập',
                'AUTH_USER_NOT_FOUND': 'Không tìm thấy thông tin người dùng',
                'NOT_FOUND_ERROR': 'Tài khoản không tồn tại',
            };

            if (error.data) {
                const code = error.data.errorCode;
                const msg = error.data.message || error.data.error;
                const errorMessage = errorMapping[code] || errorMapping[msg] || msg;

                switch (error.status) {
                    case 400:
                        setError(errorMessage || 'Thông tin đăng nhập không hợp lệ');
                        break;
                    case 401:
                        let finalMsg = errorMessage || 'Tên đăng nhập hoặc mật khẩu không đúng';
                        if (error.data?.errors?.remainingAttempts !== undefined) {
                            finalMsg += `. Bạn còn ${error.data.errors.remainingAttempts} lần thử trước khi tài khoản bị khóa 3 phút.`;
                        }
                        setError(finalMsg);
                        break;
                    case 403:
                        setError(errorMessage || 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
                        break;
                    case 404:
                        setError(errorMessage || 'Tài khoản không tồn tại');
                        break;
                    default:
                        setError(errorMessage || 'Đăng nhập thất bại. Vui lòng thử lại.');
                }
            } else if (error.request) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
            } else {
                handleLoginError(error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 py-12">
                {/* Main Container */}
                <div className="max-w-md w-full">
                    {/* Back to Homepage Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">Về trang chủ</span>
                    </button>

                    {/* Login Card */}
                    <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
                        {/* Header with gradient */}
                        <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 p-8">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    Đăng nhập
                                </h1>
                                <p className="text-white/90">
                                    Chào mừng bạn trở lại!
                                </p>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Username field */}
                                <div className="relative group">
                                    <div className={`absolute left-3 transition-all duration-300 z-10 ${username || focusedField === 'username' ? '-top-2 text-xs bg-white px-1 text-primary-600' : 'top-3 text-gray-500'}`}>
                                        <User size={username || focusedField === 'username' ? 14 : 16} className="inline mr-1" />
                                        <span className="font-medium">Email / Tên đăng nhập</span>
                                    </div>
                                    <Input
                                        type="text"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            if (fieldErrors.username) setFieldErrors(prev => ({ ...prev, username: '' }));
                                        }}
                                        onFocus={() => setFocusedField('username')}
                                        onBlur={() => setFocusedField(null)}
                                        className={`w-full pt-5 pb-2 border-2 focus:ring-4 transition-all duration-300 ${fieldErrors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'focus:border-primary-500 focus:ring-primary-100 hover:border-primary-300'}`}
                                    />
                                    {fieldErrors.username && (
                                        <p className="text-red-500 text-xs mt-1 absolute">{fieldErrors.username}</p>
                                    )}
                                    <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-blue-500 transition-all duration-300 ${focusedField === 'username' ? 'w-full' : 'w-0'}`}></div>
                                </div>

                                {/* Password field */}
                                <div className="relative group">
                                    <div className={`absolute left-3 transition-all duration-300 z-10 ${password || focusedField === 'password' ? '-top-2 text-xs bg-white px-1 text-primary-600' : 'top-3 text-gray-500'}`}>
                                        <Lock size={password || focusedField === 'password' ? 14 : 16} className="inline mr-1" />
                                        <span className="font-medium">Mật khẩu</span>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                                            }}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            className={`w-full pt-5 pb-2 pr-12 border-2 focus:ring-4 transition-all duration-300 ${fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'focus:border-primary-500 focus:ring-primary-100 hover:border-primary-300'}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-110"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {fieldErrors.password && (
                                        <p className="text-red-500 text-xs mt-1 absolute">{fieldErrors.password}</p>
                                    )}
                                    <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-blue-500 transition-all duration-300 ${focusedField === 'password' ? 'w-full' : 'w-0'}`}></div>
                                </div>

                                {/* Forgot password */}
                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group select-none">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-primary-600 checked:border-primary-600 focus:ring-4 focus:ring-primary-100 transition-all cursor-pointer"
                                            />
                                            <svg
                                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                                                viewBox="0 0 12 12"
                                                fill="none"
                                            >
                                                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                            Ghi nhớ đăng nhập
                                        </span>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors hover:underline underline-offset-4"
                                    >
                                        Quên mật khẩu?
                                    </button>
                                </div>

                                {/* Error message */}
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                        <span className="text-red-500">⚠️</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Submit button */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-4 px-4 rounded-xl transition-colors duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <span className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 rounded-full transition-transform duration-700 ease-out"></span>

                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Đang đăng nhập...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Đăng nhập
                                                <LogIn size={18} />
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-3 bg-white text-gray-500 font-medium">Hoặc tiếp tục với</span>
                                </div>
                            </div>

                            {/* Google Login */}
                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
                                        setLoading(true);
                                        try {
                                            const response = await authService.googleAuth(credentialResponse.credential);
                                            handleLoginSuccess(response);
                                        } catch (error) {
                                            handleLoginError(error);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    onError={() => {
                                        setError('Đăng nhập Google thất bại');
                                    }}
                                    useOneTap
                                    width="340"
                                />
                            </div>

                            {/* Register link */}
                            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                                <p className="text-sm text-gray-600">
                                    Chưa có tài khoản?{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/register')}
                                        className="text-primary-600 hover:text-primary-700 font-bold transition-colors hover:underline underline-offset-4"
                                    >
                                        Đăng ký ngay
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Login;