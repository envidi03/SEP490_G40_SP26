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

/**
 * Upload avatar
 * Đặt Content-Type: undefined để xóa header 'application/json' mặc định của axios instance.
 * Trình duyệt sẽ tự động set 'multipart/form-data; boundary=...' chính xác cho FormData.
 * @param {File} file - Image file to upload
 * @returns {Promise<{data: {avatar_url: string}}>}
 */
export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return await apiClient.post("/api/profile/upload-avatar", formData, {
        headers: { "Content-Type": undefined }
    });
};