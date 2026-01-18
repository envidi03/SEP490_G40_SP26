import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import HomePage from '../pages/home_page/HomePage';

const publicRoutes = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "login",
    element: <Login />
  },
  {
    path: "register",
    element: <Register />
  }
];

export default publicRoutes;
