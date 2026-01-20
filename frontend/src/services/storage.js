/**
 * Storage Service
 * Abstraction layer for browser storage (localStorage/sessionStorage)
 * Follows Dependency Inversion Principle - components depend on this abstraction, not directly on browser APIs
 */

class StorageService {
    constructor(storage = localStorage) {
        this.storage = storage;
    }

    /**
     * Get item from storage
     * @param {string} key - Storage key
     * @returns {any} Parsed value or null
     */
    get(key) {
        try {
            const item = this.storage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error getting item from storage (key: ${key}):`, error);
            return null;
        }
    }

    /**
     * Set item in storage
     * @param {string} key - Storage key
     * @param {any} value - Value to store (will be JSON stringified)
     * @returns {boolean} Success status
     */
    set(key, value) {
        try {
            this.storage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting item in storage (key: ${key}):`, error);
            return false;
        }
    }

    /**
     * Remove item from storage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    remove(key) {
        try {
            this.storage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing item from storage (key: ${key}):`, error);
            return false;
        }
    }

    /**
     * Clear all items from storage
     * @returns {boolean} Success status
     */
    clear() {
        try {
            this.storage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    /**
     * Check if key exists in storage
     * @param {string} key - Storage key
     * @returns {boolean}
     */
    has(key) {
        return this.storage.getItem(key) !== null;
    }

    /**
     * Get all keys from storage
     * @returns {string[]}
     */
    keys() {
        return Object.keys(this.storage);
    }
}

// Create singleton instances
export const storage = new StorageService(localStorage);
export const sessionStorage = new StorageService(window.sessionStorage);

// Export class for testing purposes
export default StorageService;
