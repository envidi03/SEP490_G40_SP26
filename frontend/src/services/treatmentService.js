import apiClient from './api';

const treatmentService = {
    // API dành cho Patient xem danh sách hồ sơ bệnh án của bản thân
    getPatientDentalRecords: (params) => {
        return apiClient.get('/api/dentist/patient/dental-record', { params });
    },

    // XEM chi tiết 1 hồ sơ
    getDentalRecordById: (id) => {
        return apiClient.get(`/api/dentist/dental-record/${id}`);
    },

    /**
     * GET /api/dentist/dental-record
     * Lấy tất cả hồ sơ nha khoa kèm treatments (có medicine_usage lồng bên trong)
     * Dùng cho trang Quản lý Đơn thuốc của Assistant/Doctor
     */
    getAllDentalRecordsWithTreatments: (params = {}) => {
        return apiClient.get('/api/dentist/dental-record', { params });
    },

    /**
     * PATCH /api/dentist/treatment/:id
     * Cập nhật thông tin điều trị (kê thêm thuốc / sửa medicine_usage)
     * Chỉ cập nhật được các field: tooth_position, phase, quantity, planned_price,
     * planned_date, performed_date, result, note, medicine_usage
     */
    updateTreatmentMedicine: (treatmentId, data) => {
        return apiClient.patch(`/api/dentist/treatment/${treatmentId}`, data);
    },

    // Xem chi tiết 1 phiếu điều trị
    viewTreatmentDetail: (treatmentId) => {
        return apiClient.get(`/api/dentist/treatment/${treatmentId}`);
    },

    // TẠO MỚI phiếu điều trị
    createTreatment: (dentalId, data) => {
        return apiClient.post(`/api/dentist/treatment/${dentalId}`, data);
    }
};

export default treatmentService;