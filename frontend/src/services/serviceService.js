import apiClient from './api';

const serviceService = {
    getAllServices: (params) => {
        return apiClient.get('/api/service', { params });
    },

    getServiceById: (id, params = {}) => {
        return apiClient.get(`/api/service/${id}`, { params });
    },

    getSubServiceById: (id) => {
        return apiClient.get(`/api/service/sub-service/${id}`);
    },

    getSubServicesByParent: (parentId) => {
        return apiClient.get(`/api/service/${parentId}/sub-services`);
    },

    createService: (serviceData) => {
        return apiClient.post('/api/service', serviceData);
    },

    updateService: (id, serviceData) => {
        return apiClient.patch(`/api/service/${id}`, serviceData);
    },

    updateServiceStatus: (id, status) => {
        return apiClient.patch(`/api/service/status/${id}`, { status });
    },

    deleteService: (id) => {
        return apiClient.patch(`/api/service/status/${id}`, { status: 'INACTIVE' });
    },

    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await apiClient.post('/api/service/upload-image', formData, {
            headers: { 'Content-Type': undefined },
            timeout: 30000
        });

        return response?.data?.url || response?.url;
    },

    uploadImages: async (files) => {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));

        const response = await apiClient.post('/api/service/upload-images', formData, {
            headers: { 'Content-Type': undefined },
            timeout: 60000
        });

        return response?.data?.urls || [];
    }
};

export default serviceService;