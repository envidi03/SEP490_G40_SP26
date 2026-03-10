import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
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
