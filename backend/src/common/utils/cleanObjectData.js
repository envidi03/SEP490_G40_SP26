const logger = require('./../../common/utils/logger');

/**
 * Loại bỏ các trường null, undefined hoặc chuỗi rỗng/toàn space trong Object
 * @param {Object} obj - Object cần làm sạch
 * @returns {Object} - Object mới đã được làm sạch
 */
const cleanObjectData = (obj) => {
    // Nếu obj không tồn tại hoặc rỗng thì trả về object rỗng
    if (!obj) return {};

    const newObj = { ...obj }; // Copy object để không sửa trực tiếp biến gốc

    Object.keys(newObj).forEach(key => {
        const value = newObj[key];

        // 1. Xóa nếu là null hoặc undefined
        if (value === null || value === undefined) {
            delete newObj[key];
        }

        // 2. Xử lý nếu là chuỗi
        else if (typeof value === 'string') {
            const trimmedValue = value.trim();

            // Nếu trim xong mà rỗng (tức là input ban đầu là "   " hoặc "")
            if (trimmedValue === '') {
                delete newObj[key]; // Xóa luôn key này -> Giữ lại giá trị cũ trong DB
            } else {
                newObj[key] = trimmedValue; // Cập nhật lại giá trị đã trim sạch sẽ
            }
        }
    });

    logger.debug('Clean data', {
        cleanedData: newObj
    })

    return newObj;
};

module.exports = {
    cleanObjectData
};