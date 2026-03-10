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
            return data?.data || data; // Handle data wrapping if any
        },
        enabled: !!id, // Only run the query if we have an ID
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
            book_service: Array<{ service_id: string; unit_price: number }>;
        }) => {
            const { data } = await apiClient.post('/api/appointment', payload);
            return data;
        },
        onSuccess: () => {
            // Invalidate appointments to trigger a re-fetch of the upcoming appointments on the Home screen
            queryClient.invalidateQueries({ queryKey: ['appointments', 'patient'] });
        }
    });
}

