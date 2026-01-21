/**
 * Role Configuration
 * Centralized role-based routing configuration following Open/Closed Principle
 * To add a new role, simply add an entry here without modifying login logic
 */

/**
 * Role-based dashboard routes mapping
 * Updated to match backend role names (ADMIN_CLINIC, DOCTOR, etc.)
 * @type {Object.<string, string>}
 */
export const ROLE_ROUTES = {
    // Backend role names (uppercase with underscores)
    'ADMIN_CLINIC': '/admin/dashboard',
    'DOCTOR': '/doctor/dashboard',
    'RECEPTIONIST': '/receptionist/dashboard',
    'PHARMACY': '/pharmacy/dashboard',
    'ASSISTANT': '/assistant/dashboard',
    'PATIENT': '/',
};

/**
 * Get dashboard route for a given role
 * @param {string} role - User role
 * @returns {string} Dashboard route path
 */
export const getDashboardRoute = (role) => {
    // Try exact match first
    if (ROLE_ROUTES[role]) {
        return ROLE_ROUTES[role];
    }

    // Try case-insensitive match
    const roleUpper = role?.toUpperCase();
    const matchedKey = Object.keys(ROLE_ROUTES).find(key => key.toUpperCase() === roleUpper);

    if (matchedKey) {
        return ROLE_ROUTES[matchedKey];
    }

    // Default fallback to homepage
    return '/';
};

/**
 * Check if role has a specific dashboard
 * @param {string} role - User role
 * @returns {boolean}
 */
export const hasDashboard = (role) => {
    const route = getDashboardRoute(role);
    return route !== '/';
};

/**
 * Role display names for UI
 */
export const ROLE_DISPLAY_NAMES = {
    'ADMIN_CLINIC': 'Quản trị viên',
    'DOCTOR': 'Bác sĩ',
    'RECEPTIONIST': 'Lễ tân',
    'PHARMACY': 'Dược sĩ',
    'ASSISTANT': 'Trợ lý',
    'PATIENT': 'Bệnh nhân',
};

/**
 * Get display name for role
 * @param {string} role - User role
 * @returns {string}
 */
export const getRoleDisplayName = (role) => {
    return ROLE_DISPLAY_NAMES[role] || role;
};
