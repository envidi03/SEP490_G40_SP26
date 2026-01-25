import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import InvoiceList from '../pages/invoices/InvoiceList';
import PaymentPage from '../pages/invoices/PaymentPage';

// Invoice & Payment management routes
const invoiceRoutes = [
    {
        path: '/invoices',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <InvoiceList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/invoices/:id',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <PaymentPage />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default invoiceRoutes;
