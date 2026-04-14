// ============================================================
//  clinic.service.test.js
//  Unit Test Suite - Clinic Service
//  Functions: getInforClinics, updateClinic, getAllClinics
// ============================================================

// ── Mock modules ───────────────────────────────────────────
jest.mock('../src/modules/clinic/models/clinic.model');
jest.mock('../src/common/utils/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
}));

const clinicService = require('../src/modules/clinic/services/clinic.service');
const ClinicModel = require('../src/modules/clinic/models/clinic.model');
const logger = require('../src/common/utils/logger');

// ============================================================
describe('Clinic Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================================
    //  1. getInforClinics(id)
    //  Input: id (string)
    // ========================================================
    describe('getInforClinics(id)', () => {
        // TC-GC-01: Không truyền id
        it('TC-GC-01: id rỗng hoặc null → trả về null, log warn', async () => {
            const result = await clinicService.getInforClinics(null);
            
            expect(result).toBeNull();
            expect(logger.warn).toHaveBeenCalledWith("No clinic ID provided to getInforClinics service");
            expect(ClinicModel.findById).not.toHaveBeenCalled();
        });

        // TC-GC-02: Truyền id đúng → trả về data
        it('TC-GC-02: id hợp lệ → trả về thông tin clinic', async () => {
            const mockClinic = { _id: 'clinic1', name: 'Phòng khám ABC' };
            ClinicModel.findById = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockClinic)
            });

            const result = await clinicService.getInforClinics('clinic1');

            expect(result).toEqual(mockClinic);
            expect(logger.debug).toHaveBeenCalled();
            expect(ClinicModel.findById).toHaveBeenCalledWith('clinic1');
        });

        // TC-GC-03: DB query lỗi → thow error, log error
        it('TC-GC-03: DB lỗi khi findById → throw error, log error', async () => {
            const error = new Error('Database Error');
            ClinicModel.findById = jest.fn().mockReturnValue({
                select: jest.fn().mockRejectedValue(error)
            });

            await expect(clinicService.getInforClinics('invalid_id')).rejects.toThrow('Database Error');
            expect(logger.error).toHaveBeenCalled();
        });
    });

    // ========================================================
    //  2. updateClinic(clinicId, updateData)
    //  Input: clinicId (string), updateData (object)
    // ========================================================
    describe('updateClinic(clinicId, updateData)', () => {
        // TC-UC-01: Update thành công
        it('TC-UC-01: Dữ liệu hợp lệ → update thành công', async () => {
            const mockUpdatedClinic = { _id: 'clinic1', name: 'Tên mới' };
            ClinicModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedClinic);

            const result = await clinicService.updateClinic('clinic1', { name: 'Tên mới' });

            expect(result).toEqual(mockUpdatedClinic);
            expect(logger.info).toHaveBeenCalledWith("Updating clinic in service");
            expect(logger.debug).toHaveBeenCalled();
            expect(ClinicModel.findByIdAndUpdate).toHaveBeenCalledWith('clinic1', { name: 'Tên mới' }, { new: true, runValidators: true });
        });

        // TC-UC-02: DB lỗi
        it('TC-UC-02: DB lỗi khi update → throw error, log error', async () => {
            const error = new Error('Update Failed');
            ClinicModel.findByIdAndUpdate = jest.fn().mockRejectedValue(error);

            await expect(clinicService.updateClinic('clinic1', {})).rejects.toThrow('Update Failed');
            expect(logger.error).toHaveBeenCalled();
        });
    });

    // ========================================================
    //  3. getAllClinics()
    //  Input: None
    // ========================================================
    describe('getAllClinics()', () => {
        // TC-GAC-01: Thành công
        it('TC-GAC-01: Lấy danh sách thành công', async () => {
            const mockClinics = [{ _id: 'clinic1' }, { _id: 'clinic2' }];
            ClinicModel.find = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockClinics)
            });

            const result = await clinicService.getAllClinics();

            expect(result).toEqual(mockClinics);
            expect(ClinicModel.find).toHaveBeenCalled();
        });

        // TC-GAC-02: DB lỗi
        it('TC-GAC-02: DB lỗi khi find → throw error, log error', async () => {
            const error = new Error('Find Error');
            ClinicModel.find = jest.fn().mockReturnValue({
                select: jest.fn().mockRejectedValue(error)
            });

            await expect(clinicService.getAllClinics()).rejects.toThrow('Find Error');
            expect(logger.error).toHaveBeenCalled();
        });
    });

});
