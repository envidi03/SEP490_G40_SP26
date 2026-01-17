import Login from '../pages/auth/Login';
import HomePage from '../pages/home_page/HomePage';

const publicRoutes = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "login",
    element: <Login />
  }
];

export default publicRoutes;
