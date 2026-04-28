/* eslint-disable no-undef */
const mongoose = require('mongoose');
const dentalRecordService = require('../src/modules/treatment/services/dental.record.service');
const Model = require('../src/modules/treatment/models/index.model');
const errorRes = require('../src/common/errors');
const logger = require('../src/common/utils/logger');

// Mock dependencies
jest.mock('../src/modules/treatment/models/index.model', () => ({
    DentalRecord: {
        aggregate: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findOne: jest.fn(),
    },
    Treatment: {
        find: jest.fn(),
        insertMany: jest.fn(),
        deleteMany: jest.fn(),
        checkAndCompleteDentalRecord: jest.fn(),
    },
}));

jest.mock('../src/common/utils/logger', () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
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

describe('DentalRecordService - Comprehensive Unit Tests', () => {
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
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(val),
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(val)
    });

    // 1. getListOfPatientService
    describe('getListOfPatientService', () => {
        it('should return paginated results for admin (patientId=null) and complex filters', async () => {
            const mockResult = [{ data: [{ _id: '1' }], totalCount: [{ count: 1 }] }];
            Model.DentalRecord.aggregate.mockResolvedValue(mockResult);

            const query = {
                search: '  Oral  ',
                filter_dental_record: 'IN_PROGRESS',
                filter_treatment: 'PLANNED',
                sort: 'asc',
                page: '1',
                limit: '5'
            };
            const result = await dentalRecordService.getListOfPatientService(query, null);

            expect(result.data).toHaveLength(1);
            expect(result.pagination.totalItems).toBe(1);
            expect(Model.DentalRecord.aggregate).toHaveBeenCalled();
        });

        it('should filter by patientId when provided', async () => {
            Model.DentalRecord.aggregate.mockResolvedValue([{ data: [], totalCount: [] }]);
            await dentalRecordService.getListOfPatientService({}, VALID_ID);
            const pipeline = Model.DentalRecord.aggregate.mock.calls[0][0];
            expect(pipeline[0].$match.patient_id).toEqual(new mongoose.Types.ObjectId(VALID_ID));
        });

        it('should throw InternalServerError on DB failure', async () => {
            Model.DentalRecord.aggregate.mockRejectedValue(new Error('DB Error'));
            await expect(dentalRecordService.getListOfPatientService({}, null))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // 2. getByIdService
    describe('getByIdService', () => {
        it('should return record with treatments and endDate mapping', async () => {
            const mockRecord = { _id: VALID_ID };
            const mockTreatments = [{ _id: 't1', phase: 'PLAN', end_date: '2025-01-01' }];

            Model.DentalRecord.findById.mockReturnValue(mockChain(mockRecord));
            Model.Treatment.find.mockReturnValue(mockChain(mockTreatments));

            const result = await dentalRecordService.getByIdService(VALID_ID, 'IN_PROGRESS');
            expect(result.treatments[0].endDate).toBe('2025-01-01');
        });

        it('should throw NotFoundError if record missing', async () => {
            Model.DentalRecord.findById.mockReturnValue(mockChain(null));
            await expect(dentalRecordService.getByIdService(VALID_ID))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('should propagate known errors and wrap unknown ones', async () => {
            Model.DentalRecord.findById.mockImplementation(() => { throw new errorRes.BadRequestError('Bad'); });
            await expect(dentalRecordService.getByIdService(VALID_ID)).rejects.toThrow(errorRes.BadRequestError);

            Model.DentalRecord.findById.mockImplementation(() => { throw new Error('Unknown'); });
            await expect(dentalRecordService.getByIdService(VALID_ID)).rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // 3. createService
    describe('createService', () => {
        it('should create record successfully', async () => {
            Model.DentalRecord.create.mockResolvedValue({ _id: 'new' });
            const result = await dentalRecordService.createService({ record_name: 'Test' });
            expect(result._id).toBe('new');
        });

        it('should throw InternalServerError on failure', async () => {
            Model.DentalRecord.create.mockRejectedValue(new Error('Fail'));
            await expect(dentalRecordService.createService({})).rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // 4. updateService
    describe('updateService', () => {
        it('should update record successfully', async () => {
            Model.DentalRecord.findById.mockResolvedValue({ _id: VALID_ID, status: 'IN_PROGRESS' });
            Model.DentalRecord.findByIdAndUpdate.mockResolvedValue({ _id: VALID_ID, record_name: 'Updated' });

            const result = await dentalRecordService.updateService(VALID_ID, { record_name: 'Updated' });
            expect(result.record_name).toBe('Updated');
        });

        it('should throw NotFoundError if record does not exist (line 381)', async () => {
            Model.DentalRecord.findById.mockResolvedValue(null);
            await expect(dentalRecordService.updateService(VALID_ID, {}))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('should throw BadRequest if COMPLETED record is updated', async () => {
            Model.DentalRecord.findById.mockResolvedValue({ status: 'COMPLETED' });
            await expect(dentalRecordService.updateService(VALID_ID, {}))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('should throw BadRequest if manually setting COMPLETED status', async () => {
            Model.DentalRecord.findById.mockResolvedValue({ status: 'IN_PROGRESS' });
            await expect(dentalRecordService.updateService(VALID_ID, { status: 'COMPLETED' }))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('should allow CANCELLED if no treatments are IN_PROGRESS', async () => {
            Model.DentalRecord.findById.mockResolvedValue({ status: 'IN_PROGRESS' });
            Model.Treatment.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([{ status: 'DONE' }]) });
            Model.DentalRecord.findByIdAndUpdate.mockResolvedValue({ status: 'CANCELLED' });

            const result = await dentalRecordService.updateService(VALID_ID, { status: 'CANCELLED' });
            expect(result.status).toBe('CANCELLED');
        });

        it('should throw BadRequest if CANCELLED with IN_PROGRESS treatments', async () => {
            Model.DentalRecord.findById.mockResolvedValue({ status: 'IN_PROGRESS' });
            Model.Treatment.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([{ status: 'IN_PROGRESS' }]) });

            await expect(dentalRecordService.updateService(VALID_ID, { status: 'CANCELLED' }))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('should wrap unknown DB error in InternalServerError (line 422)', async () => {
            Model.DentalRecord.findById.mockRejectedValue(new Error('DB crash'));
            await expect(dentalRecordService.updateService(VALID_ID, {}))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // 5 & 6. Duplicate Checks
    describe('Duplicate Checks', () => {
        it('checkDuplicateDental should return null if no dupe found', async () => {
            Model.DentalRecord.findOne.mockResolvedValue(null);
            const res = await dentalRecordService.checkDuplicateDental(VALID_ID, 'No Dupe');
            expect(res).toBeNull();
        });

        it('checkDuplicateDental should find dupes and log info', async () => {
            Model.DentalRecord.findOne.mockResolvedValue({ _id: '1' });
            const res = await dentalRecordService.checkDuplicateDental(VALID_ID, 'Test Name');
            expect(res._id).toBe('1');
            expect(logger.info).toHaveBeenCalled();
        });

        it('checkDuplicateDental catch error -> InternalServerError', async () => {
            Model.DentalRecord.findOne.mockRejectedValue(new Error('Fail'));
            await expect(dentalRecordService.checkDuplicateDental(VALID_ID, 'Test'))
                .rejects.toThrow(errorRes.InternalServerError);
        });

        it('checkDuplicateDentalExcludeId should return null if no dupe found', async () => {
            Model.DentalRecord.findOne.mockResolvedValue(null);
            const res = await dentalRecordService.checkDuplicateDentalExcludeId(VALID_ID, 'Test', 'someId');
            expect(res).toBeNull();
        });

        it('checkDuplicateDentalExcludeId should find dupes and log info', async () => {
            Model.DentalRecord.findOne.mockResolvedValue({ _id: '1' });
            const res = await dentalRecordService.checkDuplicateDentalExcludeId(VALID_ID, 'Test', 'someId');
            expect(res._id).toBe('1');
            expect(logger.info).toHaveBeenCalled();
        });

        it('checkDuplicateDentalExcludeId catch error -> InternalServerError (lines 513-521)', async () => {
            Model.DentalRecord.findOne.mockRejectedValue(new Error('DB Error'));
            await expect(dentalRecordService.checkDuplicateDentalExcludeId(VALID_ID, 'Test', 'someId'))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // 7. getDentalRecordById
    describe('getDentalRecordById', () => {
        it('should return null if not found', async () => {
            Model.DentalRecord.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
            const res = await dentalRecordService.getDentalRecordById(VALID_ID);
            expect(res).toBeNull();
        });

        it('should catch error', async () => {
            Model.DentalRecord.findById.mockImplementation(() => { throw new Error('E'); });
            await expect(dentalRecordService.getDentalRecordById(VALID_ID)).rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // 8. findDentalByInforUser
    describe('findDentalByInforUser', () => {
        it('should return empty if search is empty string', async () => {
            const res = await dentalRecordService.findDentalByInforUser('');
            expect(res).toEqual([]);
        });

        it('should return empty if search is null', async () => {
            const res = await dentalRecordService.findDentalByInforUser(null);
            expect(res).toEqual([]);
        });

        it('should return empty if search is whitespace only', async () => {
            const res = await dentalRecordService.findDentalByInforUser('   ');
            expect(res).toEqual([]);
        });

        it('should call aggregate and return grouped patients', async () => {
            Model.DentalRecord.aggregate.mockResolvedValue([{ patient_id: '1', full_name: 'John' }]);
            const res = await dentalRecordService.findDentalByInforUser('John');
            expect(res).toHaveLength(1);
        });

        it('should throw InternalServerError on aggregate failure (lines 660-666)', async () => {
            Model.DentalRecord.aggregate.mockRejectedValue(new Error('Agg fail'));
            await expect(dentalRecordService.findDentalByInforUser('John'))
                .rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // 9. createTreatmentPlanService
    describe('createTreatmentPlanService', () => {
        it('should create plan WITHOUT phases (phases array empty)', async () => {
            Model.DentalRecord.create.mockResolvedValue([{ _id: VALID_ID }]);
            Model.DentalRecord.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: VALID_ID }) });

            const result = await dentalRecordService.createTreatmentPlanService({
                phases: [],
                patient_id: VALID_ID
            }, 'docId');

            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(Model.Treatment.insertMany).not.toHaveBeenCalled();
            expect(result._id).toBe(VALID_ID);
        });

        it('should create plan WITH phases - status completed/in_progress/planned mapping', async () => {
            Model.DentalRecord.create.mockResolvedValue([{ _id: VALID_ID }]);
            Model.Treatment.insertMany.mockResolvedValue([]);
            Model.DentalRecord.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: VALID_ID }) });

            const result = await dentalRecordService.createTreatmentPlanService({
                phases: [
                    { name: 'Phase 1', status: 'completed', tooth_position: 'R1' },
                    { name: 'Phase 2', status: 'in_progress' },
                    { name: 'Phase 3', status: 'planned' }
                ],
                patient_id: VALID_ID
            }, 'docId');

            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(Model.Treatment.insertMany).toHaveBeenCalled();
            expect(result._id).toBe(VALID_ID);
        });

        it('should rollback and throw InternalServerError on DB error', async () => {
            Model.DentalRecord.create.mockRejectedValue(new Error('Fail'));
            await expect(dentalRecordService.createTreatmentPlanService({}, 'doc1'))
                .rejects.toThrow(errorRes.InternalServerError);
            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });

        it('should rollback and rethrow known error (statusCode present)', async () => {
            Model.DentalRecord.create.mockRejectedValue(new errorRes.NotFoundError('Not found'));
            await expect(dentalRecordService.createTreatmentPlanService({}, 'doc1'))
                .rejects.toThrow(errorRes.NotFoundError);
            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });
    });

    // 10. updateTreatmentPlanService
    describe('updateTreatmentPlanService', () => {
        it('should update plan with empty phases (delete existing PLAN phases, no insert)', async () => {
            const existing = { _id: VALID_ID, patient_id: 'p1', created_by: 'd1' };
            Model.DentalRecord.findById
                .mockReturnValueOnce({ session: jest.fn().mockResolvedValue(existing) })
                .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(existing) });
            Model.DentalRecord.findByIdAndUpdate.mockResolvedValue(existing);
            Model.Treatment.deleteMany.mockReturnValue({ session: jest.fn().mockReturnThis() });

            const result = await dentalRecordService.updateTreatmentPlanService(VALID_ID, { phases: [] });
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(Model.Treatment.deleteMany).toHaveBeenCalled();
            expect(Model.Treatment.insertMany).not.toHaveBeenCalled();
            expect(result._id).toBe(VALID_ID);
        });

        it('should update dentalRecordData AND recreate phases with all status mappings (lines 741, 751-763)', async () => {
            const existing = { _id: VALID_ID, patient_id: 'p1', created_by: 'd1' };
            Model.DentalRecord.findById
                .mockReturnValueOnce({ session: jest.fn().mockResolvedValue(existing) })
                .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(existing) });
            Model.DentalRecord.findByIdAndUpdate.mockResolvedValue(existing);
            Model.Treatment.deleteMany.mockReturnValue({ session: jest.fn().mockReturnThis() });
            Model.Treatment.insertMany.mockResolvedValue([]);

            const result = await dentalRecordService.updateTreatmentPlanService(VALID_ID, {
                record_name: 'Updated Name',
                phases: [
                    { name: 'P1', status: 'completed', tooth_position: 'R1', startDate: new Date(), endDate: new Date() },
                    { name: 'P2', status: 'in_progress' },
                    { name: 'P3', status: 'other' }
                ]
            });

            expect(Model.DentalRecord.findByIdAndUpdate).toHaveBeenCalled();
            expect(Model.Treatment.insertMany).toHaveBeenCalled();
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(result._id).toBe(VALID_ID);
        });

        it('should update without phases key (phases undefined - skip delete/insert)', async () => {
            const existing = { _id: VALID_ID, patient_id: 'p1', created_by: 'd1' };
            Model.DentalRecord.findById
                .mockReturnValueOnce({ session: jest.fn().mockResolvedValue(existing) })
                .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(existing) });
            Model.DentalRecord.findByIdAndUpdate.mockResolvedValue(existing);

            await dentalRecordService.updateTreatmentPlanService(VALID_ID, { record_name: 'No Phases' });
            expect(Model.Treatment.deleteMany).not.toHaveBeenCalled();
            expect(mockSession.commitTransaction).toHaveBeenCalled();
        });

        it('should throw NotFound if record missing in transaction', async () => {
            Model.DentalRecord.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(null) });
            await expect(dentalRecordService.updateTreatmentPlanService(VALID_ID, {}))
                .rejects.toThrow(errorRes.NotFoundError);
            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });

        it('should rollback and rethrow known error with statusCode (line 785)', async () => {
            Model.DentalRecord.findById.mockReturnValue({ session: jest.fn().mockResolvedValue(null) });
            await expect(dentalRecordService.updateTreatmentPlanService(VALID_ID, {}))
                .rejects.toThrow(errorRes.NotFoundError);
            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });

        it('should rollback and throw InternalServerError on unknown error', async () => {
            Model.DentalRecord.findById.mockImplementation(() => { throw new Error('Unexpected crash'); });
            await expect(dentalRecordService.updateTreatmentPlanService(VALID_ID, {}))
                .rejects.toThrow(errorRes.InternalServerError);
            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });
    });
});
