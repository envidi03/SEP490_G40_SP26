import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import route modules
import publicRoutes from "./publicRoutes";
import authRoutes from "./authRoutes";
import patientRoutes from "./patientRoutes";
import appointmentRoutes from "./appointmentRoutes";
import invoiceRoutes from "./invoiceRoutes";
import medicineRoutes from "./medicineRoutes";
import equipmentRoutes from "./equipmentRoutes";
import userRoutes from "./userRoutes";

// Import error pages
import Unauthorized from "../pages/error/Unauthorized";
import NotFound from "../pages/error/NotFound";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map((route, index) => (
          <Route
            key={`public-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Protected Auth Routes (Dashboard) */}
        {authRoutes.map((route, index) => (
          <Route
            key={`auth-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Patient Routes */}
        {patientRoutes.map((route, index) => (
          <Route
            key={`patient-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Appointment Routes */}
        {appointmentRoutes.map((route, index) => (
          <Route
            key={`appointment-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Invoice Routes */}
        {invoiceRoutes.map((route, index) => (
          <Route
            key={`invoice-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Medicine Routes */}
        {medicineRoutes.map((route, index) => (
          <Route
            key={`medicine-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Equipment Routes */}
        {equipmentRoutes.map((route, index) => (
          <Route
            key={`equipment-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* User Routes (Admin only) */}
        {userRoutes.map((route, index) => (
          <Route
            key={`user-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Error Pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />

        {/* Catch all - 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
