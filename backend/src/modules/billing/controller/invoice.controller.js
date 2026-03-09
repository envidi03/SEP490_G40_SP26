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

module.exports = { getListController, getByIdController, createController };
