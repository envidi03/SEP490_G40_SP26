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

/**
 * Tạo yêu cầu bổ sung thuốc
 */
exports.createRestockRequest = async (medicineId, data) => {
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
        const error = new Error("Không tìm thấy thuốc");
        error.statusCode = 404;
        throw error;
    }

    if (!data.request_by) {
        const error = new Error("Thiếu thông tin người yêu cầu");
        error.statusCode = 400;
        throw error;
    }

    if (!data.quantity_requested || isNaN(Number(data.quantity_requested)) || Number(data.quantity_requested) < 1) {
        const error = new Error("Số lượng yêu cầu phải là số hợp lệ và lớn hơn 0");
        error.statusCode = 400;
        throw error;
    }

    if (!data.reason || !data.reason.trim()) {
        const error = new Error("Vui lòng nhập lý do yêu cầu");
        error.statusCode = 400;
        throw error;
    }

    if (data.priority && !["low", "medium", "high"].includes(data.priority)) {
        const error = new Error("Mức độ ưu tiên không hợp lệ (low, medium, high)");
        error.statusCode = 400;
        throw error;
    }

    medicine.medicine_restock_requests.push({
        request_by: data.request_by,
        quantity_requested: Number(data.quantity_requested),
        priority: data.priority || "medium",
        reason: data.reason.trim(),
        note: data.note || null
    });

    await medicine.save();

    const newRequest = medicine.medicine_restock_requests[medicine.medicine_restock_requests.length - 1];
    return {
        ...newRequest.toObject(),
        medicine_name: medicine.medicine_name,
        current_quantity: medicine.quantity
    };
};

/**
 * Lấy danh sách tất cả yêu cầu bổ sung thuốc (across all medicines)
 */
exports.getRestockRequests = async ({ status, page = 1, limit = 10 }) => {
    const pipeline = [
        { $unwind: "$medicine_restock_requests" },
    ];

    // Filter theo status
    if (status && status.trim()) {
        pipeline.push({
            $match: { "medicine_restock_requests.status": status.trim() }
        });
    }

    // Sort theo ngày tạo mới nhất
    pipeline.push({ $sort: { "medicine_restock_requests.created_at": -1 } });

    // Đếm tổng
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Medicine.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    // Lookup staff info
    pipeline.push({
        $lookup: {
            from: "staffs",
            localField: "medicine_restock_requests.request_by",
            foreignField: "_id",
            as: "staff_info"
        }
    });

    // Project kết quả
    pipeline.push({
        $project: {
            _id: "$medicine_restock_requests._id",
            medicine_id: "$_id",
            medicine_name: 1,
            current_quantity: "$quantity",
            quantity_requested: "$medicine_restock_requests.quantity_requested",
            priority: "$medicine_restock_requests.priority",
            status: "$medicine_restock_requests.status",
            reason: "$medicine_restock_requests.reason",
            note: "$medicine_restock_requests.note",
            created_at: "$medicine_restock_requests.created_at",
            request_by_name: { $arrayElemAt: ["$staff_info.name", 0] }
        }
    });

    const requests = await Medicine.aggregate(pipeline);

    return {
        requests,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / limitNum),
            totalItems: totalCount,
            itemsPerPage: limitNum
        }
    };
};

/**
 * Cập nhật trạng thái yêu cầu bổ sung thuốc
 */
exports.updateRestockRequestStatus = async (medicineId, requestId, newStatus) => {
    const validStatuses = ["pending", "accept", "reject", "completed"];
    if (!validStatuses.includes(newStatus)) {
        const error = new Error("Trạng thái không hợp lệ (pending, accept, reject, completed)");
        error.statusCode = 400;
        throw error;
    }

    const medicine = await Medicine.findOne({
        "_id": medicineId,
        "medicine_restock_requests._id": requestId
    });

    if (!medicine) {
        const error = new Error("Không tìm thấy thuốc hoặc yêu cầu");
        error.statusCode = 404;
        throw error;
    }

    const request = medicine.medicine_restock_requests.id(requestId);

    // Validate status transition
    if (request.status === "completed") {
        const error = new Error("Yêu cầu đã hoàn thành, không thể thay đổi trạng thái");
        error.statusCode = 400;
        throw error;
    }

    if (request.status === "reject" && newStatus !== "pending") {
        const error = new Error("Yêu cầu đã bị từ chối, chỉ có thể chuyển về chờ duyệt");
        error.statusCode = 400;
        throw error;
    }

    request.status = newStatus;
    await medicine.save();

    return {
        _id: request._id,
        status: request.status,
        medicine_name: medicine.medicine_name
    };
};
