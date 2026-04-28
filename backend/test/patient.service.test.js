// ============================================================
//  patient.service.test.js
//  Unit Test Suite - Patient Service
//  Functions: getListService, getPatientById,
//             createPatientService, updatePatientService
// ============================================================

// ── Mock modules trước khi require service ──────────────────
jest.mock('../src/modules/patient/model/patient.model');
jest.mock('../src/modules/auth/models/profile.model');
jest.mock('../src/common/utils/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
}));
jest.mock('../src/common/responses/Pagination', () =>
    jest.fn().mockImplementation((opts) => ({
        page: opts.page,
        size: opts.size,
        totalItems: opts.totalItems,
    }))
);

// ── Import sau khi mock ──────────────────────────────────────
const patientService = require('../src/modules/patient/service/patient.service');
const PatientModel = require('../src/modules/patient/model/patient.model');
const ProfileModel = require('../src/modules/auth/models/profile.model');
const {
    NotFoundError,
    BadRequestError,
    InternalServerError,
} = require('../src/common/errors');

// ============================================================
describe('Patient Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================================
    //  1. getListService(query)
    //  Input: query { search?, status?, page?, limit? }
    // ========================================================
    describe('getListService(query)', () => {
        const mockAggregateResult = [{
            data: [{ _id: 'p1', patient_code: 'BN001', status: 'active' }],
            totalCount: [{ count: 1 }]
        }];

        // TC-GL-01: Không có filter → trả về tất cả bệnh nhân
        it('TC-GL-01: Không có filter → trả về danh sách đầy đủ', async () => {
            PatientModel.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

            const result = await patientService.getListService({});

            expect(PatientModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
            expect(result.pagination).toBeDefined();
        });

        // TC-GL-02: Có search → lọc theo tên/phone/email
        it('TC-GL-02: Có search query → lọc theo tên / phone / email', async () => {
            PatientModel.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

            const result = await patientService.getListService({ search: 'Nguyen', page: 1, limit: 5 });

            expect(PatientModel.aggregate).toHaveBeenCalled();
            expect(result.data).toBeDefined();
        });

        // TC-GL-03: Có status filter → lọc theo trạng thái
        it('TC-GL-03: Có status filter → lọc theo status active/inactive', async () => {
            PatientModel.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

            const result = await patientService.getListService({ status: 'active' });

            expect(PatientModel.aggregate).toHaveBeenCalled();
            expect(result.data).toBeDefined();
        });

        // TC-GL-04: DB lỗi → InternalServerError
        it('TC-GL-04: DB aggregate lỗi → InternalServerError', async () => {
            PatientModel.aggregate = jest.fn().mockRejectedValue(new Error('DB connection error'));

            await expect(patientService.getListService({})).rejects.toThrow(InternalServerError);
        });
    });

    // ========================================================
    //  2. getPatientById(id)
    //  Input: id (string - MongoDB ObjectId)
    // ========================================================
    describe('getPatientById(id)', () => {
        const mockPatientDoc = {
            _id: 'p1',
            patient_code: 'BN001',
            status: 'active',
            toObject: jest.fn().mockReturnValue({
                _id: 'p1',
                patient_code: 'BN001',
                status: 'active',
                profile_id: { full_name: 'Nguyen Van A', phone: null, email: null, dob: null, gender: 'male', address: '' },
                account_id: { email: 'a@a.com', phone_number: '0987654321' }
            })
        };

        // TC-GP-01: Patient tồn tại → trả về thông tin chi tiết
        it('TC-GP-01: Patient tồn tại → trả về đầy đủ thông tin', async () => {
            PatientModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockPatientDoc)
                })
            });

            const result = await patientService.getPatientById('p1');

            expect(result._id).toBe('p1');
            expect(result.account_id).toBeUndefined(); // account_id bị xoá khỏi kết quả
        });

        // TC-GP-02: Patient không tồn tại → NotFoundError
        it('TC-GP-02: Patient không tồn tại → NotFoundError', async () => {
            PatientModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(null)
                })
            });

            await expect(patientService.getPatientById('nonexistent_id')).rejects.toThrow(NotFoundError);
        });

        // TC-GP-03: DB lỗi → InternalServerError
        it('TC-GP-03: DB lỗi (không phải NotFoundError) → InternalServerError', async () => {
            PatientModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockRejectedValue(new Error('DB timeout'))
                })
            });

            await expect(patientService.getPatientById('p1')).rejects.toThrow(InternalServerError);
        });

        // TC-GP-04: Profile có phone/email = null → lấy fallback từ account_id
        it('TC-GP-04: profile.phone và profile.email null → fallback lấy từ account_id', async () => {
            const mockPatientWithNullPhone = {
                _id: 'p1',
                toObject: jest.fn().mockReturnValue({
                    _id: 'p1',
                    profile_id: { full_name: 'Nguyen Van A', phone: null, email: null },
                    account_id: { email: 'fromaccount@a.com', phone_number: '0111222333' }
                })
            };
            PatientModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockPatientWithNullPhone)
                })
            });

            const result = await patientService.getPatientById('p1');

            expect(result.profile_id.phone).toBe('0111222333');    // lấy từ account
            expect(result.profile_id.email).toBe('fromaccount@a.com'); // lấy từ account
            expect(result.account_id).toBeUndefined();
        });
    });

    // ========================================================
    //  3. createPatientService(data)
    //  Input: { full_name, phone?, email?, dob?, gender?, address? }
    // ========================================================
    describe('createPatientService(data)', () => {
        const validData = {
            full_name: 'Nguyen Van B',
            phone: '0909123456',
            email: 'b@b.com',
            dob: '1990-01-01',
            gender: 'male',
            address: 'Ha Noi'
        };
        const mockProfile = { _id: 'prof1', full_name: 'Nguyen Van B' };
        const mockCreatedPatient = { _id: 'p2', profile_id: mockProfile, status: 'active' };

        // TC-CP-01: Dữ liệu hợp lệ → tạo thành công
        it('TC-CP-01: Dữ liệu hợp lệ → tạo Profile + Patient thành công', async () => {
            ProfileModel.create = jest.fn().mockResolvedValue(mockProfile);
            PatientModel.create = jest.fn().mockResolvedValue({ _id: 'p2' });
            PatientModel.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockCreatedPatient)
            });

            const result = await patientService.createPatientService(validData);

            expect(ProfileModel.create).toHaveBeenCalled();
            expect(PatientModel.create).toHaveBeenCalledWith({ profile_id: 'prof1', status: 'active' });
            expect(result._id).toBe('p2');
        });

        // TC-CP-02: full_name null / rỗng / chỉ dấu cách (Boundary)
        it('TC-CP-02: full_name null / rỗng / khoảng trắng → BadRequestError', async () => {
            await expect(patientService.createPatientService({ full_name: '' })).rejects.toThrow(BadRequestError);
            await expect(patientService.createPatientService({ full_name: null })).rejects.toThrow(BadRequestError);
            await expect(patientService.createPatientService({ full_name: '   ' })).rejects.toThrow(BadRequestError);
        });

        // TC-CP-03: DB lỗi sau khi tạo Profile → rollback xoá Profile + InternalServerError
        it('TC-CP-03: DB lỗi khi tạo Patient → rollback xoá Profile, ném InternalServerError', async () => {
            ProfileModel.create = jest.fn().mockResolvedValue(mockProfile);
            PatientModel.create = jest.fn().mockRejectedValue(new Error('DB error'));
            ProfileModel.findByIdAndDelete = jest.fn().mockResolvedValue({});

            await expect(patientService.createPatientService(validData)).rejects.toThrow(InternalServerError);
            expect(ProfileModel.findByIdAndDelete).toHaveBeenCalledWith('prof1');
        });

        // TC-CP-04: ProfileModel.create thất bại → createdProfile = null → KHÔNG rollback
        it('TC-CP-04: DB lỗi ngay khi tạo Profile → không rollback, ném InternalServerError', async () => {
            ProfileModel.create = jest.fn().mockRejectedValue(new Error('Profile DB error'));
            ProfileModel.findByIdAndDelete = jest.fn();

            await expect(patientService.createPatientService(validData)).rejects.toThrow(InternalServerError);
            expect(ProfileModel.findByIdAndDelete).not.toHaveBeenCalled(); // không rollback vì profile chưa tạo
        });
    });

    // ========================================================
    //  4. updatePatientService(id, data)
    //  Input: id (string), data { full_name?, phone?, email?,
    //         dob?, gender?, address?, status? }
    // ========================================================
    describe('updatePatientService(id, data)', () => {
        const mockPatient = { _id: 'p1', profile_id: 'prof1', status: 'active' };
        const mockUpdatedPatient = { _id: 'p1', profile_id: { full_name: 'Updated Name' }, status: 'active' };

        // TC-UP-01: Cập nhật profile fields → thành công
        it('TC-UP-01: Cập nhật thông tin profile (full_name, phone...) → thành công', async () => {
            PatientModel.findById = jest.fn()
                .mockResolvedValueOnce(mockPatient)
                .mockReturnValue({ populate: jest.fn().mockResolvedValue(mockUpdatedPatient) });
            ProfileModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});

            const result = await patientService.updatePatientService('p1', { full_name: 'Updated Name', phone: '0911111111' });

            expect(ProfileModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'prof1',
                { full_name: 'Updated Name', phone: '0911111111' },
                { new: true }
            );
            expect(result._id).toBe('p1');
        });

        // TC-UP-02: Cập nhật status hợp lệ ('active' | 'inactive') → thành công
        it('TC-UP-02: Cập nhật status = inactive → thành công', async () => {
            PatientModel.findById = jest.fn()
                .mockResolvedValueOnce(mockPatient)
                .mockReturnValue({ populate: jest.fn().mockResolvedValue({ ...mockPatient, status: 'inactive' }) });
            PatientModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});

            const result = await patientService.updatePatientService('p1', { status: 'inactive' });

            expect(PatientModel.findByIdAndUpdate).toHaveBeenCalledWith('p1', { status: 'inactive' });
            expect(result.status).toBe('inactive');
        });

        // TC-UP-03: Patient không tồn tại → NotFoundError
        it('TC-UP-03: Patient không tồn tại → NotFoundError', async () => {
            PatientModel.findById = jest.fn().mockResolvedValue(null);

            await expect(patientService.updatePatientService('nonexistent_id', { full_name: 'X' })).rejects.toThrow(NotFoundError);
        });

        // TC-UP-04: Status không hợp lệ → BadRequestError
        it('TC-UP-04: Status = "suspended" (không hợp lệ) → BadRequestError', async () => {
            PatientModel.findById = jest.fn().mockResolvedValue(mockPatient);

            await expect(patientService.updatePatientService('p1', { status: 'suspended' })).rejects.toThrow(BadRequestError);
        });

        // TC-UP-05: Chỉ update status, không có profile fields → KHÔNG gọi ProfileModel
        it('TC-UP-05: Chỉ truyền status, không có profile fields → ProfileModel.findByIdAndUpdate KHÔNG được gọi', async () => {
            PatientModel.findById = jest.fn()
                .mockResolvedValueOnce(mockPatient)
                .mockReturnValue({ populate: jest.fn().mockResolvedValue({ ...mockPatient, status: 'active' }) });
            PatientModel.findByIdAndUpdate = jest.fn().mockResolvedValue({});
            ProfileModel.findByIdAndUpdate = jest.fn();

            await patientService.updatePatientService('p1', { status: 'active' });

            expect(ProfileModel.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(PatientModel.findByIdAndUpdate).toHaveBeenCalledWith('p1', { status: 'active' });
        });
    });
});
