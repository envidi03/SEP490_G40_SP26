/**
 * Format date to Vietnamese format (DD/MM/YYYY)
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return date; // Return original if invalid

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Format datetime to Vietnamese format (DD/MM/YYYY HH:mm)
 * @param {string|Date} datetime - Datetime string or Date object
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (datetime) => {
    if (!datetime) return '';

    const d = new Date(datetime);
    if (isNaN(d.getTime())) return datetime; // Return original if invalid

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format date to input value format (YYYY-MM-DD)
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date string for input[type="date"]
 */
export const formatDateForInput = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};
