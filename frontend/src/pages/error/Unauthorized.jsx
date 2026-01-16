import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
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

const pulseVariants = {
    animate: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2.5,
            ease: 'easeInOut',
            repeat: Infinity
        }
    }
};

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 bg-gradient-to-br from-red-50 via-white to-orange-100">

            {/* Background glow */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-200/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative max-w-2xl w-full text-center"
            >
                {/* Shield Icon */}
                <motion.div
                    variants={pulseVariants}
                    animate="animate"
                    className="mb-10"
                >
                    <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-xl flex items-center justify-center">
                        <ShieldAlert className="w-16 h-16 text-red-600" />
                    </div>
                </motion.div>

                {/* Code */}
                <motion.h1
                    variants={itemVariants}
                    className="text-8xl font-extrabold text-gray-900 mb-4 tracking-tight"
                >
                    403
                </motion.h1>

                {/* Title */}
                <motion.h2
                    variants={itemVariants}
                    className="text-3xl font-semibold text-gray-800 mb-4"
                >
                    Truy cập bị hạn chế
                </motion.h2>

                {/* Description */}
                <motion.p
                    variants={itemVariants}
                    className="text-lg text-gray-600 mb-8 max-w-md mx-auto"
                >
                    Bạn không có quyền truy cập vào tài nguyên này.
                    Vui lòng đăng nhập bằng tài khoản có quyền phù hợp.
                </motion.p>

                {/* Permission Info */}
                <motion.div
                    variants={itemVariants}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 mb-10 max-w-md mx-auto text-left"
                >
                    <p className="text-sm text-red-700">
                        <strong>Lý do:</strong> Tài nguyên này được bảo vệ bởi hệ thống phân quyền.
                        Nếu bạn cho rằng đây là nhầm lẫn, hãy liên hệ quản trị viên.
                    </p>
                </motion.div>

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

                {/* Support */}
                <motion.div
                    variants={itemVariants}
                    className="mt-12 text-sm text-gray-500"
                >
                    Cần hỗ trợ? Liên hệ&nbsp;
                    <a
                        href="mailto:support@dcms.com"
                        className="text-primary-600 hover:underline"
                    >
                        support@dcms.com
                    </a>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Unauthorized;
