const mongoose = require('mongoose');
const PatientModel = require('../src/modules/patient/model/patient.model');
const ProfileModel = require('../src/modules/auth/models/profile.model');
const patientService = require('../src/modules/patient/service/patient.service');
const { InternalServerError, NotFoundError, BadRequestError } = require('../src/common/errors');

// Mock dependencies
jest.mock('../src/modules/patient/model/patient.model');
jest.mock('../src/modules/auth/models/profile.model');
jest.mock('../src/common/utils/logger', () => ({
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
}));

describe('Patient Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getListService', () => {
        it('should return a paginated list of patients', async () => {
            const mockData = [
                {
                    data: [
                        { _id: '1', patient_code: 'P001', status: 'active', profile: { full_name: 'John Doe' } }
                    ],
                    totalCount: [{ count: 1 }]
                }
            ];
            PatientModel.aggregate.mockResolvedValue(mockData);

            const result = await patientService.getListService({ page: 1, limit: 10 });

            expect(result.data).toHaveLength(1);
            expect(result.pagination.totalItems).toBe(1);
            expect(PatientModel.aggregate).toHaveBeenCalled();
        });

        it('should apply filters and search correctly', async () => {
            PatientModel.aggregate.mockResolvedValue([{ data: [], totalCount: [] }]);

            await patientService.getListService({ search: 'John', status: 'active' });

            const pipeline = PatientModel.aggregate.mock.calls[0][0];
            const matchStage = pipeline.find(stage => stage.$match);
            expect(matchStage.$match.status).toBe('active');
            expect(matchStage.$match.$or).toBeDefined();
        });

        it('should throw InternalServerError on database error', async () => {
            PatientModel.aggregate.mockRejectedValue(new Error('DB Error'));

            await expect(patientService.getListService({})).rejects.toThrow(InternalServerError);
        });
    });

    describe('getPatientById', () => {
        it('should return patient data when found', async () => {
            const mockPatient = {
                _id: '1',
                profile_id: { full_name: 'John Doe' },
                account_id: { email: 'john@example.com' },
                toObject: jest.fn().mockReturnValue({
                    _id: '1',
                    profile_id: { full_name: 'John Doe' },
                    account_id: { email: 'john@example.com' }
                })
            };
            PatientModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnThis()
            });
            // Final populate returns the mockPatient
            PatientModel.findById().populate().populate.mockResolvedValue(mockPatient);

            const result = await patientService.getPatientById('1');

            expect(result._id).toBe('1');
            expect(result.profile_id.email).toBe('john@example.com');
        });

        it('should throw NotFoundError when patient not found', async () => {
            PatientModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnThis()
            });
            PatientModel.findById().populate().populate.mockResolvedValue(null);

            await expect(patientService.getPatientById('999')).rejects.toThrow(NotFoundError);
        });

        it('should throw InternalServerError on raw error', async () => {
            PatientModel.findById.mockReturnValue({
                populate: jest.fn().mockImplementation(() => { throw new Error('Fail'); })
            });

            await expect(patientService.getPatientById('1')).rejects.toThrow(InternalServerError);
        });
    });

    describe('createPatientService', () => {
        const patientData = { full_name: 'Jane Doe', phone: '123', email: 'jane@e.com' };

        it('should create a profile and patient successfully', async () => {
            const mockProfile = { _id: 'p1', ...patientData };
            const mockPatient = { _id: 'pat1', profile_id: 'p1' };

            ProfileModel.create.mockResolvedValue(mockProfile);
            PatientModel.create.mockResolvedValue(mockPatient);
            PatientModel.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ ...mockPatient, profile_id: mockProfile })
            });

            const result = await patientService.createPatientService(patientData);

            expect(ProfileModel.create).toHaveBeenCalled();
            expect(PatientModel.create).toHaveBeenCalledWith(expect.objectContaining({ profile_id: 'p1' }));
            expect(result.profile_id.full_name).toBe('Jane Doe');
        });

        it('should throw BadRequestError if full_name is missing', async () => {
            await expect(patientService.createPatientService({ phone: '123' })).rejects.toThrow(BadRequestError);
        });

        it('should rollback profile creation if patient creation fails', async () => {
            const mockProfile = { _id: 'p1' };
            ProfileModel.create.mockResolvedValue(mockProfile);
            PatientModel.create.mockRejectedValue(new Error('Patient creation failed'));
            ProfileModel.findByIdAndDelete.mockResolvedValue({});

            await expect(patientService.createPatientService(patientData)).rejects.toThrow(InternalServerError);
            expect(ProfileModel.findByIdAndDelete).toHaveBeenCalledWith('p1');
        });
    });

    describe('updatePatientService', () => {
        const updateData = { full_name: 'John Updated', status: 'inactive' };

        it('should update profile and patient successfully', async () => {
            const mockPatient = { _id: '1', profile_id: 'p1' };
            PatientModel.findById.mockResolvedValue(mockPatient);
            ProfileModel.findByIdAndUpdate.mockResolvedValue({});
            PatientModel.findByIdAndUpdate.mockResolvedValue({});
            
            // Final return populate
            PatientModel.findById.mockReturnValueOnce(mockPatient) // for initial check
                               .mockReturnValue({ // for final return
                                    populate: jest.fn().mockResolvedValue({ _id: '1', profile_id: { full_name: 'John Updated' } })
                               });

            const result = await patientService.updatePatientService('1', updateData);

            expect(ProfileModel.findByIdAndUpdate).toHaveBeenCalledWith('p1', expect.objectContaining({ full_name: 'John Updated' }), { new: true });
            expect(PatientModel.findByIdAndUpdate).toHaveBeenCalledWith('1', { status: 'inactive' });
            expect(result.profile_id.full_name).toBe('John Updated');
        });

        it('should throw NotFoundError if patient not found', async () => {
            PatientModel.findById.mockResolvedValue(null);
            await expect(patientService.updatePatientService('999', {})).rejects.toThrow(NotFoundError);
        });

        it('should throw BadRequestError for invalid status', async () => {
            PatientModel.findById.mockResolvedValue({ _id: '1' });
            await expect(patientService.updatePatientService('1', { status: 'invalid' })).rejects.toThrow(BadRequestError);
        });
    });
});
