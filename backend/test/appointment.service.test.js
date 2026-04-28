// ============================================================
// UNIT TEST: appointment.service.js
// Coverage Target: 100% Statements, Branches, Functions, Lines
// ============================================================

// ============================================================
// 1. MOCK ALL EXTERNAL DEPENDENCIES (Before any require)
// ============================================================
const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    abortTransaction: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn(),
};

jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        startSession: jest.fn().mockResolvedValue(mockSession),
        model: jest.fn().mockReturnValue({
            findById: jest.fn().mockReturnThis(),
            session: jest.fn().mockResolvedValue(null),
        }),
    };
});

jest.mock('../src/modules/patient/model/patient.model');
jest.mock('../src/modules/appointment/models/appointment.model');
jest.mock('../src/modules/service/index', () => ({
    model: {
        findById: jest.fn().mockReturnValue({
            session: jest.fn().mockResolvedValue({ _id: 'svc1' })
        })
    }
}));
jest.mock('../src/modules/treatment/index', () => ({
    service: {
        treatment: {
            addAppointmentIdOnTreatment: jest.fn().mockResolvedValue(true)
        }
    }
}));
jest.mock('../src/modules/auth/models/index.model', () => ({
    Account: {
        findById: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ email: 'auth@test.com' })
            })
        })
    }
}));
jest.mock('../src/common/service/email.service', () => ({
    sendBookingConfirmationEmail: jest.fn().mockResolvedValue(true),
    sendCheckinEmail: jest.fn().mockResolvedValue(true),
    sendAppointmentRescheduledByClinicEmail: jest.fn().mockResolvedValue(true),
    sendAppointmentUpdateApprovedEmail: jest.fn().mockResolvedValue(true),
    sendAppointmentUpdateRejectedEmail: jest.fn().mockResolvedValue(true),
    sendAppointmentCancelledEmail: jest.fn().mockResolvedValue(true),
}));
jest.mock('../src/modules/notification/service/notification.service', () => ({
    sendToRole: jest.fn().mockResolvedValue(true),
    sendToUser: jest.fn().mockResolvedValue(true),
}));
jest.mock('../src/common/utils/logger', () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

// ============================================================
// 2. REQUIRE MODULES AFTER MOCKS
// ============================================================
const mongoose = require('mongoose');
const PatientModel = require('../src/modules/patient/model/patient.model');
const AppointmentModel = require('../src/modules/appointment/models/appointment.model');
const { model: ServiceModel } = require('../src/modules/service/index');
const emailService = require('../src/common/service/email.service');
const notificationService = require('../src/modules/notification/service/notification.service');
const logger = require('../src/common/utils/logger');
const errorRes = require('../src/common/errors');
const appointmentService = require('../src/modules/appointment/services/appointment.service');

// ============================================================
// 3. TEST SUITES
// ============================================================
const VALID_ID = '507f1f77bcf86cd799439011';
const INVALID_ID = 'bad-id';

describe('Appointment Service Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset session mocks
        mockSession.commitTransaction.mockResolvedValue(undefined);
        mockSession.abortTransaction.mockResolvedValue(undefined);
    });

    // ============================================
    // 1. findById(id)
    // ============================================
    describe('findById()', () => {
        it('TC-AP-01: Trả null ngay lập tức nếu id falsy', async () => {
            const result = await appointmentService.findById(null);
            expect(result).toBeNull();
            expect(AppointmentModel.findById).not.toHaveBeenCalled();
        });

        it('TC-AP-02: Trả về appointment khi tìm thấy', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ _id: VALID_ID, status: 'SCHEDULED' })
            });
            const result = await appointmentService.findById(VALID_ID);
            expect(result._id).toBe(VALID_ID);
        });

        it('TC-AP-03: Trả null (không throw) khi DB lỗi', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockRejectedValue(new Error('DB Crash'))
            });
            const result = await appointmentService.findById(VALID_ID);
            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalled();
        });
    });

    // ============================================
    // 2. getByIdService(id)
    // ============================================
    describe('getByIdService()', () => {
        it('TC-AP-04: Ném BadRequestError nếu ID sai định dạng', async () => {
            await expect(appointmentService.getByIdService(INVALID_ID))
                .rejects.toThrow('Định dạng mã lịch hẹn không hợp lệ.');
        });

        it('TC-AP-05: Ném NotFoundError nếu không tìm thấy appointment', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(null)
            });
            await expect(appointmentService.getByIdService(VALID_ID))
                .rejects.toThrow('Không tìm thấy thông tin lịch hẹn.');
        });

        it('TC-AP-06: Trả về appointment khi tìm thấy thành công', async () => {
            const mockAppt = { _id: VALID_ID, full_name: 'Nguyễn Văn A' };
            AppointmentModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockAppt)
            });
            const result = await appointmentService.getByIdService(VALID_ID);
            expect(result.full_name).toBe('Nguyễn Văn A');
        });

        it('TC-AP-07: Ném InternalServerError khi DB crash hoàn toàn', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockRejectedValue(new Error('Connection reset'))
            });
            await expect(appointmentService.getByIdService(VALID_ID))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 3. calculateTotalAmount(appointmentId)
    // ============================================
    describe('calculateTotalAmount()', () => {
        it('TC-AP-08: Trả 0 khi không tìm thấy appointment', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            });
            const result = await appointmentService.calculateTotalAmount(VALID_ID);
            expect(result).toBe(0);
        });

        it('TC-AP-09: Cộng dồn unit_price của tất cả book_service', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    book_service: [
                        { service_id: 's1', unit_price: 100000 },
                        { service_id: 's2', unit_price: 200000 }
                    ]
                })
            });
            const result = await appointmentService.calculateTotalAmount(VALID_ID);
            expect(result).toBe(300000);
        });

        it('TC-AP-10: Fallback 0 khi unit_price bị undefined', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    book_service: [{ service_id: 's1' }] // Không có unit_price
                })
            });
            const result = await appointmentService.calculateTotalAmount(VALID_ID);
            expect(result).toBe(0);
        });

        it('TC-AP-11: Trả 0 khi DB lỗi (không throw)', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockRejectedValue(new Error('Crash'))
            });
            const result = await appointmentService.calculateTotalAmount(VALID_ID);
            expect(result).toBe(0);
            expect(logger.error).toHaveBeenCalled();
        });
    });

    // ============================================
    // 4. checkDuplicateFullNameAndPhoneAndAppointDateAndAppointTime()
    // ============================================
    describe('checkDuplicateFullNameAndPhoneAndAppointDateAndAppointTime()', () => {
        const fn = appointmentService.checkDuplicateFullNameAndPhoneAndAppointDateAndAppointTime;

        it('TC-AP-12: Trả true nếu đã có lịch hẹn trùng lặp', async () => {
            AppointmentModel.findOne = jest.fn().mockResolvedValue({ _id: 'appt1' });
            const result = await fn('Nguyễn Văn A', '0909000000', '2025-05-01', '09:00');
            expect(result).toBe(true);
        });

        it('TC-AP-13: Trả false nếu không trùng lặp', async () => {
            AppointmentModel.findOne = jest.fn().mockResolvedValue(null);
            const result = await fn('Nguyễn Văn A', '0909000000', '2025-05-01', '09:00');
            expect(result).toBe(false);
        });

        it('TC-AP-14: Trả true (an toàn) khi DB lỗi', async () => {
            AppointmentModel.findOne = jest.fn().mockRejectedValue(new Error('Timeout'));
            const result = await fn('Name', '0900', '2025-01-01', '10:00');
            expect(result).toBe(true);
            expect(logger.error).toHaveBeenCalled();
        });
    });

    // ============================================
    // 5. getFirstAppointmentOfPatientAtNowWithStatusCheckin()
    // ============================================
    describe('getFirstAppointmentOfPatientAtNowWithStatusCheckin()', () => {
        it('TC-AP-15: Trả về appointment nếu tìm thấy CHECKED_IN hôm nay', async () => {
            const mockAppt = { _id: 'appt1', status: 'CHECKED_IN' };
            AppointmentModel.findOne = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockAppt)
            });
            const result = await appointmentService.getFirstAppointmentOfPatientAtNowWithStatusCheckin('patient1');
            expect(result.status).toBe('CHECKED_IN');
        });

        it('TC-AP-16: Trả null nếu không tìm thấy', async () => {
            AppointmentModel.findOne = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(null)
            });
            const result = await appointmentService.getFirstAppointmentOfPatientAtNowWithStatusCheckin('patient1');
            expect(result).toBeNull();
        });

        it('TC-AP-17: Trả null (không throw) khi DB lỗi', async () => {
            AppointmentModel.findOne = jest.fn().mockReturnValue({
                sort: jest.fn().mockRejectedValue(new Error('DB Error'))
            });
            const result = await appointmentService.getFirstAppointmentOfPatientAtNowWithStatusCheckin('patient1');
            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalled();
        });
    });

    // ============================================
    // 6. findByTreatmentId(treatmentId)
    // ============================================
    describe('findByTreatmentId()', () => {
        it('TC-AP-18: Trả null ngay nếu treatmentId falsy', async () => {
            const result = await appointmentService.findByTreatmentId(null);
            expect(result).toBeNull();
        });

        it('TC-AP-19: Trả null khi không tìm thấy Treatment', async () => {
            // TreatmentModel được require() bên trong hàm - cần dùng jest.mock dynamically
            jest.mock('../src/modules/treatment/models/treatment.model', () => ({
                findById: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(null)
                })
            }), { virtual: true });

            // DB lỗi -> catch -> return null
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockRejectedValue(new Error('crash'))
            });
            const result = await appointmentService.findByTreatmentId('treatId');
            // Kết quả là null do lỗi được bắt bên trong
            expect(result).toBeNull();
        });

        it('TC-AP-20: Trả null (không throw) khi DB lỗi', async () => {
            const TreatmentModel = require('../src/modules/treatment/models/treatment.model');
            TreatmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockRejectedValue(new Error('DB crash'))
            });
            const result = await appointmentService.findByTreatmentId('treatmentId1');
            expect(result).toBeNull();
            expect(logger.error).toHaveBeenCalled();
        });

        it('TC-AP-20_B: Trả về appointment nếu Treatment có appointment_id', async () => {
            const TreatmentModel = require('../src/modules/treatment/models/treatment.model');
            TreatmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ appointment_id: 'a1' })
            });
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ _id: 'a1', status: 'SCHEDULED' })
            });
            const result = await appointmentService.findByTreatmentId('treatId');
            expect(result._id).toBe('a1');
        });
    });

    // ============================================
    // 7. getListService(query, doctor_id, lte_date, gte_date)
    // ============================================
    describe('getListService()', () => {
        it('TC-AP-21: Pipeline đầy đủ với search, status, doctor_id, gte/lte_date, sort=desc', async () => {
            AppointmentModel.aggregate = jest.fn().mockResolvedValue([{
                data: [{ _id: 'a1' }],
                totalCount: [{ count: 1 }]
            }]);

            const result = await appointmentService.getListService(
                { search: ' test ', status: 'SCHEDULED', sort: 'desc', page: 2, limit: 5, doctor_id: VALID_ID },
                null, '2025-06-30', '2025-06-01'
            );

            expect(result.data.length).toBe(1);
            expect(result.pagination.totalItems).toBe(1);
            expect(result.pagination.page).toBe(2);
        });

        it('TC-AP-22: Pipeline với exclude_status và appointment_date riêng lẻ', async () => {
            AppointmentModel.aggregate = jest.fn().mockResolvedValue([{
                data: [],
                totalCount: []
            }]);

            const result = await appointmentService.getListService(
                { exclude_status: 'CANCELLED,NO_SHOW', appointment_date: '2025-06-15' },
                null, null, null
            );
            expect(result.pagination.totalItems).toBe(0);
        });

        it('TC-AP-23: Fallback mặc định khi query rỗng hoàn toàn', async () => {
            AppointmentModel.aggregate = jest.fn().mockResolvedValue([{
                data: [],
                totalCount: []
            }]);

            const result = await appointmentService.getListService({}, null, null, null);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.size).toBe(5);
        });

        it('TC-AP-24: Ném InternalServerError khi aggregate crash', async () => {
            AppointmentModel.aggregate = jest.fn().mockRejectedValue(new Error('Timeout'));
            await expect(appointmentService.getListService({}, null, null, null))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 8. getListOfPatientService(query, account_id)
    // ============================================
    describe('getListOfPatientService()', () => {
        it('TC-AP-25: Trả mảng rỗng nếu không tìm thấy Patient profile', async () => {
            PatientModel.findOne = jest.fn().mockResolvedValue(null);
            const result = await appointmentService.getListOfPatientService({}, 'acc1');
            expect(result.data).toEqual([]);
            expect(result.pagination.totalItems).toBe(0);
            expect(logger.warn).toHaveBeenCalled();
        });

        it('TC-AP-26: Aggregate với search và status đầy đủ', async () => {
            PatientModel.findOne = jest.fn().mockResolvedValue({ _id: 'pat1' });
            AppointmentModel.aggregate = jest.fn().mockResolvedValue([{
                data: [{ _id: 'a1' }],
                totalCount: [{ count: 1 }]
            }]);

            const result = await appointmentService.getListOfPatientService(
                { search: 'test', status: 'SCHEDULED', sort: 'desc', page: 1, limit: 10 },
                'acc1'
            );
            expect(result.data.length).toBe(1);
        });

        it('TC-AP-27: Ném InternalServerError khi aggregate crash', async () => {
            PatientModel.findOne = jest.fn().mockResolvedValue({ _id: 'pat1' });
            AppointmentModel.aggregate = jest.fn().mockRejectedValue(new Error('Crash'));
            await expect(appointmentService.getListOfPatientService({}, 'acc1'))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 9. getListOfPatientServiceWithDate(query, account_id)
    // ============================================
    describe('getListOfPatientServiceWithDate()', () => {
        it('TC-AP-28: Trả mảng rỗng nếu không tìm thấy Patient', async () => {
            PatientModel.findOne = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
            const result = await appointmentService.getListOfPatientServiceWithDate({}, 'acc1');
            expect(result.data).toEqual([]);
        });

        it('TC-AP-29: Pipeline đầy đủ với filter_date, search, status', async () => {
            PatientModel.findOne = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ _id: 'pat1' })
            });
            AppointmentModel.aggregate = jest.fn().mockResolvedValue([{
                data: [{ _id: 'a1' }],
                totalCount: [{ count: 5 }]
            }]);

            const result = await appointmentService.getListOfPatientServiceWithDate(
                { filter_date: '2025-06-01', search: 'Nguyen', status: 'SCHEDULED', sort: 'desc' },
                'acc1'
            );
            expect(result.data.length).toBe(1);
            expect(result.pagination.totalItems).toBe(5);
        });

        it('TC-AP-30: Fallback khi không có filter_date (dùng now)', async () => {
            PatientModel.findOne = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ _id: 'pat1' })
            });
            AppointmentModel.aggregate = jest.fn().mockResolvedValue([{
                data: [],
                totalCount: []
            }]);

            const result = await appointmentService.getListOfPatientServiceWithDate({}, 'acc1');
            expect(result.pagination.totalItems).toBe(0);
        });

        it('TC-AP-31: Ném InternalServerError khi Aggregate crash', async () => {
            PatientModel.findOne = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ _id: 'pat1' })
            });
            AppointmentModel.aggregate = jest.fn().mockRejectedValue(new Error('Crash'));
            await expect(appointmentService.getListOfPatientServiceWithDate({}, 'acc1'))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 10. getListAppointmentToPayment(query)
    // ============================================
    describe('getListAppointmentToPayment()', () => {
        it('TC-AP-32: Pipeline thanh toán với search và date_filter', async () => {
            AppointmentModel.aggregate = jest.fn().mockResolvedValue([{
                metadata: [{ total: 3 }],
                data: [{ _id: 'a1' }]
            }]);

            const result = await appointmentService.getListAppointmentToPayment({
                search: 'Nguyen', date_filter: '2025-06-30', page: 1, limit: 5
            });
            expect(result.data.length).toBe(1);
            expect(result.pagination.total_items).toBe(3);
        });

        it('TC-AP-33: Fallback khi metadata rỗng (0 items)', async () => {
            AppointmentModel.aggregate = jest.fn().mockResolvedValue([{
                metadata: [],
                data: []
            }]);

            const result = await appointmentService.getListAppointmentToPayment({});
            expect(result.pagination.total_items).toBe(0);
        });

        it('TC-AP-34: Ném InternalServerError khi DB crash', async () => {
            AppointmentModel.aggregate = jest.fn().mockRejectedValue(new Error('Connection loss'));
            await expect(appointmentService.getListAppointmentToPayment({}))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 11. createService(dataCreate, account_id)
    // ============================================
    describe('createService()', () => {
        const validData = {
            full_name: 'BN Test', phone: '0909', email: 'test@test.com',
            appointment_date: new Date('2025-06-15'),
            appointment_time: '09:00',
            book_service: [{ service_id: VALID_ID }]
        };

        beforeEach(() => {
            mongoose.startSession.mockResolvedValue(mockSession);
        });

        it('TC-AP-35: Ném NotFoundError nếu không tìm thấy Patient', async () => {
            PatientModel.findOne = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue(null)
            });
            await expect(appointmentService.createService(validData, 'acc1'))
                .rejects.toThrow(errorRes.NotFoundError);
            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });

        it('TC-AP-36: Ném Error trùng lặp lịch hẹn (isDuplicatePatient)', async () => {
            PatientModel.findOne = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue({ _id: 'pat1' })
            });
            AppointmentModel.findOne = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue({ _id: 'existing' })
            });
            await expect(appointmentService.createService(validData, 'acc1'))
                .rejects.toThrow(errorRes.InternalServerError);
        });

        it('TC-AP-37: Tạo appointment thành công (có email + notification)', async () => {
            PatientModel.findOne = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue({ _id: 'pat1' })
            });
            AppointmentModel.findOne = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue(null)
            });
            ServiceModel.findById = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue({ _id: VALID_ID })
            });
            const newAppt = {
                _id: 'newAppt1', email: 'patient@email.com', full_name: 'BN Test',
                appointment_date: new Date('2025-06-15'), appointment_time: '09:00'
            };
            AppointmentModel.create = jest.fn().mockResolvedValue([newAppt]);

            const result = await appointmentService.createService(
                { ...validData, treatment_id: null },
                'acc1'
            );
            expect(result._id).toBe('newAppt1');
            expect(mockSession.commitTransaction).toHaveBeenCalled();
        });

        it('TC-AP-37_B: Tạo thành công nhưng lỗi nền email/noti (nhánh catch ngầm ẩn danh)', async () => {
            PatientModel.findOne = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue({ _id: 'pat1' }) });
            AppointmentModel.findOne = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue(null) });
            ServiceModel.findById = jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue({ _id: VALID_ID }) });
            const newAppt = { _id: 'a3', email: 'e', full_name: 'bn', appointment_date: new Date() };
            AppointmentModel.create = jest.fn().mockResolvedValue([newAppt]);
            
            emailService.sendBookingConfirmationEmail.mockRejectedValueOnce(new Error('Mail down'));
            notificationService.sendToRole.mockRejectedValueOnce(new Error('Role Noti down'));
            notificationService.sendToUser.mockRejectedValueOnce(new Error('User Noti down'));
            
            const result = await appointmentService.createService(validData, 'acc1');
            expect(result._id).toBe('a3');
            expect(logger.error).toHaveBeenCalled();
        });

        it('TC-AP-38: Tạo appointment với treatment_id (addAppointmentId)', async () => {
            PatientModel.findOne = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue({ _id: 'pat1' })
            });
            AppointmentModel.findOne = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue(null)
            });
            ServiceModel.findById = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue({ _id: VALID_ID })
            });
            const newAppt = {
                _id: 'newAppt2', email: null, full_name: 'BN Test2',
                appointment_date: new Date('2025-06-15'), appointment_time: '10:00'
            };
            AppointmentModel.create = jest.fn().mockResolvedValue([newAppt]);
            const { service: DentisService } = require('../src/modules/treatment/index');

            const result = await appointmentService.createService(
                { ...validData, treatment_id: 'treat1' },
                'acc1'
            );
            expect(result._id).toBe('newAppt2');
            expect(DentisService.treatment.addAppointmentIdOnTreatment).toHaveBeenCalled();
        });
    });

    // ============================================
    // 12. staffCreateService(dataCreate)
    // ============================================
    describe('staffCreateService()', () => {
        const validData = {
            full_name: 'BN Staff', phone: '0900',
            appointment_date: new Date(), appointment_time: '08:00',
            book_service: [{ service_id: VALID_ID }]
        };

        it('TC-AP-39: Ném ConflictError nếu tìm thấy trùng lịch', async () => {
            AppointmentModel.findOne = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue({ _id: 'existing' })
            });
            await expect(appointmentService.staffCreateService(validData))
                .rejects.toThrow(errorRes.ConflictError);
            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });

        it('TC-AP-40: Ném NotFoundError khi service_id không tồn tại', async () => {
            AppointmentModel.findOne = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue(null)
            });
            ServiceModel.findById = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue(null) // Service không tồn tại
            });
            await expect(appointmentService.staffCreateService(validData))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-AP-41: Tạo thành công với status CHECKED_IN (cấp số thứ tự)', async () => {
            AppointmentModel.findOne = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue(null)
            });
            ServiceModel.findById = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue({ _id: VALID_ID })
            });
            AppointmentModel.getNextQueueNumber = jest.fn().mockResolvedValue(5);
            const newAppt = { _id: 'staffAppt1', queue_number: 5 };
            AppointmentModel.create = jest.fn().mockResolvedValue([newAppt]);

            const result = await appointmentService.staffCreateService({
                ...validData, status: 'CHECKED_IN', treatment_id: null
            });
            expect(result.queue_number).toBe(5);
            expect(AppointmentModel.getNextQueueNumber).toHaveBeenCalled();
        });

        it('TC-AP-42: Tạo với treatment_id thì gán status SCHEDULED', async () => {
            AppointmentModel.findOne = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue(null)
            });
            ServiceModel.findById = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue({ _id: VALID_ID })
            });
            const newAppt = { _id: 'staffAppt2', status: 'SCHEDULED' };
            AppointmentModel.create = jest.fn().mockResolvedValue([newAppt]);
            const { service: DentisService } = require('../src/modules/treatment/index');

            const result = await appointmentService.staffCreateService({
                ...validData, treatment_id: 'treat99'
            });
            expect(result._id).toBe('staffAppt2');
            expect(DentisService.treatment.addAppointmentIdOnTreatment).toHaveBeenCalled();
        });

        it('TC-AP-43: Ném InternalServerError khi DB create crash', async () => {
            AppointmentModel.findOne = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue(null)
            });
            ServiceModel.findById = jest.fn().mockReturnValue({
                session: jest.fn().mockResolvedValue({ _id: VALID_ID })
            });
            AppointmentModel.create = jest.fn().mockRejectedValue(new Error('Write failed'));
            await expect(appointmentService.staffCreateService(validData))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 13. updateService(id, data)
    // ============================================
    describe('updateService()', () => {
        it('TC-AP-44: Ném NotFoundError nếu không tìm thấy appointment để update', async () => {
            AppointmentModel.findById = jest.fn().mockResolvedValue(null);
            await expect(appointmentService.updateService(VALID_ID, { userRole: 'PATIENT' }))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-AP-45: Ném BadRequestError nếu trạng thái không cho phép sửa', async () => {
            AppointmentModel.findById = jest.fn().mockResolvedValue({
                status: 'COMPLETED'
            });
            await expect(appointmentService.updateService(VALID_ID, { userRole: 'PATIENT' }))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-AP-46: PATIENT update -> chuyển sang PENDING_CONFIRMATION + gửi notification', async () => {
            AppointmentModel.findById = jest.fn().mockResolvedValue({ status: 'SCHEDULED', patient_id: null });
            AppointmentModel.findByIdAndUpdate = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    _id: 'a1', patient_id: null,
                    full_name: 'BN A',
                    appointment_date: new Date(), appointment_time: '09:00'
                })
            });

            const result = await appointmentService.updateService(VALID_ID, {
                userRole: 'PATIENT', appointment_date: new Date(), appointment_time: '10:00'
            });
            expect(result._id).toBe('a1');
            expect(notificationService.sendToRole).toHaveBeenCalledWith(
                ['RECEPTIONIST'], expect.any(Object)
            );
        });

        it('TC-AP-47: PATIENT update + có patient_id -> gửi thêm notification cho bệnh nhân', async () => {
            AppointmentModel.findById = jest.fn().mockResolvedValue({ status: 'SCHEDULED', patient_id: 'pat1' });
            AppointmentModel.findByIdAndUpdate = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    _id: 'a1', patient_id: 'pat1', full_name: 'BN A',
                    appointment_date: new Date(), appointment_time: '10:00'
                })
            });
            PatientModel.findById = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue({ account_id: 'acc1' })
                })
            });

            const result = await appointmentService.updateService(VALID_ID, {
                userRole: 'PATIENT', appointment_time: '10:00'
            });
            expect(result._id).toBe('a1');
            expect(notificationService.sendToUser).toHaveBeenCalled();
        });

        it('TC-AP-48: Staff update có đổi ngày -> gửi email + notification cho bệnh nhân', async () => {
            const existAppt = { status: 'SCHEDULED', patient_id: 'pat1', appointment_date: new Date(), appointment_time: '08:00' };
            AppointmentModel.findById = jest.fn().mockResolvedValue(existAppt);
            AppointmentModel.findByIdAndUpdate = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    _id: 'a1', patient_id: 'pat1', full_name: 'BN A',
                    appointment_date: new Date(), appointment_time: '11:00'
                })
            });
            PatientModel.findById = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue({ account_id: 'acc1', email: null })
                })
            });

            const result = await appointmentService.updateService(VALID_ID, {
                userRole: 'RECEPTIONIST', appointment_date: new Date(), appointment_time: '11:00'
            });
            expect(result._id).toBe('a1');
        });

        it('TC-AP-49: Ném InternalServerError khi DB crash hoàn toàn', async () => {
            AppointmentModel.findById = jest.fn().mockRejectedValue(new Error('DB down'));
            await expect(appointmentService.updateService(VALID_ID, { userRole: 'PATIENT' }))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 14. updateStatusOnly(id, status, doctorId)
    // ============================================
    describe('updateStatusOnly()', () => {
        it('TC-AP-50: Ném NotFoundError nếu không tìm thấy appointment', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            });
            await expect(appointmentService.updateStatusOnly(VALID_ID, 'SCHEDULED'))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-AP-51: Idempotent CHECKED_IN - đã có số rồi thì trả về luôn', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    _id: 'a1', status: 'CHECKED_IN', queue_number: 3
                })
            });
            const result = await appointmentService.updateStatusOnly(VALID_ID, 'CHECKED_IN');
            expect(result.queue_number).toBe(3);
            expect(AppointmentModel.getNextQueueNumber).not.toHaveBeenCalled();
        });

        it('TC-AP-52: CHECKED_IN mới -> cấp số + gửi thông báo bác sĩ', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    _id: 'a1', status: 'SCHEDULED', doctor_id: 'doc1',
                    appointment_date: new Date(), full_name: 'BN'
                })
            });
            AppointmentModel.getNextQueueNumber = jest.fn().mockResolvedValue(7);
            AppointmentModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
                _id: 'a1', status: 'CHECKED_IN', queue_number: 7, doctor_id: 'doc1', full_name: 'BN'
            });

            await appointmentService.updateStatusOnly(VALID_ID, 'CHECKED_IN');
            expect(AppointmentModel.getNextQueueNumber).toHaveBeenCalled();
            expect(notificationService.sendToUser).toHaveBeenCalled();
        });

        it('TC-AP-53: CANCELLED -> gửi notification cho Lễ Tân và Bác Sĩ + cảnh báo nếu >=10', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    _id: 'a1', status: 'SCHEDULED', doctor_id: 'doc1',
                    appointment_date: new Date(), full_name: 'BN', appointment_time: '09:00',
                    patient_id: 'pat1'
                })
            });
            AppointmentModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
                _id: 'a1', status: 'CANCELLED', doctor_id: 'doc1',
                full_name: 'BN', appointment_time: '09:00', appointment_date: new Date(),
                patient_id: 'pat1'
            });
            AppointmentModel.countDocuments = jest.fn().mockResolvedValue(10); // Cảnh báo mốc 10

            await appointmentService.updateStatusOnly(VALID_ID, 'CANCELLED');
            expect(notificationService.sendToRole).toHaveBeenCalledWith(
                ['RECEPTIONIST'], expect.any(Object)
            );
            expect(notificationService.sendToRole).toHaveBeenCalledWith(
                ['ADMIN_CLINIC'], expect.any(Object)
            );
        });

        it('TC-AP-54: NO_SHOW -> chỉ gửi thông báo Bác Sĩ, không gửi Lễ Tân', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    _id: 'a1', status: 'SCHEDULED', doctor_id: 'doc1',
                    appointment_date: new Date(), full_name: 'BN', appointment_time: '09:00'
                })
            });
            AppointmentModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
                _id: 'a1', status: 'NO_SHOW', doctor_id: 'doc1',
                full_name: 'BN', appointment_time: '09:00', appointment_date: new Date()
            });

            await appointmentService.updateStatusOnly(VALID_ID, 'NO_SHOW');
            expect(notificationService.sendToUser).toHaveBeenCalledWith(
                'doc1', expect.any(Object)
            );
        });

        it('TC-AP-55: PENDING_CONFIRMATION -> SCHEDULED: gửi email xác nhận + thông báo bệnh nhân', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    _id: 'a1', status: 'PENDING_CONFIRMATION', patient_id: 'pat1',
                    appointment_date: new Date(), appointment_time: '09:00'
                })
            });
            AppointmentModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
                _id: 'a1', status: 'SCHEDULED', patient_id: 'pat1',
                full_name: 'BN', appointment_date: new Date(), appointment_time: '09:00'
            });
            PatientModel.findById = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue({ account_id: 'acc1', email: null })
                })
            });

            await appointmentService.updateStatusOnly(VALID_ID, 'SCHEDULED');
            expect(emailService.sendAppointmentUpdateApprovedEmail).toHaveBeenCalled();
        });

        it('TC-AP-56: Ném NotFoundError nếu update trả về null', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ _id: 'a1', status: 'SCHEDULED' })
            });
            AppointmentModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

            await expect(appointmentService.updateStatusOnly(VALID_ID, 'COMPLETED'))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-AP-57: Ném InternalServerError khi DB crash', async () => {
            AppointmentModel.findById = jest.fn().mockReturnValue({
                lean: jest.fn().mockRejectedValue(new Error('DB down'))
            });
            await expect(appointmentService.updateStatusOnly(VALID_ID, 'SCHEDULED'))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 15. checkinService(data)
    // ============================================
    describe('checkinService()', () => {
        const checkinData = { full_name: 'BN Test', phone: '0909' };

        it('TC-AP-58: Ném NotFoundError nếu không có lịch nào hôm nay', async () => {
            AppointmentModel.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue([])
            });
            await expect(appointmentService.checkinService(checkinData))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-AP-59: Check-in thành công nhiều lịch + gửi email từng lịch', async () => {
            const mockAppts = [
                { _id: 'a1', appointment_date: new Date() },
                { _id: 'a2', appointment_date: new Date() }
            ];
            AppointmentModel.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockAppts)
            });
            AppointmentModel.getNextQueueNumber = jest.fn()
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(2);
            AppointmentModel.findByIdAndUpdate = jest.fn()
                .mockResolvedValueOnce({ _id: 'a1', email: 'bn@test.com', full_name: 'BN', queue_number: 1 })
                .mockResolvedValueOnce({ _id: 'a2', email: null, full_name: 'BN', queue_number: 2 });

            const result = await appointmentService.checkinService(checkinData);
            expect(result.length).toBe(2);
            expect(emailService.sendCheckinEmail).toHaveBeenCalledTimes(1); // Chỉ a1 có email
        });

        it('TC-AP-60: Ném InternalServerError khi DB crash', async () => {
            AppointmentModel.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockRejectedValue(new Error('DB Error'))
            });
            await expect(appointmentService.checkinService(checkinData))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });
});
