import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PublicLayout from '../../components/layout/PublicLayout';
import { Mail, KeyRound } from 'lucide-react';
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

    // Handle initial "Forgot Password" request (Send OTP)
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setStep('reset'); // Go to OTP & Reset step
        } catch (error) {
            console.error('Forgot password error:', error);
            if (error?.data) {
                setError(error.data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            } else if (error?.request) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.');
            } else {
                setError('Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle Password Reset (Verify OTP + Set New Password)
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (newPassword.length < 8) {
            setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(email, otp, newPassword);
            setStep('success'); // Go to Success step
        } catch (error) {
            console.error('Reset password error:', error);
            if (error?.data) {
                setError(error.data.message || 'Mã OTP không đúng hoặc đã hết hạn.');
            } else if (error?.request) {
                setError('Không thể kết nối đến máy chủ.');
            } else {
                setError('Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 py-12">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        {/* Header */}
                        {step !== 'success' && (
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                    <KeyRound size={32} className="text-orange-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {step === 'email' && 'Quên mật khẩu'}
                                    {step === 'reset' && 'Đặt lại mật khẩu'}
                                </h1>
                                <p className="text-gray-600">
                                    {step === 'email' && 'Nhập email để nhận mã OTP xác thực'}
                                    {step === 'reset' && `Nhập mã OTP đã gửi tới ${email} và mật khẩu mới`}
                                </p>
                            </div>
                        )}

                        {/* STEP 1: Email Input */}
                        {step === 'email' && (
                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail size={16} className="inline mr-1" />
                                        Địa chỉ Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        required
                                        className="w-full"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/login')}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                                    >
                                        Quay lại đăng nhập
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 2: OTP & New Password */}
                        {step === 'reset' && (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mã OTP (6 số)
                                    </label>
                                    <Input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Nhập mã OTP"
                                        required
                                        className="w-full text-center tracking-widest font-mono text-lg"
                                        maxLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mật khẩu mới
                                    </label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full"
                                        minLength={8}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Xác nhận mật khẩu
                                    </label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setStep('email')}
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Gửi lại mã?
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 3: Success */}
                        {step === 'success' && (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <KeyRound size={40} className="text-green-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Hoàn tất!</h1>
                                <p className="text-gray-600 mb-8">
                                    Mật khẩu của bạn đã được thay đổi thành công. Bạn có thể đăng nhập ngay bây giờ.
                                </p>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full"
                                >
                                    Đăng nhập ngay
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ForgotPassword;
