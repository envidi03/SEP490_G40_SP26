const InvoiceModel = require('../model/invoice.model');
const Pagination = require('../../../common/responses/Pagination');
const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');

const getListInvoice = async (query) => {
    try {
        const search = query.search?.trim();
        const statusFilter = query.status;
        const page = Math.max(1, parseInt(query.page || 1));
        const limit = Math.max(1, parseInt(query.limit || 10));
        const skip = (page - 1) * limit;

        const matchCondition = {};

        if (statusFilter) {
            matchCondition.status = statusFilter;
        }

        if (search) {
            const regex = { $regex: search, $options: 'i' };
            matchCondition.$or = [
                { invoice_code: regex },
                { 'patient.profile.full_name': regex },
            ];
        }

        const pipeline = [
            {
                $lookup: {
                    from: 'patients',
                    localField: 'patient_id',
                    foreignField: '_id',
                    as: 'patient'
                }
            },
            { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: 'profiles',
                    localField: 'patient.profile_id',
                    foreignField: '_id',
                    as: 'patient.profile'
                }
            },
            { $unwind: { path: '$patient.profile', preserveNullAndEmptyArrays: true } },

            { $match: matchCondition },

            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                invoice_code: 1,
                                invoice_date: 1,
                                total_amount: 1,
                                status: 1,
                                createdAt: 1,
                                'patient._id': 1,
                                'patient.patient_code': 1,
                                'patient.profile.full_name': 1,
                                'patient.profile.phone': 1,
                            }
                        }
                    ],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ];

        const result = await InvoiceModel.aggregate(pipeline);

        const invoices = result[0]?.data || [];
        const totalItems = result[0]?.totalCount[0]?.count || 0;

        return {
            data: invoices,
            pagination: new Pagination({ page, size: limit, totalItems })
        };

    } catch (error) {
        logger.error('Error getting invoice list', {
            context: 'InvoiceService.getListInvoice',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

const getInvoiceById = async (id) => {
    try {
        const invoice = await InvoiceModel.findById(id)
            .populate('patient_id', 'patient_code status profile_id')
            .populate({
                path: 'patient_id',
                populate: { path: 'profile_id', select: 'full_name phone email' }
            })
            .populate('items.service_id', 'service_name price')
            .populate('created_by', 'username');

        if (!invoice) {
            throw new errorRes.NotFoundError('Invoice not found');
        }

        return invoice;

    } catch (error) {
        if (error.name === 'NotFoundError') throw error;
        logger.error('Error getting invoice by id', {
            context: 'InvoiceService.getInvoiceById',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};


module.exports = { getListInvoice, getInvoiceById };
