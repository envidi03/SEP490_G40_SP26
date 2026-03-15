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
            const isFormData = data instanceof FormData;
            const response = await apiClient.patch(`/api/clinic/${clinicId}`, data, {
                headers: {
                    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
                }
            });
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Get all clinics
     * @returns {Promise} API response
     */
    getAllClinics: async () => {
        try {
            const response = await apiClient.get('/api/clinic');
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Get all clinics (Public)
     * @returns {Promise} API response
     */
    getPublicClinics: async () => {
        try {
            const response = await apiClient.get('/api/clinic/public');
            return response;
        } catch (error) {
            throw error.response || error;
        }
    }
};

export default clinicService;
