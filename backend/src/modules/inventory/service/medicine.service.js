const Medicine = require("../model/medicine.model");

/**
 * Lấy danh sách thuốc có phân trang, tìm kiếm và lọc theo danh mục
 */
exports.getMedicines = async ({ page = 1, limit = 10, search, category }) => {
    const query = {};

    // Tìm kiếm theo tên thuốc hoặc nhà sản xuất
    if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");
        query.$or = [
            { medicine_name: searchRegex },
            { manufacturer: searchRegex }
        ];
    }

    if (category && category.trim()) {
        query.category = category.trim();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const [medicines, totalCount] = await Promise.all([
        Medicine.find(query)
            .select("medicine_name category manufacturer price quantity expiry_date unit dosage_form status")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Medicine.countDocuments(query)
    ]);

    return {
        medicines,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limitNum),
            totalItems: totalCount,
            itemsPerPage: limitNum
        }
    };
};
