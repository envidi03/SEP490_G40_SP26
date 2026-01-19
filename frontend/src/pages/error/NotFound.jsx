import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileQuestion, Home, Search, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';

/**
 * NotFound - Trang 404 Not Found
 * Hiển thị khi user truy cập trang không tồn tại
 * 
 * @component
 */
const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center">
                {/* Icon */}
                <div className="mb-8">
                    <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                        <FileQuestion className="w-16 h-16 text-blue-600" />
                    </div>
                </div>

                {/* Error Code */}
                <h1 className="text-8xl font-bold text-gray-900 mb-4">404</h1>

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Không tìm thấy trang
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                </p>

                {/* Suggestions */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 text-left max-w-md mx-auto">
                    <p className="text-sm text-blue-800 mb-2">
                        <strong>Gợi ý:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                        <li>Kiểm tra lại địa chỉ URL</li>
                        <li>Quay lại trang trước</li>
                        <li>Về trang chủ để tiếp tục</li>
                    </ul>
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

                {/* Quick Links */}
                <div className="mt-12">
                    <p className="text-sm text-gray-500 mb-4">Hoặc truy cập:</p>
                    <div className="flex flex-wrap gap-4 justify-center text-sm">
                        <Link to="/" className="text-primary-600 hover:underline">Trang chủ</Link>
                        <Link to="/login" className="text-primary-600 hover:underline">Đăng nhập</Link>
                        <Link to="/register" className="text-primary-600 hover:underline">Đăng ký</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
