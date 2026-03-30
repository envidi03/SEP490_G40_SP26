const Medicine = require("../model/medicine.model");
const MedicineCategory = require("../model/medicine-category.model");
const notificationService = require("../../notification/service/notification.service");

/**
 * Lấy danh sách thuốc có phân trang, tìm kiếm và lọc theo danh mục
 */
exports.getMedicines = async ({ page = 1, limit = 10, search, category, statusFilter }) => {
    const query = {};
    const now = new Date();

    // Tìm kiếm theo tên thuốc hoặc nhà sản xuất
    if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");
        query.$or = [
            { medicine_name: searchRegex },
            { manufacturer: searchRegex }
        ];
    }

    // Lọc theo danh mục (category id)
    if (category && category.trim() && category !== "all") {
        query.category = category.trim();
    }

    // Lọc theo trạng thái (Business Logic)
    if (statusFilter && statusFilter !== 'all') {
        switch (statusFilter) {
            case 'EXPIRED':
                query.$or = [
                    { status: 'EXPIRED' },
                    { expiry_date: { $lt: now } }
                ];
                break;
            case 'EXPIRING_SOON':
                const startOfToday = new Date(now.setHours(0, 0, 0, 0));
                const sixtyDaysLater = new Date(startOfToday);
                sixtyDaysLater.setDate(startOfToday.getDate() + 60);
                query.expiry_date = { $gte: startOfToday, $lte: sixtyDaysLater };
                break;
            case 'LOW_STOCK':
                // Đảm bảo min_quantity tồn tại, nếu không có thì mặc định là 10 hoặc dùng $exists
                query.$and = [
                    { quantity: { $gt: 0 } },
                    {
                        $expr: {
                            $lte: ["$quantity", { $ifNull: ["$min_quantity", 10] }]
                        }
                    }
                ];
                break;
            case 'OUT_OF_STOCK':
                query.quantity = { $lte: 0 };
                break;
            case 'AVAILABLE':
                query.status = 'AVAILABLE';
                query.quantity = { $gt: 0 };
                query.expiry_date = { $gt: now };
                break;
            default:
                // Nếu là các status enum khác
                query.status = statusFilter;
        }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const [medicines, totalCount] = await Promise.all([
        Medicine.find(query)
            .select("medicine_name category manufacturer price quantity expiry_date selling_unit base_unit dosage_form status")
            .populate("category", "name")
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
 * Lấy danh sách danh mục thuốc (từ bảng MedicineCategory)
 */
exports.getCategories = async () => {
    return await MedicineCategory.find({ status: "active" })
        .select("name description")
        .sort({ name: 1 });
};

/**
 * Lấy danh sách dạng bào chế thuốc (thuần túy dược học, không bao gồm dạng đóng gói)
 */
exports.getDosageForms = () => {
    return [
        "Viên nén", "Viên nang", "Viên sủi", "Viên ngậm",
        "Dung dịch", "Siro", "Hỗn dịch",
        "Kem", "Gel", "Bột", "Nhỏ giọt"
    ];
};

/**
 * Lấy danh sách đơn vị BÁN (đơn vị quản lý tồn kho, bán cho bệnh nhân)
 */
exports.getSellingUnits = () => {
    return ['Viên', 'Vỉ', 'Hộp', 'Chai', 'Lọ', 'Tuýp', 'Gói', 'Ống', 'Bộ'];
};

/**
 * Lấy danh sách đơn vị CƠ BẢN (dùng khi kê đơn thuốc)
 */
exports.getBaseUnits = () => {
    return ['Viên', 'ml', 'mg', 'Gói', 'Ống', 'Giọt'];
};

// Giữ lại để backward compatibility (có thể có các endpoint cũ gọi getUnits)
exports.getUnits = exports.getSellingUnits;

/**
 * Thêm thuốc mới
 */
exports.createMedicine = async (data) => {
    const requiredFields = [
        { field: "medicine_name", label: "Tên thuốc" },
        { field: "category", label: "Danh mục" },
        { field: "selling_unit", label: "Đơn vị bán" },
        { field: "base_unit", label: "Đơn vị cơ bản (kê đơn)" },
        { field: "manufacturer", label: "Nhà sản xuất" },
        { field: "price", label: "Giá" },
        { field: "quantity", label: "Số lượng tồn kho" },
        { field: "min_quantity", label: "Tồn kho tối thiểu" },
        { field: "expiry_date", label: "Hạn sử dụng" },
        { field: "units_per_selling_unit", label: "Hệ số quy đổi" }
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

    if (data.dosage_form) {
        const validDosageForms = ["Viên nén", "Viên nang", "Viên sủi", "Viên ngậm", "Dung dịch", "Siro", "Hỗn dịch", "Kem", "Gel", "Bột", "Nhỏ giọt"];
        if (!validDosageForms.includes(data.dosage_form.trim())) {
            const error = new Error("Dạng bào chế không hợp lệ");
            error.statusCode = 400;
            throw error;
        }
    }

    if (data.selling_unit) {
        const validSellingUnits = ['Viên', 'Vỉ', 'Hộp', 'Chai', 'Lọ', 'Tuýp', 'Gói', 'Ống', 'Bộ'];
        if (!validSellingUnits.includes(data.selling_unit.trim())) {
            const error = new Error("Đơn vị bán không hợp lệ");
            error.statusCode = 400;
            throw error;
        }
    }

    if (data.base_unit) {
        const validBaseUnits = ['Viên', 'ml', 'mg', 'Gói', 'Ống', 'Giọt'];
        if (!validBaseUnits.includes(data.base_unit.trim())) {
            const error = new Error("Đơn vị cơ bản không hợp lệ");
            error.statusCode = 400;
            throw error;
        }
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

    if (data.dosage_form) {
        const validDosageForms = ["Viên", "Viên nén", "Viên nang", "Dung dịch", "Siro", "Kem", "Bột", "Gói", "Tuýp", "Chai", "Ống", "Hỗn dịch"];
        if (!validDosageForms.includes(data.dosage_form.trim())) {
            const error = new Error("Dạng bào chế không hợp lệ");
            error.statusCode = 400;
            throw error;
        }
    }

    if (data.unit) {
        const validUnits = ['Viên', 'Chai', 'Lọ', 'Tuýp', 'Hộp', 'Bộ', 'Gói', 'Vỉ', 'Ống', 'ml', 'mg'];
        if (!validUnits.includes(data.unit.trim())) {
            const error = new Error("Đơn vị tính không hợp lệ");
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
    const medicine = await Medicine.findById(id).populate("category", "name description");
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
        note: data.note || null,
        selling_unit: data.selling_unit,
        base_unit: data.base_unit,
        units_per_selling_unit: Number(data.units_per_selling_unit) || 1,
        manufacturer: data.manufacturer
    });

    await medicine.save();

    const newRequest = medicine.medicine_restock_requests[medicine.medicine_restock_requests.length - 1];

    // Gửi thông báo cho Quản lý kho / Dược sĩ
    try {
        await notificationService.sendToRole(['PHARMACIST'], {
            type: 'RESTOCK_REQUESTED',
            title: 'Yêu cầu lấy mới vật tư/thuốc',
            message: `Có yêu cầu bổ sung mới cho thuốc/vật tư "${medicine.medicine_name}" (Số lượng: ${newRequest.quantity_requested}). Mức độ ưu tiên: ${newRequest.priority}.`,
            action_url: `/inventory/restock-requests`
        });
    } catch (err) {
        console.error("Lỗi gửi thông báo RESTOCK_REQUESTED:", err.message);
    }

    return {
        ...newRequest.toObject(),
        medicine_name: medicine.medicine_name,
        current_quantity: medicine.quantity
    };
};

/**
 * Lấy danh sách tất cả yêu cầu bổ sung thuốc (Across all medicines)
 * Hỗ trợ tìm kiếm, lọc theo trạng thái, mức độ ưu tiên và phân trang
 */
exports.getRestockRequests = async ({ status, priority, search, page = 1, limit = 10 }) => {
    // 1. Phân nhánh Thống kê (Global - không bị ảnh hưởng bởi search/filter)
    const statsPipeline = [
        { $unwind: "$medicine_restock_requests" },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                pending: { $sum: { $cond: [{ $eq: ["$medicine_restock_requests.status", "pending"] }, 1, 0] } },
                highPriority: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$medicine_restock_requests.priority", "high"] },
                                    { $eq: ["$medicine_restock_requests.status", "pending"] }
                                ]
                            },
                            1, 0
                        ]
                    }
                },
                completed: { $sum: { $cond: [{ $in: ["$medicine_restock_requests.status", ["completed", "accept"]] }, 1, 0] } }
            }
        }
    ];

    // 2. Phân nhánh Dữ liệu (Có lọc search/status/priority)
    const matchCondition = {};
    if (status && status !== 'all') {
        matchCondition["medicine_restock_requests.status"] = status;
    }
    if (priority && priority !== 'all') {
        matchCondition["medicine_restock_requests.priority"] = priority;
    }

    const basePipeline = [
        { $unwind: "$medicine_restock_requests" }
    ];

    // Bước này cần lookup trước khi lọc search nếu muốn search theo tên nhân viên
    const dataPipeline = [
        { $match: matchCondition },
        // Lookup thông tin nhân viên
        {
            $lookup: {
                from: "staffs",
                localField: "medicine_restock_requests.request_by",
                foreignField: "_id",
                as: "staff_info"
            }
        },
        {
            $lookup: {
                from: "profiles",
                localField: "staff_info.profile_id",
                foreignField: "_id",
                as: "profile_info"
            }
        }
    ];

    // Search theo tên thuốc hoặc tên nhân viên
    if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");
        dataPipeline.push({
            $match: {
                $or: [
                    { "medicine_name": searchRegex },
                    { "profile_info.full_name": searchRegex }
                ]
            }
        });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Final result facets
    const result = await Medicine.aggregate([
        ...basePipeline,
        {
            $facet: {
                data: [
                    ...dataPipeline,
                    { $sort: { "medicine_restock_requests.created_at": -1 } },
                    { $skip: skip },
                    { $limit: limitNum },
                    {
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
                            request_by_name: { $arrayElemAt: ["$profile_info.full_name", 0] }
                        }
                    }
                ],
                totalCount: [
                    ...dataPipeline,
                    { $count: "total" }
                ],
                overallStats: statsPipeline
            }
        }
    ]);

    const requests = result[0]?.data || [];
    const totalItems = result[0]?.totalCount[0]?.total || 0;
    const stats = result[0]?.overallStats[0] || { total: 0, pending: 0, highPriority: 0, completed: 0 };

    return {
        requests,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalItems / limitNum),
            totalItems: totalItems,
            itemsPerPage: limitNum
        },
        statistics: {
            total: stats.total,
            pending: stats.pending,
            highPriority: stats.highPriority,
            completed: stats.completed
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
