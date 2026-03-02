import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Button from '../../components/ui/Button';
import { Mail, CheckCircle, XCircle, Loader } from 'lucide-react';
import authService from '../../services/authService';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
    const [message, setMessage] = useState('');
    const hasVerified = React.useRef(false); // Prevent double call in React StrictMode
    const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
    const [emailToResend, setEmailToResend] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            // Prevent double execution in React StrictMode
            if (hasVerified.current) {
                return;
            }
            hasVerified.current = true;

            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Token xác minh không hợp lệ. Vui lòng kiểm tra lại link trong email.');
                return;
            }

            try {
                const response = await authService.verifyEmail(token);
                setStatus('success');
                setMessage(response.message || 'Email đã được xác minh thành công!');
            } catch (error) {
                setStatus('error');
                console.error('Verify email error:', error);
                setMessage(
                    error.message ||
                    'Xác minh email thất bại. Link có thể đã hết hạn hoặc không hợp lệ.'
                );
            }
        };

        verifyEmail();
    }, [searchParams]);

    const handleResendEmail = async (e) => {
        e.preventDefault();
        if (!emailToResend) return;

        setResendStatus('sending');
        try {
            await authService.resendVerificationEmail(emailToResend);
            setResendStatus('sent');
        } catch (error) {
            setResendStatus('error');
            console.error('Resend email error:', error);
        }
    };

    return (
        <PublicLayout>
            <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        {/* Verifying State */}
                        {status === 'verifying' && (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                    <Loader size={40} className="text-blue-600 animate-spin" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Đang xác minh email...
                                </h2>
                                <p className="text-gray-600">
                                    Vui lòng chờ trong giây lát
                                </p>
                            </div>
                        )}

                        {/* Success State */}
                        {status === 'success' && (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={40} className="text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Xác minh thành công!
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    {message}
                                </p>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-green-800">
                                        ✅ Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ!
                                    </p>
                                </div>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full"
                                >
                                    Đăng nhập ngay
                                </Button>
                            </div>
                        )}

                        {/* Error State */}
                        {status === 'error' && (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <XCircle size={40} className="text-red-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Xác minh thất bại
                                </h2>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-red-800">
                                        {message}
                                    </p>
                                </div>

                                {/* Resend Verification Section */}
                                <div className="border-t border-gray-100 pt-6 mt-6">
                                    <h3 className="font-medium text-gray-900 mb-4">Gửi lại email kích hoạt?</h3>

                                    {resendStatus === 'sent' ? (
                                        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">
                                            Đã gửi lại email kích hoạt! Vui lòng kiểm tra hộp thư của bạn.
                                        </div>
                                    ) : (
                                        <form onSubmit={handleResendEmail} className="space-y-3">
                                            <input
                                                type="email"
                                                placeholder="Nhập email của bạn"
                                                value={emailToResend}
                                                onChange={(e) => setEmailToResend(e.target.value)}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                            />
                                            <Button
                                                type="submit"
                                                variant="outline"
                                                className="w-full"
                                                disabled={resendStatus === 'sending'}
                                            >
                                                {resendStatus === 'sending' ? 'Đang gửi...' : 'Gửi lại email xác thực'}
                                            </Button>
                                        </form>
                                    )}

                                    {resendStatus === 'error' && (
                                        <p className="text-red-500 text-sm mt-2">
                                            Gửi thất bại. Vui lòng kiểm tra lại email hoặc thử lại sau.
                                        </p>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <Button
                                        onClick={() => navigate('/login')}
                                        className="w-full"
                                    >
                                        Về trang đăng nhập
                                    </Button>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Đăng ký tài khoản mới?
                                    </button>
                                </div>
                            </div>
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

export default VerifyEmail;
