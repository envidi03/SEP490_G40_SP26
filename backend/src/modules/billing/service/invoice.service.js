const mongoose = require('mongoose');
const InvoiceModel = require('../model/invoice.model');
const ServiceModel = require('../../service/models/service.model');
const PatientModel = require('../../patient/model/patient.model');
const Pagination = require('../../../common/responses/Pagination');
const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const notificationService = require('../../notification/service/notification.service');
const AppointmentModel = require('../../appointment/models/appointment.model');
const AuthModel = require('../../auth/models/index.model');

const getListInvoice = async (query) => {
    try {
        const search = query.search?.trim();
        const statusFilter = query.status;
        const patientIdFilter = query.patient_id;
        const invoiceTypeFilter = query.invoice_type; // 'MEDICAL' | 'MEDICINE'
        const page = Math.max(1, parseInt(query.page || 1));
        const limit = Math.max(1, parseInt(query.limit || 10));
        const skip = (page - 1) * limit;

        const matchCondition = {};

        if (patientIdFilter) {
            const mongoose = require('mongoose');
            if (mongoose.isValidObjectId(patientIdFilter)) {
                matchCondition.patient_id = new mongoose.Types.ObjectId(patientIdFilter);
            }
        }

        if (statusFilter) {
            matchCondition.status = statusFilter;
        }

        // Lọc theo loại hóa đơn — mặc định nếu không truyền thì lấy tất cả
        if (invoiceTypeFilter) {
            matchCondition.invoice_type = invoiceTypeFilter;
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
                                payment_method: 1,
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
            .populate('items.sub_service_id', 'sub_service_name min_price max_price')
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
        const { patient_id, appointment_id, items, note, created_by, payment_method } = data;

        if (!patient_id) throw new errorRes.BadRequestError('patient_id is required');
        if (!items || items.length === 0) throw new errorRes.BadRequestError('items cannot be empty');

        // Kiểm tra patient tồn tại và lấy thông tin cơ bản
        const patient = await PatientModel.findById(patient_id).populate('profile_id', 'full_name');
        if (!patient) throw new errorRes.NotFoundError('Patient not found');

        // Lấy thông tin dịch vụ từ DB cho từng item
        // Lưu service_name và unit_price tại thời điểm tạo HĐ
        // Tránh bị ảnh hưởng nếu dịch vụ thay đổi giá sau này
        const builtItems = await Promise.all(
            items.map(async (item) => {
                const { service_id, sub_service_id, quantity = 1, price } = item;
                if (!service_id) throw new errorRes.BadRequestError('service_id is required for each item');

                const service = await ServiceModel.findById(service_id);
                if (!service) throw new errorRes.NotFoundError(`Service ${service_id} not found`);

                let subServiceName = null;
                let unitPrice = price || service.price || 0;

                if (sub_service_id) {
                    const subService = await mongoose.model('SubService').findById(sub_service_id);
                    if (subService) {
                        subServiceName = subService.sub_service_name;
                        // If price wasn't passed from frontend (auto-filled), use min_price as default for sub-service
                        if (price === undefined) {
                            unitPrice = subService.min_price || 0;
                        }
                    }
                }

                return {
                    service_id: service._id,
                    sub_service_id: sub_service_id || null,
                    service_name: service.service_name,
                    sub_service_name: subServiceName,
                    unit_price: unitPrice,
                    quantity,
                    amount: unitPrice * quantity
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
            payment_method: payment_method || 'CASH',
            created_by: created_by || null,
        });

        try {
            const patientName = patient.profile_id?.full_name || 'Khách hàng';
            await notificationService.sendToRole(['RECEPTIONIST'], {
                type: 'INVOICE_READY',
                title: 'Hóa đơn chờ thanh toán',
                message: `Bác sĩ vừa chỉ định xong cho bệnh nhân ${patientName}. Vui lòng hỗ trợ bệnh nhân thanh toán hóa đơn.`,
                action_url: `/invoices/${invoice._id}`,
                channels: {
                    in_app: { enabled: true },
                    zalo: { enabled: true },
                    sms: { enabled: true }
                }
            });
        } catch (err) {
            logger.error('Lỗi gửi thông báo cho Lễ tân chờ thanh toán:', { message: err.message });
        }

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

const updateInvoiceStatus = async (id, status, note, updated_by, payment_method) => {
    try {
        if (!['COMPLETED', 'CANCELLED'].includes(status)) {
            throw new errorRes.BadRequestError('Trạng thái hóa đơn chỉ có thể là COMPLETED hoặc CANCELLED');
        }

        const invoice = await InvoiceModel.findById(id);
        if (!invoice) {
            throw new errorRes.NotFoundError('Không tìm thấy thông tin hóa đơn');
        }

        if (invoice.status !== 'PENDING') {
            throw new errorRes.BadRequestError(`Không thể cập nhật khi hóa đơn đang ở trạng thái ${invoice.status}`);
        }

        // Cập nhật trạng thái
        invoice.status = status;
        if (payment_method) {
            invoice.payment_method = payment_method;
        }
        if (note !== undefined) invoice.note = note;

        await invoice.save();

        return invoice;

    } catch (error) {
        if (['BadRequestError', 'NotFoundError'].includes(error.name)) throw error;
        logger.error('Error updating invoice status', {
            context: 'InvoiceService.updateInvoiceStatus',
            message: error.message,
        });
        throw error;
    }
};

/**
 * Tạo hóa đơn thuốc riêng biệt từ đơn thuốc (treatment.medicine_usage)
 * Gọi sau khi xuất thuốc (dispensePrescription) thành công
 */
const createMedicineInvoice = async (treatmentId) => {
    const context = 'InvoiceService.createMedicineInvoice';
    try {
        if (!mongoose.isValidObjectId(treatmentId)) {
            throw new errorRes.BadRequestError('Treatment ID không hợp lệ');
        }

        const TreatmentModel = mongoose.model('Treatment');
        const MedicineModel = mongoose.model('Medicine');

        const treatment = await TreatmentModel.findById(treatmentId).lean();
        if (!treatment) {
            throw new errorRes.NotFoundError('Không tìm thấy điều trị');
        }

        if (!treatment.medicine_usage || treatment.medicine_usage.length === 0) {
            throw new errorRes.BadRequestError('Điều trị này không có thuốc');
        }

        // Kiểm tra hóa đơn thuốc đã tồn tại chưa (tránh tạo trung)
        const existing = await InvoiceModel.findOne({
            'meta.treatment_id': new mongoose.Types.ObjectId(treatmentId),
            invoice_type: 'MEDICINE'
        }).lean();
        if (existing) {
            logger.debug('Medicine invoice already exists for treatment', { context, treatmentId, invoiceId: existing._id });
            return existing;
        }

        // Build items từ medicine_usage
        const items = [];
        for (const usage of treatment.medicine_usage) {
            const medicine = await MedicineModel.findById(usage.medicine_id).lean();
            if (!medicine) {
                logger.warn('Medicine not found when building invoice item', { context, medicine_id: usage.medicine_id });
                continue;
            }

            // Dùng giá bán của thuốc, tính theo số lượng base_unit
            const unitPrice = medicine.price || 0;
            const qty = usage.quantity || 1;

            items.push({
                medicine_name: medicine.medicine_name,
                unit_price: unitPrice,
                quantity: qty,
                amount: unitPrice * qty,
                // Lưu medicine_id vào service_id field — dùng ObjectId chở không ref Service
                // (invoice.model không bắt buộc service_id kết nối, nên ta truyền medicine_id)
                service_id: medicine._id,
                service_name: medicine.medicine_name,
            });
        }

        if (items.length === 0) {
            throw new errorRes.BadRequestError('Không có thuốc hợp lệ để lập hóa đơn');
        }

        // Tính tổng tiền
        const total_amount = items.reduce((sum, i) => sum + i.amount, 0);

        // Tạo invoice
        const invoice = new InvoiceModel({
            patient_id: treatment.patient_id,
            appointment_id: treatment.appointment_id || null,
            items,
            total_amount,
            status: 'PENDING',
            invoice_type: 'MEDICINE',
            payment_method: 'CASH',
            note: `Hóa đơn thuốc từ điều trị #${treatmentId}`,
        });
        await invoice.save();

        logger.info('Medicine invoice created', { context, treatmentId, invoiceId: invoice._id, total_amount });
        return invoice;

    } catch (error) {
        if (['BadRequestError', 'NotFoundError'].includes(error.name)) throw error;
        logger.error('Error creating medicine invoice', { context, message: error.message });
        throw error;
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

/**
 * Tự động tạo hóa đơn nháp (PENDING) từ thông tin lịch hẹn
 * Thường gọi khi Lịch hẹn -> COMPLETED
 */
const autoCreateInvoiceFromAppointment = async (appointmentId) => {
    const context = 'InvoiceService.autoCreateInvoiceFromAppointment';
    try {
        if (!appointmentId) return null;

        // 1. Kiểm tra xem đã có hóa đơn cho lịch hẹn này chưa (Idempotency)
        const existing = await InvoiceModel.findOne({ appointment_id: appointmentId }).lean();
        if (existing) {
            logger.debug('Invoice already exists for this appointment', { context, appointmentId, invoiceId: existing._id });
            return existing;
        }

        // 2. Lấy thông tin lịch hẹn (+ services)
        const appointment = await AppointmentModel.findById(appointmentId).lean();
        if (!appointment) {
            logger.warn('Appointment not found for auto-invoice', { context, appointmentId });
            return null;
        }

        if (!appointment.patient_id) {
            logger.warn('Appointment has no patient_id, cannot create invoice', { context, appointmentId });
            return null;
        }

        // 3. Chuẩn bị items từ book_service của lịch hẹn
        const items = appointment.book_service || [];
        if (items.length === 0) {
            logger.warn('Appointment has no booked services, skipping auto-invoice', { context, appointmentId });
            return null;
        }

        // 4. Gọi createInvoice để xử lý logic lấy tên service, tính tiền...
        // Mẹo: Truyền data thô vào, hàm createInvoice sẽ tự truy vấn ServiceModel để lấy name
        const invoiceData = {
            patient_id: appointment.patient_id,
            appointment_id: appointment._id,
            note: appointment.reason || 'Hóa đơn tự động sinh từ lịch hẹn',
            payment_method: 'CASH', // Mặc định
            items: items.map(s => ({
                service_id: s.service_id,
                sub_service_id: s.sub_service_id,
                price: s.unit_price, // Ưu tiên giá lúc đặt lịch
                quantity: 1
            }))
        };

        const newInvoice = await createInvoice(invoiceData);
        logger.info('Auto-created invoice successfully', {
            context,
            appointmentId,
            invoiceId: newInvoice._id,
            invoiceCode: newInvoice.invoice_code
        });

        return newInvoice;

    } catch (error) {
        logger.error('Error in auto-creating invoice', {
            context,
            appointmentId,
            message: error.message
        });
        // Không quăng lỗi để không làm chết luồng cập nhật lịch hẹn
        return null;
    }
};

module.exports = {
    getListInvoice,
    getInvoiceById,
    createInvoice,
    updateInvoiceStatus,
    getInvoiceStats,
    autoCreateInvoiceFromAppointment,
    createMedicineInvoice
};
