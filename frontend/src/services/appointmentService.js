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

    // Nhân viên tạo cuộc hẹn cho khách
    staffCreateAppointment: async (appointmentData) => {
        try {
            const response = await apiClient.post('/api/appointment/staff', appointmentData);
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

    // Cập nhật thông tin cuộc hẹn (ngày, giờ, lý do)
    updateAppointment: async (id, data) => {
        try {
            const response = await apiClient.patch(`/api/appointment/${id}`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Hủy cuộc hẹn (cập nhật trạng thái thành CANCELLED)
    cancelAppointment: async (id) => {
        try {
            const response = await apiClient.patch(`/api/appointment/status/${id}`, { status: 'CANCELLED' });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Lấy danh sách cuộc hẹn cho nhân viên (Receptionist/Admin/Doctor_Assistant)
    getStaffAppointments: async (params) => {
        try {
            const response = await apiClient.get('/api/appointment/staff', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Cập nhật trạng thái cuộc hẹn (Confirmed, Completed, ...)
    updateAppointmentStatus: async (id, status, doctorId = null) => {
        try {
            const response = await apiClient.patch(`/api/appointment/status/${id}`, {
                status,
                ...(doctorId && { doctorId })
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Lấy danh sách lịch hẹn của nha sĩ đang đăng nhập
    getDoctorAppointments: async (params) => {
        try {
            const response = await apiClient.get('/api/appointment/doctor/appointment', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Calculator total amount
    calculatorTotalAmount: async (appointmentId) => {
        return await apiClient.get(`/api/appointment/amount/${appointmentId}`);
    },

    // Lấy danh sách cuộc hẹn cần thanh toán (dành cho nhân viên thu ngân)
    getAppointmentsToPayment: async (params) => {
        return await apiClient.get('/api/appointment/staff/appointment/payment', { params });
    },
    
};

export default appointmentService;
