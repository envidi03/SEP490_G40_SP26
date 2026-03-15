import apiClient from './api';

const serviceService = {
    getAllServices: async (params) => {
        try {
            const response = await apiClient.get('/api/service', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    getServiceById: async (id, params = {}) => {
        try {
            const response = await apiClient.get(`/api/service/${id}`, { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    getSubServiceById: async (id) => {
        try {
            const response = await apiClient.get(`/api/service/sub-service/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getSubServicesByParent: async (parentId) => {
        try {
            const response = await apiClient.get(`/api/service/${parentId}/sub-services`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    createService: async (serviceData) => {
        try {
            const response = await apiClient.post('/api/service', serviceData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateService: async (id, serviceData) => {
        try {
            const response = await apiClient.patch(`/api/service/${id}`, serviceData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateServiceStatus: async (id, status) => {
        try {
            const response = await apiClient.patch(`/api/service/status/${id}`, { status });
            return response;
        } catch (error) {
            throw error;
        }
    },

    deleteService: async (id) => {
        try {
            const response = await apiClient.patch(`/api/service/status/${id}`, { status: 'INACTIVE' });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Upload 1 ảnh (backward compat)
     */
    uploadImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await apiClient.post('/api/service/upload-image', formData, {
                headers: { 'Content-Type': undefined },
                timeout: 30000
            });
            const url = response?.data?.url || response?.url;
            return url;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Upload nhiều ảnh cùng lúc
     * @param {File[]} files - Mảng File object
     * @returns {Promise<string[]>} - Mảng URL ảnh đã upload
     */
    uploadImages: async (files) => {
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('images', file));
            const response = await apiClient.post('/api/service/upload-images', formData, {
                headers: { 'Content-Type': undefined },
                timeout: 60000
            });
            const urls = response?.data?.urls || [];
            return urls;
        } catch (error) {
            throw error;
        }
    }
};

export default serviceService;
