const Medicine = require('../src/modules/inventory/model/medicine.model');
const Treatment = require('../src/modules/treatment/models/treatment.model');
const dashboardService = require('../src/modules/inventory/service/dashboard.service');

// Mock models
jest.mock('../src/modules/inventory/model/medicine.model');
jest.mock('../src/modules/treatment/models/treatment.model');

describe('Inventory Dashboard Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getDashboardStats', () => {
        it('should return aggregated stats', async () => {
            Medicine.countDocuments.mockResolvedValueOnce(100) // totalActive
                .mockResolvedValueOnce(10) // lowStock
                .mockResolvedValueOnce(5) // urgentStock
                .mockResolvedValueOnce(2); // nearExpired
            Medicine.aggregate.mockResolvedValue([{ totalQuantity: 500 }]);
            Treatment.countDocuments.mockResolvedValue(3);

            const result = await dashboardService.getDashboardStats();

            expect(result.totalMedicines).toBe(100);
            expect(result.totalInventoryQuantity).toBe(500);
            expect(result.pendingOrders).toBe(3);
            expect(result.lowStockCount).toBe(10);
        });

        it('should return 0 for inventory quantity if aggregate returns empty', async () => {
            Medicine.countDocuments.mockResolvedValue(0);
            Medicine.aggregate.mockResolvedValue([]);
            Treatment.countDocuments.mockResolvedValue(0);

            const result = await dashboardService.getDashboardStats();
            expect(result.totalInventoryQuantity).toBe(0);
        });
    });

    describe('getLowStockMedicines', () => {
        it('should return medicines with low stock limited by param', async () => {
            const mockMedicines = [{ medicine_name: 'A', quantity: 1 }];
            Medicine.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockMedicines)
            });

            const result = await dashboardService.getLowStockMedicines(5);
            expect(result).toHaveLength(1);
            expect(Medicine.find).toHaveBeenCalled();
        });
    });

    describe('getNearExpiredMedicines', () => {
        it('should return medicines expiring soon', async () => {
            const mockMedicines = [{ medicine_name: 'B', expiry_date: new Date() }];
            Medicine.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockMedicines)
            });

            const result = await dashboardService.getNearExpiredMedicines(30);
            expect(result).toHaveLength(1);
        });
    });

    describe('getStockTracking', () => {
        it('should return paginated stock tracking data', async () => {
            const mockMedicines = [
                { _id: '1', medicine_name: 'C', quantity: 5, min_quantity: 10 }
            ];
            Medicine.find.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockMedicines)
            });
            Medicine.countDocuments.mockResolvedValue(1);

            const result = await dashboardService.getStockTracking({ page: 1, limit: 10 });

            expect(result.medicines).toHaveLength(1);
            expect(result.medicines[0].stock_status).toBe('Thấp');
            expect(result.pagination.totalItems).toBe(1);
        });

        it('should return "Hết hàng" if quantity is 0', async () => {
            Medicine.find.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue([{ medicine_name: 'D', quantity: 0, min_quantity: 5 }])
            });
            Medicine.countDocuments.mockResolvedValue(1);

            const result = await dashboardService.getStockTracking({});
            expect(result.medicines[0].stock_status).toBe('Hết hàng');
        });
    });
});
