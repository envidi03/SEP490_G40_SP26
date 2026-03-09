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

/**
 * PATCH /api/staff/leave/:id
 * Chỉnh sửa đơn xin phép (chỉ khi ở trạng thái PENDING hoặc DRAFT)
 */
export const updateLeaveRequest = (id, body) =>
    apiClient.patch(`/api/staff/leave/${id}`, body);

/**
 * PATCH /api/staff/leave/cancel/:id
 * Hủy đơn xin phép
 */
export const cancelLeaveRequest = (id) =>
    apiClient.patch(`/api/staff/leave/cancel/${id}`);
