const mongoose = require('mongoose');
const InvoiceModel = require('../model/invoice.model');
const ServiceModel = require('../../service/models/service.model');
const PatientModel = require('../../patient/model/patient.model');
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


const createInvoice = async (data) => {
    try {
        const { patient_id, appointment_id, items, note, created_by } = data;

        if (!patient_id) throw new errorRes.BadRequestError('patient_id is required');
        if (!items || items.length === 0) throw new errorRes.BadRequestError('items cannot be empty');

        // Kiểm tra patient tồn tại
        const patient = await PatientModel.findById(patient_id);
        if (!patient) throw new errorRes.NotFoundError('Patient not found');

        // Lấy thông tin dịch vụ từ DB cho từng item
        // Lưu service_name và unit_price tại thời điểm tạo HĐ
        // Tránh bị ảnh hưởng nếu dịch vụ thay đổi giá sau này
        const builtItems = await Promise.all(
            items.map(async (item) => {
                if (!item.service_id) throw new errorRes.BadRequestError('service_id is required for each item');
                const quantity = item.quantity || 1;

                const service = await ServiceModel.findById(item.service_id);
                if (!service) throw new errorRes.NotFoundError(`Service ${item.service_id} not found`);

                return {
                    service_id: service._id,
                    service_name: service.service_name,  // snapshot tên dịch vụ
                    unit_price: service.price,            // snapshot giá tại thời điểm tạo
                    quantity,
                    amount: service.price * quantity      // pre-save hook cũng tính lại, nhưng set trước cho rõ
                };
            })
        );

        // Tạo invoice — pre-save hook sẽ tự gen invoice_code và tính lại total_amount
        const invoice = await InvoiceModel.create({
            patient_id,
            appointment_id: (appointment_id && mongoose.isValidObjectId(appointment_id)) ? appointment_id : null,
            items: builtItems,
            status: 'PENDING',
            note: note || '',
            created_by: created_by || null,
        });

        return invoice;

    } catch (error) {
        if (['BadRequestError', 'NotFoundError'].includes(error.name)) throw error;
        logger.error('Error creating invoice', {
            context: 'InvoiceService.createInvoice',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

const updateInvoiceStatus = async (id, status, note, updated_by) => {
    try {
        if (!['COMPLETED', 'CANCELLED'].includes(status)) {
            throw new errorRes.BadRequestError('Status must be COMPLETED or CANCELLED');
        }

        const invoice = await InvoiceModel.findById(id);
        if (!invoice) {
            throw new errorRes.NotFoundError('Invoice not found');
        }

        if (invoice.status !== 'PENDING') {
            throw new errorRes.BadRequestError(`Cannot update invoice with status ${invoice.status}`);
        }

        // Cập nhật trạng thái
        invoice.status = status;
        if (note !== undefined) invoice.note = note;
        // Có thể lưu thêm người cập nhật nếu sau này model Invoice có field updated_by

        await invoice.save();

        return invoice;

    } catch (error) {
        if (['BadRequestError', 'NotFoundError'].includes(error.name)) throw error;
        logger.error('Error updating invoice status', {
            context: 'InvoiceService.updateInvoiceStatus',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

const getInvoiceStats = async () => {
    try {
        const pipeline = [
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    completedCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                    },
                    pendingCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] }
                    },
                    cancelledCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] }
                    },
                    totalRevenue: {
                        $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$total_amount', 0] }
                    },
                    totalPendingAmount: {
                        $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, '$total_amount', 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalInvoices: 1,
                    completedCount: 1,
                    pendingCount: 1,
                    cancelledCount: 1,
                    totalRevenue: 1,
                    totalPendingAmount: 1
                }
            }
        ];

        const result = await InvoiceModel.aggregate(pipeline);

        if (result.length === 0) {
            return {
                totalInvoices: 0,
                completedCount: 0,
                pendingCount: 0,
                cancelledCount: 0,
                totalRevenue: 0,
                totalPendingAmount: 0
            };
        }

        return result[0];

    } catch (error) {
        logger.error('Error getting invoice stats', {
            context: 'InvoiceService.getInvoiceStats',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

module.exports = { getListInvoice, getInvoiceById, createInvoice, updateInvoiceStatus, getInvoiceStats };
