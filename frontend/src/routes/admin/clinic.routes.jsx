import { lazy } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const ClinicList = lazy(() => import('../../pages/admin/clinic/ClinicList'));
const ClinicInfo = lazy(() => import('../../pages/admin/clinic/ClinicInfo'));

const clinicRoutes = [
    {
        path: '/admin/clinics',
        element: (
            <DashboardLayout>
                <ClinicList />
            </DashboardLayout>
        )
    },
    {
        path: '/admin/clinic-info/:clinicId',
        element: (
            <DashboardLayout>
                <ClinicInfo />
            </DashboardLayout>
        )
    }
];

export default clinicRoutes;
