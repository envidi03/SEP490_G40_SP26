
/**
 * Format a date string or object to 'DD/MM/YYYY' format for display
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string or 'N/A' if invalid
 */
export const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return 'N/A';
    }
};

/**
 * Format a date string or object to 'DD/MM/YYYY HH:mm' format for display
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date time string or 'N/A' if invalid
 */
export const formatDateTime = (date) => {
    if (!date) return 'N/A';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'N/A';
    }
};

/**
 * Format a date string to 'YYYY-MM-DD' for input[type="date"] value
 * @param {string|Date} date - The date to format
 * @returns {string} Date string in YYYY-MM-DD format or empty string
 */
export const formatDateForInput = (date) => {
    if (!date) return '';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    } catch (error) {
        return '';
    }
};
