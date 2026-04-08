const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const SubServiceModel = require("../models/sub_service.model");
const ServiceModel = require("../models/service.model");
const mongoose = require("mongoose");

/**
 * Lấy danh sách dịch vụ con theo parentId (dịch vụ cha)
 */
const getSubServicesByParentId = async (parentId, query = {}) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
            throw new errorRes.BadRequestError("Invalid parent service ID format");
        }

        // Kiểm tra dịch vụ cha tồn tại
        const parentExists = await ServiceModel.findById(parentId).lean();
        if (!parentExists) {
            throw new errorRes.NotFoundError("Parent service not found");
        }

        const statusFilter = query.filter;
        const filter = { parent_id: parentId };
        if (statusFilter) {
            filter.status = statusFilter;
        }

        const subServices = await SubServiceModel
            .find(filter)
            .sort({ createdAt: -1 })
            .lean();
        logger.debug("Sub-services fetched successfully", {
            context: "SubServiceService.getSubServicesByParentId",
            parentId,
            filter,
            subServiceCount: subServices.length
        });
        return subServices;
    } catch (error) {
        logger.error("Error getting sub-services by parent ID", {
            context: "SubServiceService.getSubServicesByParentId",
            message: error.message
        });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`An error occurred: ${error.message}`);
    }
};

/**
 * Lấy chi tiết 1 dịch vụ con theo ID
 */
const getSubServiceById = async (id) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new errorRes.BadRequestError("Invalid sub-service ID format");
        }

        const subService = await SubServiceModel
            .findById(id)
            .populate("parent_id", "service_name status")
            .lean();

        if (!subService) {
            throw new errorRes.NotFoundError("Sub-service not found");
        }

        return subService;
    } catch (error) {
        logger.error("Error getting sub-service by ID", {
            context: "SubServiceService.getSubServiceById",
            message: error.message
        });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`An error occurred: ${error.message}`);
    }
};

/**
 * Tạo mới dịch vụ con
 */
const createSubService = async (parentId, data) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(parentId)) {
            throw new errorRes.BadRequestError("Invalid parent service ID format");
        }

        const parentExists = await ServiceModel.findById(parentId).lean();
        if (!parentExists) {
            throw new errorRes.NotFoundError("Parent service not found");
        }

        // Kiểm tra trùng tên (không phân biệt hoa thường) trong cùng một parent_id
        const existing = await SubServiceModel.findOne({
            parent_id: parentId,
            sub_service_name: { $regex: new RegExp(`^${data.sub_service_name.trim()}$`, "i") }
        }).lean();

        if (existing) {
            throw new errorRes.BadRequestError("Tên gói dịch vụ này đã tồn tại trong dịch vụ này!");
        }

        const newSubService = new SubServiceModel({
            ...data,
            parent_id: parentId
        });

        const saved = await newSubService.save();

        logger.debug("Sub-service created successfully", {
            context: "SubServiceService.createSubService",
            id: saved._id
        });

        return saved;
    } catch (error) {
        logger.error("Error creating sub-service", {
            context: "SubServiceService.createSubService",
            message: error.message
        });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`An error occurred: ${error.message}`);
    }
};

/**
 * Cập nhật dịch vụ con
 */
const updateSubService = async (id, data) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new errorRes.BadRequestError("Invalid sub-service ID format");
        }

        // Không cho phép thay đổi parent_id qua update
        delete data.parent_id;

        // Nếu có cập nhật tên, kiểm tra trùng
        if (data.sub_service_name) {
            const currentSubService = await SubServiceModel.findById(id).lean();
            if (!currentSubService) {
                throw new errorRes.NotFoundError("Sub-service not found");
            }

            const existing = await SubServiceModel.findOne({
                parent_id: currentSubService.parent_id,
                _id: { $ne: id },
                sub_service_name: { $regex: new RegExp(`^${data.sub_service_name.trim()}$`, "i") }
            }).lean();

            if (existing) {
                throw new errorRes.BadRequestError("Tên gói dịch vụ này đã tồn tại!");
            }
        }

        const updated = await SubServiceModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!updated) {
            throw new errorRes.NotFoundError("Sub-service not found");
        }

        logger.debug("Sub-service updated successfully", {
            context: "SubServiceService.updateSubService",
            id
        });

        return updated;
    } catch (error) {
        logger.error("Error updating sub-service", {
            context: "SubServiceService.updateSubService",
            message: error.message
        });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`An error occurred: ${error.message}`);
    }
};

/**
 * Xóa dịch vụ con
 */
const deleteSubService = async (id) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new errorRes.BadRequestError("Invalid sub-service ID format");
        }

        const deleted = await SubServiceModel.findByIdAndDelete(id);

        if (!deleted) {
            throw new errorRes.NotFoundError("Sub-service not found");
        }

        logger.debug("Sub-service deleted successfully", {
            context: "SubServiceService.deleteSubService",
            id
        });

        return deleted;
    } catch (error) {
        logger.error("Error deleting sub-service", {
            context: "SubServiceService.deleteSubService",
            message: error.message
        });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`An error occurred: ${error.message}`);
    }
};

module.exports = {
    getSubServicesByParentId,
    getSubServiceById,
    createSubService,
    updateSubService,
    deleteSubService
};
