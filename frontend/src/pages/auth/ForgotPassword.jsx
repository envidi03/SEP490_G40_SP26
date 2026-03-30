import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, RefreshCw, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';

const ForgotPassword = () => {
    const [email, setEmail] = React.useState('');
    const [step, setStep] = React.useState('email');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const navigate = useNavigate();

    const [otp, setOtp] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const getErrorMessage = (msg) => {
        if (!msg) return 'Đã xảy ra lỗi. Vui lòng thử lại. (An error occurred. Please try again.)';
        
        const errorMap = {
            'Invalid OTP': 'Mã OTP không hợp lệ hoặc đã hết hạn. (Invalid or expired OTP)',
            'Invalid OTP!': 'Mã OTP không hợp lệ hoặc đã hết hạn. (Invalid or expired OTP)',
            'Account not found!': 'Không tìm thấy tài khoản! (Account not found!)',
            'Email not found': 'Email không tồn tại trong hệ thống. (Email not found)',
            'Email not found!': 'Email không tồn tại trong hệ thống. (Email not found)',
            'User not found': 'Không tìm thấy người dùng. (User not found)',
            'User not found!': 'Không tìm thấy người dùng. (User not found)',
            'Too many attempts': 'Quá nhiều lần thử. Vui lòng thử lại sau. (Too many attempts)',
            'Internal server error': 'Lỗi hệ thống. Vui lòng thử lại sau. (Internal server error)'
        };

        const cleanMsg = msg ? msg.replace('!', '').trim() : '';
        const mapped = errorMap[msg] || errorMap[cleanMsg];
        
        return mapped || msg;
    };

    // Handle initial "Forgot Password" request (Send OTP)
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Vui lòng nhập địa chỉ email. (Please enter your email)');
            return;
        }

        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setStep('reset'); // Go to OTP & Reset step
        } catch (error) {
            console.error('Forgot password error:', error);
            const msg = error?.data?.message || error?.message;
            setError(getErrorMessage(msg));
        } finally {
            setLoading(false);
        }
    };

    // Handle Resend OTP (Automatic)
    const handleResendOtp = async () => {
        setError('');
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setError('Mã mới đã được gửi! Vui lòng kiểm tra email của bạn. (New code sent! Please check your email)');
        } catch (error) {
            console.error('Resend OTP error:', error);
            const msg = error?.data?.message || error?.message;
            setError(getErrorMessage(msg));
        } finally {
            setLoading(false);
        }
    };

    // Handle Password Reset (Verify OTP + Set New Password)
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin. (Please fill in all fields)');
            return;
        }

        // Basic validation
        if (newPassword.length < 8) {
            setError('Mật khẩu mới phải có ít nhất 8 ký tự. (Password must be at least 8 characters)');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp. (Passwords do not match)');
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(email, otp, newPassword);
            setStep('success'); // Go to Success step
        } catch (error) {
            console.error('Reset password error:', error);
            const msg = error?.data?.message || error?.message;
            setError(getErrorMessage(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4 py-12 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-primary-100/50 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl animate-pulse delay-700"></div>

                <div className="max-w-md w-full relative z-10 transition-all duration-500 transform">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 p-8 md:p-10">

                        {/* Status Icon Wrapper */}
                        <div className="flex justify-center mb-8">
                            <div className={`w-20 h-20 rounded-2xl rotate-12 flex items-center justify-center shadow-lg transition-all duration-500 scale-110 ${step === 'success' ? 'bg-green-500 text-white rotate-0' : 'bg-primary-600 text-white'
                                }`}>
                                {step === 'email' && <Mail size={36} />}
                                {step === 'reset' && <ShieldCheck size={36} />}
                                {step === 'success' && <CheckCircle2 size={36} />}
                            </div>
                        </div>

                        {/* Text Header */}
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                                {step === 'email' && (
                                    <>Quên mật khẩu <span className="block text-sm font-medium text-gray-400 mt-1">Forgot Password</span></>
                                )}
                                {step === 'reset' && (
                                    <>Đặt lại mật khẩu <span className="block text-sm font-medium text-gray-400 mt-1">Reset Your Password</span></>
                                )}
                                {step === 'success' && (
                                    <>Thành công! <span className="block text-sm font-medium text-gray-400 mt-1">Success!</span></>
                                )}
                            </h1>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {step === 'email' && 'Nhập email để nhận mã OTP xác thực khôi phục tài khoản.'}
                                {step === 'email' && <span className="block italic mt-1">(Enter your email to receive recovery OTP code)</span>}
                                {step === 'reset' && `Nhập mã OTP đã được gửi tới ${email} để tạo mật khẩu mới.`}
                                {step === 'reset' && <span className="block italic mt-1">(Enter OTP sent to your email to create a new password)</span>}
                                {step === 'success' && 'Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập ngay bây giờ.'}
                                {step === 'success' && <span className="block italic mt-1">(Your password has been updated. You can login now)</span>}
                            </p>
                        </div>

                        {/* STEP 1: Email Input */}
                        {step === 'email' && (
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all duration-300 shadow-sm"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-shake">
                                        <span>⚠️</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-4 rounded-2xl hover:shadow-xl hover:shadow-primary-200 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <RefreshCw size={18} className="animate-spin" />
                                    ) : 'Gửi mã OTP (Send OTP)'}
                                </button>

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/login')}
                                        className="text-sm text-gray-400 hover:text-primary-600 font-bold transition-all flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <ArrowLeft size={16} />
                                        Quay lại (Back to Login)
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 2: OTP & New Password */}
                        {step === 'reset' && (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="space-y-2 text-center">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Verification Code (OTP)
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="······"
                                        className="w-full text-center tracking-[1em] font-mono text-3xl py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all duration-300"
                                        maxLength={6}
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Mật khẩu mới (New Password)</label>
                                        <div className="relative group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all duration-300"
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Xác nhận mật khẩu (Confirm)</label>
                                        <div className="relative group">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all duration-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                                        <span>⚠️</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary-600 text-white font-bold py-4 rounded-2xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-100"
                                >
                                    {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Đặt lại mật khẩu (Reset Now)'}
                                </button>

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                        className="text-xs text-gray-400 hover:text-primary-600 font-bold underline underline-offset-4 disabled:opacity-50"
                                    >
                                        Gửi lại mã? (Resend OTP)
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 3: Success */}
                        {step === 'success' && (
                            <div className="text-center animate-in fade-in zoom-in duration-500">
                                <div className="space-y-6">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full bg-primary-600 text-white font-bold py-4 rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 group"
                                    >
                                        Đăng nhập ngay (Login Now)
                                        <ArrowLeft size={16} className="inline ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Link */}
                    <p className="text-center mt-8 text-sm text-gray-500 font-medium">
                        Bạn chưa có tài khoản? (No account?) {' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="text-primary-600 font-bold hover:underline"
                        >
                            Đăng ký ngay (Register)
                        </button>
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ForgotPassword;
