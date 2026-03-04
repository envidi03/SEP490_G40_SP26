import apiClient from './api';

const appointmentService = {
    // Lấy danh sách cuộc hẹn của bệnh nhân (dành cho Patient dashboard)
    getPatientAppointments: async (params) => {
        try {
            const response = await apiClient.get('/api/appointment/patient', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Bệnh nhân tự tạo cuộc hẹn
    createAppointment: async (appointmentData) => {
        try {
            const response = await apiClient.post('/api/appointment', appointmentData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Lấy chi tiết một cuộc hẹn theo ID
    getAppointmentById: async (id) => {
        try {
            const response = await apiClient.get(`/api/appointment/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Hủy cuộc hẹn (cập nhật trạng thái thành CANCELLED)
    cancelAppointment: async (id) => {
        try {
            const response = await apiClient.patch(`/api/dentist/status/${id}`, { status: 'CANCELLED' });
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default appointmentService;
