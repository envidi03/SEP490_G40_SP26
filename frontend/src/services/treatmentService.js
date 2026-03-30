import apiClient from './api';
const BASE_API_DENTIST = "/api/dentist";
const treatmentService = {
    // API dành cho Patient xem danh sách hồ sơ bệnh án của bản thân
    getPatientDentalRecords: (params) => {
        return apiClient.get(`${BASE_API_DENTIST}/patient/dental-record`, { params });
    },

    // XEM chi tiết 1 hồ sơ
    getDentalRecordById: (id) => {
        return apiClient.get(`${BASE_API_DENTIST}/dental-record/${id}`);
    },

    /**
     * GET /api/dentist/dental-record
     * Lấy tất cả hồ sơ nha khoa kèm treatments (có medicine_usage lồng bên trong)
     * Dùng cho trang Quản lý Đơn thuốc của Assistant/Doctor
     */
    getAllDentalRecordsWithTreatments: (params = {}) => {
        return apiClient.get(`${BASE_API_DENTIST}/dental-record`, { params });
    },

    /**
     * PATCH /api/dentist/treatment/:id
     * Cập nhật thông tin điều trị (kê thêm thuốc / sửa medicine_usage)
     * Chỉ cập nhật được các field: tooth_position, phase, quantity, planned_price,
     * planned_date, performed_date, result, note, medicine_usage
     */
    updateTreatmentMedicine: (treatmentId, data) => {
        return apiClient.patch(`${BASE_API_DENTIST}/treatment/${treatmentId}`, data);
    },

    // Xem chi tiết 1 phiếu điều trị
    viewTreatmentDetail: (treatmentId) => {
        return apiClient.get(`${BASE_API_DENTIST}/treatment/${treatmentId}`);
    },

    // TẠO MỚI phiếu điều trị
    createTreatment: (dentalId, data) => {
        return apiClient.post(`${BASE_API_DENTIST}/treatment/${dentalId}`, data);
    },

    changeStatusTreatment: (treatmentId, status) => {
        return apiClient.patch(`${BASE_API_DENTIST}/treatment/status/${treatmentId}`, status)
    },

    getListTreatementWithAppointmentNull: (params) => {
        return apiClient.get(`${BASE_API_DENTIST}/treatmen/plan/null/appointment`, { params });
    },
};

export default treatmentService;