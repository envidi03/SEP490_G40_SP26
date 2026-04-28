// ============================================================
//  inventory.dashboard.service.test.js
//  Unit Test Suite - Inventory Dashboard Service
// ============================================================

const dashboardService = require('../src/modules/inventory/service/dashboard.service');
const Medicine = require('../src/modules/inventory/model/medicine.model');
const Treatment = require('../src/modules/treatment/models/treatment.model');

jest.mock('../src/modules/inventory/model/medicine.model');
jest.mock('../src/modules/treatment/models/treatment.model');

describe('Inventory Dashboard Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getDashboardStats()', () => {
        it('TC-ID-01: Lấy thông số thành công với tất cả Promise.all xử lý đúng', async () => {
            Medicine.countDocuments = jest.fn()
                .mockResolvedValueOnce(100) // totalActive
                .mockResolvedValueOnce(5)   // lowStock
                .mockResolvedValueOnce(2)   // urgentStock
                .mockResolvedValueOnce(3);  // nearExpired

            Medicine.aggregate = jest.fn().mockResolvedValue([{ _id: null, totalQuantity: 500 }]);
            Treatment.countDocuments = jest.fn().mockResolvedValue(10); // pendingDispense

            const result = await dashboardService.getDashboardStats();

            expect(result.totalMedicines).toBe(100);
            expect(result.totalInventoryQuantity).toBe(500);
            expect(result.pendingOrders).toBe(10);
            expect(result.lowStockCount).toBe(5);
            expect(result.urgentStockCount).toBe(2);
            expect(result.nearExpiredCount).toBe(3);
        });

        it('TC-ID-02: Lấy thông số khi Aggregate trả về mảng rỗng (không có quantity)', async () => {
            Medicine.countDocuments = jest.fn().mockResolvedValue(0);
            Medicine.aggregate = jest.fn().mockResolvedValue([]);
            Treatment.countDocuments = jest.fn().mockResolvedValue(0);

            const result = await dashboardService.getDashboardStats();

            expect(result.totalInventoryQuantity).toBe(0); // Rơi vào nhánh fallback || 0
        });
    });

    describe('getLowStockMedicines(limit)', () => {
        it('TC-ID-03: Lấy danh sách thuốc tồn kho thấp thành công (truyền limit tuỳ chỉnh)', async () => {
            const mockData = [{ medicine_name: 'Para' }];
            Medicine.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue(mockData)
                })
            });

            const result = await dashboardService.getLowStockMedicines(5);

            expect(result).toEqual(mockData);
        });
    });

    describe('getNearExpiredMedicines(days)', () => {
        it('TC-ID-04: Lấy danh sách thuốc sắp hết hạn', async () => {
            const mockData = [{ medicine_name: 'Para' }];
            Medicine.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockData)
            });

            const result = await dashboardService.getNearExpiredMedicines(10);

            expect(result).toEqual(mockData);
        });
    });

    describe('getStockTracking(query)', () => {
        it('TC-ID-05: Lấy stock tracking với search keyword hợp lệ', async () => {
            const mockMedicines = [
                { _id: '1', medicine_name: 'M1', quantity: 0, min_quantity: 5 }, // Hết hàng
                { _id: '2', medicine_name: 'M2', quantity: 3, min_quantity: 5 }, // Thấp
                { _id: '3', medicine_name: 'M3', quantity: 10, min_quantity: 5 } // Đủ hàng
            ];

            Medicine.find = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue(mockMedicines)
                        })
                    })
                })
            });
            Medicine.countDocuments = jest.fn().mockResolvedValue(3);

            const result = await dashboardService.getStockTracking({ page: 1, limit: 10, search: 'Para' });

            // Kiểm tra phân trang và tìm kiếm (có new RegExp)
            expect(result.pagination.totalItems).toBe(3);

            // Branch: quantity <= 0
            expect(result.medicines[0].stock_status).toBe('Hết hàng');
            // Branch: quantity <= min_quantity
            expect(result.medicines[1].stock_status).toBe('Thấp');
            // Branch: còn lại
            expect(result.medicines[2].stock_status).toBe('Đủ hàng');
        });

        it('TC-ID-06: Lấy stock tracking chỉ mảng rỗng khi không có search (Branch coverage cho search)', async () => {
            Medicine.find = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue([])
                        })
                    })
                })
            });
            Medicine.countDocuments = jest.fn().mockResolvedValue(0);

            // Truyền search: "" (trống tếu hoặc khoảng trắng)
            const result = await dashboardService.getStockTracking({ page: 1, limit: 10, search: '   ' });

            expect(result.medicines.length).toBe(0);
        });
    });

});
