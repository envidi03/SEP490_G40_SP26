/* eslint-disable no-undef */
const mongoose = require('mongoose');
const treatmentService = require('../src/modules/treatment/services/treatment.service');
const model = require('../src/modules/treatment/models/index.model');
const { service: AppointmentService } = require('../src/modules/appointment/index');
const AppointmentModel = require('../src/modules/appointment/models/appointment.model');
const DentalRecord = require('../src/modules/treatment/models/dental-record.model');
const notificationService = require('../src/modules/notification/service/notification.service');
const errorRes = require('../src/common/errors');
const logger = require('../src/common/utils/logger');

// MOCKS
jest.mock('../src/modules/treatment/models/index.model', () => ({
    Treatment: {
        findById: jest.fn(),
        create: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        aggregate: jest.fn()
    }
}));
jest.mock('../src/modules/appointment/index', () => ({
    service: {
        findByTreatmentId: jest.fn(),
        updateStatusOnly: jest.fn()
    }
}));
jest.mock('../src/modules/appointment/models/appointment.model', () => ({
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findById: jest.fn()
}));
jest.mock('../src/modules/treatment/models/dental-record.model', () => ({
    findById: jest.fn()
}));
jest.mock('../src/modules/notification/service/notification.service', () => ({
    sendToRole: jest.fn()
}));
jest.mock('../src/common/utils/logger', () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
}));
mongoose.Types.ObjectId.isValid = jest.fn();

const VALID_ID = new mongoose.Types.ObjectId().toString();

describe('TreatmentService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ============================================
    // 1. getByIdService(id)
    // ============================================
    describe('1. getByIdService(id)', () => {
        it('TC-TRM-01: Báo lỗi BadRequestError nếu mã id truyền vào vi phạm chuẩn cấu trúc Mongoose ObjectId', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValueOnce(false);
            await expect(treatmentService.getByIdService('invalid-id'))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-TRM-02: Ném NotFoundError nếu ID hợp chuẩn nhưng Database rỗng', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValueOnce(true);
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(null)
            };
            model.Treatment.findById.mockReturnValueOnce(mockQuery);

            await expect(treatmentService.getByIdService(VALID_ID))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-TRM-03: Trích xuất thành công hồ sơ Treatment', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValueOnce(true);
            const mockTreatment = { _id: VALID_ID, name: 'Treat' };
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockTreatment)
            };
            model.Treatment.findById.mockReturnValueOnce(mockQuery);

            const result = await treatmentService.getByIdService(VALID_ID);
            expect(result).toEqual(mockTreatment);
        });

        it('TC-TRM-04: Bốc InternalServerError khi kết nối DB lỗi', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValueOnce(true);
            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockRejectedValue(new Error('DB Crash'))
            };
            model.Treatment.findById.mockReturnValueOnce(mockQuery);

            await expect(treatmentService.getByIdService(VALID_ID))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 2. createService(dataCreate)
    // ============================================
    describe('2. createService(dataCreate)', () => {
        it('TC-TRM-05: Nhét dữ liệu và tạo DB thành công', async () => {
            const payload = { test: 1 };
            model.Treatment.create.mockResolvedValueOnce({ _id: VALID_ID, ...payload });
            const result = await treatmentService.createService(payload);
            expect(result._id).toBe(VALID_ID);
        });

        it('TC-TRM-06: Phản ứng bằng InternalServerError khi Database lỗi tạo', async () => {
            model.Treatment.create.mockRejectedValueOnce(new Error('Constraint Error'));
            await expect(treatmentService.createService({}))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 3. updateService(treatmentId, data)
    // ============================================
    describe('3. updateService(treatmentId, data)', () => {
        it('TC-TRM-07: Nhả NotFoundError nếu truy xuất ko ra mã', async () => {
            model.Treatment.findById.mockResolvedValueOnce(null);
            await expect(treatmentService.updateService(VALID_ID, { status: 'PLANNED' }))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-TRM-08: Quăng BadRequestError nếu trạng thái hiện thời là DONE', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ status: 'DONE' });
            await expect(treatmentService.updateService(VALID_ID, {}))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-TRM-09: Quăng BadRequestError nếu trạng thái hiện thời là CANCELLED', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ status: 'CANCELLED' });
            await expect(treatmentService.updateService(VALID_ID, {}))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-TRM-10: WAITING_APPROVAL có sẵn appointment_id -> Auto Update Appt', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ status: 'PLANNED', appointment_id: VALID_ID });
            model.Treatment.findByIdAndUpdate.mockResolvedValueOnce({ status: 'WAITING_APPROVAL' });
            AppointmentModel.findOneAndUpdate.mockResolvedValueOnce({ status: 'COMPLETED' });
            
            await treatmentService.updateService(VALID_ID, { status: 'WAITING_APPROVAL' });
            expect(AppointmentModel.findOneAndUpdate).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('SUCCESS! Appt'));
        });

        it('TC-TRM-11: WAITING_APPROVAL Không có appointment_id (PLAN Phase) -> Lọc IN_CONSULTATION', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ status: 'PLANNED', patient_id: VALID_ID });
            model.Treatment.findByIdAndUpdate.mockResolvedValueOnce({ status: 'WAITING_APPROVAL' });
            
            AppointmentModel.findOne.mockReturnValueOnce({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue({ _id: VALID_ID }) });
            AppointmentModel.findOneAndUpdate.mockResolvedValueOnce({ status: 'COMPLETED' });

            await treatmentService.updateService(VALID_ID, { status: 'WAITING_APPROVAL' });
            expect(AppointmentModel.findOne).toHaveBeenCalled();
            expect(AppointmentModel.findOneAndUpdate).toHaveBeenCalled();
        });

        it('TC-TRM-12: WAITING_APPROVAL Không Lịch khám phụ -> Fallback từ DentalRecord', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ status: 'PLANNED', record_id: VALID_ID });
            model.Treatment.findByIdAndUpdate.mockResolvedValueOnce({ status: 'WAITING_APPROVAL' });
            
            AppointmentModel.findOne.mockReturnValueOnce({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(null) }); 
            DentalRecord.findById.mockReturnValueOnce({ lean: jest.fn().mockResolvedValue({ appointment_id: 'appt1' }) });
            AppointmentModel.findOneAndUpdate.mockResolvedValueOnce({ status: 'COMPLETED' });

            await treatmentService.updateService(VALID_ID, { status: 'WAITING_APPROVAL' });
            expect(DentalRecord.findById).toHaveBeenCalled();
            expect(AppointmentModel.findOneAndUpdate).toHaveBeenCalled();
        });

        it('TC-TRM-13: WAITING_APPROVAL update hụt (findOneAndUpdate trả null) -> Nuốt lỗi mượt', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ status: 'PLANNED', appointment_id: VALID_ID });
            model.Treatment.findByIdAndUpdate.mockResolvedValueOnce({ status: 'WAITING_APPROVAL' });
            AppointmentModel.findOneAndUpdate.mockResolvedValueOnce(null); // fail
            AppointmentModel.findById.mockReturnValueOnce({ lean: jest.fn().mockResolvedValue({ status: 'COMPLETED' }) });

            await treatmentService.updateService(VALID_ID, { status: 'WAITING_APPROVAL' });
            expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('FAILED TO UPDATE'));
        });

        it('TC-TRM-14: WAITING_APPROVAL gãy truy ngược (Không có appt_id) -> Vẫn nhả kết quả bth', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ status: 'PLANNED' });
            model.Treatment.findByIdAndUpdate.mockResolvedValueOnce({ status: 'WAITING_APPROVAL' });
            AppointmentModel.findOne.mockReturnValueOnce({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(null) }); 

            await treatmentService.updateService(VALID_ID, { status: 'WAITING_APPROVAL' });
            expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('No appointment_id found'), expect.any(Object));
        });

        it('TC-TRM-15: Cập nhật thông thường (IN_PROGRESS) -> Bỏ qua Auto-complete', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ status: 'PLANNED' });
            model.Treatment.findByIdAndUpdate.mockResolvedValueOnce({ status: 'IN_PROGRESS' });

            await treatmentService.updateService(VALID_ID, { status: 'IN_PROGRESS' });
            expect(AppointmentModel.findOneAndUpdate).not.toHaveBeenCalled();
        });

        it('TC-TRM-16: Ném InternalServerError dập máy khi thao tác DB lỗi Create/Update', async () => {
            // Mock findById thành công để qua bước kiểm tra tồn tại đầu tiên
            model.Treatment.findById.mockResolvedValueOnce({ status: 'IN_PROGRESS' });
            // Mock findByIdAndUpdate mới là nơi gây lỗi để chui vào Catch ném InternalError
            model.Treatment.findByIdAndUpdate.mockRejectedValueOnce(new Error('Update Crash'));
            
            await expect(treatmentService.updateService(VALID_ID, { status: 'IN_PROGRESS' }))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 4. updateStatusOnly(id, status)
    // ============================================
    describe('4. updateStatusOnly(id, status)', () => {
        it('TC-TRM-17: Phụt văng NotFoundError nếu không tìm thấy ID', async () => {
            model.Treatment.findById.mockResolvedValueOnce(null);
            await expect(treatmentService.updateStatusOnly(VALID_ID, 'IN_PROGRESS'))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-TRM-18: Tối ưu tài nguyên: Status trùng lặp -> Trả thẳng Object gốc', async () => {
            const mockTreat = { status: 'PLANNED' };
            model.Treatment.findById.mockResolvedValueOnce(mockTreat);
            const result = await treatmentService.updateStatusOnly(VALID_ID, 'PLANNED');
            expect(result).toEqual(mockTreat);
        });

        it('TC-TRM-19: Cấm thay đổi từ CANCELLED -> BadRequestError', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ status: 'CANCELLED' });
            await expect(treatmentService.updateStatusOnly(VALID_ID, 'PLANNED'))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-TRM-20: Cấm thay đổi từ DONE -> BadRequestError', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ status: 'DONE' });
            await expect(treatmentService.updateStatusOnly(VALID_ID, 'PLANNED'))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-TRM-21: WAITING_APPROVAL -> Load Appointment -> Đổi thành COMPLETED', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ _id: VALID_ID, status: 'IN_PROGRESS' });
            AppointmentService.findByTreatmentId.mockResolvedValueOnce({ _id: VALID_ID, status: 'IN_CONSULTATION' });
            AppointmentService.updateStatusOnly.mockResolvedValueOnce();
            
            model.Treatment.findByIdAndUpdate.mockReturnValueOnce({ populate: jest.fn().mockResolvedValue({ _id: VALID_ID }) });

            await treatmentService.updateStatusOnly(VALID_ID, 'WAITING_APPROVAL');
            expect(AppointmentService.updateStatusOnly).toHaveBeenCalledWith(VALID_ID, 'COMPLETED');
        });

        it('TC-TRM-22: WAITING_APPROVAL -> Lịch rỗng -> Mong đợi InternalServerError (Do crash tại appoint.status)', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ _id: VALID_ID, status: 'IN_PROGRESS' });
            // Mock trả về null để gây ra lỗi "Cannot read properties of null (reading 'status')"
            AppointmentService.findByTreatmentId.mockResolvedValueOnce(null);
            
            // Do logic gốc kiểm tra .status trước khi check null, nên hệ thống sẽ crash và ném InternalServerError
            await expect(treatmentService.updateStatusOnly(VALID_ID, 'WAITING_APPROVAL'))
                .rejects.toThrow(errorRes.InternalServerError);
        });

        it('TC-TRM-23: IN_PROGRESS -> Ép khởi tạo phase = SESSION', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ _id: VALID_ID, status: 'PLANNED' });
            const popMock = jest.fn().mockResolvedValue({ phase: 'SESSION' });
            model.Treatment.findByIdAndUpdate.mockReturnValueOnce({ populate: popMock });

            await treatmentService.updateStatusOnly(VALID_ID, 'IN_PROGRESS');
            expect(model.Treatment.findByIdAndUpdate).toHaveBeenCalledWith(VALID_ID, { status: "IN_PROGRESS", phase: "SESSION" }, { new: true });
        });

        it('TC-TRM-24: APPROVED -> Nhảy số DONE + Gọi gửi Notification cho PHARMACIST', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ _id: VALID_ID, status: 'WAITING_APPROVAL' });
            const popMock = jest.fn().mockResolvedValue({
                status: 'DONE', 
                medicine_usage: [1, 2],
                patient_id: { full_name: 'Bệnh nhân B' }
            });
            model.Treatment.findByIdAndUpdate.mockReturnValueOnce({ populate: popMock });
            notificationService.sendToRole.mockResolvedValueOnce();

            await treatmentService.updateStatusOnly(VALID_ID, 'APPROVED'); // map to DONE implicitly in code
            expect(notificationService.sendToRole).toHaveBeenCalled();
        });

        it('TC-TRM-25: Notification rớt mạng -> Nuốt lỗi không Crash', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ _id: VALID_ID, status: 'WAITING_APPROVAL' });
            const popMock = jest.fn().mockResolvedValue({
                status: 'DONE', medicine_usage: [1]
            });
            model.Treatment.findByIdAndUpdate.mockReturnValueOnce({ populate: popMock });
            notificationService.sendToRole.mockRejectedValueOnce(new Error('Noti Boom'));

            const result = await treatmentService.updateStatusOnly(VALID_ID, 'APPROVED');
            expect(logger.error).toHaveBeenCalled();
            expect(result.status).toBe('DONE');
        });

        it('TC-TRM-26: Database sập gãy Update -> Ném InternalServerError', async () => {
            model.Treatment.findById.mockResolvedValueOnce({ _id: VALID_ID, status: 'PLANNED' });
            // Mock findByIdAndUpdate ném lỗi để chui vào khối catch tổng
            const mockFullQuery = {
                populate: jest.fn().mockRejectedValueOnce(new Error('DB Crash'))
            };
            model.Treatment.findByIdAndUpdate.mockReturnValueOnce(mockFullQuery);

            await expect(treatmentService.updateStatusOnly(VALID_ID, 'IN_PROGRESS'))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 5. getListTreatementWithAppointmentNull(query)
    // ============================================
    describe('5. getListTreatementWithAppointmentNull(query)', () => {
        it('TC-TRM-27: Vắt Database pipeline qua RegExp', async () => {
            const query = { search: 'John', filter_date: '2026-04-14', sort: 'desc', status: 'PLANNED', page: 1, limit: 10 };
            model.Treatment.aggregate.mockResolvedValueOnce([{ data: [1, 2], totalCount: [{ count: 2 }] }]);

            const result = await treatmentService.getListTreatementWithAppointmentNull(query);
            expect(result.data.length).toBe(2);
            expect(model.Treatment.aggregate).toHaveBeenCalled();
        });

        it('TC-TRM-28: Falsy Param -> Tự sinh Array rỗng', async () => {
            model.Treatment.aggregate.mockResolvedValueOnce([{ data: [], totalCount: [] }]);

            const result = await treatmentService.getListTreatementWithAppointmentNull({});
            expect(result.data).toEqual([]);
            expect(result.pagination.totalItems).toBe(0);
        });

        it('TC-TRM-29: Quăng InternalServerError nếu Database gãy Agg', async () => {
            model.Treatment.aggregate.mockRejectedValueOnce(new Error('Agg Boom'));
            await expect(treatmentService.getListTreatementWithAppointmentNull({}))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 6. addAppointmentIdOnTreatment
    // ============================================
    describe('6. addAppointmentIdOnTreatment(treatmentId, appointmentId, session)', () => {
        it('TC-TRM-30: Gắn Session ID thành công đè lên Treatment', async () => {
            model.Treatment.findByIdAndUpdate.mockResolvedValueOnce({ phase: 'SESSION' });
            const result = await treatmentService.addAppointmentIdOnTreatment(VALID_ID, VALID_ID, {});
            expect(result.phase).toBe('SESSION');
        });

        it('TC-TRM-31: NotFoundError do không tìm thấy file id', async () => {
            model.Treatment.findByIdAndUpdate.mockResolvedValueOnce(null);
            await expect(treatmentService.addAppointmentIdOnTreatment(VALID_ID, VALID_ID, {}))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-TRM-32: Gọi InternalServerError khi văng Lỗi Error DB', async () => {
            model.Treatment.findByIdAndUpdate.mockRejectedValueOnce(new Error('Transaction Failed'));
            await expect(treatmentService.addAppointmentIdOnTreatment(VALID_ID, VALID_ID, {}))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });
});
