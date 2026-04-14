// ============================================================
//  inventory.prescription.service.test.js
//  Unit Test Suite - Inventory Prescription Service
// ============================================================

const prescriptionService = require('../src/modules/inventory/service/prescription.service');
const Treatment = require('../src/modules/treatment/models/treatment.model');
const Medicine = require('../src/modules/inventory/model/medicine.model');
const notificationService = require('../src/modules/notification/service/notification.service');

jest.mock('../src/modules/treatment/models/treatment.model');
jest.mock('../src/modules/inventory/model/medicine.model');
jest.mock('../src/modules/notification/service/notification.service');
// Mock loggers internally used
global.console = { error: jest.fn(), log: jest.fn() };

describe('Inventory Prescription Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getPrescriptions()', () => {
        it('TC-IP-01: Lọc thành công với status=pending, search có giá trị, date hợp lệ', async () => {
            const mockTreatments = [{
                _id: 't1',
                createdAt: new Date(),
                patient_id: { profile_id: { full_name: 'Nguyen Van A', phone: '090' } },
                doctor_id: { profile_id: { full_name: 'Dr. John' } },
                medicine_usage: [{ dispensed: false, quantity: 2, medicine_id: { medicine_name: 'Para', unit: 'Hộp', dosage: '2 vien' } }]
            }];

            Treatment.find = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockReturnValue({
                            select: jest.fn().mockReturnValue({
                                sort: jest.fn().mockReturnValue({
                                    skip: jest.fn().mockReturnValue({
                                        limit: jest.fn().mockResolvedValue(mockTreatments)
                                    })
                                })
                            })
                        })
                    })
                })
            });
            Treatment.countDocuments = jest.fn().mockResolvedValue(1);

            const result = await prescriptionService.getPrescriptions({
                status: 'pending', search: 'Nguyen', date: '2023-10-10', page: 1, limit: 10
            });

            // "dispense_status" của `dispensed: false` là "Chờ xuất"
            expect(result.prescriptions[0].dispense_status).toBe('Chờ xuất');
            // search matched Nguyen Van A
            expect(result.prescriptions.length).toBe(1);
        });

        it('TC-IP-02: Lọc với status=dispensed và search không khớp (N filter ra mảng rỗng)', async () => {
            const mockTreatments = [{
                _id: 't1',
                medicine_usage: [{ dispensed: true }],
                patient_id: { profile_id: { full_name: 'Nguyen Van A' } }
            }];

            Treatment.find = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockReturnValue({
                            select: jest.fn().mockReturnValue({
                                sort: jest.fn().mockReturnValue({
                                    skip: jest.fn().mockReturnValue({
                                        limit: jest.fn().mockResolvedValue(mockTreatments)
                                    })
                                })
                            })
                        })
                    })
                })
            });
            Treatment.countDocuments = jest.fn().mockResolvedValue(1);

            const result = await prescriptionService.getPrescriptions({ status: 'dispensed', search: 'No Match Name' });

            // "dispensed: true" => "Đã xuất"
            expect(result.prescriptions.length).toBe(0); // vì search không khớp
        });
    });

    describe('dispensePrescription()', () => {
        it('TC-IP-03: Lỗi 404 nếu không tìm thấy đơn thuốc', async () => {
            Treatment.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            const req = prescriptionService.dispensePrescription('invalid');
            await expect(req).rejects.toThrow('Không tìm thấy đơn thuốc');
            await expect(req).rejects.toMatchObject({ statusCode: 404 });
        });

        it('TC-IP-04: Lỗi 400 nếu đơn thuốc không chứa thuốc nào', async () => {
            Treatment.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue({ medicine_usage: [] }) // rỗng
            });

            await expect(prescriptionService.dispensePrescription('t1')).rejects.toThrow('Đơn thuốc không có thuốc nào');
        });

        it('TC-IP-05: Lỗi 400 nếu đơn thuốc đã được xuất hết', async () => {
            Treatment.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    medicine_usage: [{ dispensed: true }]
                })
            });

            await expect(prescriptionService.dispensePrescription('t1')).rejects.toThrow('Đơn thuốc đã được xuất rồi');
        });

        it('TC-IP-06: Lỗi 400 nếu Tồn kho không đủ', async () => {
            Treatment.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    medicine_usage: [{ dispensed: false, medicine_id: { _id: 'm1' }, quantity: 10 }]
                })
            });

            Medicine.findById = jest.fn().mockResolvedValue({
                _id: 'm1', medicine_name: 'Para', quantity: 2, units_per_selling_unit: 1, base_unit: 'Vien', selling_unit: 'Hop' 
            }); // Yêu cầu 10 > Tồn kho 2

            await expect(prescriptionService.dispensePrescription('t1')).rejects.toThrow(/Tồn kho không đủ/);
        });

        it('TC-IP-07: Lỗi 400 khi duyệt thấy Thuốc không tồn tại trong kho (Model xoá)', async () => {
            Treatment.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    medicine_usage: [{ dispensed: false, medicine_id: 'm2', quantity: 1 }]
                })
            });

            Medicine.findById = jest.fn().mockResolvedValue(null); // kho không có

            await expect(prescriptionService.dispensePrescription('t1')).rejects.toThrow(/Tồn kho không đủ: Thuốc không tồn tại/);
        });

        it('TC-IP-08: Xuất thuốc Thành công và KHÔNG dính Low Stock', async () => {
            const mockTreatment = {
                _id: 't1',
                medicine_usage: [{ dispensed: false, medicine_id: 'm1', quantity: 10 }],
                save: jest.fn()
            };
            Treatment.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockTreatment)
            });

            Medicine.findById = jest.fn().mockResolvedValue({ quantity: 100, units_per_selling_unit: 1 });
            Medicine.findByIdAndUpdate = jest.fn().mockResolvedValue({
                quantity: 90, min_quantity: 5 // 90 > 5 => ko cảnh báo
            });

            const result = await prescriptionService.dispensePrescription('t1');

            expect(mockTreatment.medicine_usage[0].dispensed).toBe(true);
            expect(mockTreatment.save).toHaveBeenCalled();
            expect(notificationService.sendToRole).not.toHaveBeenCalled();
            expect(result.dispensed_count).toBe(1);
        });

        it('TC-IP-09: Xuất thuốc Thành công VÀ gửi Notification vì Low Stock', async () => {
            const mockTreatment = {
                _id: 't1',
                medicine_usage: [{ dispensed: false, medicine_id: 'm1', quantity: 10 }],
                save: jest.fn()
            };
            Treatment.findById = jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockTreatment)
            });

            Medicine.findById = jest.fn().mockResolvedValue({ quantity: 10, units_per_selling_unit: 1 });
            Medicine.findByIdAndUpdate = jest.fn().mockResolvedValue({
                _id: 'm1', medicine_name: 'Para', quantity: 0, min_quantity: 5, selling_unit: 'Hop' // 0 < 5 => alert
            });

            await prescriptionService.dispensePrescription('t1');

            expect(notificationService.sendToRole).toHaveBeenCalled(); // cảnh báo đã bị trigger
        });
    });

});
