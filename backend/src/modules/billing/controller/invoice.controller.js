const logger = require('../../../common/utils/logger');
const successRes = require('../../../common/success');
const InvoiceService = require('../service/invoice.service');

// GET /api/billing
const getListController = async (req, res) => {
    try {
        logger.debug('Get invoice list request', {
            context: 'InvoiceController.getListController',
            query: req.query
        });

        const { data, pagination } = await InvoiceService.getListInvoice(req.query);

        return new successRes.GetListSuccess(
            data,
            pagination,
            'Invoices retrieved successfully'
        ).send(res);

    } catch (error) {
        logger.error('Error get invoice list', {
            context: 'InvoiceController.getListController',
            message: error.message,
        });
        throw error;
    }
};

// GET /api/billing/:id
const getByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        logger.debug('Get invoice by id request', {
            context: 'InvoiceController.getByIdController',
            id
        });

        const invoice = await InvoiceService.getInvoiceById(id);

        return new successRes.GetDetailSuccess(
            invoice,
            'Invoice retrieved successfully'
        ).send(res);

    } catch (error) {
        logger.error('Error get invoice by id', {
            context: 'InvoiceController.getByIdController',
            message: error.message,
        });
        throw error;
    }
};

// POST /api/billing
const createController = async (req, res) => {
    try {
        const data = req.body || {};
        logger.debug('Create invoice request', {
            context: 'InvoiceController.createController',
            data
        });

        const invoice = await InvoiceService.createInvoice(data);

        return new successRes.CreateSuccess(
            invoice,
            'Invoice created successfully'
        ).send(res);

    } catch (error) {
        logger.error('Error create invoice', {
            context: 'InvoiceController.createController',
            message: error.message,
        });
        throw error;
    }
};

// PUT /api/billing/:id/status
const updateStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        
        // Sẽ lấy user ID từ token sau khi có middleware auth
        const updated_by = req.user?.id;

        logger.debug('Update invoice status request', {
            context: 'InvoiceController.updateStatusController',
            id, status
        });

        const invoice = await InvoiceService.updateInvoiceStatus(id, status, note, updated_by);

        return new successRes.UpdateSuccess(
            invoice,
            'Invoice status updated successfully'
        ).send(res);

    } catch (error) {
        logger.error('Error update invoice status', {
            context: 'InvoiceController.updateStatusController',
            message: error.message,
        });
        throw error;
    }
};
// GET /api/billing/stats
const getStatsController = async (req, res) => {
    try {
        logger.debug('Get invoice stats request', {
            context: 'InvoiceController.getStatsController'
        });

        const stats = await InvoiceService.getInvoiceStats();

        // Use standard success response, it wraps data in `data` field typically
        return new successRes.GetDetailSuccess(
            stats,
            'Invoice stats retrieved successfully'
        ).send(res);

    } catch (error) {
        logger.error('Error get invoice stats', {
            context: 'InvoiceController.getStatsController',
            message: error.message,
        });
        throw error;
    }
};

module.exports = { getListController, getByIdController, createController, updateStatusController, getStatsController };
