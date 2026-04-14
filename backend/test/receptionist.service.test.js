// ============================================================
//  receptionist.service.test.js
//  Unit Test Suite - Receptionist Dashboard Service
//  Functions: getDashboard
// ============================================================

// ── Mock modules ───────────────────────────────────────────
jest.mock('../src/modules/appointment/models/appointment.model');
jest.mock('../src/modules/patient/model/patient.model');
jest.mock('../src/common/utils/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
}));

const dashboardService = require('../src/modules/receptionist/service/dashboard.service');
const AppointmentModel = require('../src/modules/appointment/models/appointment.model');
const PatientModel = require('../src/modules/patient/model/patient.model');
const logger = require('../src/common/utils/logger');
const { InternalServerError } = require('../src/common/errors');

// ============================================================
describe('Receptionist Dashboard Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================================
    //  1. getDashboard()
    //  Input: None
    // ========================================================
    describe('getDashboard()', () => {
        const mockTodayAppointments = [{ _id: 'app1', full_name: 'Patient A' }];
        const mockRecentPatients = [{ _id: 'pat1', profile_id: { full_name: 'Patient B', dob: '1990' } }];

        // TC-DB-01: Lấy dashboard thành công
        it('TC-DB-01: Lấy thông tin dashboard thành công', async () => {
            // Mock cho AppointmentModel.countDocuments
            AppointmentModel.countDocuments = jest.fn()
                .mockResolvedValueOnce(10) // todayCount
                .mockResolvedValueOnce(5);  // pendingCount

            // Mock cho PatientModel.countDocuments
            PatientModel.countDocuments = jest.fn().mockResolvedValue(3); // newPatientCount

            // Mock cho AppointmentModel.find
            AppointmentModel.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        select: jest.fn().mockResolvedValue(mockTodayAppointments)
                    })
                })
            });

            // Mock cho PatientModel.find
            PatientModel.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        populate: jest.fn().mockResolvedValue(mockRecentPatients)
                    })
                })
            });

            const result = await dashboardService.getDashboard();

            // Kiểm tra return format
            expect(result.stats.today_appointment).toBe(10);
            expect(result.stats.pending_confirm).toBe(5);
            expect(result.stats.new_patient).toBe(3);
            expect(result.today_appointment_list).toEqual(mockTodayAppointments);
            expect(result.recent_patients).toEqual(mockRecentPatients);

            // Đảm bảo logger không quăng lỗi
            expect(logger.error).not.toHaveBeenCalled();
        });

        // TC-DB-02: DB query thất bại (một trong các Promise bị lỗi)
        it('TC-DB-02: Promise.all thất bại do lỗi DB → ném InternalServerError', async () => {
            // Cố tình làm 1 Promise (hoặc tất cả) lỗi
            AppointmentModel.countDocuments = jest.fn().mockRejectedValue(new Error('Connection lost'));

            await expect(dashboardService.getDashboard()).rejects.toThrow(InternalServerError);
            
            // Check nếu logger error được gọi
            expect(logger.error).toHaveBeenCalled();
            expect(logger.error.mock.calls[0][0]).toContain('Error getting dashboard data');
        });
    });
});
