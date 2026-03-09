import apiClient from './api';

const treatmentService = {
    // API dành cho Patient xem danh sách hồ sơ bệnh án của bản thân
    getPatientDentalRecords: async (params) => {
        try {
            const response = await apiClient.get('/api/dentist/patient/dental-record', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // XEM chi tiết 1 hồ sơ
    getDentalRecordById: async (id) => {
        try {
            const response = await apiClient.get(`/api/dentist/dental-record/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default treatmentService;
