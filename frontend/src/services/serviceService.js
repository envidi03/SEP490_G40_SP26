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
        // Hiện tại backend chưa có API delete cứng, có thể là soft delete qua update status
        // Tuy nhiên UI có nút delete, ta sẽ tạm thời gọi updateStatus thành INACTIVE hoặc implement API delete nếu backend có sau này.
        // Dựa vào routes đã check, không có route delete. 
        // Tạm thời giả lập delete bằng cách chuyển status sang inactive hoặc báo lỗi chưa hỗ trợ.
        // Nhưng để UI hoạt động mượt mà, ta sẽ dùng updateStatus('INACTIVE') cho hành động delete.
        try {
            const response = await apiClient.patch(`/api/service/status/${id}`, { status: 'INACTIVE' });
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default serviceService;
