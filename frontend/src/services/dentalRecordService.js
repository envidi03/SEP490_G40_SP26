import apiClient from './api';

/**
 * Dental Record API Service
 * Base URL: http://localhost:5000/api/dentist
 */

/**
 * GET /api/dentist/dental-record
 * Lấy tất cả hồ sơ nha khoa (tất cả bệnh nhân) – dành cho bác sĩ/staff
 * @param {Object} params - query params: search, filter_dental_record, filter_treatment, sort, page, limit
 */
export const getAllDentalRecords = (params = {}) =>
    apiClient.get('/api/dentist/dental-record', { params });

/**
 * GET /api/dentist/staff/patient/:id/dental-record
 * Lấy danh sách hồ sơ nha khoa của 1 bệnh nhân cụ thể (by patientId)
 * @param {string} patientId
 * @param {Object} params - query params: search, filter_dental_record, page, limit
 */
export const getDentalRecordsByPatient = (patientId, params = {}) =>
    apiClient.get(`/api/dentist/staff/patient/${patientId}/dental-record`, { params });

/**
 * GET /api/dentist/dental-record/:id
 * Lấy chi tiết 1 hồ sơ nha khoa (kèm danh sách phiếu điều trị)
 * @param {string} id - dental record id
 * @param {Object} params - optional: treatment_status filter
 */
export const getDentalRecordById = (id, params = {}) =>
    apiClient.get(`/api/dentist/dental-record/${id}`, { params });

/**
 * POST /api/dentist/patient/:id/dental-record
 * Tạo hồ sơ nha khoa mới cho bệnh nhân
 * @param {string} patientId
 * @param {Object} body - { full_name, phone, record_name, description, ... }
 */
export const createDentalRecord = (patientId, body) =>
    apiClient.post(`/api/dentist/dental-record/${patientId}`, body);


/**
 * PUT /api/dentist/dental-record/:id
 * Cập nhật hồ sơ nha khoa
 * @param {string} id
 * @param {Object} body - { full_name, phone, record_name, description, status }
 */
export const updateDentalRecord = (id, body) =>
    apiClient.patch(`/api/dentist/dental-record/${id}`, body);

/**
 * PATCH /api/dentist/treatment/status/:id
 * Cập nhật trạng thái phiếu điều trị (approve/reject/etc)
 * @param {string} id - treatment id
 * @param {string} status - PLANNED, WAITING_APPROVAL, APPROVED, REJECTED, IN_PROGRESS, DONE, CANCELLED
 */
export const updateTreatmentStatus = (id, status) =>
    apiClient.patch(`/api/dentist/treatment/status/${id}`, { status });

/**
 * GET /api/dentist/patient?search=...
 * Tìm bệnh nhân theo thông tin (tên, sdt, ...) để chọn khi tạo hồ sơ
 * @param {string} search
 */
export const findPatientByInfo = (search) =>
    apiClient.get('/api/dentist/patient', { params: { search } });
