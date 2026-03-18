import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, CheckCircle, AlertTriangle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import Input from '../../components/ui/Input';
import authService from '../../services/authService';

const SetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    useEffect(() => {
        if (!token || !email) {
            triggerToast('Mã xác thực không hợp lệ hoặc đã hết hạn.', 'error');
        }
    }, [token, email]);

    const triggerToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            triggerToast('Mật khẩu xác nhận không khớp!', 'error');
            return;
        }

        if (password.length < 8) {
            triggerToast('Mật khẩu phải có ít nhất 8 ký tự!', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.setupPassword(email, token, password);

            if (response.status === 'success' || response.data?.status === 'success') {
                setSuccess(true);
                triggerToast('Thiết lập mật khẩu thành công!', 'success');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (error) {
            const message = error.data?.message || error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
            triggerToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <Toast 
                    show={showToast} 
                    type={toastType} 
                    message={toastMessage} 
                    onClose={() => setShowToast(false)} 
                />
                <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-xl shadow-lg">
                    <div className="flex justify-center">
                        <CheckCircle className="text-green-500 w-16 h-16" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Thành công!</h2>
                    <p className="text-gray-600">
                        Mật khẩu của bạn đã được thiết lập. Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát...
                    </p>
                    <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-500">
                        Quay lại đăng nhập ngay
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <Toast 
                show={showToast} 
                type={toastType} 
                message={toastMessage} 
                onClose={() => setShowToast(false)} 
            />
            
            <div className="max-w-md w-full space-y-8">
                {/* Back to Homepage Button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
                    <span className="font-medium">Về trang chủ</span>
                </button>

                <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                    <div>
                        <div className="flex justify-center">
                            <div className="p-3 bg-primary-100 rounded-2xl">
                                <Lock className="text-primary-600 w-8 h-8" />
                            </div>
                        </div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Thiết lập mật khẩu
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Chào <span className="font-semibold text-primary-600">{email}</span>, hãy đặt mật khẩu để có thể đăng nhập thủ công sau này.
                        </p>
                    </div>

                    {(!token || !email) ? (
                        <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        Liên kết không hợp lệ. Vui lòng kiểm tra lại email chào mừng của bạn.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="w-full pr-12"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Xác nhận mật khẩu
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            className="w-full pr-12"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700 leading-relaxed border border-blue-100">
                                <p className="font-semibold mb-1 flex items-center gap-1">
                                    <CheckCircle size={12} /> Yêu cầu mật khẩu:
                                </p>
                                <ul className="list-disc list-inside space-y-0.5 ml-1">
                                    <li>Ít nhất 8 ký tự</li>
                                    <li>Có chữ hoa và chữ thường</li>
                                    <li>Có chữ số và ký tự đặc biệt (@, $, !, %,...)</li>
                                </ul>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800'}`}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Đang xử lý...
                                        </div>
                                    ) : 'Xác nhận thiết lập'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SetPassword;
