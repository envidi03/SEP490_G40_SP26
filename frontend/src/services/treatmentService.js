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
    },

    /**
     * GET /api/dentist/dental-record
     * Lấy tất cả hồ sơ nha khoa kèm treatments (có medicine_usage lồng bên trong)
     * Dùng cho trang Quản lý Đơn thuốc của Assistant/Doctor
     */
    getAllDentalRecordsWithTreatments: async (params = {}) => {
        try {
            const response = await apiClient.get('/api/dentist/dental-record', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * PATCH /api/dentist/treatment/:id
     * Cập nhật thông tin điều trị (kê thêm thuốc / sửa medicine_usage)
     * Chỉ cập nhật được các field: tooth_position, phase, quantity, planned_price,
     * planned_date, performed_date, result, note, medicine_usage
     */
    updateTreatmentMedicine: async (treatmentId, data) => {
        try {
            const response = await apiClient.patch(`/api/dentist/treatment/${treatmentId}`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    viewTreatmentDetail: async (treatmentId) => apiClient.get(`/api/dentist/treatment/${treatmentId}`),
};

export default treatmentService;
