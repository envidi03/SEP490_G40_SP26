const prescriptionService = require("../service/prescription.service");
const InvoiceService = require("../../billing/service/invoice.service");

exports.getPrescriptions = async (req, res) => {
    try {
        const { status, search, page, limit, date } = req.query;
        const result = await prescriptionService.getPrescriptions({ status, search, page, limit, date });
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

/**
 * Đánh dấu đơn thuốc là mua ngoài (không trừ kho, không tạo hóa đơn)
 */
exports.skipDispensePrescription = async (req, res) => {
    try {
        const result = await prescriptionService.skipDispensePrescription(req.params.id);
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

/**
 * POST /api/inventory/prescriptions/:id/create-invoice
 * Tạo hóa đơn thuốc riêng từ treatment (medicine_usage)
 * Frontend gọi sau khi dispensePrescription thành công, rồi mở PaymentModal
 */
exports.createMedicineInvoiceController = async (req, res) => {
    try {
        const { id } = req.params; // treatmentId
        const invoice = await InvoiceService.createMedicineInvoice(id);
        return res.status(201).json({
            success: true,
            message: 'Tạo hóa đơn thuốc thành công',
            data: invoice
        });
    } catch (error) {
        const statusCode = error.statusCode || error.status || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};
