const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");

const EquipmentModel = require("../models/equipment.model");
const Pagination = require("../../../common/responses/Pagination");
const mongoose = require("mongoose");

/*
    get list equipments with pagination and filter 
    (
        search by equipment_name, equipment_serial_number, supplier; 
        filter by equipment_type, status; 
        sort by equipment_name
        page 
        limit
    )
*/
const getEquipments = async (query) => {
    try {
        const search = query.search?.trim();
        const statusFilter = query.status ? query.status.toUpperCase() : null;
        const equipmentTypeFilter = query.equipment_type;

        // Model mới: Sort theo Tên danh mục (equipment_type) sẽ chuẩn hơn là theo tên máy con
        const sortOrder = query.sort === "desc" ? -1 : 1;
        const page = parseInt(query.page || 1);
        const limit = parseInt(query.limit || 5);
        const skip = (page - 1) * limit;

        logger.debug("Fetching equipments with query", {
            context: "EquipmentService.getEquipments",
            query: query,
        });

        // --- BƯỚC 1: XÂY DỰNG ĐIỀU KIỆN LỌC NHANH (SỬ DỤNG INDEX) ---
        const initialMatch = {};

        if (equipmentTypeFilter) {
            initialMatch.equipment_type = equipmentTypeFilter;
        }

        const childElemMatch = {};
        if (statusFilter) childElemMatch.status = statusFilter;
        if (search) {
            childElemMatch.$or = [
                { equipment_name: { $regex: search, $options: "i" } },
                { equipment_serial_number: { $regex: search, $options: "i" } },
                { supplier: { $regex: search, $options: "i" } }
            ];
        }

        // Nếu có điều kiện tìm kiếm ở thiết bị con, yêu cầu mảng phải có ít nhất 1 cái khớp
        if (Object.keys(childElemMatch).length > 0) {
            initialMatch.equipment = { $elemMatch: childElemMatch };
        }

        // --- BƯỚC 2: XÂY DỰNG ĐIỀU KIỆN "GỌT MẢNG" TRONG RAM ($filter) ---
        const arrayFilterConditions = [];
        if (statusFilter) {
            arrayFilterConditions.push({ $eq: ["$$item.status", statusFilter] });
        }
        if (search) {
            arrayFilterConditions.push({
                $or: [
                    // Dùng $ifNull để tránh lỗi khi field bị thiếu/null
                    { $regexMatch: { input: { $ifNull: ["$$item.equipment_name", ""] }, regex: search, options: "i" } },
                    { $regexMatch: { input: { $ifNull: ["$$item.equipment_serial_number", ""] }, regex: search, options: "i" } },
                    { $regexMatch: { input: { $ifNull: ["$$item.supplier", ""] }, regex: search, options: "i" } }
                ]
            });
        }

        const aggregatePipeline = [
            // 1. Sàng lọc thô (Lọc ra các nhóm cha thỏa mãn)
            { $match: initialMatch },

            // 2. Tinh chế mảng (Chỉ giữ lại những thằng con thỏa mãn)
            ...(arrayFilterConditions.length > 0 ? [
                {
                    $addFields: {
                        equipment: {
                            $filter: {
                                input: "$equipment",
                                as: "item",
                                cond: { $and: arrayFilterConditions } // Áp dụng điều kiện gọt mảng
                            }
                        }
                    }
                }
            ] : []),

            // 3. Sắp xếp các nhóm theo Tên Loại Thiết Bị
            { $sort: { equipment_type: sortOrder } },

            // 4. Phân trang
            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
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
        throw new errorRes.InternalServerError(`An error occurred while fetching equipments: ${error.message}`);
    }
};

/*
    get equipment by id with 
        filter maintence_history 
        (
            filter_maintence_history: maintence_start_date <= maintenance_date <= maintence_end_date 
            sort_maintence_history: maintence_date
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
        logger.debug("Fetching equipment by id", {
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
        const filter_maintence_history = query.filter_maintence_history || {};
        let maintConditions = [];
        if (filter_maintence_history.maintence_start_date) {
            maintConditions.push({ $gte: ["$$item.maintence_date", new Date(filter_maintence_history.maintence_start_date)] });
        }
        if (filter_maintence_history.maintence_end_date) {
            maintConditions.push({ $lte: ["$$item.maintence_date", new Date(filter_maintence_history.maintence_end_date)] });
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
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $addFields: {
                    // Tránh lỗi $size bằng cách đảm bảo trường luôn là mảng
                    safe_maint: { $ifNull: ["$maintenance_history", []] },
                    safe_logs: { $ifNull: ["$equipments_log", []] }
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
                    document: "$$ROOT",

                    // Thông tin phục vụ phân trang
                    maint_total: { $size: "$filtered_maint" },
                    logs_total: { $size: "$filtered_logs" },

                    // Dữ liệu đã cắt (sliced)
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
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            "$document",
                            {
                                maint_total: "$maint_total",
                                logs_total: "$logs_total",
                                maint_items: "$maint_items",
                                logs_items: "$logs_items"
                            }
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
            // Ghi đè lại các trường mảng bằng cấu trúc có pagination
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

        // Dọn dẹp các trường phụ dùng trong aggregate
        delete data.maint_items;
        delete data.maint_total;
        delete data.logs_items;
        delete data.logs_total;

        logger.debug("Equipment fetched successfully", {
            context: "EquipmentService.getEquipmentById",
            data: data,
        });

        return data;

    } catch (error) {
        logger.error("Error getting equipment by id", {
            context: "EquipmentService.getEquipmentById",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            `An error occurred while fetching equipment by id: ${error.message}`
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
            `An error occurred while checking equipment serial number: ${error.message}`
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
            equipment_type: dataCreate.equipment_type,
            newItemsCount: dataCreate.equipment.length
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
            throw new errorRes.ConflictError(`Equipment type '${dataCreate.equipment_type}' already exists. Please use the add items API instead.`);
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
            `An error occurred while creating equipment: ${error.message}`
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
            throw new errorRes.NotFoundError("Equipment category not found");
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
            `An error occurred while adding equipment items: ${error.message}`
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
            `An error occurred while checking equipment serial number: ${error.message}`
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
        throw new errorRes.InternalServerError(`Error updating category: ${error.message}`);
    }
};

/**
 * Update 1 item cụ thể trong mảng equipment
 */
const updateEquipmentItem = async (equipmentItemId, dataUpdate) => {
    const context = "EquipmentService.updateEquipmentItem";
    try {
        const setQuery = {};
        for (const key in dataUpdate) {
            setQuery[`equipment.$.${key}`] = dataUpdate[key];
        }

        // 2. Tìm document chứa item đó, và chỉ update đúng phần tử (nhờ toán tử $)
        const updatedDoc = await EquipmentModel.findOneAndUpdate(
            { "equipment._id": equipmentItemId },
            { $set: setQuery },
            { new: true, runValidators: true }
        );

        if (!updatedDoc) {
            throw new errorRes.NotFoundError("Equipment item not found");
        }

        return updatedDoc;
    } catch (error) {
        logger.error("Error updating equipment item", { context, message: error.message });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`An error occurred while updating equipment item: ${error.message}`);
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
        throw new errorRes.InternalServerError(`An error occurred while fetching equipment statistics: ${error.message}`);
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
            `An error occurred while reporting equipment incident: ${error.message}`
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
