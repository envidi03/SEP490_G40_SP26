import HomePage from '../../pages/home_page/HomePage';
import Register from '../../pages/auth/Register';
import Login from '../../pages/auth/Login';


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
    }
];

export default publicRoutes;
