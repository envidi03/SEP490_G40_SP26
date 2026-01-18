import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PublicLayout from '../../components/layout/PublicLayout';
import { Mail, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = React.useState('');
    const [step, setStep] = React.useState('email'); // 'email' | 'success'
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Mock validation - check if email exists
            if (email && email.includes('@')) {
                setStep('success');
            } else {
                setError('Email không hợp lệ');
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <PublicLayout>
            <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 py-12">
                <div className="max-w-md w-full">
                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                                <KeyRound size={32} className="text-orange-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quên mật khẩu</h1>
                            <p className="text-gray-600">
                                {step === 'email'
                                    ? 'Nhập email để nhận hướng dẫn đặt lại mật khẩu'
                                    : 'Kiểm tra email của bạn'}
                            </p>
                        </div>

                        {/* Content */}
                        {step === 'email' ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
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

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
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
                        ) : (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Mail size={40} className="text-green-600" />
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến:
                                </p>
                                <p className="font-semibold text-primary-600 text-lg mb-6">
                                    {email}
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-blue-800">
                                        💡 <strong>Lưu ý:</strong> Kiểm tra cả thư mục spam nếu không thấy email trong hộp thư đến.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => navigate('/')}
                                    className="w-full"
                                >
                                    Quay lại trang chủ
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
