const Clinic = require('../src/modules/clinic/models/clinic.model');
const clinicService = require('../src/modules/clinic/services/clinic.service');

// Mock dependencies
jest.mock('../src/modules/clinic/models/clinic.model');
jest.mock('../src/common/utils/logger', () => ({
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
}));

describe('Clinic Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getInforClinics', () => {
        it('should return clinic data when ID is provided', async () => {
            const mockClinic = { _id: '1', name: 'Dental Clinic' };
            Clinic.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockClinic)
            });

            const result = await clinicService.getInforClinics('1');
            expect(result).toEqual(mockClinic);
            expect(Clinic.findById).toHaveBeenCalledWith('1');
        });

        it('should return null if no ID is provided', async () => {
            const result = await clinicService.getInforClinics(null);
            expect(result).toBeNull();
        });

        it('should throw error if findById fails', async () => {
            Clinic.findById.mockReturnValue({
                select: jest.fn().mockRejectedValue(new Error('DB Error'))
            });
            await expect(clinicService.getInforClinics('1')).rejects.toThrow('DB Error');
        });
    });

    describe('updateClinic', () => {
        it('should update and return clinic data', async () => {
            const updateData = { name: 'New Name' };
            Clinic.findByIdAndUpdate.mockResolvedValue({ _id: '1', ...updateData });

            const result = await clinicService.updateClinic('1', updateData);
            expect(result.name).toBe('New Name');
            expect(Clinic.findByIdAndUpdate).toHaveBeenCalledWith('1', updateData, expect.any(Object));
        });

        it('should throw error if update fails', async () => {
            Clinic.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'));
            await expect(clinicService.updateClinic('1', {})).rejects.toThrow('Update failed');
        });
    });

    describe('getAllClinics', () => {
        it('should return all clinics', async () => {
            const mockClinics = [{ _id: '1' }, { _id: '2' }];
            Clinic.find.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockClinics)
            });

            const result = await clinicService.getAllClinics();
            expect(result).toHaveLength(2);
            expect(Clinic.find).toHaveBeenCalled();
        });

        it('should throw error if find fails', async () => {
            Clinic.find.mockReturnValue({
                select: jest.fn().mockRejectedValue(new Error('Find failed'))
            });
            await expect(clinicService.getAllClinics()).rejects.toThrow('Find failed');
        });
    });
});
