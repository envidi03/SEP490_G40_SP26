import apiClient from './api';

const inventoryService = {
    // ======================== DASHBOARD ========================

    updateMedicinePartial: async (id, data) => {
        const response = await apiClient.patch(`/api/inventory/medicines/${id}`, data);
        return response;
    },

    importMedicines: async (id, data) => {
        const response = await apiClient.patch(`/api/inventory/import/medicines/${id}`, data);
        return response;
    },

    /**
     * Lấy thống kê tổng quan dashboard kho thuốc
     * GET /api/inventory/dashboard/stats
     */
    getDashboardStats: async () => {
        const response = await apiClient.get('/api/inventory/dashboard/stats');
        return response;
    },

    /**
     * Lấy danh sách thuốc sắp hết hàng
     * GET /api/inventory/dashboard/low-stock?limit=5
     */
    getLowStockMedicines: async (limit = 5) => {
        const response = await apiClient.get('/api/inventory/dashboard/low-stock', {
            params: { limit },
        });
        return response;
    },

    /**
     * Lấy danh sách thuốc sắp hết hạn
     * GET /api/inventory/dashboard/near-expired?days=30
     */
    getNearExpiredMedicines: async (days = 30) => {
        const response = await apiClient.get('/api/inventory/dashboard/near-expired', {
            params: { days },
        });
        return response;
    },

    /**
     * Lấy danh sách theo dõi tồn kho (có phân trang)
     * GET /api/inventory/dashboard/stock-tracking
     */
    getStockTracking: async (params = {}) => {
        const response = await apiClient.get('/api/inventory/dashboard/stock-tracking', { params });
        return response;
    },

    // ======================== MEDICINES ========================

    /**
     * Lấy danh sách thuốc (có phân trang, tìm kiếm, lọc)
     * GET /api/inventory/medicines
     */
    getMedicines: async (params = {}) => {
        const response = await apiClient.get('/api/inventory/medicines', { params });
        return response;
    },

    /**
     * Lấy danh sách danh mục thuốc
     * GET /api/inventory/medicines/categories
     */
    getCategories: async () => {
        const response = await apiClient.get('/api/inventory/medicines/categories');
        return response;
    },

    /**
     * Lấy danh sách dạng bào chế thuốc
     * GET /api/inventory/medicines/dosage-forms
     */
    getDosageForms: async () => {
        const response = await apiClient.get('/api/inventory/medicines/dosage-forms');
        return response;
    },

    /**
     * Lấy danh sách đơn vị tính thuốc (backward compat)
     * GET /api/inventory/medicines/units
     */
    getUnits: async () => {
        const response = await apiClient.get('/api/inventory/medicines/units');
        return response;
    },

    /**
     * Lấy danh sách đơn vị BÁN (quản lý tồn kho)
     * GET /api/inventory/medicines/selling-units
     */
    getSellingUnits: async () => {
        const response = await apiClient.get('/api/inventory/medicines/selling-units');
        return response;
    },

    /**
     * Lấy danh sách đơn vị CƠ BẢN (dùng khi kê đơn thuốc)
     * GET /api/inventory/medicines/base-units
     */
    getBaseUnits: async () => {
        const response = await apiClient.get('/api/inventory/medicines/base-units');
        return response;
    },

    /**
     * Lấy chi tiết thuốc theo ID
     * GET /api/inventory/medicines/:id
     */
    getMedicineById: async (id) => {
        const response = await apiClient.get(`/api/inventory/medicines/${id}`);
        return response;
    },

    /**
     * Thêm thuốc mới
     * POST /api/inventory/medicines
     */
    createMedicine: async (data) => {
        const response = await apiClient.post('/api/inventory/medicines', data);
        return response;
    },

    /**
     * Cập nhật thông tin thuốc
     * PUT /api/inventory/medicines/:id
     */
    updateMedicine: async (id, data) => {
        const response = await apiClient.put(`/api/inventory/medicines/${id}`, data);
        return response;
    },

    // ======================== RESTOCK REQUESTS ========================

    /**
     * Lấy tất cả yêu cầu bổ sung thuốc
     * GET /api/inventory/restock-requests
     */
    getRestockRequests: async (params = {}) => {
        const response = await apiClient.get('/api/inventory/restock-requests', { params });
        return response;
    },

    /**
     * Tạo yêu cầu bổ sung thuốc
     * POST /api/inventory/medicines/:id/restock-requests
     */
    createRestockRequest: async (medicineId, data) => {
        const response = await apiClient.post(
            `/api/inventory/medicines/${medicineId}/restock-requests`,
            data
        );
        return response;
    },

    /**
     * Cập nhật trạng thái yêu cầu bổ sung thuốc
     * PATCH /api/inventory/medicines/:id/restock-requests/:requestId
     */
    updateRestockRequestStatus: async (medicineId, requestId, status) => {
        const response = await apiClient.patch(
            `/api/inventory/medicines/${medicineId}/restock-requests/${requestId}`,
            { status }
        );
        return response;
    },

    // ======================== PRESCRIPTIONS ========================

    /**
     * Lấy danh sách đơn thuốc sau khám
     * GET /api/inventory/prescriptions
     */
    getPrescriptions: async (params = {}) => {
        const response = await apiClient.get('/api/inventory/prescriptions', { params });
        return response;
    },

    /**
     * Xuất thuốc theo đơn (trừ kho)
     * POST /api/inventory/prescriptions/:id/dispense
     */
    dispensePrescription: async (id) => {
        const response = await apiClient.post(`/api/inventory/prescriptions/${id}/dispense`);
        return response;
    },
};

export default inventoryService;
