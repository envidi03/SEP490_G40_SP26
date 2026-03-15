import apiClient from './api';

const subServiceService = {
    /**
     * Lấy danh sách dịch vụ con theo ID dịch vụ cha
     */
    getSubServicesByParent: async (parentId, params = {}) => {
        try {
            const response = await apiClient.get(`/api/service/${parentId}/sub-services`, { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy chi tiết 1 dịch vụ con
     */
    getSubServiceById: async (subId) => {
        try {
            const response = await apiClient.get(`/api/service/sub-service/${subId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Tạo dịch vụ con mới
     */
    createSubService: async (parentId, data) => {
        try {
            const response = await apiClient.post(`/api/service/${parentId}/sub-services`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cập nhật dịch vụ con
     */
    updateSubService: async (subId, data) => {
        try {
            const response = await apiClient.patch(`/api/service/sub-service/${subId}`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Xóa dịch vụ con
     */
    deleteSubService: async (subId) => {
        try {
            const response = await apiClient.delete(`/api/service/sub-service/${subId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default subServiceService;
