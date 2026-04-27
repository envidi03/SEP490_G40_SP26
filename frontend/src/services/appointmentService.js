import apiClient from './api';

const appointmentService = {
    // Lấy danh sách cuộc hẹn của bệnh nhân (dành cho Patient dashboard)
    getPatientAppointments: async (params) => {
        const response = await apiClient.get('/api/appointment/patient', { params });
        return response;
    },

    // Bệnh nhân tự tạo cuộc hẹn
    createAppointment: async (appointmentData) => {
        const response = await apiClient.post('/api/appointment', appointmentData);
        return response;
    },

    // Nhân viên tạo cuộc hẹn cho khách
    staffCreateAppointment: async (appointmentData) => {
        const response = await apiClient.post('/api/appointment/staff', appointmentData);
        return response;
    },

    // Lấy chi tiết một cuộc hẹn theo ID
    getAppointmentById: async (id) => {
        const response = await apiClient.get(`/api/appointment/${id}`);
        return response;
    },

    // Cập nhật thông tin cuộc hẹn (ngày, giờ, lý do) - Dành cho Lễ tân/Admin
    updateAppointment: async (id, data) => {
        const response = await apiClient.patch(`/api/appointment/${id}`, data);
        return response;
    },

    // Bệnh nhân yêu cầu đổi lịch khám
    updatePatientAppointment: async (id, data) => {
        const response = await apiClient.patch(`/api/appointment/${id}`, data);
        return response;
    },

    // Hủy cuộc hẹn (cập nhật trạng thái thành CANCELLED)
    cancelAppointment: async (id) => {
        const response = await apiClient.patch(`/api/appointment/status/${id}`, { status: 'CANCELLED' });
        return response;
    },

    // Lấy danh sách cuộc hẹn cho nhân viên (Receptionist/Admin/Doctor_Assistant)
    getStaffAppointments: async (params) => {
        const response = await apiClient.get('/api/appointment/staff', { params });
        return response;
    },

    // Cập nhật trạng thái cuộc hẹn (Confirmed, Completed, ...)
    updateAppointmentStatus: async (id, status, doctorId = null) => {
        const response = await apiClient.patch(`/api/appointment/status/${id}`, {
            status,
            ...(doctorId && { doctorId })
        });
        return response;
    },

    // Lấy danh sách lịch hẹn của nha sĩ đang đăng nhập
    getDoctorAppointments: async (params) => {
        const response = await apiClient.get('/api/appointment/doctor/appointment', { params });
        return response;
    },

    // Calculator total amount
    calculatorTotalAmount: async (appointmentId) => {
        console.log('Gọi API calculatorTotalAmount với appointmentId:', appointmentId);
        const response = await apiClient.get(`/api/appointment/amount/${appointmentId}`);
        return response;
    },

    getBookServiceFromAppointmentId: async (appointmentId) => {
        console.log('Gọi API calculatorTotalAmount với appointmentId:', appointmentId);
        const response = await apiClient.get(`/api/appointment/service/${appointmentId}`);
        return response;
    },

    getDoctorIdFromAppointmentId: async (appointmentId) => {
        console.log('Gọi API calculatorTotalAmount với appointmentId:', appointmentId);
        const response = await apiClient.get(`/api/appointment/doctor/${appointmentId}`);
        return response;
    },

    // Lấy danh sách cuộc hẹn cần thanh toán (dành cho nhân viên thu ngân)
    getAppointmentsToPayment: async (params) => {
        console.log('Gọi API getAppointmentsToPayment với params:', params);
        const response = await apiClient.get('/api/appointment/staff/appointment/payment', { params });
        console.log('Response từ API getAppointmentsToPayment:', response);
        return response;
    },
};

export default appointmentService;