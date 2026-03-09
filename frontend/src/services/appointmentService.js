import apiClient from './api';

/**
 * GET /api/appointment/doctor/appointment
 * Lấy danh sách lịch hẹn của nha sĩ đang đăng nhập
 */
export const getDoctorAppointments = (params) =>
    apiClient.get('/api/appointment/doctor/appointment', { params });
