const prescriptionService = require("../service/prescription.service");

exports.getPrescriptions = async (req, res) => {
    try {
        const { status, search, page, limit } = req.query;
        const result = await prescriptionService.getPrescriptions({ status, search, page, limit });
        return res.status(200).json({
            success: true,
            data: result.prescriptions,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.dispensePrescription = async (req, res) => {
    try {
        const result = await prescriptionService.dispensePrescription(req.params.id);
        return res.status(200).json({
            success: true,
            message: result.message,
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
