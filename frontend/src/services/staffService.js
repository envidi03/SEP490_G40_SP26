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
    }
};

export default staffService;
