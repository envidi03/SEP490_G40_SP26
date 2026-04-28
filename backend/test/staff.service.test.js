/* eslint-disable no-undef */

/**
 * MOCK MONGOOSE
 */
const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
    inTransaction: jest.fn().mockReturnValue(true),
};
jest.doMock('mongoose', () => {
    const original = jest.requireActual('mongoose');
    return {
        ...original,
        startSession: jest.fn().mockResolvedValue(mockSession),
        Types: { ObjectId: original.Types.ObjectId }
    };
});
const mongoose = require('mongoose');

const bcrypt = { hash: jest.fn().mockResolvedValue('hashed_password') };
jest.doMock('bcrypt', () => bcrypt);

const mockNotificationService = { sendToRole: jest.fn().mockResolvedValue(undefined) };
jest.doMock('../src/modules/notification/service/notification.service', () => mockNotificationService);

/* ── MOCK FACTORY ── */
const mockChain = (val) => {
    const chain = {
        select: jest.fn(() => chain),
        sort: jest.fn(() => chain),
        limit: jest.fn(() => chain),
        skip: jest.fn(() => chain),
        session: jest.fn(() => chain),
        populate: jest.fn(() => chain),
        lean: jest.fn(() => Promise.resolve(val)),
        exec: jest.fn(() => Promise.resolve(val)),
        then: (resolve) => resolve(val),
    };
    return chain;
};

const createMockModel = () => {
    const Model = jest.fn().mockImplementation(function (data) {
        Object.assign(this, data || {});
        this._id = this._id || new mongoose.Types.ObjectId();
        this.save = jest.fn().mockResolvedValue(this);
        return this;
    });
    Model.aggregate = jest.fn();
    Model.findById = jest.fn();
    Model.findOne = jest.fn();
    Model.findByIdAndUpdate = jest.fn();
    Model.findOneAndUpdate = jest.fn();
    Model.find = jest.fn();
    Model.create = jest.fn();
    return Model;
};

const mockStaffModel   = createMockModel();
const mockLicenseModel = createMockModel();
const mockAccountModel = createMockModel();
const mockProfileModel = createMockModel();
const mockLeaveModel   = createMockModel();
const mockRoleModel    = { findById: jest.fn(), find: jest.fn() };

jest.doMock('../src/modules/staff/models/index.model', () => ({ Staff: mockStaffModel, License: mockLicenseModel }));
jest.doMock('../src/modules/auth/index', () => ({ Model: { Account: mockAccountModel, Profile: mockProfileModel, Role: mockRoleModel } }));
jest.doMock('../src/modules/staff/models/leaveRequest.model', () => mockLeaveModel);
jest.doMock('../src/common/utils/logger', () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn(), debug: jest.fn() }));

const staffService = require('../src/modules/staff/services/staff.service');
const errorRes     = require('../src/common/errors');
const logger       = require('../src/common/utils/logger');
const VALID_ID     = new mongoose.Types.ObjectId().toString();

/* ── DEFAULT AGG ── */
const defaultAgg = () => [{
    data: [], totalCount: [{ count: 0 }],
    overallStats: [{ total: 0, doctors: 0, staff: 0, admins: 0, active: 0, inactive: 0 }],
    statistics: [{ total: 0, pending: 0, approved: 0, rejected: 0 }]
}];

/* ── RESET ALL MOCKS ── */
const resetMocks = () => {
    // mongoose session
    mockSession.startTransaction.mockReset();
    mockSession.commitTransaction.mockReset();
    mockSession.abortTransaction.mockReset();
    mockSession.endSession.mockReset();
    mockSession.inTransaction.mockReset().mockReturnValue(true);
    mongoose.startSession.mockResolvedValue(mockSession);

    // Staff model
    mockStaffModel.aggregate.mockResolvedValue(defaultAgg());
    mockStaffModel.findById.mockImplementation(() => mockChain({ _id: 's1' }));
    mockStaffModel.findOne.mockImplementation(() => mockChain({ _id: 's1', account_id: VALID_ID }));
    mockStaffModel.findByIdAndUpdate.mockImplementation(() => mockChain({ _id: 's1' }));
    mockStaffModel.findOneAndUpdate.mockImplementation(() => mockChain({ _id: 's1' }));
    mockStaffModel.find.mockImplementation(() => mockChain([]));
    mockStaffModel.mockImplementation(function (data) {
        Object.assign(this, data || {});
        this._id = this._id || new mongoose.Types.ObjectId();
        this.save = jest.fn().mockResolvedValue(this);
        return this;
    });

    // Account model
    mockAccountModel.findByIdAndUpdate.mockImplementation(() => mockChain({ _id: VALID_ID, status: 'ACTIVE' }));
    mockAccountModel.findById.mockImplementation(() => mockChain({ _id: VALID_ID }));
    mockAccountModel.findOne.mockImplementation(() => mockChain(null));
    mockAccountModel.mockImplementation(function (data) {
        Object.assign(this, data || {});
        this._id = this._id || new mongoose.Types.ObjectId();
        this.save = jest.fn().mockResolvedValue(this);
        return this;
    });

    // Profile model
    mockProfileModel.findOne.mockImplementation(() => mockChain({ _id: 'p1', full_name: 'Test User' }));
    mockProfileModel.findOneAndUpdate.mockImplementation(() => mockChain({ _id: 'p1' }));
    mockProfileModel.mockImplementation(function (data) {
        Object.assign(this, data || {});
        this._id = this._id || new mongoose.Types.ObjectId();
        this.save = jest.fn().mockResolvedValue(this);
        return this;
    });

    // License model
    mockLicenseModel.findOne.mockImplementation(() => mockChain(null));
    mockLicenseModel.findOneAndUpdate.mockImplementation(() => mockChain({ _id: 'l1' }));
    mockLicenseModel.mockImplementation(function (data) {
        Object.assign(this, data || {});
        this._id = this._id || new mongoose.Types.ObjectId();
        this.save = jest.fn().mockResolvedValue(this);
        return this;
    });

    // Leave model
    mockLeaveModel.aggregate.mockResolvedValue(defaultAgg());
    mockLeaveModel.findById.mockImplementation(() => mockChain(null));
    mockLeaveModel.findOne.mockImplementation(() => mockChain(null));
    mockLeaveModel.create.mockResolvedValue({ _id: 'lr1' });

    // Role model
    mockRoleModel.findById.mockImplementation(() => mockChain({ _id: 'r1', name: 'DOCTOR' }));
    mockRoleModel.find.mockImplementation(() => mockChain([]));

    mockNotificationService.sendToRole.mockResolvedValue(undefined);
    bcrypt.hash.mockResolvedValue('hashed');
};

/* ═══════════════════════════════════════════════════════════
   MAIN SUITE
═══════════════════════════════════════════════════════════ */
describe('StaffService', () => {
    beforeEach(async () => {
        jest.resetAllMocks();
        resetMocks();
        await mongoose.startSession();
    });

    /* ─────────────────────────────────────────────
     * TR-01  getListService
     * ───────────────────────────────────────────── */
    describe('TR-01 · getListService', () => {
        it('TC-GL-01 · default call returns data, pagination, statistics', async () => {
            const res = await staffService.getListService({});
            expect(res).toHaveProperty('data');
            expect(res).toHaveProperty('pagination');
            expect(res).toHaveProperty('statistics');
        });

        it('TC-GL-02 · search keyword applies regex across fields', async () => {
            await staffService.getListService({ search: 'Nguyen' });
            expect(mockStaffModel.aggregate).toHaveBeenCalled();
        });

        it('TC-GL-03 · role filter uppercased and applied', async () => {
            await staffService.getListService({ role_name: 'doctor' });
            expect(mockStaffModel.aggregate).toHaveBeenCalled();
        });

        it('TC-GL-04 · status "all" skips status filter', async () => {
            await staffService.getListService({ status: 'all' });
            expect(mockStaffModel.aggregate).toHaveBeenCalled();
        });

        it('TC-GL-05 · negative/invalid page clamps to 1', async () => {
            mockStaffModel.aggregate.mockResolvedValueOnce(defaultAgg());
            const res = await staffService.getListService({ page: '-5' });
            expect(res.pagination.page).toBe(1);
        });

        it('TC-GL-06 · totalCount mapped to pagination.totalItems', async () => {
            mockStaffModel.aggregate.mockResolvedValueOnce([{ data: [], totalCount: [{ count: 42 }], overallStats: [] }]);
            const res = await staffService.getListService({});
            expect(res.pagination.totalItems).toBe(42);
        });

        it('TC-GL-07 · aggregate failure throws InternalServerError', async () => {
            mockStaffModel.aggregate.mockRejectedValueOnce(new Error('db down'));
            await expect(staffService.getListService({})).rejects.toThrow();
        });
    });

    /* ─────────────────────────────────────────────
     * TR-02  getByIdService
     * ───────────────────────────────────────────── */
    describe('TR-02 · getByIdService', () => {
        it('TC-GI-01 · valid ID returns staff document', async () => {
            mockStaffModel.aggregate.mockResolvedValueOnce([{ _id: VALID_ID }]);
            const res = await staffService.getByIdService(VALID_ID, {});
            expect(res._id).toBe(VALID_ID);
        });

        it('TC-GI-02 · invalid ID format throws BadRequestError', async () => {
            await expect(staffService.getByIdService('bad-id', {})).rejects.toThrow();
        });

        it('TC-GI-03 · aggregate returns [] → return null', async () => {
            mockStaffModel.aggregate.mockResolvedValueOnce([]);
            expect(await staffService.getByIdService(VALID_ID, {})).toBeNull();
        });

        it('TC-GI-04 · logger.debug called on every fetch', async () => {
            mockStaffModel.aggregate.mockResolvedValueOnce([{ _id: VALID_ID }]);
            await staffService.getByIdService(VALID_ID, {});
            expect(logger.debug).toHaveBeenCalled();
        });

        it('TC-GI-05 · logger.warn called when staff not found', async () => {
            mockStaffModel.aggregate.mockResolvedValueOnce([]);
            await staffService.getByIdService(VALID_ID, {});
            expect(logger.warn).toHaveBeenCalled();
        });

        it('TC-GI-06 · error with statusCode rethrown as-is', async () => {
            const e = new Error('forbidden'); e.statusCode = 403;
            mockStaffModel.aggregate.mockRejectedValueOnce(e);
            await expect(staffService.getByIdService(VALID_ID, {})).rejects.toThrow();
        });
    });

    /* ─────────────────────────────────────────────
     * TR-03  createService
     * ───────────────────────────────────────────── */
    describe('TR-03 · createService', () => {
        it('TC-CS-01 · DOCTOR role creates License', async () => {
            const res = await staffService.createService({ role_id: 'r1', license_number: 'L1' });
            expect(res.data.license).toBeDefined();
        });

        it('TC-CS-02 · non-DOCTOR role has no License (null)', async () => {
            mockRoleModel.findById.mockImplementationOnce(() => mockChain({ name: 'RECEPTIONIST' }));
            const res = await staffService.createService({ role_id: 'r1' });
            expect(res.data.license).toBeNull();
        });

        it('TC-CS-03 · invalid role_id throws NotFoundError', async () => {
            mockRoleModel.findById.mockImplementationOnce(() => mockChain(null));
            await expect(staffService.createService({ role_id: 'bad' })).rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-CS-04 · Account.save failure aborts transaction', async () => {
            mockAccountModel.mockImplementationOnce(function () {
                this.save = jest.fn().mockRejectedValueOnce(new Error('dup key'));
                return this;
            });
            await expect(staffService.createService({ role_id: 'r1' })).rejects.toThrow();
            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });

        it('TC-CS-05 · BCRYPT_SALT env used for hash rounds', async () => {
            process.env.BCRYPT_SALT = '12';
            await staffService.createService({ role_id: 'r1', password: 'pass' });
            expect(bcrypt.hash).toHaveBeenCalledWith('pass', 12);
        });

        it('TC-CS-06 · commitTransaction called on success', async () => {
            await staffService.createService({ role_id: 'r1' });
            expect(mockSession.commitTransaction).toHaveBeenCalled();
        });

        it('TC-CS-07 · endSession always called (success and failure)', async () => {
            await staffService.createService({ role_id: 'r1' });
            expect(mockSession.endSession).toHaveBeenCalled();
        });
    });

    /* ─────────────────────────────────────────────
     * TR-04  updateService
     * ───────────────────────────────────────────── */
    describe('TR-04 · updateService', () => {
        beforeEach(() => {
            mockStaffModel.findOne.mockImplementation(() => ({
                session: jest.fn().mockResolvedValue({ _id: 's1' })
            }));
        });

        it('TC-US-01 · Account fields updated via findByIdAndUpdate', async () => {
            await staffService.updateService(VALID_ID, { username: 'newname' });
            expect(mockAccountModel.findByIdAndUpdate).toHaveBeenCalled();
        });

        it('TC-US-02 · Profile fields updated via findOneAndUpdate', async () => {
            await staffService.updateService(VALID_ID, { full_name: 'Dr. A' });
            expect(mockProfileModel.findOneAndUpdate).toHaveBeenCalled();
        });

        it('TC-US-03 · License upserted with { upsert: true }', async () => {
            await staffService.updateService(VALID_ID, { license_number: 'L1' });
            expect(mockLicenseModel.findOneAndUpdate).toHaveBeenCalledWith(
                expect.anything(), expect.anything(),
                expect.objectContaining({ upsert: true })
            );
        });

        it('TC-US-04 · Account not found throws NotFoundError', async () => {
            mockAccountModel.findByIdAndUpdate.mockImplementationOnce(() => mockChain(null));
            await expect(staffService.updateService(VALID_ID, { username: 'x' })).rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-US-05 · Staff not found throws error', async () => {
            mockStaffModel.findOne.mockImplementationOnce(() => ({
                session: jest.fn().mockResolvedValue(null)
            }));
            await expect(staffService.updateService(VALID_ID, { degree: 'PhD' })).rejects.toThrow();
        });

        it('TC-US-06 · DB crash aborts transaction', async () => {
            mockAccountModel.findByIdAndUpdate.mockImplementationOnce(() => { throw new Error('crash'); });
            await expect(staffService.updateService(VALID_ID, { email: 'e@e.com' })).rejects.toThrow();
            expect(mockSession.abortTransaction).toHaveBeenCalled();
        });

        it('TC-US-07 · empty data {} skips all updates, returns result', async () => {
            const res = await staffService.updateService(VALID_ID, {});
            expect(res).toHaveProperty('account');
        });
    });

    /* ─────────────────────────────────────────────
     * TR-05  getRoleById
     * ───────────────────────────────────────────── */
    describe('TR-05 · getRoleById', () => {
        it('TC-RB-01 · returns role object when found', async () => {
            mockRoleModel.findById.mockImplementationOnce(() => mockChain({ _id: 'r1', name: 'DOCTOR' }));
            const res = await staffService.getRoleById('r1');
            expect(res._id).toBe('r1');
        });

        it('TC-RB-02 · returns null for null id (no DB call)', async () => {
            expect(await staffService.getRoleById(null)).toBeNull();
            expect(mockRoleModel.findById).not.toHaveBeenCalled();
        });

        it('TC-RB-03 · returns null for undefined id', async () => {
            expect(await staffService.getRoleById(undefined)).toBeNull();
        });

        it('TC-RB-04 · returns null for empty string id', async () => {
            expect(await staffService.getRoleById('')).toBeNull();
        });

        it('TC-RB-05 · DB error throws InternalServerError', async () => {
            mockRoleModel.findById.mockImplementationOnce(() => { throw new Error('db fail'); });
            await expect(staffService.getRoleById('r1')).rejects.toThrow();
        });

        it('TC-RB-06 · DB error logged via logger.error', async () => {
            mockRoleModel.findById.mockImplementationOnce(() => { throw new Error('fail'); });
            await expect(staffService.getRoleById('r1')).rejects.toThrow();
            expect(logger.error).toHaveBeenCalled();
        });
    });

    /* ─────────────────────────────────────────────
     * TR-06  checkUniqueUsername / NotId
     * ───────────────────────────────────────────── */
    describe('TR-06 · checkUniqueUsername', () => {
        it('TC-UU-01 · username taken → returns true', async () => {
            mockAccountModel.findOne.mockImplementationOnce(() => mockChain({ _id: 'a1' }));
            expect(await staffService.checkUniqueUsername('admin')).toBe(true);
        });

        it('TC-UU-02 · username available → returns false', async () => {
            mockAccountModel.findOne.mockImplementationOnce(() => mockChain(null));
            expect(await staffService.checkUniqueUsername('free')).toBe(false);
        });

        it('TC-UU-03 · queries Account with correct username field', async () => {
            mockAccountModel.findOne.mockImplementationOnce(() => mockChain(null));
            await staffService.checkUniqueUsername('testuser');
            expect(mockAccountModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
        });

        it('TC-UU-04 · NotId variant returns true when another account has this username', async () => {
            mockAccountModel.findOne.mockImplementationOnce(() => mockChain({ _id: 'other' }));
            expect(await staffService.checkUniqueUsernameNotId('taken', 'me')).toBe(true);
        });

        it('TC-UU-05 · NotId variant excludes self via $ne filter', async () => {
            mockAccountModel.findOne.mockImplementationOnce(() => mockChain(null));
            await staffService.checkUniqueUsernameNotId('u', 'myId');
            expect(mockAccountModel.findOne).toHaveBeenCalledWith(
                expect.objectContaining({ _id: { $ne: 'myId' } })
            );
        });
    });

    /* ─────────────────────────────────────────────
     * TR-07  checkUniqueEmail / NotId
     * ───────────────────────────────────────────── */
    describe('TR-07 · checkUniqueEmail', () => {
        it('TC-UE-01 · email taken → returns true', async () => {
            mockAccountModel.findOne.mockImplementationOnce(() => mockChain({ _id: 'a1' }));
            expect(await staffService.checkUniqueEmail('dup@test.com')).toBe(true);
        });

        it('TC-UE-02 · email available → returns false', async () => {
            mockAccountModel.findOne.mockImplementationOnce(() => mockChain(null));
            expect(await staffService.checkUniqueEmail('new@test.com')).toBe(false);
        });

        it('TC-UE-03 · queries Account with correct email field', async () => {
            mockAccountModel.findOne.mockImplementationOnce(() => mockChain(null));
            await staffService.checkUniqueEmail('x@x.com');
            expect(mockAccountModel.findOne).toHaveBeenCalledWith({ email: 'x@x.com' });
        });

        it('TC-UE-04 · NotId variant returns false when only self has email', async () => {
            mockAccountModel.findOne.mockImplementationOnce(() => mockChain(null));
            expect(await staffService.checkUniqueEmailNotId('me@e.com', 'myId')).toBe(false);
        });

        it('TC-UE-05 · NotId variant excludes self via $ne filter', async () => {
            mockAccountModel.findOne.mockImplementationOnce(() => mockChain(null));
            await staffService.checkUniqueEmailNotId('e@e.com', 'myId');
            expect(mockAccountModel.findOne).toHaveBeenCalledWith(
                expect.objectContaining({ _id: { $ne: 'myId' } })
            );
        });
    });

    /* ─────────────────────────────────────────────
     * TR-08  checkUniqueLicenseNumber / NotId
     * ───────────────────────────────────────────── */
    describe('TR-08 · checkUniqueLicenseNumber', () => {
        it('TC-UL-01 · license number exists → returns true', async () => {
            mockLicenseModel.findOne.mockImplementationOnce(() => mockChain({ _id: 'l1' }));
            expect(await staffService.checkUniqueLicenseNumber('LIC-001')).toBe(true);
        });

        it('TC-UL-02 · license number available → returns false', async () => {
            mockLicenseModel.findOne.mockImplementationOnce(() => mockChain(null));
            expect(await staffService.checkUniqueLicenseNumber('NEW-001')).toBe(false);
        });

        it('TC-UL-03 · queries License model with correct field', async () => {
            mockLicenseModel.findOne.mockImplementationOnce(() => mockChain(null));
            await staffService.checkUniqueLicenseNumber('L-999');
            expect(mockLicenseModel.findOne).toHaveBeenCalledWith({ license_number: 'L-999' });
        });

        it('TC-UL-04 · NotId variant excludes current license via $ne', async () => {
            mockLicenseModel.findOne.mockImplementationOnce(() => mockChain(null));
            await staffService.checkUniqueLicenseNumberNotId('L', 'myLicId');
            expect(mockLicenseModel.findOne).toHaveBeenCalledWith(
                expect.objectContaining({ _id: { $ne: 'myLicId' } })
            );
        });

        it('TC-UL-05 · NotId returns false when no other license has number', async () => {
            mockLicenseModel.findOne.mockImplementationOnce(() => mockChain(null));
            expect(await staffService.checkUniqueLicenseNumberNotId('L', 'id')).toBe(false);
        });
    });

    /* ─────────────────────────────────────────────
     * TR-09  updateStaffStatusOnly
     * ───────────────────────────────────────────── */
    describe('TR-09 · updateStaffStatusOnly', () => {
        it('TC-SS-01 · updates Account status to ACTIVE', async () => {
            mockAccountModel.findByIdAndUpdate.mockImplementationOnce(() => mockChain({ _id: 'a1', status: 'ACTIVE' }));
            const res = await staffService.updateStaffStatusOnly('a1', 'ACTIVE');
            expect(res.status).toBe('ACTIVE');
        });

        it('TC-SS-02 · updates Account status to INACTIVE', async () => {
            mockAccountModel.findByIdAndUpdate.mockImplementationOnce(() => mockChain({ _id: 'a1', status: 'INACTIVE' }));
            const res = await staffService.updateStaffStatusOnly('a1', 'INACTIVE');
            expect(res.status).toBe('INACTIVE');
        });

        it('TC-SS-03 · syncs Staff status via findOneAndUpdate', async () => {
            await staffService.updateStaffStatusOnly('a1', 'ACTIVE');
            expect(mockStaffModel.findOneAndUpdate).toHaveBeenCalledWith(
                { account_id: 'a1' }, expect.anything(), expect.anything()
            );
        });

        it('TC-SS-04 · Account not found throws NotFoundError', async () => {
            mockAccountModel.findByIdAndUpdate.mockImplementationOnce(() => mockChain(null));
            await expect(staffService.updateStaffStatusOnly('ghost', 'ACTIVE')).rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-SS-05 · returns full updated Account object', async () => {
            const account = { _id: 'a1', status: 'ACTIVE', username: 'doc1' };
            mockAccountModel.findByIdAndUpdate.mockImplementationOnce(() => mockChain(account));
            const res = await staffService.updateStaffStatusOnly('a1', 'ACTIVE');
            expect(res.username).toBe('doc1');
        });
    });

    /* ─────────────────────────────────────────────
     * TR-10  getStaffRoles
     * ───────────────────────────────────────────── */
    describe('TR-10 · getStaffRoles', () => {
        it('TC-GR-01 · returns all matched staff roles', async () => {
            mockRoleModel.find.mockImplementationOnce(() => mockChain([{ name: 'DOCTOR' }, { name: 'RECEPTIONIST' }]));
            const roles = await staffService.getStaffRoles();
            expect(roles).toHaveLength(2);
        });

        it('TC-GR-02 · returns empty array when no roles match', async () => {
            mockRoleModel.find.mockImplementationOnce(() => mockChain([]));
            expect(await staffService.getStaffRoles()).toHaveLength(0);
        });

        it('TC-GR-03 · queries Role with $in filter for staff roles', async () => {
            mockRoleModel.find.mockImplementationOnce(() => mockChain([]));
            await staffService.getStaffRoles();
            expect(mockRoleModel.find).toHaveBeenCalledWith(
                expect.objectContaining({ name: expect.objectContaining({ $in: expect.any(Array) }) }),
                expect.anything()
            );
        });

        it('TC-GR-04 · DB error logged and rethrown', async () => {
            mockRoleModel.find.mockImplementationOnce(() => { throw new Error('fail'); });
            await expect(staffService.getStaffRoles()).rejects.toThrow();
            expect(logger.error).toHaveBeenCalled();
        });

        it('TC-GR-05 · returns all 5 role types when all exist', async () => {
            const all = ['ADMIN_CLINIC', 'DOCTOR', 'RECEPTIONIST', 'PHARMACY', 'ASSISTANT']
                .map(name => ({ name }));
            mockRoleModel.find.mockImplementationOnce(() => mockChain(all));
            expect(await staffService.getStaffRoles()).toHaveLength(5);
        });
    });

    /* ─────────────────────────────────────────────
     * TR-11  createLeaveRequestService
     * ───────────────────────────────────────────── */
    describe('TR-11 · createLeaveRequestService', () => {
        beforeEach(() => {
            mockStaffModel.findOne.mockImplementation(() => mockChain({ _id: 's1' }));
        });

        it('TC-CLR-01 · creates leave request successfully', async () => {
            mockLeaveModel.create.mockResolvedValueOnce({ _id: 'lr1' });
            const res = await staffService.createLeaveRequestService(VALID_ID, { startedDate: '2025-06-01', endDate: '2025-06-05' });
            expect(res._id).toBe('lr1');
        });

        it('TC-CLR-02 · staff not found throws NotFoundError', async () => {
            mockStaffModel.findOne.mockImplementationOnce(() => mockChain(null));
            await expect(staffService.createLeaveRequestService(VALID_ID, { startedDate: '2025-06-01', endDate: '2025-06-05' }))
                .rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-CLR-03 · startedDate > endDate throws BadRequestError', async () => {
            await expect(staffService.createLeaveRequestService(VALID_ID, { startedDate: '2025-06-10', endDate: '2025-06-01' }))
                .rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-CLR-04 · sends notification to ADMIN_CLINIC on success', async () => {
            mockLeaveModel.create.mockResolvedValueOnce({ _id: 'lr2' });
            await staffService.createLeaveRequestService(VALID_ID, { startedDate: '2025-06-01', endDate: '2025-06-05' });
            expect(mockNotificationService.sendToRole).toHaveBeenCalledWith(
                expect.arrayContaining(['ADMIN_CLINIC']), expect.objectContaining({ type: 'LEAVE_REQUESTED' })
            );
        });

        it('TC-CLR-05 · notification failure silently logged, no throw', async () => {
            mockLeaveModel.create.mockResolvedValueOnce({ _id: 'lr3' });
            mockNotificationService.sendToRole.mockRejectedValueOnce(new Error('notify down'));
            await staffService.createLeaveRequestService(VALID_ID, { startedDate: '2025-06-01', endDate: '2025-06-05' });
            expect(logger.error).toHaveBeenCalled();
        });

        it('TC-CLR-06 · staff_id attached to created record', async () => {
            mockLeaveModel.create.mockResolvedValueOnce({ _id: 'lr4' });
            await staffService.createLeaveRequestService(VALID_ID, { startedDate: '2025-06-01', endDate: '2025-06-05' });
            expect(mockLeaveModel.create).toHaveBeenCalledWith(expect.objectContaining({ staff_id: 's1' }));
        });
    });

    /* ─────────────────────────────────────────────
     * TR-12  getLeaveRequestService
     * ───────────────────────────────────────────── */
    describe('TR-12 · getLeaveRequestService', () => {
        beforeEach(() => {
            mockStaffModel.findOne.mockImplementation(() => mockChain({ _id: 's1' }));
        });

        it('TC-GLR-01 · returns data and statistics on success', async () => {
            mockLeaveModel.aggregate.mockResolvedValueOnce([{ data: [{ _id: 'lr1' }], statistics: [{ total: 1, pending: 1, approved: 0, rejected: 0 }] }]);
            const res = await staffService.getLeaveRequestService(VALID_ID, {});
            expect(res.data).toHaveLength(1);
            expect(res.statistics.total).toBe(1);
        });

        it('TC-GLR-02 · staff not found throws NotFoundError', async () => {
            mockStaffModel.findOne.mockImplementationOnce(() => mockChain(null));
            await expect(staffService.getLeaveRequestService(VALID_ID, {})).rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-GLR-03 · empty aggregate returns 0 statistics', async () => {
            mockLeaveModel.aggregate.mockResolvedValueOnce([]);
            const res = await staffService.getLeaveRequestService(VALID_ID, {});
            expect(res.statistics.total).toBe(0);
        });

        it('TC-GLR-04 · status filter applied when provided', async () => {
            await staffService.getLeaveRequestService(VALID_ID, { status: 'pending' });
            expect(mockLeaveModel.aggregate).toHaveBeenCalled();
        });

        it('TC-GLR-05 · status "all" skips status filter', async () => {
            await staffService.getLeaveRequestService(VALID_ID, { status: 'all' });
            expect(mockLeaveModel.aggregate).toHaveBeenCalled();
        });

        it('TC-GLR-06 · empty statistics[] in result defaults to 0', async () => {
            mockLeaveModel.aggregate.mockResolvedValueOnce([{ data: [], statistics: [] }]);
            const res = await staffService.getLeaveRequestService(VALID_ID, {});
            expect(res.statistics.total).toBe(0);
        });
    });

    /* ─────────────────────────────────────────────
     * TR-13  editLeaveRequestService
     * ───────────────────────────────────────────── */
    describe('TR-13 · editLeaveRequestService', () => {
        beforeEach(() => {
            mockStaffModel.findOne.mockImplementation(() => mockChain({ _id: 's1' }));
        });

        it('TC-ELR-01 · edits PENDING request successfully', async () => {
            const leave = { status: 'PENDING', save: jest.fn().mockResolvedValue(true) };
            mockLeaveModel.findById.mockResolvedValueOnce(leave);
            await staffService.editLeaveRequestService(VALID_ID, 'lr1', { reason: 'Updated' });
            expect(leave.save).toHaveBeenCalled();
        });

        it('TC-ELR-02 · APPROVED request throws BadRequestError', async () => {
            mockLeaveModel.findById.mockResolvedValueOnce({ status: 'APPROVED' });
            await expect(staffService.editLeaveRequestService(VALID_ID, 'lr1', {})).rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-ELR-03 · REJECTED request throws BadRequestError', async () => {
            mockLeaveModel.findById.mockResolvedValueOnce({ status: 'REJECTED' });
            await expect(staffService.editLeaveRequestService(VALID_ID, 'lr1', {})).rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-ELR-04 · staff not found throws NotFoundError', async () => {
            mockStaffModel.findOne.mockImplementationOnce(() => mockChain(null));
            await expect(staffService.editLeaveRequestService(VALID_ID, 'lr1', {})).rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-ELR-05 · leave not found throws NotFoundError', async () => {
            mockLeaveModel.findById.mockResolvedValueOnce(null);
            await expect(staffService.editLeaveRequestService(VALID_ID, 'lr1', {})).rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-ELR-06 · startedDate > endDate in payload throws BadRequestError', async () => {
            mockLeaveModel.findById.mockResolvedValueOnce({ status: 'PENDING', save: jest.fn() });
            await expect(staffService.editLeaveRequestService(VALID_ID, 'lr1', { startedDate: '2025-06-10', endDate: '2025-06-01' }))
                .rejects.toThrow(errorRes.BadRequestError);
        });
    });

    /* ─────────────────────────────────────────────
     * TR-14  cancelLeaveRequestService
     * ───────────────────────────────────────────── */
    describe('TR-14 · cancelLeaveRequestService', () => {
        beforeEach(() => {
            mockStaffModel.findOne.mockImplementation(() => mockChain({ _id: 's1' }));
        });

        it('TC-CCLR-01 · cancels PENDING request, status = CANCELLED', async () => {
            const leave = { status: 'PENDING', save: jest.fn().mockResolvedValue(true) };
            mockLeaveModel.findOne.mockImplementationOnce(() => mockChain(leave));
            await staffService.cancelLeaveRequestService(VALID_ID, 'lr1');
            expect(leave.status).toBe('CANCELLED');
            expect(leave.save).toHaveBeenCalled();
        });

        it('TC-CCLR-02 · staff not found throws NotFoundError', async () => {
            mockStaffModel.findOne.mockImplementationOnce(() => mockChain(null));
            await expect(staffService.cancelLeaveRequestService(VALID_ID, 'lr1')).rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-CCLR-03 · leave not found throws NotFoundError', async () => {
            mockLeaveModel.findOne.mockImplementationOnce(() => mockChain(null));
            await expect(staffService.cancelLeaveRequestService(VALID_ID, 'lr1')).rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-CCLR-04 · APPROVED request cannot be cancelled', async () => {
            mockLeaveModel.findOne.mockImplementationOnce(() => mockChain({ status: 'APPROVED' }));
            await expect(staffService.cancelLeaveRequestService(VALID_ID, 'lr1')).rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-CCLR-05 · REJECTED request cannot be cancelled', async () => {
            mockLeaveModel.findOne.mockImplementationOnce(() => mockChain({ status: 'REJECTED' }));
            await expect(staffService.cancelLeaveRequestService(VALID_ID, 'lr1')).rejects.toThrow(errorRes.BadRequestError);
        });
    });

    /* ─────────────────────────────────────────────
     * TR-15  approveLeaveRequestService
     * ───────────────────────────────────────────── */
    describe('TR-15 · approveLeaveRequestService', () => {
        it('TC-ALR-01 · approves PENDING request, status = APPROVED', async () => {
            const leave = { status: 'PENDING', save: jest.fn().mockResolvedValue(true) };
            mockLeaveModel.findById.mockResolvedValueOnce(leave);
            await staffService.approveLeaveRequestService('lr1', 'APPROVED');
            expect(leave.status).toBe('APPROVED');
        });

        it('TC-ALR-02 · rejects PENDING request, status = REJECTED', async () => {
            const leave = { status: 'PENDING', save: jest.fn().mockResolvedValue(true) };
            mockLeaveModel.findById.mockResolvedValueOnce(leave);
            await staffService.approveLeaveRequestService('lr1', 'REJECTED');
            expect(leave.status).toBe('REJECTED');
        });

        it('TC-ALR-03 · invalid status value throws BadRequestError', async () => {
            await expect(staffService.approveLeaveRequestService('lr1', 'INVALID')).rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-ALR-04 · already APPROVED/REJECTED request throws BadRequestError', async () => {
            mockLeaveModel.findById.mockResolvedValueOnce({ status: 'APPROVED' });
            await expect(staffService.approveLeaveRequestService('lr1', 'APPROVED')).rejects.toThrow(errorRes.BadRequestError);
        });

        it('TC-ALR-05 · leave not found throws NotFoundError', async () => {
            mockLeaveModel.findById.mockResolvedValueOnce(null);
            await expect(staffService.approveLeaveRequestService('missing', 'APPROVED')).rejects.toThrow(errorRes.NotFoundError);
        });

        it('TC-ALR-06 · save() called after status update', async () => {
            const leave = { status: 'PENDING', save: jest.fn().mockResolvedValue(true) };
            mockLeaveModel.findById.mockResolvedValueOnce(leave);
            await staffService.approveLeaveRequestService('lr1', 'APPROVED');
            expect(leave.save).toHaveBeenCalled();
        });
    });

    /* ─────────────────────────────────────────────
     * TR-16  getAllLeaveRequestsService
     * ───────────────────────────────────────────── */
    describe('TR-16 · getAllLeaveRequestsService', () => {
        it('TC-GALR-01 · returns data, pagination, statistics', async () => {
            mockLeaveModel.aggregate.mockResolvedValueOnce([{ data: [{ _id: 'lr1' }], totalCount: [{ count: 1 }], overallStats: [{ total: 1, pending: 1, approved: 0, rejected: 0 }] }]);
            const res = await staffService.getAllLeaveRequestsService({});
            expect(res).toHaveProperty('data');
            expect(res).toHaveProperty('pagination');
            expect(res).toHaveProperty('statistics');
        });

        it('TC-GALR-02 · returns empty data when no requests', async () => {
            mockLeaveModel.aggregate.mockResolvedValueOnce([{ data: [], totalCount: [], overallStats: [] }]);
            const res = await staffService.getAllLeaveRequestsService({});
            expect(res.data).toHaveLength(0);
        });

        it('TC-GALR-03 · default page=1 and limit=100', async () => {
            mockLeaveModel.aggregate.mockResolvedValueOnce([{ data: [], totalCount: [{ count: 0 }], overallStats: [{ total: 0 }] }]);
            const res = await staffService.getAllLeaveRequestsService({});
            expect(res.pagination.page).toBe(1);
            expect(res.pagination.limit).toBe(100);
        });

        it('TC-GALR-04 · custom page and limit applied', async () => {
            mockLeaveModel.aggregate.mockResolvedValueOnce([{ data: [], totalCount: [{ count: 50 }], overallStats: [{ total: 50 }] }]);
            const res = await staffService.getAllLeaveRequestsService({ page: 2, limit: 10 });
            expect(res.pagination.page).toBe(2);
            expect(res.pagination.limit).toBe(10);
        });

        it('TC-GALR-05 · totalPages calculated correctly', async () => {
            mockLeaveModel.aggregate.mockResolvedValueOnce([{ data: [], totalCount: [{ count: 25 }], overallStats: [{ total: 25 }] }]);
            const res = await staffService.getAllLeaveRequestsService({ limit: 10 });
            expect(res.pagination.totalPages).toBe(3);
        });

        it('TC-GALR-06 · aggregate called once with pipeline', async () => {
            mockLeaveModel.aggregate.mockResolvedValueOnce([{ data: [], totalCount: [], overallStats: [] }]);
            await staffService.getAllLeaveRequestsService({ status: 'PENDING', search: 'Nam' });
            expect(mockLeaveModel.aggregate).toHaveBeenCalledTimes(1);
        });
    });
});