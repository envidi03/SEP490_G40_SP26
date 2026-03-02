import { useNavigate, Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const floatingVariants = {
    animate: {
        y: [0, -12, 0],
        transition: {
            duration: 3,
            ease: 'easeInOut',
            repeat: Infinity
        }
    }
};

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-100">

            {/* Background blur shapes */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative max-w-2xl w-full text-center"
            >
                {/* Floating Icon */}
                <motion.div
                    variants={floatingVariants}
                    animate="animate"
                    className="mb-10"
                >
                    <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-xl flex items-center justify-center">
                        <FileQuestion className="w-16 h-16 text-primary-600" />
                    </div>
                </motion.div>

                {/* 404 */}
                <motion.h1
                    variants={itemVariants}
                    className="text-8xl font-extrabold text-gray-900 mb-4 tracking-tight"
                >
                    404
                </motion.h1>

                <motion.h2
                    variants={itemVariants}
                    className="text-3xl font-semibold text-gray-800 mb-4"
                >
                    Trang bạn tìm không tồn tại
                </motion.h2>

                <motion.p
                    variants={itemVariants}
                    className="text-lg text-gray-600 mb-10 max-w-md mx-auto"
                >
                    Có thể đường dẫn đã bị thay đổi, bị xoá hoặc bạn đã nhập sai địa chỉ.
                </motion.p>

                {/* Actions */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 transition-all"
                    >
                        <ArrowLeft size={20} />
                        Quay lại
                    </Button>

                    <Button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:scale-105 transition-transform"
                    >
                        <Home size={20} />
                        Về trang chủ
                    </Button>
                </motion.div>

                {/* Quick links */}
                <motion.div
                    variants={itemVariants}
                    className="mt-12"
                >
                    <p className="text-sm text-gray-500 mb-4">
                        Truy cập nhanh
                    </p>
                    <div className="flex flex-wrap gap-6 justify-center text-sm">
                        <Link to="/" className="text-primary-600 hover:underline">Trang chủ</Link>
                        <Link to="/login" className="text-primary-600 hover:underline">Đăng nhập</Link>
                        <Link to="/register" className="text-primary-600 hover:underline">Đăng ký</Link>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default NotFound;
