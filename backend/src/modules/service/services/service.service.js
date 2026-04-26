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

            // Sắp xếp theo giá (Price) theo yêu cầu (giá mặc định)
            { $sort: { price: sortPrice } },

            {
                $facet: {
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            // Lookup để lấy sub-services nhằm tính toán giá
                            $lookup: {
                                from: "sub_services",
                                localField: "_id",
                                foreignField: "parent_id",
                                as: "sub_services_data"
                            }
                        },
                        {
                            $addFields: {
                                // Tính min_price tổng hợp: Min của tất cả sub_services.min_price
                                // Hoặc fallback về price của chính nó nếu không có sub-service
                                calculated_min_price: {
                                    $cond: {
                                        if: { $gt: [{ $size: "$sub_services_data" }, 0] },
                                        then: { $min: "$sub_services_data.min_price" },
                                        else: "$price"
                                    }
                                },
                                // Tính max_price tổng hợp: Max của (max_price || min_price)
                                calculated_max_price: {
                                    $cond: {
                                        if: { $gt: [{ $size: "$sub_services_data" }, 0] },
                                        then: {
                                            $max: {
                                                $map: {
                                                    input: "$sub_services_data",
                                                    as: "sub",
                                                    in: { $ifNull: ["$$sub.max_price", "$$sub.min_price"] }
                                                }
                                            }
                                        },
                                        else: "$price"
                                    }
                                },
                                // Đếm số lượng dịch vụ con
                                sub_service_count: { $size: "$sub_services_data" }
                            }
                        },
                        {
                            $project: {
                                __v: 0,
                                equipment_service: 0,
                                // sub_services_data: 0 // Ẩn data thô đi cho nhẹ response
                            }
                        }
                    ],
                    totalCount: [{ $count: "count" }]
                }
            }
        ]);

        const services = result[0]?.data || [];
        const totalItems = result[0]?.totalCount[0]?.count || 0;
        logger.debug("services fetched successfully", {
            context: "ServiceService.getListService",
            query: query,
            data: services,
            pagination: {
                page: page,
                size: limit,
                totalItems: totalItems
            }
        });
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
            "Hệ thống lỗi, vui lòng thực hiện sau"
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

        // Tính toán khoảng giá từ sub-services (nếu có)
        const SubService = mongoose.model("SubService");
        const subServices = await SubService.find({ parent_id: id, status: 'AVAILABLE' });

        if (subServices.length > 0) {
            service.calculated_min_price = Math.min(...subServices.map(s => s.min_price));
            service.calculated_max_price = Math.max(...subServices.map(s => s.max_price || s.min_price));
            service.sub_service_count = subServices.length;
        } else {
            service.calculated_min_price = service.price;
            service.calculated_max_price = service.price;
            service.sub_service_count = 0;
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
            "Hệ thống lỗi, vui lòng thực hiện sau"
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
            "Hệ thống lỗi, vui lòng thực hiện sau"
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
            "Hệ thống lỗi, vui lòng thực hiện sau"
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
            "Hệ thống lỗi, vui lòng thực hiện sau"
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
            "Hệ thống lỗi, vui lòng thực hiện sau"
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
