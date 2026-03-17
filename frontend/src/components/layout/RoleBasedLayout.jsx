import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from './DashboardLayout'; // For ADMIN_CLINIC
import ReceptionistLayout from './receptionist/ReceptionistLayout';
import DentistDashboardLayout from './dentist/DentistDashboardLayout';
import AssistantLayout from './assistant/AssistantLayout';
import PharmacyLayout from './PharmacyLayout';
import PublicLayout from './PublicLayout';

/**
 * A wrapper component that automatically applies the correct layout 
 * based on the authenticated user's role.
 */
const RoleBasedLayout = ({ children }) => {
    const { user } = useAuth();
    const role = user?.role;

    // Map roles to their respective layout components
    switch (role) {
        case 'RECEPTIONIST':
            return <ReceptionistLayout>{children}</ReceptionistLayout>;
        case 'DOCTOR':
            return <DentistDashboardLayout>{children}</DentistDashboardLayout>;
        case 'ASSISTANT':
            return <AssistantLayout>{children}</AssistantLayout>;
        case 'PHARMACY':
            return <PharmacyLayout>{children}</PharmacyLayout>;
        case 'ADMIN_CLINIC':
        case 'ADMIN':
            return <DashboardLayout>{children}</DashboardLayout>;
        case 'PATIENT':
            return <PublicLayout>{children}</PublicLayout>;
        default:
            // Fallback for unknown roles or users without a role
            return <div className="p-6">{children}</div>;
    }
};

export default RoleBasedLayout;
