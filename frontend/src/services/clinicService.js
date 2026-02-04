import apiClient from './api';

const clinicService = {
    /**
     * Get clinic details by ID
     * @param {string} clinicId 
     * @returns {Promise} API response
     */
    getClinicDetail: async (clinicId) => {
        try {
            const response = await apiClient.get(`/api/clinic/${clinicId}`);
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Update clinic details
     * @param {string} clinicId 
     * @param {Object} data - Update data
     * @returns {Promise} API response
     */
    updateClinic: async (clinicId, data) => {
        try {
            const response = await apiClient.patch(`/api/clinic/${clinicId}`, data);
            return response;
        } catch (error) {
            throw error.response || error;
        }
    }
};

export default clinicService;
