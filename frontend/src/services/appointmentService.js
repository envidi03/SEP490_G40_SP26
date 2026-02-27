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
    }
};

export default appointmentService;
