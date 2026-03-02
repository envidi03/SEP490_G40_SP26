import apiClient from "./api";

/**
 * Get current profile
 */
export const getProfile = async () => {
    return await apiClient.get("/api/profile/");
};

/**
 * Update profile
 * @param {Object} payload
 * @param {string} payload.full_name
 * @param {string} payload.gender  ("MALE" | "FEMALE" | "OTHER")
 * @param {string} payload.address
 * @param {string} payload.dob (YYYY-MM-DD)
 */
export const updateProfile = async (payload) => {
    return await apiClient.patch("/api/profile/update", payload);
};