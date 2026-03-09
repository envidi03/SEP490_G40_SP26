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

        // ── Build match condition ──────────────────────────
        const matchCondition = {};

        // Filter theo status: PENDING | COMPLETED | CANCELLED
        if (statusFilter) {
            matchCondition.status = statusFilter;
        }

        // Search theo invoice_code hoặc tên bệnh nhân (từ profile)
        if (search) {
            const regex = { $regex: search, $options: 'i' };
            matchCondition.$or = [
                { invoice_code: regex },
                { 'patient.profile.full_name': regex },
            ];
        }

        // ── Aggregation Pipeline ───────────────────────────
        const pipeline = [
            // JOIN patients để lấy thông tin bệnh nhân
            {
                $lookup: {
                    from: 'patients',
                    localField: 'patient_id',
                    foreignField: '_id',
                    as: 'patient'
                }
            },
            { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },

            // JOIN profiles để lấy tên bệnh nhân (cho search và hiển thị)
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'patient.profile_id',
                    foreignField: '_id',
                    as: 'patient.profile'
                }
            },
            { $unwind: { path: '$patient.profile', preserveNullAndEmptyArrays: true } },

            // Lọc theo điều kiện
            { $match: matchCondition },

            // $facet: lấy data và đếm tổng cùng lúc
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

module.exports = { getListInvoice };
