// utils/validator.js
const checkRequiredFields = (requiredFields, cleanedData, caller = null, methodName = '') => {
    // Tự động xác định tên Class từ instance
    const className = caller?.constructor?.name || 'UnknownClass';
    const context = `${className}${methodName ? '.' + methodName : ''}`;

    for (const field of requiredFields) {
        const value = cleanedData[field];
        if (value === undefined || value === null || String(value).trim() === '') {
            logger.warn(`Missing required field`, {
                context: context, // Kết quả: "StaffController.createController"
                field: field
            });
            throw new errorRes.BadRequestError(`Missing required field: ${field}`);
        }
    }
    return true;
};

module.exports = {checkRequiredFields}