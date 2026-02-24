const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");

const ServiceModel = require("../models/service.model");
const Pagination = require("../../../common/responses/Pagination");
const mongoose = require("mongoose");

/*
    get list service with pagination and filter 
    (
        search: search by service_name; 
        filter: filter by status; 
        sort: sort by price
        page 
        limit
    )
*/
const getListService = async (query) => {
    try {
        const search = query.search?.trim();
        const statusFilter = query.filter; // Lấy trực tiếp status từ query
        const sortPrice = query.sort === "desc" ? -1 : 1;
        const page = Math.max(1, parseInt(query.page || 1));
        const limit = Math.max(1, parseInt(query.limit || 5));
        const skip = (page - 1) * limit;

        logger.debug("Fetching services with query", {
            context: "ServiceService.getListService",
            query: query,
        });

        // 1. Xây dựng điều kiện lọc (Match)
        const matchCondition = {};

        // Tìm kiếm theo tên dịch vụ (hoặc mô tả nếu cần)
        if (search) {
            matchCondition.service_name = { $regex: search, $options: "i" };
        }

        // Lọc theo trạng thái (AVAILABLE/UNAVAILABLE)
        if (statusFilter) {
            matchCondition.status = statusFilter;
        }

        // 2. Thực hiện Aggregation
        const result = await ServiceModel.aggregate([
            { $match: matchCondition },

            // Sắp xếp theo giá (Price) theo yêu cầu
            { $sort: { price: sortPrice } },

            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                __v: 0,
                                equipment_service: 0,
                            }
                        }
                    ],
                    totalCount: [{ $count: "count" }]
                }
            }
        ]);

        const services = result[0]?.data || [];
        const totalItems = result[0]?.totalCount[0]?.count || 0;

        return {
            data: services,
            pagination: {
                page: page,
                size: limit,
                totalItems: totalItems
            }
        };

    } catch (error) {
        logger.error("Error getting services", {
            context: "ServiceService.getListService",
            message: error.message
        });
        throw new errorRes.InternalServerError(
            `An error occurred while fetching services: ${error.message}`
        );
    }
};

/*
    get service by id with 
        filter equipment_service 
        (
            page
            limit
        )
*/
const getByIdService = async (id) => {
    try {
        logger.debug("Fetching service by id", {
            context: "ServiceService.getById",
            id: id,
        });

        const service = await ServiceModel
            .findById(id)
            .populate('equipment_service.equipment_id', 'equipment_name equipment_type serial_number status')
            .lean();

        if (!service) {
            logger.warn("Service not found", { context: "ServiceService.getById", id });
            return null;
        }

        logger.debug("Service fetched successfully", {
            context: "ServiceService.getById",
            serviceId: id
        });

        return service;

    } catch (error) {
        logger.error("Error getting service by id", {
            context: "ServiceService.getById",
            message: error.message,
            stack: error.stack,
        });

        if (error.statusCode) throw error;

        throw new errorRes.InternalServerError(
            `An error occurred while fetching service by id: ${error.message}`
        );
    }
};



/**
 * Create new Service don't have equipment_service
 * 
 * @param {Object} serviceData service data to create
 * @returns created service object
 */
const createService = async (dataCreate) => {
    try {
        logger.debug("Creating new service", {
            context: "ServiceService.createService",
            data: dataCreate,
        });
        const newService = new ServiceModel(dataCreate);
        const savedService = await newService.save();
        logger.debug("Service created successfully", {
            context: "ServiceService.createService",
            savedService: savedService,
        });
        return savedService;
    } catch (error) {
        logger.error("Error creating service", {
            context: "ServiceService.createService",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            `An error occurred while creating service: ${error.message}`
        );
    }
};


/**
 * Update an existing service
 * 
 * @param {ObjectId} id service id to update
 * @param {*} updateData data to update
 * @returns updated service object
 */
const updateService = async (id, updateData) => {
    try {
        logger.debug("Updating service", {
            context: "ServiceService.updateService",
            id: id,
            updateData: updateData,
        });
        const updatedService = await ServiceModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        logger.debug("Service updated successfully", {
            context: "ServiceService.updateService",
            updatedService: updatedService,
        });
        return updatedService;
    } catch (error) {
        logger.error("Error updating service", {
            context: "ServiceService.updateService",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            `An error occurred while updating service: ${error.message}`
        );
    }
};

/**
 * check unique service name
 * 
 * @param {String} service_name name service
 * @returns True if exits
 */
const checkUniqueServiceName = async (service_name) => {
    try {
        const existingService = await ServiceModel.findOne({ service_name: service_name });
        return existingService;
    } catch (error) {
        logger.error("Error checking unique service name", {
            context: "ServiceService.checkUniqueServiceName",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            `An error occurred while checking unique service name: ${error.message}`
        );
    }
};

/**
 * check unique service name
 * 
 * @param {String} service_name name service
 * @returns True if exits
 */
const checkUniqueServiceNameNotId = async (service_name, id) => {
    try {
        const existingService = await ServiceModel.findOne({
            service_name: service_name,
            _id: { $ne: id } // Exclude the current service being updated
        });
        return existingService;
    } catch (error) {
        logger.error("Error checking unique service name", {
            context: "ServiceService.checkUniqueServiceNameNotId",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            `An error occurred while checking unique service name: ${error.message}`
        );
    }
};


module.exports = {
    getListService,
    getByIdService,
    createService,
    updateService,
    checkUniqueServiceName,
    checkUniqueServiceNameNotId
};
