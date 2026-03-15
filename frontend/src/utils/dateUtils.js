
/**
 * Parse a date value safely in local time (avoids UTC midnight shift)
 * @param {string|Date} date
 * @returns {Date|null}
 */
const parseLocalDate = (date) => {
    if (!date) return null;
    if (date instanceof Date) return date;
    // If it's a date-only string (YYYY-MM-DD), parse as local time to avoid UTC shift
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    // Otherwise, parse normally (ISO strings with time/timezone parse correctly)
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
};

/**
 * Format a date string or object to 'DD/MM/YYYY' format for display
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string or 'N/A' if invalid
 */
export const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
        const d = parseLocalDate(date);
        if (!d) return 'N/A';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
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
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
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
        const d = parseLocalDate(date);
        if (!d) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        return '';
    }
};
