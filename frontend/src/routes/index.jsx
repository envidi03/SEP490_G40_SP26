import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import role-based routes
import * as adminRoutes from './admin';
import * as receptionistRoutes from './receptionist';
import * as pharmacyRoutes from './pharmacy';
import * as assistantRoutes from './assistant';
import * as doctorRoutes from './doctor';
import * as publicRoutes from './public';
import * as sharedRoutes from './shared';

// Import error pages
import Unauthorized from '../pages/error/Unauthorized';
import NotFound from '../pages/error/NotFound';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.publicRoutes && publicRoutes.publicRoutes.map((route, index) => (
          <Route key={`public-${index}`} path={route.path} element={route.element} />
        ))}

        {/* Admin Routes */}
        {Object.values(adminRoutes).flat().map((route, index) => (
          <Route key={`admin-${index}`} path={route.path} element={route.element} />
        ))}

        {/* Doctor Routes */}
        {Object.values(doctorRoutes).flat().map((route, index) => (
          <Route key={`doctor-${index}`} path={route.path} element={route.element} />
        ))}

        {/* Receptionist Routes */}
        {Object.values(receptionistRoutes).flat().map((route, index) => (
          <Route key={`receptionist-${index}`} path={route.path} element={route.element} />
        ))}

        {/* Pharmacy Routes */}
        {Object.values(pharmacyRoutes).flat().map((route, index) => (
          <Route key={`pharmacy-${index}`} path={route.path} element={route.element} />
        ))}

        {/* Assistant Routes */}
        {Object.values(assistantRoutes).flat().map((route, index) => (
          <Route key={`assistant-${index}`} path={route.path} element={route.element} />
        ))}

        {/* Shared Routes (Profile, etc.) */}
        {sharedRoutes.profileRoutes && sharedRoutes.profileRoutes.map((route, index) => (
          <Route key={`profile-${index}`} path={route.path} element={route.element} />
        ))}

        {/* Common Routes - Patients */}
        {sharedRoutes.patientRoutes && sharedRoutes.patientRoutes.map((route, index) => (
          <Route key={`patient-${index}`} path={route.path} element={route.element} />
        ))}

        {/* Common Routes - Appointments */}
        {sharedRoutes.appointmentRoutes && sharedRoutes.appointmentRoutes.map((route, index) => (
          <Route key={`appointment-${index}`} path={route.path} element={route.element} />
        ))}

        {/* Common Routes - Invoices */}
        {sharedRoutes.invoiceRoutes && sharedRoutes.invoiceRoutes.map((route, index) => (
          <Route key={`invoice-${index}`} path={route.path} element={route.element} />
        ))}

        {/* Common Routes - Medicines */}
        {sharedRoutes.medicineRoutes && sharedRoutes.medicineRoutes.map((route, index) => (
          <Route key={`medicine-${index}`} path={route.path} element={route.element} />
        ))}

        {/* Common Routes - Equipment */}
        {sharedRoutes.equipmentRoutes && sharedRoutes.equipmentRoutes.map((route, index) => (
          <Route key={`equipment-${index}`} path={route.path} element={route.element} />
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
