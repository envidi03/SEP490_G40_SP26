const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");

const EquipmentModel = require("../models/equipment.model");
const Pagination = require("../../../common/responses/Pagination");

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
        const filter = query.filter;
        const sort = query.sort === "desc" ? -1 : 1;
        const page = parseInt(query.page || 1);
        const limit = parseInt(query.limit || 5);
        const skip = (page - 1) * limit;

        logger.debug("Fetching equipments with query", {
            context: "EquipmentService.getEquipments",
            query: query,
        });

        // TODO: implement the logic to get equipments from database with pagination, search, filter, sort and return the result
        const result = await EquipmentModel.aggregate([
            // match 
            {
                $match: {
                    ... (search && {
                        $or: [
                            { equipment_name: { $regex: search, $options: "i" } },
                            { equipment_serial_number: { $regex: search, $options: "i" } },
                            { supplier: { $regex: search, $options: "i" } }
                        ],
                    }),
                    ...(filter?.equipment_type && { equipment_type: filter.equipment_type }),
                    ...(filter?.status && { status: filter.status })
                }
            },
            // sort
            { $sort: { equipment_name: sort } },
            // pagination
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
                                equipments_logs: 0
                            }
                        }
                    ],
                    totalItems: [{ $count: "count" }]
                }
            }
        ]);

        logger.debug("Equipments fetched successfully", {
            context: "EquipmentService.getEquipments",
            result: result[0],
        });
        // prepare pagination
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

        // Maintenance History
        const filter_maintence_history = query.filter_maintence_history || {};
        const sort_maintence_val = query.sort_maintence_history === "desc" ? -1 : 1;
        const page_maintence = parseInt(query.page_maintence_history || 1);
        const limit_maintence = parseInt(query.limit_maintence_history || 5);
        const skip_maintence = (page_maintence - 1) * limit_maintence;

        // Equipment Logs
        const filter_equipments_logs = query.filter_equipments_logs || {};
        const sort_logs_val = query.sort_equipments_logs === "desc" ? -1 : 1;
        const page_logs = parseInt(query.page_equipments_logs || 1);
        const limit_logs = parseInt(query.limit_equipments_logs || 5);
        const skip_logs = (page_logs - 1) * limit_logs;

        // --- 2. BUILD FILTER CONDITIONS (JavaScript Side) ---
        // Xây dựng condition mảng bên ngoài để code aggregate gọn và an toàn hơn

        // Condition cho Maintenance
        let maintConditions = [];
        if (filter_maintence_history.maintence_start_date) {
            maintConditions.push({ $gte: ["$$item.maintence_date", new Date(filter_maintence_history.maintence_start_date)] });
        }
        if (filter_maintence_history.maintence_end_date) {
            maintConditions.push({ $lte: ["$$item.maintence_date", new Date(filter_maintence_history.maintence_end_date)] });
        }
        // Nếu không có filter thì condition là true (để lấy tất cả)
        let maintFilterExpression = maintConditions.length > 0 ? { $and: maintConditions } : true;

        // Condition cho Logs
        let logConditions = [];
        if (filter_equipments_logs.usage_start_date) {
            logConditions.push({ $gte: ["$$item.usage_date", new Date(filter_equipments_logs.usage_start_date)] });
        }
        if (filter_equipments_logs.usage_end_date) {
            logConditions.push({ $lte: ["$$item.usage_date", new Date(filter_equipments_logs.usage_end_date)] });
        }
        let logFilterExpression = logConditions.length > 0 ? { $and: logConditions } : true;


        // --- 3. AGGREGATION PIPELINE ---
        const result = await EquipmentModel.aggregate([
            { $match: { _id: id } }, // Nếu id là ObjectId, hãy đảm bảo cast: new mongoose.Types.ObjectId(id)
            {
                $project: {
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    maintenance_history: {
                        $slice: [
                            {
                                // BƯỚC QUAN TRỌNG: $sortArray
                                $sortArray: {
                                    input: {
                                        $filter: {
                                            input: "$maintenance_history",
                                            as: "item",
                                            cond: maintFilterExpression
                                        }
                                    },
                                    sortBy: { maintence_date: sort_maintence_val }
                                }
                            },
                            skip_maintence,
                            limit_maintence
                        ]
                    },
                    equipments_logs: {
                        $slice: [
                            {
                                // BƯỚC QUAN TRỌNG: $sortArray
                                $sortArray: {
                                    input: {
                                        $filter: {
                                            input: "$equipments_logs",
                                            as: "item",
                                            cond: logFilterExpression
                                        }
                                    },
                                    sortBy: { usage_date: sort_logs_val }
                                }
                            },
                            skip_logs,
                            limit_logs
                        ]
                    }
                }
            }
        ]);

        logger.debug("Equipment fetched successfully", {
            context: "EquipmentService.getEquipmentById",
            result: result[0], // Có thể undefined nếu không tìm thấy
        });

        // Kiểm tra nếu không tìm thấy thiết bị
        if (!result || result.length === 0) {
            return null; // Hoặc throw error 404 tùy logic của bạn
        }

        return result[0];

    } catch (error) {
        logger.error("Error getting equipment by id", {
            context: "EquipmentService.getEquipmentById",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            `An error occurred while fetching equipment by id: ${error.message}`
        );
    };
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


module.exports = {
    getEquipments,
    getEquipmentById,
    checkExitSerialNumber,
    createEquipment,
    checkExitSerialNumberNotId,
    updateEquipment
};
