import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
                params: { limit: 5, page: 1, filter: 'AVAILABLE' },
            });
            return data;
        },
    });
}

// 2b. Fetch Dental Services with Pagination (Infinite Scroll)
export function useInfiniteServicesData(searchQuery: string = '') {
    return useInfiniteQuery({
        queryKey: ['services', 'infinite', searchQuery],
        queryFn: async ({ pageParam = 1 }) => {
            const params: any = { limit: 10, page: pageParam, filter: 'AVAILABLE' };
            if (searchQuery) {
                params.search = searchQuery;
            }
            const { data } = await apiClient.get('/api/service', { params });
            return data;
        },
        getNextPageParam: (lastPage, allPages) => {
            // the actual array is likely inside lastPage.data
            const items = Array.isArray(lastPage) ? lastPage : (lastPage?.data || []);
            // If we received 10 items, there *might* be a next page
            return items.length === 10 ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
    });
}

// 2c. Fetch Single Service Detail
export function useServiceDetail(id: string) {
    return useQuery({
        queryKey: ['service', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/api/service/${id}`);
            return data?.data || data;
        },
        enabled: !!id,
    });
}

// 3. Fetch Upcoming Appointments (nearest 1)
export function useAppointmentsData() {
    return useQuery({
        queryKey: ['appointments', 'patient'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/appointment/patient', {
                params: { limit: 1, sort: 'asc' },
            });
            return data;
        },
    });
}

// ==========================================
// APPOINTMENT BOOKING API
// ==========================================

export function useCreateAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: {
            full_name: string;
            phone: string;
            email?: string;
            appointment_date: string;
            appointment_time: string;
            book_service: { service_id: string; unit_price: number }[];
        }) => {
            const { data } = await apiClient.post('/api/appointment', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments', 'patient'] });
        }
    });
}

// ==========================================
// PROFILE UPDATE API
// ==========================================

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            full_name?: string;
            dob?: string;
            gender?: string;
            address?: string;
        }) => {
            const { data } = await apiClient.patch('/api/profile/update', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}

// ==========================================
// CHANGE PASSWORD API
// ==========================================

export function useChangePassword() {
    return useMutation({
        mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
            const { data } = await apiClient.post('/api/auth/change-password', payload);
            return data;
        },
    });
}

// ==========================================
// DENTAL RECORD - Full appointment history
// ==========================================

export function useDentalRecordData() {
    return useQuery({
        queryKey: ['dental-record'],
        queryFn: async () => {
            const { data } = await apiClient.get('/api/dentist/patient/dental-record', {
                params: { limit: 50, sort: 'desc' },
            });
            return data;
        },
    });
}
