import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/services/api';

// 1. Fetch Profile Data
export function useProfileData() {
    return useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/profile/');
            return data;
        },
    });
}

// 2. Fetch Dental Services
export function useServicesData() {
    return useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/service', {
                params: { limit: 100, page: 1, filter: 'AVAILABLE' },
            });
            return data;
        },
    });
}

// 3. Fetch Upcoming Appointments
export function useAppointmentsData() {
    return useQuery({
        queryKey: ['appointments', 'patient'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/appointment/patient', {
                params: { limit: 5 }, // just get a few for the home screen
            });
            return data;
        },
    });
}
