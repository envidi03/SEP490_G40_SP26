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
        // Lấy từ khóa tìm kiếm
        const search = query.search?.trim();
        
        // --- XỬ LÝ FILTER ---
        // 1. Nhận status trực tiếp từ query.status và chuyển thành IN HOA để khớp với Enum trong DB
        const statusFilter = query.status ? query.status.toUpperCase() : null;
        
        // 2. Nhận equipment_type trực tiếp từ query.equipment_type
        const equipmentTypeFilter = query.equipment_type; 

        // --- XỬ LÝ SẮP XẾP & PHÂN TRANG ---
        const sort = query.sort === "desc" ? -1 : 1;
        const page = parseInt(query.page || 1);
        const limit = parseInt(query.limit || 5);
        const skip = (page - 1) * limit;

        logger.debug("Fetching equipments with query", {
            context: "EquipmentService.getEquipments",
            query: query,
        });

        // --- THỰC THI QUERY BẰNG AGGREGATION ---
        const result = await EquipmentModel.aggregate([
            // 1. Lọc dữ liệu (Match)
            {
                $match: {
                    // Tìm kiếm text (nếu có)
                    ...(search && {
                        $or: [
                            { equipment_name: { $regex: search, $options: "i" } },
                            { equipment_serial_number: { $regex: search, $options: "i" } },
                            { supplier: { $regex: search, $options: "i" } }
                        ],
                    }),
                    // Lọc theo trạng thái và loại thiết bị (nếu có truyền lên)
                    ...(statusFilter && { status: statusFilter }),
                    ...(equipmentTypeFilter && { equipment_type: equipmentTypeFilter })
                }
            },
            // 2. Sắp xếp (Sort)
            { $sort: { equipment_name: sort } },
            // 3. Phân trang và định hình dữ liệu trả về (Facet & Project)
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
                                maintenance_history: 0,
                                equipments_log: 0 // Đã chuẩn hóa tên theo đúng model Equipment
                            }
                        }
                    ],
                    totalItems: [{ $count: "count" }]
                }
            }
        ]);

        logger.debug("Equipments fetched successfully", {
            context: "EquipmentService.getEquipments",
            resultCount: result[0]?.data?.length || 0, // Log số lượng thay vì mảng data lớn để console gọn gàng hơn
        });

        // --- CHUẨN BỊ KẾT QUẢ TRẢ VỀ ---
        const data = result[0]?.data || [];
        const pagination = new Pagination({
            page: page,
            size: limit,
            totalItems: result[0]?.totalItems[0]?.count || 0,
        });

        return { data, pagination };

    } catch (error) {
        logger.error("Error getting equipments", {
            context: "EquipmentService.getEquipments",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            `An error occurred while fetching equipments: ${error.message}`
        );
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
                    // Giữ lại các trường thông tin chung
                    name: 1, code: 1, status: 1, type: 1, clinic_id: 1, // Thêm các trường bạn cần

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
 * Create a new equipment
 * @param {Object} equipmentData equipment data to create
 * @returns created equipment object
 */
const createEquipment = async (equipmentData) => {
    try {
        logger.debug("Creating new equipment", {
            context: "EquipmentService.createEquipment",
            equipmentData: equipmentData,
        });
        const newEquipment = new EquipmentModel(equipmentData);
        const savedEquipment = await newEquipment.save();
        logger.debug("Equipment created successfully", {
            context: "EquipmentService.createEquipment",
            savedEquipment: savedEquipment,
        });
        return savedEquipment;
    } catch (error) {
        logger.error("Error creating equipment", {
            context: "EquipmentService.createEquipment",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            `An error occurred while creating equipment: ${error.message}`
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

/**
 * Update an existing equipment
 * @param {ObjectId} id equipment id to update
 * @param {*} updateData data to update
 * @returns updated equipment object
 */
const updateEquipment = async (id, updateData) => {
    try {
        logger.debug("Updating equipment", {
            context: "EquipmentService.updateEquipment",
            id: id,
            updateData: updateData,
        });
        const updatedEquipment = await EquipmentModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        logger.debug("Equipment updated successfully", {
            context: "EquipmentService.updateEquipment",
            updatedEquipment: updatedEquipment,
        });
        return updatedEquipment;
    } catch (error) {
        logger.error("Error updating equipment", {
            context: "EquipmentService.updateEquipment",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            `An error occurred while updating equipment: ${error.message}`
        );
    }
};

/*
    get statistics of equipments based on their status
*/
const getStatistics = async () => {
    try {
        logger.debug("Fetching equipment statistics", {
            context: "EquipmentService.getStatistics"
        });

        // Sử dụng Aggregation để đếm số lượng theo từng trạng thái trong 1 lần query duy nhất
        const result = await EquipmentModel.aggregate([
            {
                $group: {
                    _id: null, // Nhóm tất cả các documents lại thành 1 record duy nhất
                    total: { $sum: 1 }, // Đếm tổng số

                    // Sử dụng $cond (Condition) để kiểm tra: nếu status khớp thì cộng 1, ngược lại cộng 0
                    // LƯU Ý: Bạn hãy điều chỉnh các chuỗi "READY", "IN_USE"... cho khớp với Enum trong Database của bạn nhé
                    ready: { $sum: { $cond: [{ $eq: ["$status", "READY"] }, 1, 0] } },
                    in_use: { $sum: { $cond: [{ $eq: ["$status", "IN_USE"] }, 1, 0] } },
                    maintenance: { $sum: { $cond: [{ $eq: ["$status", "MAINTENANCE"] }, 1, 0] } },
                    repairing: { $sum: { $cond: [{ $eq: ["$status", "REPAIRING"] }, 1, 0] } },
                    faulty: { $sum: { $cond: [{ $eq: ["$status", "FAULTY"] }, 1, 0] } },
                    sterilizing: { $sum: { $cond: [{ $eq: ["$status", "STERILIZING"] }, 1, 0] } }
                }
            },
            {
                // Bước Project để loại bỏ trường _id mặc định của $group
                $project: {
                    _id: 0
                }
            }
        ]);

        // Xử lý trường hợp database chưa có thiết bị nào (Collection rỗng)
        const defaultStats = {
            total: 0,
            ready: 0,
            in_use: 0,
            maintenance: 0,
            repairing: 0,
            faulty: 0,
            sterilizing: 0
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
        throw new errorRes.InternalServerError(
            `An error occurred while fetching equipment statistics: ${error.message}`
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
    updateEquipment
};
