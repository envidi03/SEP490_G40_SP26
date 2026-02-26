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

/**
 * Lấy danh sách danh mục thuốc (distinct)
 */
exports.getCategories = async () => {
    return await Medicine.distinct("category");
};

/**
 * Thêm thuốc mới
 */
exports.createMedicine = async (data) => {
    const requiredFields = [
        { field: "medicine_name", label: "Tên thuốc" },
        { field: "category", label: "Danh mục" },
        { field: "unit", label: "Đơn vị" },
        { field: "manufacturer", label: "Nhà sản xuất" },
        { field: "price", label: "Giá" },
        { field: "quantity", label: "Số lượng tồn kho" },
        { field: "min_quantity", label: "Tồn kho tối thiểu" },
        { field: "expiry_date", label: "Hạn sử dụng" }
    ];

    const missingFields = requiredFields.filter(
        ({ field }) => data[field] === undefined || data[field] === null || data[field] === ""
    );

    if (missingFields.length > 0) {
        const error = new Error(
            `Vui lòng điền đầy đủ: ${missingFields.map(f => f.label).join(", ")}`
        );
        error.statusCode = 400;
        throw error;
    }

    if (isNaN(Number(data.price)) || Number(data.price) < 0) {
        const error = new Error("Giá phải là số hợp lệ và không được âm");
        error.statusCode = 400;
        throw error;
    }

    if (isNaN(Number(data.quantity)) || Number(data.quantity) < 0) {
        const error = new Error("Số lượng tồn kho phải là số hợp lệ và không được âm");
        error.statusCode = 400;
        throw error;
    }

    if (isNaN(Number(data.min_quantity)) || Number(data.min_quantity) < 0) {
        const error = new Error("Tồn kho tối thiểu phải là số hợp lệ và không được âm");
        error.statusCode = 400;
        throw error;
    }

    const expiryDate = new Date(data.expiry_date);
    if (isNaN(expiryDate.getTime())) {
        const error = new Error("Hạn sử dụng không hợp lệ");
        error.statusCode = 400;
        throw error;
    }

    if (expiryDate < new Date()) {
        const error = new Error("Hạn sử dụng phải sau ngày hiện tại");
        error.statusCode = 400;
        throw error;
    }

    const existingMedicine = await Medicine.findOne({
        medicine_name: { $regex: new RegExp(`^${data.medicine_name}$`, "i") }
    });

    if (existingMedicine) {
        const error = new Error("Thuốc với tên này đã tồn tại trong hệ thống");
        error.statusCode = 409;
        throw error;
    }

    const medicine = new Medicine(data);
    return await medicine.save();
};

/**
 * Cập nhật thông tin thuốc
 */
exports.updateMedicine = async (id, data) => {
    const medicine = await Medicine.findById(id);
    if (!medicine) {
        const error = new Error("Không tìm thấy thuốc");
        error.statusCode = 404;
        throw error;
    }

    if (data.price !== undefined) {
        if (isNaN(Number(data.price)) || Number(data.price) < 0) {
            const error = new Error("Giá phải là số hợp lệ và không được âm");
            error.statusCode = 400;
            throw error;
        }
    }

    if (data.quantity !== undefined) {
        if (isNaN(Number(data.quantity)) || Number(data.quantity) < 0) {
            const error = new Error("Số lượng tồn kho phải là số hợp lệ và không được âm");
            error.statusCode = 400;
            throw error;
        }
    }

    if (data.min_quantity !== undefined) {
        if (isNaN(Number(data.min_quantity)) || Number(data.min_quantity) < 0) {
            const error = new Error("Tồn kho tối thiểu phải là số hợp lệ và không được âm");
            error.statusCode = 400;
            throw error;
        }
    }

    if (data.expiry_date !== undefined) {
        const expiryDate = new Date(data.expiry_date);
        if (isNaN(expiryDate.getTime())) {
            const error = new Error("Hạn sử dụng không hợp lệ");
            error.statusCode = 400;
            throw error;
        }
    }

    if (data.medicine_name) {
        const duplicate = await Medicine.findOne({
            medicine_name: { $regex: new RegExp(`^${data.medicine_name}$`, "i") },
            _id: { $ne: id }
        });
        if (duplicate) {
            const error = new Error("Thuốc với tên này đã tồn tại trong hệ thống");
            error.statusCode = 409;
            throw error;
        }
    }

    Object.keys(data).forEach((key) => {
        if (key !== "_id" && key !== "medicine_restock_requests") {
            medicine[key] = data[key];
        }
    });

    return await medicine.save();
};

/**
 * Lấy chi tiết thuốc theo ID
 */
exports.getMedicineById = async (id) => {
    const medicine = await Medicine.findById(id);
    if (!medicine) {
        const error = new Error("Không tìm thấy thuốc");
        error.statusCode = 404;
        throw error;
    }
    return medicine;
};
