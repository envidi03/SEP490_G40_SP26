import HomePage from '../../pages/home_page/HomePage';
import Register from '../../pages/auth/Register';
import Login from '../../pages/auth/Login';
import PublicRoute from '../guards/PublicRoute';
import VerifyEmail from '../../pages/auth/VerifyEmail';


// Public routes - accessible without authentication
const publicRoutes = [
    {
        path: '/',
        element: <HomePage />
    },
    {
        path: '/login',
        element: (
            <PublicRoute>
                <Login />
            </PublicRoute>
        )
    },
    {
        path: '/register',
        element: (
            <PublicRoute>
                <Register />
            </PublicRoute>
        )
    },
    {
        path: '/verify-email',
        element: (
            <PublicRoute>
                <VerifyEmail />
            </PublicRoute>
        )
    },
];

export default publicRoutes;
