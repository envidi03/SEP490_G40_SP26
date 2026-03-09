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

module.exports = { getListController };
