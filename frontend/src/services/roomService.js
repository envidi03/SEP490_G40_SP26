import apiClient from './api';

const roomService = {
    /**
     * Get list of rooms with optional filters
     * @param {Object} params - Query parameters (search, status, sort, page, limit)
     * @returns {Promise} API response
     */
    getRooms: async (params = {}) => {
        try {
            const response = await apiClient.get('/api/room', { params });
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Create a new room
     * @param {Object} data - Room data
     * @returns {Promise} API response
     */
    createRoom: async (data) => {
        try {
            const response = await apiClient.post('/api/room', data);
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Get room details by ID
     * @param {string} roomId 
     * @returns {Promise} API response
     */
    getRoomById: async (roomId, params = {}) => {
        try {
            const response = await apiClient.get(`/api/room/${roomId}`, { params });
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Update room details
     * @param {string} roomId 
     * @param {Object} data - Update data
     * @returns {Promise} API response
     */
    updateRoom: async (roomId, data) => {
        try {
            const response = await apiClient.patch(`/api/room/${roomId}`, data);
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Update room status
     * @param {string} roomId 
     * @param {string} status - New status (ACTIVE, INACTIVE, MAINTENANCE)
     * @returns {Promise} API response
     */
    updateRoomStatus: async (roomId, status) => {
        try {
            const response = await apiClient.patch(`/api/room/status/${roomId}`, { status });
            return response;
        } catch (error) {
            throw error.response || error;
        }
    }
};

export default roomService;
