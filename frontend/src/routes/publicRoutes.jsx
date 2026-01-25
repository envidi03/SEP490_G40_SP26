import HomePage from '../pages/home_page/HomePage';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import PatientProfile from '../pages/patients/PatientProfile';
import PatientAppointments from '../pages/patients/PatientAppointments';
import PatientMedicalRecords from '../pages/patients/PatientMedicalRecords';

// Public routes - accessible without authentication
const publicRoutes = [
    {
        path: '/',
        element: <HomePage />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />
    },
    {
        path: '/profile',
        element: <PatientProfile />
    },
    {
        path: '/appointments',
        element: <PatientAppointments />
    },
    {
        path: '/medical-records',
        element: <PatientMedicalRecords />
    }
];

export default publicRoutes;
