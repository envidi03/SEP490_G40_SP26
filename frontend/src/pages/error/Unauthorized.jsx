import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';

/**
 * Unauthorized - Trang 403 Forbidden
 * Hiển thị khi user cố truy cập trang không có quyền
 * 
 * @component
 */
const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center">
                {/* Icon */}
                <div className="mb-8">
                    <div className="w-32 h-32 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-16 h-16 text-red-600" />
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="text-8xl font-bold text-gray-900 mb-4">403</h1>

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Truy cập bị từ chối
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    Xin lỗi, bạn không có quyền truy cập trang này.
                    Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                </p>

                {/* Info Box */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 text-left max-w-md mx-auto">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Lưu ý:</strong> Trang này yêu cầu quyền truy cập đặc biệt.
                                Vui lòng đăng nhập với tài khoản có quyền phù hợp.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700"
                    >
                        <ArrowLeft size={20} />
                        Quay lại
                    </Button>

                    <Button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700"
                    >
                        <Home size={20} />
                        Về trang chủ
                    </Button>
                </div>

                {/* Additional Help */}
                <div className="mt-12 text-sm text-gray-500">
                    <p>Cần hỗ trợ? Liên hệ: <a href="mailto:support@dcms.com" className="text-primary-600 hover:underline">support@dcms.com</a></p>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
