/* eslint-disable no-undef */
const mongoose = require('mongoose');
const invoiceService = require('../src/modules/billing/service/invoice.service');
const InvoiceModel = require('../src/modules/billing/model/invoice.model');
const PatientModel = require('../src/modules/patient/model/patient.model');
const ServiceModel = require('../src/modules/service/models/service.model');
const AppointmentModel = require('../src/modules/appointment/models/appointment.model');
const notificationService = require('../src/modules/notification/service/notification.service');
const errorRes = require('../src/common/errors');
const logger = require('../src/common/utils/logger');
const Pagination = require('../src/common/responses/Pagination');

jest.mock('../src/modules/billing/model/invoice.model');
jest.mock('../src/modules/patient/model/patient.model');
jest.mock('../src/modules/service/models/service.model');
jest.mock('../src/modules/appointment/models/appointment.model');
jest.mock('../src/modules/notification/service/notification.service');
jest.mock('../src/common/utils/logger', () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
}));
jest.mock('mongoose', () => {
    const original = jest.requireActual('mongoose');
    return {
        ...original,
        model: jest.fn(() => ({})),
        Types: {
            ObjectId: original.Types.ObjectId
        },
        isValidObjectId: original.isValidObjectId
    };
});

// Using constant for a valid ObjectId so comparisons work nicely
const VALID_ID = new mongoose.Types.ObjectId().toString();

describe('InvoiceService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ============================================
    // 1. getListInvoice(query)
    // ============================================
    describe('getListInvoice()', () => {
        it('TC-INV-01: Trích xuất thành công khi truyền đủ query, patient_id là ObjectId', async () => {
            const query = { search: 'Test', status: 'PENDING', patient_id: VALID_ID, page: 1, limit: 10 };
            InvoiceModel.aggregate = jest.fn().mockResolvedValue([{
                data: [{ _id: 'inv1' }],
                totalCount: [{ count: 1 }]
            }]);

            const result = await invoiceService.getListInvoice(query);
            expect(result.data.length).toBe(1);
            expect(result.pagination).toBeInstanceOf(Pagination);
            expect(result.pagination.totalItems).toBe(1);
        });

        it('TC-INV-02: Bỏ qua bộ lọc patient_id khi Falsy/Sai chuẩn ObjectId', async () => {
            const query = { patient_id: 'invalid-id' };
            InvoiceModel.aggregate = jest.fn().mockResolvedValue([{
                data: [], totalCount: []
            }]);

            const result = await invoiceService.getListInvoice(query);
            expect(result.data).toEqual([]);
        });

        it('TC-INV-03: Khởi động giá trị query rỗng, fallback (page 1, limit 10)', async () => {
            InvoiceModel.aggregate = jest.fn().mockResolvedValue([{
                data: [], totalCount: []
            }]);

            const result = await invoiceService.getListInvoice({});
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.totalItems).toBe(0);
        });

        it('TC-INV-04: Ném InternalServerError khi aggregate lỗi', async () => {
            InvoiceModel.aggregate = jest.fn().mockRejectedValue(new Error('Aggregate error'));
            await expect(invoiceService.getListInvoice({}))
                .rejects.toThrow(errorRes.InternalServerError);
            expect(logger.error).toHaveBeenCalled();
        });
    });

    // ============================================
    // 2. getInvoiceById(id)
    // ============================================
    describe('getInvoiceById()', () => {
        it('TC-INV-05: Lấy invoice với populate thành công', async () => {
            const mockInvoice = { _id: VALID_ID };
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                then: jest.fn((resolve) => resolve(mockInvoice))
            };
            InvoiceModel.findById = jest.fn().mockReturnValue(mockQuery);

            const result = await invoiceService.getInvoiceById(VALID_ID);
            expect(result).toEqual(mockInvoice);
        });

        it('TC-INV-06: Ném NotFoundError khi DB trả về rỗng', async () => {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                then: jest.fn((resolve) => resolve(null))
            };
            InvoiceModel.findById = jest.fn().mockReturnValue(mockQuery);

            await expect(invoiceService.getInvoiceById(VALID_ID))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-INV-07: Ném InternalServerError khi DB crash ngoại vi', async () => {
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                then: jest.fn((resolve, reject) => reject(new Error('Crash DB')))
            };
            InvoiceModel.findById = jest.fn().mockReturnValue(mockQuery);

            await expect(invoiceService.getInvoiceById(VALID_ID))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 3. createInvoice(data)
    // ============================================
    describe('createInvoice()', () => {
        const validItem = { service_id: VALID_ID, quantity: 1, price: 50 };
        const validData = {
            patient_id: VALID_ID,
            items: [validItem]
        };

        it('TC-INV-08: Ném BadRequestError nếu khuyết patient_id', async () => {
            await expect(invoiceService.createInvoice({ items: [validItem] }))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-INV-09: Ném BadRequestError nếu khuyết mảng items hoặc rỗng', async () => {
            await expect(invoiceService.createInvoice({ patient_id: VALID_ID, items: [] }))
                .rejects.toThrow(errorRes.BadRequestError);
            await expect(invoiceService.createInvoice({ patient_id: VALID_ID }))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-INV-10: Ném NotFoundError khi Patient không có trên hệ thống', async () => {
            PatientModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });
            await expect(invoiceService.createInvoice(validData))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-INV-11: Ném BadRequestError nếu item khuyết service_id', async () => {
            PatientModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue({ _id: VALID_ID })
            });
            await expect(invoiceService.createInvoice({
                patient_id: VALID_ID, items: [{ quantity: 1 }]
            })).rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-INV-12: Ném NotFoundError nếu truy xuất Service thất bại', async () => {
            PatientModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue({ _id: VALID_ID })
            });
            ServiceModel.findById = jest.fn().mockResolvedValue(null);

            await expect(invoiceService.createInvoice(validData))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-INV-13: Lấy bù giá trị min_price nếu có sub_service và khuyết price', async () => {
            PatientModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue({ _id: VALID_ID })
            });
            ServiceModel.findById = jest.fn().mockResolvedValue({ _id: VALID_ID, service_name: 'Khám' });
            
            // Mock mongoose.model('SubService')
            mongoose.model.mockReturnValue({
                findById: jest.fn().mockResolvedValue({ sub_service_name: 'Chi tiết', min_price: 150 })
            });

            InvoiceModel.create = jest.fn().mockResolvedValue({ _id: 'new_inv' });

            const data = {
                patient_id: VALID_ID,
                items: [{ service_id: VALID_ID, sub_service_id: VALID_ID }] // không truyền giá
            };

            const result = await invoiceService.createInvoice(data);
            expect(result._id).toBe('new_inv');
            // Mock InvoiceModel.create args check
            const createArgs = InvoiceModel.create.mock.calls[0][0];
            expect(createArgs.items[0].unit_price).toBe(150);
        });

        it('TC-INV-14: Thành công chuẩn quy trình (Happy Path) + Noti', async () => {
            PatientModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue({ _id: VALID_ID, profile_id: { full_name: 'Bệnh Nhân A' } })
            });
            ServiceModel.findById = jest.fn().mockResolvedValue({ _id: VALID_ID, service_name: 'Khám', price: 100 });
            
            const newInvoice = { _id: 'new_inv' };
            InvoiceModel.create = jest.fn().mockResolvedValue(newInvoice);
            notificationService.sendToRole = jest.fn().mockResolvedValue();

            const result = await invoiceService.createInvoice(validData);
            expect(result).toEqual(newInvoice);
            expect(notificationService.sendToRole).toHaveBeenCalled();
        });

        it('TC-INV-15: Chịu lực lỗi API Noti sập mà không vỡ App (Fault tolerance)', async () => {
            PatientModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue({ _id: VALID_ID })
            });
            ServiceModel.findById = jest.fn().mockResolvedValue({ _id: VALID_ID });
            InvoiceModel.create = jest.fn().mockResolvedValue({ _id: 'new_inv' });
            notificationService.sendToRole = jest.fn().mockRejectedValue(new Error('Noti down'));

            const result = await invoiceService.createInvoice(validData);
            expect(result._id).toBe('new_inv');
            expect(logger.error).toHaveBeenCalled();
        });

        it('TC-INV-16: Ném InternalServerError khi lưu DB bốc khói', async () => {
            PatientModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue({ _id: VALID_ID })
            });
            ServiceModel.findById = jest.fn().mockResolvedValue({ _id: VALID_ID });
            InvoiceModel.create = jest.fn().mockRejectedValue(new Error('Write Failure'));

            await expect(invoiceService.createInvoice(validData))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 4. updateInvoiceStatus(id, status, note, updated_by, payment_method)
    // ============================================
    describe('updateInvoiceStatus()', () => {
        it('TC-INV-17: Ném BadRequestError khi Status truyền sai chuẩn', async () => {
            await expect(invoiceService.updateInvoiceStatus(VALID_ID, 'PENDING'))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-INV-18: Ném NotFoundError khi DB không có mặt Invoice này', async () => {
            InvoiceModel.findById = jest.fn().mockResolvedValue(null);
            await expect(invoiceService.updateInvoiceStatus(VALID_ID, 'COMPLETED'))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-INV-19: Ngăn cấm cập nhật bằng BadRequestError khi Invoice khác PENDING', async () => {
            InvoiceModel.findById = jest.fn().mockResolvedValue({ status: 'COMPLETED' });
            await expect(invoiceService.updateInvoiceStatus(VALID_ID, 'CANCELLED'))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-INV-20: Cập nhật thành công Status và Payment (Happy Path)', async () => {
            const mockInvoice = {
                status: 'PENDING',
                save: jest.fn().mockResolvedValue(true)
            };
            InvoiceModel.findById = jest.fn().mockResolvedValue(mockInvoice);

            const result = await invoiceService.updateInvoiceStatus(VALID_ID, 'COMPLETED', 'test_note', 'uc1', 'TRANSFER');
            
            expect(result.status).toBe('COMPLETED');
            expect(result.payment_method).toBe('TRANSFER');
            expect(result.note).toBe('test_note');
            expect(mockInvoice.save).toHaveBeenCalled();
        });

        it('TC-INV-21: Ném InternalServerError khi DB chập mạch', async () => {
            InvoiceModel.findById = jest.fn().mockRejectedValue(new Error('Crash Update'));
            await expect(invoiceService.updateInvoiceStatus(VALID_ID, 'COMPLETED'))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 5. getInvoiceStats()
    // ============================================
    describe('getInvoiceStats()', () => {
        it('TC-INV-22: Tính toán và nhả đúng cục Stats Data thông kê', async () => {
            const mockStats = { totalInvoices: 5, completedCount: 2 };
            InvoiceModel.aggregate = jest.fn().mockResolvedValue([mockStats]);

            const result = await invoiceService.getInvoiceStats();
            expect(result).toEqual(mockStats);
        });

        it('TC-INV-23: Nhả Fallback 0 an toàn nếu DB tổng bị mảng rỗng []', async () => {
            InvoiceModel.aggregate = jest.fn().mockResolvedValue([]);

            const result = await invoiceService.getInvoiceStats();
            expect(result.totalInvoices).toBe(0);
            expect(result.completedCount).toBe(0);
        });

        it('TC-INV-24: Ném InternalServerError khi Pipeline ứ đọng', async () => {
            InvoiceModel.aggregate = jest.fn().mockRejectedValue(new Error('Pipeline crash'));
            await expect(invoiceService.getInvoiceStats())
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 6. autoCreateInvoiceFromAppointment(appointmentId)
    // ============================================
    describe('autoCreateInvoiceFromAppointment()', () => {
        it('TC-INV-25: Nhét nhầm ID Rỗng falsy thì tự gãy lùi null, không ném throw', async () => {
            const result = await invoiceService.autoCreateInvoiceFromAppointment(null);
            expect(result).toBeNull();
        });

        it('TC-INV-26: Cơ chế Idempotent rẽ về hóa đơn cũ nếu lịch này đã có hoá đơn (Đang Existing)', async () => {
            InvoiceModel.findOne = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ _id: 'old_inv' })
            });

            const result = await invoiceService.autoCreateInvoiceFromAppointment(VALID_ID);
            expect(result._id).toBe('old_inv');
            expect(logger.debug).toHaveBeenCalled();
        });

        it('TC-INV-27: Giải null im hơi nếu hệ truy bắt khuyết lịch hẹn (Appointment NotFound)', async () => {
            InvoiceModel.findOne = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
            AppointmentModel.findById = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

            const result = await invoiceService.autoCreateInvoiceFromAppointment(VALID_ID);
            expect(result).toBeNull();
            expect(logger.warn).toHaveBeenCalled();
        });

        it('TC-INV-28: Giải null dạt luồng khi đối tượng Appt thiếu nhân phẩm Khách (no patient_id)', async () => {
            InvoiceModel.findOne = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
            AppointmentModel.findById = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: VALID_ID }) });

            const result = await invoiceService.autoCreateInvoiceFromAppointment(VALID_ID);
            expect(result).toBeNull();
            expect(logger.warn).toHaveBeenCalled();
        });

        it('TC-INV-29: Giải null im sụp nếu không có mảng book_service chèn vào', async () => {
            InvoiceModel.findOne = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ _id: VALID_ID, patient_id: VALID_ID, book_service: [] })
            });

            const result = await invoiceService.autoCreateInvoiceFromAppointment(VALID_ID);
            expect(result).toBeNull();
            expect(logger.warn).toHaveBeenCalled();
        });

        it('TC-INV-30: Auto bắn luồng chốt hạ sinh Invoice (Đá chéo API createInvoice)', async () => {
            InvoiceModel.findOne = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    _id: VALID_ID, patient_id: VALID_ID, book_service: [{ service_id: VALID_ID }]
                })
            });

            // Mock implementation for the core functions to fake a hit. Note: createInvoice is exported and tested. We can mock dependencies of createInvoice to make it succeed locally
            PatientModel.findById = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue({ _id: VALID_ID }) });
            ServiceModel.findById = jest.fn().mockResolvedValue({ _id: VALID_ID, price: 100 });
            InvoiceModel.create = jest.fn().mockResolvedValue({ _id: 'auto_inv1' });
            notificationService.sendToRole = jest.fn().mockResolvedValue();

            const result = await invoiceService.autoCreateInvoiceFromAppointment(VALID_ID);
            expect(result._id).toBe('auto_inv1');
            expect(logger.info).toHaveBeenCalled();
        });

        it('TC-INV-31: Bao cát nuốt toàn bộ Error (DB down) nhả về null cực tĩnh', async () => {
            InvoiceModel.findOne = jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('DB Boom')) });
            
            const result = await invoiceService.autoCreateInvoiceFromAppointment(VALID_ID);
            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalled();
        });
    });
});
