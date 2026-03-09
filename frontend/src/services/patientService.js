import api from './api';

const patientService = {
    // Lấy danh sách bệnh nhân (hỗ trợ search, status, page, limit)
    getAllPatients: (params) => {
        return api.get('/api/patient', { params });
    },

    // Lấy chi tiết bệnh nhân
    getPatientById: (id) => {
        return api.get(`/api/patient/${id}`);
    },

    // Tạo bệnh nhân mới
    createPatient: (data) => {
        return api.post('/api/patient', data);
    },

    // Cập nhật thông tin bệnh nhân
    updatePatient: (id, data) => {
        return api.put(`/api/patient/${id}`, data);
    }
};

export default patientService;
