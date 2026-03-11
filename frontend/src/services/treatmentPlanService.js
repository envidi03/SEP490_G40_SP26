import apiClient from './api';

const treatmentPlanService = {
    // Get list of treatment plans
    getTreatmentPlans: async (params = {}) => {
        try {
            const response = await apiClient.get('/api/dentist/dental-records/plans', { params });
            return response;
        } catch (error) {
            console.error('Error fetching treatment plans:', error);
            throw error;
        }
    },

    // Create a new treatment plan
    createTreatmentPlan: async (planData) => {
        try {
            const response = await apiClient.post('/api/dentist/dental-records/plans', planData);
            return response;
        } catch (error) {
            console.error('Error creating treatment plan:', error);
            throw error;
        }
    },

    // Update an existing treatment plan
    updateTreatmentPlan: async (id, planData) => {
        try {
            const response = await apiClient.put(`/api/dentist/dental-records/plans/${id}`, planData);
            return response;
        } catch (error) {
            console.error('Error updating treatment plan:', error);
            throw error;
        }
    }
};

export default treatmentPlanService;
