const Treatment = require('../../src/modules/treatment/models/treatment.model');
const Medicine = require('../../src/modules/inventory/model/medicine.model');
const notificationService = require('../../src/modules/notification/service/notification.service');
const prescriptionService = require('../../src/modules/inventory/service/prescription.service');

// Mock models and services
jest.mock('../../src/modules/treatment/models/treatment.model');
jest.mock('../../src/modules/inventory/model/medicine.model');
jest.mock('../../src/modules/notification/service/notification.service');

describe('Prescription Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getPrescriptions', () => {
        it('should return prescriptions with correct mapping', async () => {
            const mockTreatments = [
                {
                    _id: 't1',
                    patient_id: { profile_id: { full_name: 'Patient A', phone: '123' } },
                    doctor_id: { profile_id: { full_name: 'Doctor B' } },
                    medicine_usage: [{ medicine_id: { medicine_name: 'Med X' }, quantity: 2, dispensed: false }],
                    createdAt: new Date()
                }
            ];
            Treatment.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockTreatments)
            });
            Treatment.countDocuments.mockResolvedValue(1);

            const result = await prescriptionService.getPrescriptions({});
            expect(result.prescriptions[0].patient_name).toBe('Patient A');
            expect(result.prescriptions[0].dispense_status).toBe('Chờ xuất');
        });
    });

    describe('dispensePrescription', () => {
        it('should dispense prescription and update inventory', async () => {
            const mockTreatment = {
                _id: 't1',
                medicine_usage: [
                    { medicine_id: { _id: 'm1' }, quantity: 10, dispensed: false }
                ],
                save: jest.fn().mockResolvedValue(true)
            };
            Treatment.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockTreatment)
            });

            Medicine.findById.mockResolvedValue({
                _id: 'm1',
                medicine_name: 'Med X',
                quantity: 100,
                units_per_selling_unit: 10
            });
            Medicine.findByIdAndUpdate.mockResolvedValue({
                _id: 'm1',
                medicine_name: 'Med X',
                quantity: 99,
                min_quantity: 5
            });

            const result = await prescriptionService.dispensePrescription('t1');
            expect(result.dispensed_count).toBe(1);
            expect(mockTreatment.save).toHaveBeenCalled();
            expect(Medicine.findByIdAndUpdate).toHaveBeenCalledWith('m1', { $inc: { quantity: -1 } }, { new: true });
        });

        it('should throw error if stock is insufficient', async () => {
            const mockTreatment = {
                _id: 't1',
                medicine_usage: [{ medicine_id: { _id: 'm1' }, quantity: 10, dispensed: false }]
            };
            Treatment.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockTreatment) });
            Medicine.findById.mockResolvedValue({ _id: 'm1', quantity: 0.5, units_per_selling_unit: 10 }); // only 5 base units

            await expect(prescriptionService.dispensePrescription('t1')).rejects.toThrow(/Tồn kho không đủ/);
        });

        it('should throw error if prescription not found', async () => {
            Treatment.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
            await expect(prescriptionService.dispensePrescription('t1')).rejects.toMatchObject({ statusCode: 404 });
        });
    });
});
