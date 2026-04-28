// ============================================================
//  inventory.medicine.service.test.js
//  Trùm cuối Unit Test Suite - Medicine Service (100% Coverage)
// ============================================================

const medicineService = require('../src/modules/inventory/service/medicine.service');
const Medicine = require('../src/modules/inventory/model/medicine.model');
const MedicineCategory = require('../src/modules/inventory/model/medicine-category.model');
const notificationService = require('../src/modules/notification/service/notification.service');
const logger = require('../src/common/utils/logger');

// Mocks
jest.mock('../src/modules/inventory/model/medicine.model');
jest.mock('../src/modules/inventory/model/medicine-category.model');
jest.mock('../src/modules/notification/service/notification.service');
jest.mock('../src/common/utils/logger', () => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
}));

describe('Inventory Medicine Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 1. Static Sync Methods
    describe('Static Methods (getDosageForms, getSellingUnits, getBaseUnits)', () => {
        it('TC-IM-01: Lấy thành công danh sách hằng số định dạng', () => {
            expect(medicineService.getDosageForms()).toContain('Viên nén');
            expect(medicineService.getSellingUnits()).toContain('Viên');
            expect(medicineService.getBaseUnits()).toContain('ml');
            expect(medicineService.getUnits).toBe(medicineService.getSellingUnits);
        });
    });

    // 2. getCategories
    describe('getCategories()', () => {
        it('TC-IM-02: Lấy categories thành công', async () => {
            const mockData = [{ name: 'Thuốc giảm đau' }];
            MedicineCategory.find = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(mockData)
                })
            });
            const res = await medicineService.getCategories();
            expect(res).toEqual(mockData);
        });

        it('TC-IM-03: Lỗi DB khi lấy categories -> throw error và logger.error', async () => {
            MedicineCategory.find = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockRejectedValue(new Error('DB Lỗi'))
                })
            });
            await expect(medicineService.getCategories()).rejects.toThrow('DB Lỗi');
            expect(logger.error).toHaveBeenCalled();
        });
    });

    // 3. getMedicines (Với 5 bộ lọc Status)
    describe('getMedicines()', () => {
        beforeEach(() => {
            Medicine.countDocuments = jest.fn().mockResolvedValue(10);
            Medicine.find = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        sort: jest.fn().mockReturnValue({
                            skip: jest.fn().mockReturnValue({
                                limit: jest.fn().mockResolvedValue([{ _id: "m1" }])
                            })
                        })
                    })
                })
            });
        });

        it('TC-IM-04: Lọc ALL thông thường kèm Search & Category', async () => {
            const res = await medicineService.getMedicines({ search: '  para  ', category: 'cat1' });
            expect(res.medicines).toBeDefined();
            expect(Medicine.find).toHaveBeenCalledWith(expect.objectContaining({
                $or: expect.any(Array),
                category: 'cat1'
            }));
        });

        it('TC-IM-05: Lọc với status EXPIRED', async () => {
            await medicineService.getMedicines({ statusFilter: 'EXPIRED' });
            expect(Medicine.find.mock.calls[0][0]).toHaveProperty('$or');
        });

        it('TC-IM-06: Lọc với status EXPIRING_SOON', async () => {
            await medicineService.getMedicines({ statusFilter: 'EXPIRING_SOON' });
            expect(Medicine.find.mock.calls[0][0]).toHaveProperty('expiry_date');
        });

        it('TC-IM-07: Lọc với status LOW_STOCK', async () => {
            await medicineService.getMedicines({ statusFilter: 'LOW_STOCK' });
            expect(Medicine.find.mock.calls[0][0]).toHaveProperty('$and');
        });

        it('TC-IM-08: Lọc với status OUT_OF_STOCK', async () => {
            await medicineService.getMedicines({ statusFilter: 'OUT_OF_STOCK' });
            expect(Medicine.find.mock.calls[0][0].quantity).toEqual({ $lte: 0 });
        });

        it('TC-IM-09: Lọc với status AVAILABLE', async () => {
            await medicineService.getMedicines({ statusFilter: 'AVAILABLE' });
            expect(Medicine.find.mock.calls[0][0].status).toBe('AVAILABLE');
        });

        it('TC-IM-10: Lọc với custom status (default switch case)', async () => {
            await medicineService.getMedicines({ statusFilter: 'DRAFT' });
            expect(Medicine.find.mock.calls[0][0].status).toBe('DRAFT');
        });

        it('TC-IM-10b: Bẫy lỗi DB (catch Error) -> logger.error', async () => {
            Medicine.countDocuments = jest.fn().mockRejectedValue(new Error('DB Find Lỗi'));
            await expect(medicineService.getMedicines({})).rejects.toThrow('DB Find Lỗi');
            expect(logger.error).toHaveBeenCalled();
        });
    });

    // 4. getMedicineById
    describe('getMedicineById()', () => {
        it('TC-IM-11: Thành công', async () => {
            const mockItem = { _id: 'abc' };
            Medicine.findById = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(mockItem) });
            expect(await medicineService.getMedicineById('abc')).toEqual(mockItem);
        });

        it('TC-IM-12: Không tìm thấy thuốc (404)', async () => {
            Medicine.findById = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
            await expect(medicineService.getMedicineById('nil')).rejects.toMatchObject({ statusCode: 404 });
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    // 5. createMedicine (Hơn chục nhánh Check)
    describe('createMedicine()', () => {
        const validPayload = {
            medicine_name: 'Thuốc A', category: 'cat1', selling_unit: 'Viên', base_unit: 'mg',
            manufacturer: 'NSX', price: 1000, quantity: 100, min_quantity: 10,
            expiry_date: '2030-01-01', units_per_selling_unit: 1
        };

        it('TC-IM-13: Lỗi thiếu field (400)', async () => {
            await expect(medicineService.createMedicine({ medicine_name: 'A' })).rejects.toThrow(/Vui lòng điền đầy đủ/);
        });

        it('TC-IM-14: Lỗi giá trị số âm (Price, Quantity, min_quantity)', async () => {
            await expect(medicineService.createMedicine({ ...validPayload, price: -5 })).rejects.toThrow(/Giá phải là số hợp lệ/);
            await expect(medicineService.createMedicine({ ...validPayload, quantity: -5 })).rejects.toThrow(/Số lượng/);
            await expect(medicineService.createMedicine({ ...validPayload, min_quantity: -5 })).rejects.toThrow(/Tồn kho/);
        });

        it('TC-IM-15: Lỗi ngày hết hạn (Date)', async () => {
            await expect(medicineService.createMedicine({ ...validPayload, expiry_date: 'invalid' })).rejects.toThrow(/Hạn sử dụng không hợp lệ/);
            await expect(medicineService.createMedicine({ ...validPayload, expiry_date: '2000-01-01' })).rejects.toThrow(/Hạn sử dụng phải sau/);
        });

        it('TC-IM-16: Lỗi định dạng Enum (dosage_form, selling_unit, base_unit)', async () => {
            await expect(medicineService.createMedicine({ ...validPayload, dosage_form: 'Cục' })).rejects.toThrow(/Dạng bào chế không hợp lệ/);
            await expect(medicineService.createMedicine({ ...validPayload, selling_unit: 'Thùng' })).rejects.toThrow(/Đơn vị bán/);
            await expect(medicineService.createMedicine({ ...validPayload, base_unit: 'Kg' })).rejects.toThrow(/Đơn vị cơ bản/);
        });

        it('TC-IM-17: Lỗi rớt (409) do trùng tên', async () => {
            Medicine.findOne = jest.fn().mockResolvedValue({ _id: 'old' });
            await expect(medicineService.createMedicine({ ...validPayload, dosage_form: 'Viên nén' })).rejects.toMatchObject({ statusCode: 409 });
        });

        it('TC-IM-18: Thành công (Lưu Model) và bẫy lỗi DB (catch Error)', async () => {
            // Thành công
            Medicine.findOne = jest.fn().mockResolvedValue(null);
            Medicine.prototype.save = jest.fn().mockResolvedValue({ _id: 'new_med' });
            const res = await medicineService.createMedicine(validPayload);
            expect(res._id).toBe('new_med');

            // DB Lỗi (Mock save throws error)
            Medicine.prototype.save = jest.fn().mockRejectedValue(new Error('DB Save Lỗi'));
            await expect(medicineService.createMedicine(validPayload)).rejects.toThrow('DB Save Lỗi');
        });
    });

    // 6. updateMedicine
    describe('updateMedicine()', () => {
        let saveMock;
        beforeEach(() => {
            saveMock = jest.fn().mockResolvedValue(true);
            Medicine.findById = jest.fn().mockResolvedValue({ save: saveMock });
        });

        it('TC-IM-19: Lỗi 404 khi không tìm thấy thuốc sửa', async () => {
            Medicine.findById = jest.fn().mockResolvedValue(null);
            await expect(medicineService.updateMedicine('xxx', {})).rejects.toThrow(/Không tìm thấy thu/);
        });

        it('TC-IM-20: Cập nhật thành công không vướng check, bỏ qua _id', async () => {
            await medicineService.updateMedicine('some', { _id: 'cant_update', medicine_name: 'B', price: 200, unit: 'Viên' });
            expect(saveMock).toHaveBeenCalled();
        });

        it('TC-IM-21: Bẫy lỗi âm số (Giá trị, Tồn kho)', async () => {
            await expect(medicineService.updateMedicine('some', { price: -100 })).rejects.toThrow(/Giá phải là số/);
            await expect(medicineService.updateMedicine('some', { quantity: -5 })).rejects.toThrow(/Số lượng/);
            await expect(medicineService.updateMedicine('some', { min_quantity: '-a' })).rejects.toThrow(/Tồn kho/);
            await expect(medicineService.updateMedicine('some', { expiry_date: 'invalid' })).rejects.toThrow(/Hạn sử dụng/);
            await expect(medicineService.updateMedicine('some', { dosage_form: 'Cục' })).rejects.toThrow(/Dạng bào chế/);
            await expect(medicineService.updateMedicine('some', { unit: 'Thùng' })).rejects.toThrow(/Đơn vị tính/);
        });

        it('TC-IM-22: Trùng tên thuốc với record khác (409) và Test DB Lỗi', async () => {
            Medicine.findOne = jest.fn().mockResolvedValue({ _id: 'other' }); // tìm thấy tk khác xài tên
            await expect(medicineService.updateMedicine('me', { medicine_name: 'B' })).rejects.toMatchObject({ statusCode: 409 });

            Medicine.findById = jest.fn().mockRejectedValue(new Error('Lỗi Update'));
            await expect(medicineService.updateMedicine('me', {})).rejects.toThrow('Lỗi Update');
        });
    });

    // 7. createRestockRequest
    describe('createRestockRequest()', () => {
        const reqPayload = { request_by: 'staff1', quantity_requested: 5, reason: 'Hết', priority: 'high' };
        
        it('TC-IM-23: Thành công thêm Request và văng Notification', async () => {
            const mockMedArray = {
                medicine_restock_requests: {
                    push: jest.fn(),
                    length: 1,
                    0: { toObject: () => ({ req: 1 }), quantity_requested: 5, priority: 'high' }
                },
                save: jest.fn().mockResolvedValue(true),
                medicine_name: 'Thuốc O'
            };
            Medicine.findById = jest.fn().mockResolvedValue(mockMedArray);
            
            const res = await medicineService.createRestockRequest('med1', reqPayload);
            expect(res.req).toBe(1);
            expect(notificationService.sendToRole).toHaveBeenCalled();
        });

        it('TC-IM-24: Fail các validation mòng mỏi ở đầu và bẫy DB Error', async () => {
            Medicine.findById = jest.fn().mockResolvedValue({ medicine_restock_requests: [] });
            await expect(medicineService.createRestockRequest('med1', { quantity_requested: 5, reason: 'x' })).rejects.toThrow(/Thiếu/); // thieu request_by
            await expect(medicineService.createRestockRequest('med1', { request_by: 'a', quantity_requested: 0 })).rejects.toThrow(/Số lượng/);
            await expect(medicineService.createRestockRequest('med1', { request_by: 'a', quantity_requested: 5 })).rejects.toThrow(/lý do/);
            await expect(medicineService.createRestockRequest('med1', { request_by: 'a', quantity_requested: 5, reason:'x', priority: 'ultra' })).rejects.toThrow(/ưu tiên/);
            
            // DB Error
            Medicine.findById = jest.fn().mockRejectedValue(new Error('Lỗi create Restock'));
            await expect(medicineService.createRestockRequest('med2', reqPayload)).rejects.toThrow('Lỗi create Restock');
        });
    });

    // 8. getRestockRequests
    describe('getRestockRequests()', () => {
        it('TC-IM-25: Aggregate thành công với search text, filter status', async () => {
            // Mock array
            Medicine.aggregate = jest.fn().mockResolvedValue([{
                data: [{ req: 'abc' }],
                totalCount: [{ total: 1 }],
                overallStats: [{ pending: 1 }]
            }]);

            const res = await medicineService.getRestockRequests({ search: 'NV A', status: 'pending', priority: 'high', page: 1, limit: 10 });
            expect(res.requests.length).toBe(1);
            expect(res.statistics.pending).toBe(1);
        });

        it('TC-IM-25b: Bypass filter ALL, mảng rỗng fallback, và DB lỗi (Coverage)', async () => {
            // 1. Nhánh fallback rỗng / ALL filter
            Medicine.aggregate = jest.fn().mockResolvedValue([]);
            const res = await medicineService.getRestockRequests({ status: 'all', priority: 'all' });
            expect(res.requests.length).toBe(0); // Rơi vào kết quả `|| []`

            // 2. Nhánh DB Lỗi Aggregate nổ `catch` block
            Medicine.aggregate = jest.fn().mockRejectedValue(new Error('Aggregate Crashed'));
            await expect(medicineService.getRestockRequests({})).rejects.toThrow('Aggregate Crashed');
        });
    });

    // 9. updateRestockRequestStatus
    describe('updateRestockRequestStatus()', () => {
        const mockFn = jest.fn();

        beforeEach(() => {
            Medicine.findOne = jest.fn().mockResolvedValue({
                medicine_name: 'Thuốc J',
                medicine_restock_requests: {
                    id: jest.fn().mockReturnValue({ _id: 'req1', status: 'pending' })
                },
                save: mockFn
            });
        });

        it('TC-IM-26: Invalid enum status (400)', async () => {
            await expect(medicineService.updateRestockRequestStatus('med1', 'req1', 'magic')).rejects.toThrow(/Trạng thái không hợp lệ/);
        });

        it('TC-IM-27: Completed ko được đổi (400)', async () => {
            Medicine.findOne = jest.fn().mockResolvedValue({
                medicine_name: 'Thuốc J',
                medicine_restock_requests: { id: () => ({ status: 'completed' }) }
            });
            await expect(medicineService.updateRestockRequestStatus('med1', 'req1', 'reject')).rejects.toThrow(/đã hoàn thành/);
        });

        it('TC-IM-28: Reject chỉ được về pending (400) mà ko dc về accept', async () => {
            Medicine.findOne = jest.fn().mockResolvedValue({
                medicine_name: 'Thuốc J',
                medicine_restock_requests: { id: () => ({ status: 'reject' }) }
            });
            await expect(medicineService.updateRestockRequestStatus('med1', 'req1', 'accept')).rejects.toThrow(/chỉ có thể chuyển về chờ duyệt/);
        });

        it('TC-IM-29: Cập nhật status thành công (N), lỗi không tìm thấy (404) và lỗi DB', async () => {
            // 1. Thành công
            const res = await medicineService.updateRestockRequestStatus('med1', 'req1', 'accept');
            expect(mockFn).toHaveBeenCalled();
            expect(res.status).toBe('accept');

            // 2. Lỗi 404
            Medicine.findOne = jest.fn().mockResolvedValue(null);
            await expect(medicineService.updateRestockRequestStatus('med', 'req', 'accept')).rejects.toMatchObject({ statusCode: 404 });

            // 3. Lỗi sập DB
            Medicine.findOne = jest.fn().mockRejectedValue(new Error('Update Crashed'));
            await expect(medicineService.updateRestockRequestStatus('med', 'req', 'accept')).rejects.toThrow('Update Crashed');
        });
    });
});
