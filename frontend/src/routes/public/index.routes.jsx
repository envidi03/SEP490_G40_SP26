import HomePage from '../../pages/home_page/HomePage';
import Register from '../../pages/auth/Register';
import Login from '../../pages/auth/Login';
import PublicRoute from '../guards/PublicRoute';
import VerifyEmail from '../../pages/auth/VerifyEmail';
import ForgotPassword from '../../pages/auth/ForgotPassword';
import Contact from '../../pages/public/Contact';
import ServicesPricing from '../../pages/public/ServicesPricing';
import About from '../../pages/public/About';


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
            <PublicRoute allowPatient={true}>
                <VerifyEmail />
            </PublicRoute>
        )
    },

    {
        path: '/forgot-password',
        element: (
            <PublicRoute>
                <ForgotPassword />
            </PublicRoute>
        )
    },
    {
        path: '/about',
        element: (
            <PublicRoute allowPatient={true}>
                <About />
            </PublicRoute>
        )
    },
    {
        path: '/contact',
        element: (
            <PublicRoute allowPatient={true}>
                <Contact />
            </PublicRoute>
        )
    },
    {
        path: '/pricing',
        element: (
            <PublicRoute allowPatient={true}>
                <ServicesPricing />
            </PublicRoute>
        )
    }
];

export default publicRoutes;
