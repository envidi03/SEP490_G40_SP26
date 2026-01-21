import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardRoute, hasDashboard } from '../../utils/roleConfig';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>;
    }

    // Nếu user đã login và có role hợp lệ
    if (user && user.role) {
        // Nếu user có dashboard riêng (Admin, Doctor...) -> Redirect về dashboard đó
        if (hasDashboard(user.role)) {
            const dashboardRoute = getDashboardRoute(user.role);
            return <Navigate to={dashboardRoute} replace />;
        }

        // Nếu là Patient (hoặc role không có dashboard riêng biệt trong config), 
        // có thể redirect về Home hoặc giữ nguyên.
        // Tuy nhiên, thường login rồi thì không nên vào lại trang login/register.
        // Redirect về Home là an toàn nhất.
        return <Navigate to="/" replace />;
    }

    // Chưa login -> Cho phép truy cập
    return children || <Outlet />;
};

export default PublicRoute;
