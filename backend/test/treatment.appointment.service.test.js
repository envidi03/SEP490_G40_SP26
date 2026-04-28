/* eslint-disable no-undef */
const mongoose = require('mongoose');
const appointmentService = require('../src/modules/treatment/services/appointment.service');
const StaffModel = require('../src/modules/treatment/models/index.model');
const { Model: AuthModel } = require('../src/modules/auth/index');
const PatientModel = require('../src/modules/patient/model/patient.model');
const { Appointment: AppointmentModel } = require('../src/modules/appointment/models/index.model');
const { model: ServiceModel } = require('../src/modules/service/index');
const emailService = require('../src/common/service/email.service');
const errorRes = require('../src/common/errors');
const logger = require('../src/common/utils/logger');
const bcrypt = require('bcrypt');

// Mock dependencies
jest.mock('../src/modules/treatment/models/index.model', () => ({
    Staff: {
        findOne: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findById: jest.fn(),
    },
    License: {
        findOneAndUpdate: jest.fn(),
        findOne: jest.fn(),
    },
}));

jest.mock('../src/modules/auth/index', () => ({
    Model: {
        Account: {
            findByIdAndUpdate: jest.fn(),
            findById: jest.fn(),
        },
        Profile: {
            findOneAndUpdate: jest.fn(),
            findOne: jest.fn(),
        },
    },
}));

jest.mock('../src/modules/patient/model/patient.model', () => ({
    findOne: jest.fn(),
}));

jest.mock('../src/modules/appointment/models/index.model', () => ({
    Appointment: {
        aggregate: jest.fn(),
        findById: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        getNextQueueNumber: jest.fn(),
        find: jest.fn(),
    },
}));

jest.mock('../src/modules/service/index', () => ({
    model: {
        findById: jest.fn(),
    },
}));

jest.mock('../src/common/service/email.service', () => ({
    sendBookingConfirmationEmail: jest.fn().mockImplementation(() => ({
        catch: jest.fn(),
    })),
    sendCheckinEmail: jest.fn().mockImplementation(() => ({
        catch: jest.fn(),
    })),
}));

jest.mock('../src/common/utils/logger', () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
}));

jest.mock('mongoose', () => {
    const original = jest.requireActual('mongoose');
    return {
        ...original,
        startSession: jest.fn(),
        Types: {
            ObjectId: original.Types.ObjectId,
        },
    };
});

const VALID_ID = new mongoose.Types.ObjectId().toString();

describe('AppointmentService - Comprehensive Unit Tests', () => {
    let mockSession;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSession = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn(),
            inTransaction: jest.fn().mockReturnValue(true),
        };
        mongoose.startSession.mockResolvedValue(mockSession);
    });

    const mockChain = (val) => ({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(val),
        session: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
    });

    // 1. getListService
    describe('getListService', () => {
        it('should return list of appointments with filters', async () => {
            const mockResult = [{ data: [], totalCount: [{ count: 0 }] }];
            AppointmentModel.aggregate.mockResolvedValue(mockResult);
            const res = await appointmentService.getListService({ search: 'John', status: 'SCHEDULED' });
            expect(res.data).toEqual([]);
        });

        it('should throw InternalServerError on fail', async () => {
            AppointmentModel.aggregate.mockRejectedValue(new Error('Fail'));
            await expect(appointmentService.getListService({})).rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // 2. getListOfPatientService
    describe('getListOfPatientService', () => {
        it('should return empty if patient not found', async () => {
            PatientModel.findOne.mockResolvedValue(null);
            const res = await appointmentService.getListOfPatientService({}, 'acc1');
            expect(res.data).toEqual([]);
        });

        it('should return list if patient exists', async () => {
            PatientModel.findOne.mockResolvedValue({ _id: 'p1' });
            AppointmentModel.aggregate.mockResolvedValue([{ data: [], totalCount: [] }]);
            const res = await appointmentService.getListOfPatientService({ search: 'x' }, 'acc1');
            expect(res.data).toBeDefined();
        });

        it('should catch error', async () => {
            PatientModel.findOne.mockRejectedValue(new Error('E'));
            await expect(appointmentService.getListOfPatientService({}, '1')).rejects.toThrow();
        });
    });

    // 3. getByIdService
    describe('getByIdService', () => {
        it('should handle invalid ID', async () => {
            await expect(appointmentService.getByIdService('invalid')).rejects.toThrow(errorRes.BadRequestError);
        });

        it('should throw NotFound if missing', async () => {
            AppointmentModel.findById.mockReturnValue(mockChain(null));
            await expect(appointmentService.getByIdService(VALID_ID)).rejects.toThrow(errorRes.NotFoundError);
        });

        it('should return data if exists', async () => {
            AppointmentModel.findById.mockReturnValue(mockChain({ _id: VALID_ID }));
            const res = await appointmentService.getByIdService(VALID_ID);
            expect(res._id).toBe(VALID_ID);
        });
    });

    // 4. createService
    describe('createService', () => {
        it('should throw NotFound if patient profile missing', async () => {
            PatientModel.findOne.mockResolvedValue(null);
            await expect(appointmentService.createService({}, 'acc')).rejects.toThrow(errorRes.NotFoundError);
        });

        it('should check for duplicate', async () => {
            PatientModel.findOne.mockResolvedValue({ _id: 'p1' });
            AppointmentModel.findOne.mockResolvedValue({ _id: 'a1' });
            await expect(appointmentService.createService({ full_name: 'N' }, 'acc')).rejects.toThrow();
        });

        it('should validate services and create', async () => {
            PatientModel.findOne.mockResolvedValue({ _id: 'p1' });
            AppointmentModel.findOne.mockResolvedValue(null);
            ServiceModel.findById.mockResolvedValue({ _id: 's1' });
            AppointmentModel.create.mockResolvedValue({ _id: 'a1', email: 'v@m.c', appointment_date: new Date() });

            const res = await appointmentService.createService({ book_service: [{ service_id: 's1' }] }, 'acc');
            expect(res._id).toBe('a1');
        });
    });

    // 5. staffCreateService
    describe('staffCreateService', () => {
        it('should handle staff creation and queue number', async () => {
            AppointmentModel.findOne.mockResolvedValue(null);
            AppointmentModel.getNextQueueNumber.mockResolvedValue(5);
            AppointmentModel.create.mockResolvedValue({ _id: 'a1', queue_number: 5 });

            const res = await appointmentService.staffCreateService({ status: 'CHECKED_IN' });
            expect(res.queue_number).toBe(5);
        });
    });

    // 6. updateService
    describe('updateService', () => {
        it('should update multiple models and commit', async () => {
            AuthModel.Account.findByIdAndUpdate.mockResolvedValue({ _id: 'acc' });
            StaffModel.Staff.findOne.mockReturnValue({ session: jest.fn().mockResolvedValue({ _id: 's1' }) });

            // Mocks for Promise.all
            AuthModel.Account.findById.mockReturnValue({ select: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue({ _id: 'acc' }) });
            AuthModel.Profile.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({}) });
            StaffModel.Staff.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue({}) });
            StaffModel.License.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({}) });

            const res = await appointmentService.updateService('acc', { username: 'root', password: '1' });
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(res.account).toBeDefined();
        });

        it('should rollback on staff not found', async () => {
            AuthModel.Account.findByIdAndUpdate.mockResolvedValue({ _id: 'acc' });
            StaffModel.Staff.findOne.mockReturnValue({ session: jest.fn().mockResolvedValue(null) });
            await expect(appointmentService.updateService('acc', {})).rejects.toThrow(errorRes.NotFoundError);
            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });
    });

    // 7. updateStatusOnly
    describe('updateStatusOnly', () => {
        it('should assign queue number on CHECKED_IN', async () => {
            AppointmentModel.findById.mockResolvedValue({ _id: VALID_ID, appointment_date: new Date() });
            AppointmentModel.getNextQueueNumber.mockResolvedValue(10);
            AppointmentModel.findByIdAndUpdate.mockResolvedValue({ status: 'CHECKED_IN', queue_number: 10 });

            const res = await appointmentService.updateStatusOnly(VALID_ID, 'CHECKED_IN');
            expect(res.queue_number).toBe(10);
        });

        it('should return existing if already checked in', async () => {
            AppointmentModel.findById.mockResolvedValue({ status: 'CHECKED_IN', queue_number: 1 });
            const res = await appointmentService.updateStatusOnly(VALID_ID, 'CHECKED_IN');
            expect(res.queue_number).toBe(1);
        });
    });

    // 8. checkinService
    describe('checkinService', () => {
        it('should checkin today\'s appointments', async () => {
            AppointmentModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ _id: 'a1', email: 'v@m.c' }]) });
            AppointmentModel.getNextQueueNumber.mockResolvedValue(1);
            AppointmentModel.findByIdAndUpdate.mockResolvedValue({ _id: 'a1', email: 'v@m.c' });

            const res = await appointmentService.checkinService({ phone: '123' });
            expect(res).toHaveLength(1);
        });

        it('should throw NotFound if no appointments', async () => {
            AppointmentModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
            await expect(appointmentService.checkinService({})).rejects.toThrow(errorRes.NotFoundError);
        });
    });
});
