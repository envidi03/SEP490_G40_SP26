const medicineService = require("../service/medicine.service");
const successResponse = require("../../../common/success/index");
const errorResponse = require("../../../common/errors/index");
const logger = require("../../../common/utils/logger");

exports.getMedicines = async (req, res) => {
    try {
        const { page, limit, search, category, statusFilter } = req.query;
        const result = await medicineService.getMedicines({ page, limit, search, category, statusFilter });
        return res.status(200).json({
            success: true,
            data: result.medicines,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await medicineService.getCategories();
        return res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getDosageForms = (req, res) => {
    try {
        const dosageForms = medicineService.getDosageForms();
        return res.status(200).json({
            success: true,
            data: dosageForms
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getUnits = (req, res) => {
    try {
        const units = medicineService.getSellingUnits(); // backward compat
        return res.status(200).json({ success: true, data: units });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellingUnits = (req, res) => {
    try {
        const units = medicineService.getSellingUnits();
        return res.status(200).json({ success: true, data: units });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBaseUnits = (req, res) => {
    try {
        const units = medicineService.getBaseUnits();
        return res.status(200).json({ success: true, data: units });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.createMedicine = async (req, res) => {
    try {
        const medicine = await medicineService.createMedicine(req.body);
        return res.status(201).json({
            success: true,
            message: "Thêm thuốc thành công",
            data: medicine
        });
    } catch (error) {
        const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateMedicine = async (req, res) => {
    try {
        const medicine = await medicineService.updateMedicine(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Cập nhật thuốc thành công",
            data: medicine
        });
    } catch (error) {
        const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateMedicinePartial = async (req, res) => {
    try {
        const medicine = await medicineService.updateMedicinePartial(req.params.id, req.body);
        return new successResponse.UpdateSuccess(medicine, "Cập nhật thuốc thành công").send(res);
    } catch (error) {
        logger.error("Error updating medicine", {
            context: "medicine.controller.updateMedicinePartial",
            message: error.message,
            stack: error.stack,
            error: error
        });
        if (error.statusCode) {
            throw error;
        }
        throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
    }
};

exports.importMedicines = async (req, res) => {
    try {
        const medicineId = req.params.id;
        const quantity = req.body.quantity;
        const medicine = await medicineService.updateMedicinePartial(medicineId, { $inc: { quantity: quantity } });
        return new successResponse.UpdateSuccess(medicine, "Cập nhật thuốc thành công").send(res);
    } catch (error) {
        logger.error("Error importing medicine", {
            context: "medicine.controller.importMedicines",
            message: error.message,
            stack: error.stack,
            error: error
        });
        if (error.statusCode) {
            throw error;
        }
        throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau.");
    }
};

exports.getMedicineById = async (req, res) => {
    try {
        const medicine = await medicineService.getMedicineById(req.params.id);
        return res.status(200).json({
            success: true,
            data: medicine
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

exports.createRestockRequest = async (req, res) => {
    try {
        const request = await medicineService.createRestockRequest(req.params.id, req.body);
        return res.status(201).json({
            success: true,
            message: "Tạo yêu cầu bổ sung thuốc thành công",
            data: request
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

exports.getRestockRequests = async (req, res) => {
    try {
        const { status, priority, search, page, limit } = req.query;
        const result = await medicineService.getRestockRequests({ status, priority, search, page, limit });
        return res.status(200).json({
            success: true,
            data: result.requests,
            pagination: result.pagination,
            statistics: result.statistics
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateRestockRequestStatus = async (req, res) => {
    try {
        const { id, requestId } = req.params;
        const { status } = req.body;
        const result = await medicineService.updateRestockRequestStatus(id, requestId, status);
        return res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái yêu cầu thành công",
            data: result
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};
