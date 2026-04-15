const invoiceModel = require('../../billing/model/invoice.model');
const bookingModel = require('../../appointment/models/index.model').Appointment;
const { generateCashFlowReport } = require('../../../utils/statistic.utils');
const logger = require('../../../common/utils/logger');
const errorMessage = require('../../../common/errors/index');
const successMessage = require('../../../common/success/index');

const getMoneyStatistics = async (req, res) => {
    try {
        const conditions = {
            status: "COMPLETED",
        };
        const { fromDate, toDate } = req.query;
        const report = await generateCashFlowReport({
            model: invoiceModel,
            dateField: 'invoice_date',
            nameFieldMoneyIn: ['total_amount'],
            nameFieldMoneyOut: [],
            fromDate: fromDate,
            toDate: toDate,
            extraConditions: conditions
        });
        return new successMessage.GetDetailSuccess(report, "Lấy thống kê doanh thu thành công").send(res);
    } catch (error) {
        logger.error('Error in getMoneyStatistics:', {
            message: error.message,
            stack: error.stack,
            route: req.originalUrl,
        });
        throw new errorMessage.InternalServerError('Lỗi khi lấy thống kê doanh thu');
    }
};

const getBookingStatistics = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        const conditionsNormal = {
            status: { $nin: ["CANCELLED", "NO_SHOW"] }
        };
        const reportNormal = await generateCashFlowReport({
            model: bookingModel,
            dateField: 'appointment_date',
            nameFieldMoneyIn: [],
            nameFieldMoneyOut: [],
            fromDate: fromDate,
            toDate: toDate,
            extraConditions: conditionsNormal
        });

        const conditionsCancelled = {
            status: { $in: ["CANCELLED", "NO_SHOW"] }
        };
        const reportCancelled = await generateCashFlowReport({
            model: bookingModel,
            dateField: 'appointment_date',
            nameFieldMoneyIn: [],
            nameFieldMoneyOut: [],
            fromDate: fromDate,
            toDate: toDate,
            extraConditions: conditionsCancelled
        });
        return new successMessage.GetDetailSuccess({ normal: reportNormal, cancelled: reportCancelled }, "Lấy thống kê lịch hẹn thành công").send(res);
    } catch (error) {
        logger.error('Error in getBookingStatistics:', {
            message: error.message,
            stack: error.stack,
            route: req.originalUrl,
        });
        throw new errorMessage.InternalServerError('Lỗi khi lấy thống kê lịch hẹn');
    }
};

module.exports = { getMoneyStatistics, getBookingStatistics };