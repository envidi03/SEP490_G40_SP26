const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");

const EquipmentModel = require("../models/equipment.model");
const Pagination = require("../../../common/responses/Pagination");
const mongoose = require("mongoose");

/**
 * Get list of equipments with pagination and filter (Optimized for Nested Array, No $unwind)
 *
 * Query Params:
 * - search: Tìm kiếm theo tên máy, số serial, nhà cung cấp (Cấp độ thiết bị con)
 * - category_status: Lọc theo trạng thái danh mục - ACTIVE, INACTIVE (Cấp độ danh mục cha)
 * - status: Lọc theo trạng thái máy - READY, IN_USE, MAINTENANCE... (Cấp độ thiết bị con)
 * - sort: Sắp xếp (asc/desc) theo tên danh mục (equipment_type)
 * - page: Số trang hiện tại
 * - limit: Số lượng danh mục trên 1 trang
 */
const getEquipments = async (query) => {
    try {
        // --- 1. CHUẨN HÓA THAM SỐ TỪ QUERY ---
        const search = query.search?.trim();

        // Trạng thái của thiết bị con (Ví dụ: READY, IN_USE...)
        const itemStatusFilter = query.status ? query.status.toUpperCase() : null;

        // Trạng thái của danh mục cha (Ví dụ: ACTIVE, INACTIVE)
        const categoryStatusFilter = query.category_status ? query.category_status.toUpperCase() : null;

        // Sắp xếp theo tên danh mục (equipment_type)
        const sortOrder = query.sort === "desc" ? -1 : 1;

        // Phân trang
        const page = parseInt(query.page || 1);
        const limit = parseInt(query.limit || 5);
        const skip = (page - 1) * limit;

        logger.debug("Fetching equipments with query", {
            context: "EquipmentService.getEquipments",
            query: query,
        });

        // --- 2. XÂY DỰNG ĐIỀU KIỆN LỌC (AGGREGATION PIPELINE) ---

        // BƯỚC 2.1: Điều kiện lọc thô (Match ở cấp độ Document Cha)
        const initialMatch = {};

        // Lọc theo trạng thái danh mục (Nằm ở cấp độ gốc của Document)
        if (categoryStatusFilter) {
            initialMatch.status = categoryStatusFilter;
        }

        // Điều kiện lọc dành cho mảng thiết bị con (Dùng cho toán tử $elemMatch)
        const childElemMatch = {};

        // Lọc theo trạng thái thiết bị con
        if (itemStatusFilter) {
            childElemMatch.status = itemStatusFilter;
        }

        // Lọc theo từ khóa tìm kiếm (Tên máy, Serial, Nhà cung cấp)
        if (search) {
            childElemMatch.$or = [
                { equipment_name: { $regex: search, $options: "i" } },
                { equipment_serial_number: { $regex: search, $options: "i" } },
                { supplier: { $regex: search, $options: "i" } }
            ];
        }

        // Nếu có điều kiện lọc thiết bị con, DB chỉ lấy những Danh mục có chứa ít nhất 1 máy con thỏa mãn
        if (Object.keys(childElemMatch).length > 0) {
            initialMatch.equipment = { $elemMatch: childElemMatch };
        }

        // BƯỚC 2.2: Điều kiện "Gọt mảng" (Lọc phần tử con trong RAM bằng $filter)
        const arrayFilterConditions = [];

        if (itemStatusFilter) {
            arrayFilterConditions.push({ $eq: ["$$item.status", itemStatusFilter] });
        }

        if (search) {
            arrayFilterConditions.push({
                $or: [
                    // Dùng $ifNull để tránh sập query nếu data cũ bị thiếu field
                    { $regexMatch: { input: { $ifNull: ["$$item.equipment_name", ""] }, regex: search, options: "i" } },
                    { $regexMatch: { input: { $ifNull: ["$$item.equipment_serial_number", ""] }, regex: search, options: "i" } },
                    { $regexMatch: { input: { $ifNull: ["$$item.supplier", ""] }, regex: search, options: "i" } }
                ]
            });
        }

        // --- 3. THỰC THI AGGREGATION PIPELINE ---
        const aggregatePipeline = [
            // Stage 1: Sàng lọc thô (Chỉ lấy các danh mục phù hợp)
            { $match: initialMatch },

            // Stage 2: Gọt mảng (Loại bỏ các máy con không khớp điều kiện khỏi mảng equipment)
            ...(arrayFilterConditions.length > 0 ? [
                {
                    $addFields: {
                        equipment: {
                            $filter: {
                                input: { $ifNull: ["$equipment", []] }, // Đảm bảo an toàn nếu mảng equipment bị null
                                as: "item",
                                cond: { $and: arrayFilterConditions }
                            }
                        }
                    }
                }
            ] : []),

            // Stage 3: Sắp xếp kết quả theo tên danh mục
            { $sort: { equipment_type: sortOrder } },

            // Stage 4: Phân trang (Tách làm 2 luồng: Lấy data và Đếm tổng số)
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            // Ẩn đi các trường không cần thiết để giảm tải JSON trả về
                            $project: {
                                __v: 0,
                                createdAt: 0,
                                updatedAt: 0,
                                "equipment.maintenance_history": 0,
                                "equipment.equipments_log": 0
                            }
                        }
                    ],
                    totalItems: [{ $count: "count" }]
                }
            }
        ];

        const result = await EquipmentModel.aggregate(aggregatePipeline);

        // --- 4. XỬ LÝ KẾT QUẢ VÀ TRẢ VỀ ---
        const data = result[0]?.data || [];
        const totalItemsCount = result[0]?.totalItems[0]?.count || 0;

        const pagination = new Pagination({
            page: page,
            size: limit,
            totalItems: totalItemsCount,
        });

        return { data, pagination };

    } catch (error) {
        logger.error("Error getting equipments", {
            context: "EquipmentService.getEquipments",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau");
    }
};

/*
    get equipment by id with 
        filter maintenance_history 
        (
            filter_maintence_history: maintenance_start_date <= maintenance_date <= maintenance_end_date 
            sort_maintence_history: maintenance_date
            page_maintence_history  
            limit_maintence_history
        )

        filter equipments_logs
        (
            filter_equipments_logs: usage_start_date <= usage_date <= usage_end_date
            sort_equipments_logs: usage_date
            page_equipments_logs  
            limit_equipments_logs
        )
*/
const getEquipmentById = async (id, query) => {
    try {
        logger.debug("Fetching equipment by id (Nested Model)", {
            context: "EquipmentService.getEquipmentById",
            id: id,
            query: query,
        });

        // --- 1. PREPARE VARIABLES ---
        const page_maintence = parseInt(query.page_maintence_history || 1);
        const limit_maintence = parseInt(query.limit_maintence_history || 5);
        const skip_maintence = (page_maintence - 1) * limit_maintence;
        const sort_maintence_val = query.sort_maintence_history === "desc" ? -1 : 1;

        const page_logs = parseInt(query.page_equipments_logs || 1);
        const limit_logs = parseInt(query.limit_equipments_logs || 5);
        const skip_logs = (page_logs - 1) * limit_logs;
        const sort_logs_val = query.sort_equipments_logs === "desc" ? -1 : 1;

        // --- 2. BUILD FILTER CONDITIONS ---
        // Sử dụng maintenance_date theo model mới
        const filter_maintence_history = query.filter_maintence_history || {};
        let maintConditions = [];
        if (filter_maintence_history.maintence_start_date) {
            maintConditions.push({ $gte: ["$$item.maintenance_date", new Date(filter_maintence_history.maintence_start_date)] });
        }
        if (filter_maintence_history.maintence_end_date) {
            maintConditions.push({ $lte: ["$$item.maintenance_date", new Date(filter_maintence_history.maintence_end_date)] });
        }
        let maintFilterExpression = maintConditions.length > 0 ? { $and: maintConditions } : { $literal: true };

        const filter_equipments_logs = query.filter_equipments_logs || {};
        let logConditions = [];
        if (filter_equipments_logs.usage_start_date) {
            logConditions.push({ $gte: ["$$item.usage_date", new Date(filter_equipments_logs.usage_start_date)] });
        }
        if (filter_equipments_logs.usage_end_date) {
            logConditions.push({ $lte: ["$$item.usage_date", new Date(filter_equipments_logs.usage_end_date)] });
        }
        let logFilterExpression = logConditions.length > 0 ? { $and: logConditions } : { $literal: true };

        // --- 3. AGGREGATION PIPELINE ---
        const aggregateResult = await EquipmentModel.aggregate([
            // Tìm document có chứa thiết bị con cụ thể
            { $match: { "equipment._id": new mongoose.Types.ObjectId(id) } },

            // Trích xuất thiết bị con mục tiêu và thông tin cha (equipment_type)
            {
                $project: {
                    equipment_type: 1,
                    category_status: "$status",
                    target: {
                        $first: {
                            $filter: {
                                input: "$equipment",
                                as: "eq",
                                cond: { $eq: ["$$eq._id", new mongoose.Types.ObjectId(id)] }
                            }
                        }
                    }
                }
            },

            // Xử lý các mảng lịch sử bên trong thiết bị con đã tìm được
            {
                $addFields: {
                    safe_maint: { $ifNull: ["$target.maintenance_history", []] },
                    safe_logs: { $ifNull: ["$target.equipments_log", []] }
                }
            },
            {
                $addFields: {
                    filtered_maint: {
                        $filter: {
                            input: "$safe_maint",
                            as: "item",
                            cond: maintFilterExpression
                        }
                    },
                    filtered_logs: {
                        $filter: {
                            input: "$safe_logs",
                            as: "item",
                            cond: logFilterExpression
                        }
                    }
                }
            },
            {
                $project: {
                    // Thông tin cơ bản của thiết bị con
                    _id: "$target._id",
                    equipment_name: "$target.equipment_name",
                    equipment_serial_number: "$target.equipment_serial_number",
                    purchase_date: "$target.purchase_date",
                    supplier: "$target.supplier",
                    warranty: "$target.warranty",
                    status: "$target.status",

                    // Thông tin loại (cha)
                    equipment_type: 1,
                    category_status: 1,

                    // Thống kê số lượng để phân trang
                    maint_total: { $size: "$filtered_maint" },
                    logs_total: { $size: "$filtered_logs" },

                    // Phân trang và sắp xếp mảng lồng nhau
                    maint_items: {
                        $slice: [
                            { $sortArray: { input: "$filtered_maint", sortBy: { maintenance_date: sort_maintence_val } } },
                            skip_maintence,
                            limit_maintence
                        ]
                    },
                    logs_items: {
                        $slice: [
                            { $sortArray: { input: "$filtered_logs", sortBy: { usage_date: sort_logs_val } } },
                            skip_logs,
                            limit_logs
                        ]
                    }
                }
            }
        ]);

        if (!aggregateResult || aggregateResult.length === 0) return null;

        const rawData = aggregateResult[0];

        // --- 4. FORMAT FINAL DATA WITH PAGINATION OBJECT ---
        const data = {
            ...rawData,
            maintenance_history: {
                items: rawData.maint_items,
                pagination: new Pagination({
                    page: page_maintence,
                    size: limit_maintence,
                    totalItems: rawData.maint_total
                })
            },
            equipments_log: {
                items: rawData.logs_items,
                pagination: new Pagination({
                    page: page_logs,
                    size: limit_logs,
                    totalItems: rawData.logs_total
                })
            }
        };

        // Dọn dẹp các trường phụ
        delete data.maint_items;
        delete data.maint_total;
        delete data.logs_items;
        delete data.logs_total;

        return data;

    } catch (error) {
        logger.error("Error getting equipment by id", {
            context: "EquipmentService.getEquipmentById",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            "Hệ thống lỗi, vui lòng thực hiện sau"
        );
    }
};

/**
 * Check if equipment serial number exists
 * @param {String} serialNumber serial number to check
 * @returns returns true if serial number exists, false otherwise
 */
const checkExitSerialNumber = async (serialNumber) => {
    try {
        logger.debug("Checking existence of equipment serial number", {
            context: "EquipmentService.checkExitSerialNumber",
            serialNumber: serialNumber,
        });
        const equipment = await EquipmentModel.findOne({ equipment_serial_number: serialNumber });
        logger.debug("Existence check completed", {
            context: "EquipmentService.checkExitSerialNumber",
            equipment: equipment,
        });
        return equipment !== null;
    } catch (error) {
        logger.error("Error checking equipment serial number", {
            context: "EquipmentService.checkExitSerialNumber",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            "Hệ thống lỗi, vui lòng thực hiện sau"
        );
    }
};

/**
 * Create a new equipment (Strictly Create - Bắt lỗi nếu trùng equipment_type)
 * @param {Object} dataCreate { equipment_type: "...", equipment: [...] }
 * @returns saved equipment document
 */
const createEquipment = async (dataCreate) => {
    const context = "EquipmentService.createEquipment";
    try {
        logger.debug("Processing new equipment data", {
            context: context,
            dataCreate: dataCreate
        });

        // TÌM KIẾM xem loại thiết bị này đã tồn tại chưa
        const category = await EquipmentModel.findOne({
            equipment_type: dataCreate.equipment_type
        }).lean();

        // NẾU ĐÃ TỒN TẠI -> Chặn không cho tạo và ném lỗi Conflict
        if (category) {
            logger.warn("Equipment type already exists", {
                context: context,
                equipment_type: dataCreate.equipment_type
            });
            throw new errorRes.ConflictError(`Loại thiết bị '${dataCreate.equipment_type}' đã tồn tại. Vui lòng sử dụng chức năng thêm thiết bị vào danh mục.`);
        }

        // NẾU CHƯA TỒN TẠI -> Tạo document mới hoàn toàn
        logger.debug("Equipment type does not exist, creating new document", { context });

        const newCategory = new EquipmentModel(dataCreate);
        const savedEquipment = await newCategory.save();

        logger.debug("Equipment created successfully", { context });

        return savedEquipment;

    } catch (error) {
        logger.error("Error creating equipment", {
            context: context,
            message: error.message,
            stack: error.stack,
        });

        // Giữ lại mã lỗi gốc (ví dụ: 409 Conflict) để trả về đúng cho Frontend
        if (error.statusCode) throw error;

        throw new errorRes.InternalServerError(
            "Hệ thống lỗi, vui lòng thực hiện sau"
        );
    }
};

/**
 * Thêm một mảng các thiết bị con vào một danh mục thiết bị đã tồn tại
 * @param {ObjectId} categoryId ID của document cha
 * @param {Array} newItems Mảng chứa các object thiết bị mới đã được làm sạch
 * @returns document sau khi đã được thêm
 */
const addEquipmentItems = async (categoryId, newItems) => {
    const context = "EquipmentService.addEquipmentItems";
    try {
        // Sử dụng $push kết hợp $each để thêm nhiều phần tử vào mảng cùng lúc
        const updatedCategory = await EquipmentModel.findByIdAndUpdate(
            categoryId,
            {
                $push: {
                    equipment: { $each: newItems }
                }
            },
            { new: true, runValidators: true }
        );

        // Nếu trả về null nghĩa là cái categoryId truyền vào bị sai hoặc đã bị xóa
        if (!updatedCategory) {
            throw new errorRes.NotFoundError("Không tìm thấy danh mục thiết bị");
        }

        return updatedCategory;

    } catch (error) {
        logger.error("Error adding equipment items", {
            context: context,
            categoryId: categoryId,
            message: error.message,
            stack: error.stack
        });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(
            "Hệ thống lỗi, vui lòng thực hiện sau"
        );
    }
};

/**
 * Check if equipment serial number exists excluding a specific equipment id
 * 
 * @param {String} serialNumber serial number to check
 * @param {ObjectId} id equipment id to exclude
 * @returns returns true if serial number exists excluding the given id, false otherwise
 */
const checkExitSerialNumberNotId = async (serialNumber, id) => {
    try {
        logger.debug("Checking existence of equipment serial number excluding specific ID", {
            context: "EquipmentService.checkExitSerialNumberNotId",
            serialNumber: serialNumber,
            id: id,
        });
        const equipment = await EquipmentModel.findOne({
            equipment_serial_number: serialNumber,
            _id: { $ne: id }
        });
        logger.debug("Existence check completed", {
            context: "EquipmentService.checkExitSerialNumberNotId",
            equipment: equipment,
        });
        return equipment !== null;
    } catch (error) {
        logger.error("Error checking equipment serial number", {
            context: "EquipmentService.checkExitSerialNumberNotId",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            "Hệ thống lỗi, vui lòng thực hiện sau"
        );
    }
};

const updateCategory = async (categoryId, updateData) => {
    const context = "EquipmentService.updateCategory";
    try {
        // Update document cha cực nhanh, bỏ qua array equipment
        const updatedCategory = await EquipmentModel.findByIdAndUpdate(
            categoryId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) throw new errorRes.NotFoundError("Equipment category not found");
        return updatedCategory;
    } catch (error) {
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau");
    }
};

/**
 * Update 1 item cụ thể trong mảng equipment
 */
const updateEquipmentItem = async (categoryId, dataUpdate) => {
    const context = "EquipmentService.updateEquipmentCategory";
    logger.debug("Updating equipment category with data", {
        context,
        categoryId,
        dataUpdate
    });

    try {
        const updatedDoc = await EquipmentModel.findByIdAndUpdate(
            categoryId,
            { $set: dataUpdate },
            { new: true, runValidators: true }
        );

        if (!updatedDoc) {
            throw new errorRes.NotFoundError("Không tìm thấy danh mục thiết bị");
        }
        return updatedDoc;

    } catch (error) {
        logger.error("Error updating equipment category", { context, message: error.message });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau");
    }
};

/*
 * get statistics of equipments based on their status (Nested Array - Safe with $ifNull)
 */
const getStatistics = async () => {
    try {
        logger.debug("Fetching equipment statistics", {
            context: "EquipmentService.getStatistics"
        });

        const result = await EquipmentModel.aggregate([
            {
                // BƯỚC 0 (QUAN TRỌNG): Xử lý an toàn mảng equipment, nếu null thì đổi thành mảng rỗng []
                // Tạo ra một trường ảo tên là safeEquipment để dùng cho các bước sau cho gọn
                $addFields: {
                    safeEquipment: { $ifNull: ["$equipment", []] }
                }
            },
            {
                // Bước 1: Đếm số lượng theo từng trạng thái dựa trên safeEquipment
                $addFields: {
                    readyCount: { $size: { $filter: { input: "$safeEquipment", as: "item", cond: { $eq: ["$$item.status", "READY"] } } } },
                    inUseCount: { $size: { $filter: { input: "$safeEquipment", as: "item", cond: { $eq: ["$$item.status", "IN_USE"] } } } },
                    maintenanceCount: { $size: { $filter: { input: "$safeEquipment", as: "item", cond: { $eq: ["$$item.status", "MAINTENANCE"] } } } },
                    repairingCount: { $size: { $filter: { input: "$safeEquipment", as: "item", cond: { $eq: ["$$item.status", "REPAIRING"] } } } },
                    faultyCount: { $size: { $filter: { input: "$safeEquipment", as: "item", cond: { $eq: ["$$item.status", "FAULTY"] } } } },
                    sterilizingCount: { $size: { $filter: { input: "$safeEquipment", as: "item", cond: { $eq: ["$$item.status", "STERILIZING"] } } } }
                }
            },
            {
                // Bước 2: Gom tất cả các document lại và tính tổng
                $group: {
                    _id: null,
                    total: { $sum: { $size: "$safeEquipment" } }, // Đếm trên safeEquipment sẽ không bao giờ lỗi
                    ready: { $sum: "$readyCount" },
                    in_use: { $sum: "$inUseCount" },
                    maintenance: { $sum: "$maintenanceCount" },
                    repairing: { $sum: "$repairingCount" },
                    faulty: { $sum: "$faultyCount" },
                    sterilizing: { $sum: "$sterilizingCount" }
                }
            },
            {
                $project: { _id: 0 }
            }
        ]);

        const defaultStats = {
            total: 0, ready: 0, in_use: 0, maintenance: 0, repairing: 0, faulty: 0, sterilizing: 0
        };

        const statsData = result.length > 0 ? result[0] : defaultStats;

        logger.debug("Equipment statistics fetched successfully", {
            context: "EquipmentService.getStatistics",
            result: statsData,
        });

        return statsData;

    } catch (error) {
        logger.error("Error getting equipment statistics", {
            context: "EquipmentService.getStatistics",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau");
    }
};

/**
 * Report an incident for a specific equipment
 * @param {ObjectId} id equipment id
 * @param {Object} incidentData incident details (issue_type, severity, description, appointment_id, reported_by)
 * @returns updated equipment object
 */
const reportIncident = async (id, incidentData) => {
    try {
        logger.debug("Reporting equipment incident", {
            context: "EquipmentService.reportIncident",
            id: id,
            incidentData: incidentData,
        });

        // Determine new status based on issue type
        let newStatus = "FAULTY";
        if (incidentData.issue_type === "MAINTENANCE") {
            newStatus = "MAINTENANCE";
        }

        const updatePayload = {
            $set: { status: newStatus },
            $push: {
                maintenance_history: {
                    appointment_id: incidentData.appointment_id,
                    issue_type: incidentData.issue_type,
                    severity: incidentData.severity,
                    description: incidentData.description,
                    reported_by: incidentData.reported_by,
                    maintenance_date: new Date()
                }
            }
        };

        const updatedEquipment = await EquipmentModel.findByIdAndUpdate(
            id,
            updatePayload,
            { new: true, runValidators: true }
        );

        // Gửi thông báo cho Admin
        try {
            const notificationService = require('../../notification/service/notification.service');
            const alertType = newStatus === "FAULTY" ? "Sự cố hỏng hóc" : "Bảo trì thiết bị";
            await notificationService.sendToRole(['ADMIN_CLINIC'], {
                type: 'EQUIPMENT_INCIDENT',
                title: `Cảnh báo thiết bị: ${alertType}`,
                message: `Thiết bị "${updatedEquipment.equipment_name}" (S/N: ${updatedEquipment.equipment_serial_number}) vừa được báo sự cố. Trạng thái hiện tại: ${newStatus}.`,
                action_url: `/equipment/${updatedEquipment._id}`
            });
        } catch (err) {
            logger.error("Lỗi gửi cảnh báo thiết bị hỏng cho Admin:", { message: err.message });
        }

        logger.info("Equipment incident reported successfully", {
            context: "EquipmentService.reportIncident",
            equipmentId: id,
            newStatus: newStatus
        });

        return updatedEquipment;
    } catch (error) {
        logger.error("Error reporting equipment incident", {
            context: "EquipmentService.reportIncident",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            "Hệ thống lỗi, vui lòng thực hiện sau"
        );
    }
};

module.exports = {
    getStatistics,
    getEquipments,
    getEquipmentById,
    checkExitSerialNumber,
    createEquipment,
    checkExitSerialNumberNotId,
    updateEquipmentItem,
    updateCategory,
    reportIncident,
    addEquipmentItems
};
