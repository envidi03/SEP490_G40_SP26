import apiClient from './api';

const staffService = {
    /**
     * Lấy danh sách staff với phân trang và tìm kiếm
     * @param {Object} params - { search, filter(gender), sort, page, limit }
     */
    getStaffs: async (params = {}) => {
        try {
            const response = await apiClient.get('/api/staff', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy chi tiết staff theo staffId
     * @param {string} staffId
     */
    getStaffById: async (staffId) => {
        try {
            const response = await apiClient.get(`/api/staff/${staffId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Tạo staff mới (multipart/form-data: avatar + license)
     * @param {FormData} formData
     */
    createStaff: async (formData) => {
        try {
            const response = await apiClient.post('/api/staff', formData, {
                headers: { 'Content-Type': undefined }, // Let Axios set multipart boundary
                timeout: 30000
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cập nhật thông tin staff
     * @param {string} accountId - Account ID (dùng trong URL)
     * @param {FormData|Object} data
     */
    updateStaff: async (accountId, data) => {
        try {
            const isFormData = data instanceof FormData;
            const response = await apiClient.patch(`/api/staff/${accountId}`, data, {
                headers: isFormData ? { 'Content-Type': undefined } : {},
                timeout: 30000
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Cập nhật trạng thái staff (ACTIVE / INACTIVE)
     * @param {string} accountId
     * @param {string} status - 'ACTIVE' | 'INACTIVE'
     */
    updateStaffStatus: async (accountId, status) => {
        try {
            const response = await apiClient.patch(`/api/staff/status/${accountId}`, { status });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy danh sách roles dành cho nhân viên (không bao gồm PATIENT)
     */
    getRoles: async () => {
        try {
            const response = await apiClient.get('/api/staff/roles');
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Lấy danh sách yêu cầu nghỉ phép
     */
    getLeaveRequests: async (params = {}) => {
        try {
            const response = await apiClient.get('/api/staff/leave', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Tạo yêu cầu nghỉ phép mới
     */
    createLeaveRequest: async (data) => {
        try {
            const response = await apiClient.post('/api/staff/leave', data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Chỉnh sửa yêu cầu nghỉ phép
     */
    updateLeaveRequest: async (leaveId, data) => {
        try {
            const response = await apiClient.patch(`/api/staff/leave/${leaveId}`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Hủy yêu cầu nghỉ phép
     */
    cancelLeaveRequest: async (leaveId) => {
        try {
            const response = await apiClient.patch(`/api/staff/leave/cancel/${leaveId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Admin: Lấy tất cả yêu cầu nghỉ phép của tất cả nhân viên
     */
    getAllLeaveRequestsAdmin: async (params = {}) => {
        try {
            const response = await apiClient.get('/api/staff/admin/leave', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Admin: Phê duyệt hoặc từ chối yêu cầu nghỉ phép
     * @param {string} leaveId - ID của leave request
     * @param {string} status - 'APPROVED' | 'REJECTED'
     */
    approveLeaveRequest: async (leaveId, status) => {
        try {
            const response = await apiClient.patch(`/api/staff/admin/leave/${leaveId}`, { status });
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default staffService;
