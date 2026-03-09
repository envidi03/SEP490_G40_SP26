import apiClient from './api';

/**
 * GET /api/staff/leave?page=1&limit=10&status=PENDING
 * Lấy danh sách đơn xin phép của bản thân (Doctor/Assistant)
 */
export const getMyLeaveRequests = (params) =>
    apiClient.get('/api/staff/leave', { params });

/**
 * POST /api/staff/leave
 * Tạo đơn xin nghỉ phép mới
 * @param {Object} body - { type, startDate, endDate, reason }
 */
export const createLeaveRequest = (body) =>
    apiClient.post('/api/staff/leave', body);
