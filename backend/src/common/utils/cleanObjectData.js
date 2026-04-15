const logger = require('./../../common/utils/logger');

/**
 * Loại bỏ các trường null, undefined hoặc chuỗi rỗng/toàn space trong Object
 * @param {Object} obj - Object cần làm sạch
 * @returns {Object} - Object mới đã được làm sạch
 */
const cleanObjectData = (obj) => {
    if (!obj) return obj;

    // Nếu là array → clean từng phần tử
    if (Array.isArray(obj)) {
        return obj
            .map(item => cleanObjectData(item))
            .filter(item => item !== undefined && item !== null);
    }

    // Nếu là object
    if (typeof obj === 'object') {
        const newObj = {};

        Object.keys(obj).forEach(key => {
            let value = obj[key];

            if (value === null || value === undefined) return;

            if (typeof value === 'string') {
                value = value.trim();
                if (value === '') return;
            }

            if (typeof value === 'object') {
                value = cleanObjectData(value);
                if (
                    value === undefined ||
                    value === null ||
                    (typeof value === 'object' && Object.keys(value).length === 0)
                ) {
                    return;
                }
            }

            newObj[key] = value;
        });

        return newObj;
    }
    logger.debug("Value is not an object or array, returning as is", {
        context: "cleanObjectData",
        value: obj
    });
    return obj;
};

module.exports = {
    cleanObjectData
};