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
