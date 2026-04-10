import apiClient from './api';

const statisticService = {
    getMoneyStatistics: async (params) => {
        const response = await apiClient.get('/api/statistic/money', { params });
        return response;
    },
    getBookingStatistics: async (params) => {
        const response = await apiClient.get('/api/statistic/booking', { params });
        return response;
    }

};

export default statisticService;