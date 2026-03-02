const medicineService = require("../service/medicine.service");

exports.getMedicines = async (req, res) => {
    try {
        const { page, limit, search, category } = req.query;
        const result = await medicineService.getMedicines({ page, limit, search, category });
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
        const { status, page, limit } = req.query;
        const result = await medicineService.getRestockRequests({ status, page, limit });
        return res.status(200).json({
            success: true,
            data: result.requests,
            pagination: result.pagination
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
