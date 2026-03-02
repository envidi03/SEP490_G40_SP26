import apiClient from './api';

const equipmentService = {
    /**
     * Get list of equipment with optional filters
     * @param {Object} params - Query parameters (search, status, sort, page, limit)
     * @returns {Promise} API response
     */
    getEquipments: async (params = {}) => {
        try {
            const response = await apiClient.get('/api/equipment', { params });
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Create a new equipment
     * @param {Object} data - Equipment data
     * @returns {Promise} API response
     */
    createEquipment: async (data) => {
        try {
            const response = await apiClient.post('/api/equipment', data);
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Get equipment details by ID
     * @param {string} equipmentId 
     * @returns {Promise} API response
     */
    getEquipmentById: async (equipmentId, params = {}) => {
        try {
            const response = await apiClient.get(`/api/equipment/${equipmentId}`, { params });
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Update equipment details
     * @param {string} equipmentId 
     * @param {Object} data - Update data
     * @returns {Promise} API response
     */
    updateEquipment: async (equipmentId, data) => {
        try {
            const response = await apiClient.patch(`/api/equipment/${equipmentId}`, data);
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Update equipment status
     * @param {string} equipmentId 
     * @param {string} status - New status (ACTIVE, INACTIVE, MAINTENANCE, etc.)
     * @returns {Promise} API response
     */
    updateEquipmentStatus: async (equipmentId, status) => {
        try {
            const response = await apiClient.patch(`/api/equipment/status/${equipmentId}`, { status });
            return response;
        } catch (error) {
            throw error.response || error;
        }
    }
};

export default equipmentService;
