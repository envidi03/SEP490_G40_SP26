import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { getDashboardRoute } from '../../utils/roleConfig';
import Input from '../../components/ui/Input';
import Toast from '../../components/ui/Toast';
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
    const [showToast, setShowToast] = React.useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const savedUsername = localStorage.getItem('remembered_username');
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Call the login API
            const response = await authService.login(username, password, rememberMe);

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

                // Show success toast
                setShowToast(true);

                // Redirect after showing toast based on role
                setTimeout(() => {
                    // Save username if remember me is checked
                    if (rememberMe) {
                        localStorage.setItem('remembered_username', username);
                    } else {
                        localStorage.removeItem('remembered_username');
                    }
                    const dashboardRoute = getDashboardRoute(role.name);
                    navigate(dashboardRoute);
                }, 1500);
            } else {
                setError('Không thể lấy thông tin người dùng');
            }
        } catch (error) {
            console.error('Login error:', error);

            // Handle different types of errors
            if (error.data) {
                // API returned an error response
                const errorMessage = error.data.message || error.data.error;

                switch (error.status) {
                    case 400:
                        setError(errorMessage || 'Thông tin đăng nhập không hợp lệ');
                        break;
                    case 401:
                        setError('Tên đăng nhập hoặc mật khẩu không đúng');
                        break;
                    case 403:
                        setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
                        break;
                    case 404:
                        setError('Tài khoản không tồn tại');
                        break;
                    default:
                        setError(errorMessage || 'Đăng nhập thất bại. Vui lòng thử lại.');
                }
            } else if (error.request) {
                // Request was made but no response received
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
            } else {
                // Something else happened
                setError('Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            {/* Success Toast */}
            {showToast && (
                <Toast
                    type="success"
                    message="🎉 Đăng nhập thành công! Chào mừng bạn trở lại."
                    onClose={() => setShowToast(false)}
                    duration={3000}
                />
            )}

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
                                    <div className={`absolute left-3 transition-all duration-300 ${username || focusedField === 'username' ? '-top-2 text-xs bg-white px-1 text-primary-600' : 'top-3 text-gray-500'}`}>
                                        <User size={username || focusedField === 'username' ? 14 : 16} className="inline mr-1" />
                                        <span className="font-medium">Tên đăng nhập</span>
                                    </div>
                                    <Input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => setFocusedField('username')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full pt-5 pb-2 border-2 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300 hover:border-primary-300"
                                        required
                                    />
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
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pt-5 pb-2 pr-12 border-2 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300 hover:border-primary-300"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300 hover:scale-110"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
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
                            <div>
                                <button
                                    type="button"
                                    onClick={() => alert('Tính năng đăng nhập Google đang được phát triển.')}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="font-semibold text-gray-700">Đăng nhập với Google</span>
                                </button>
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
