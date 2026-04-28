const mongoose = require('mongoose');
const roomService = require('../src/modules/room/services/room.service');
const Room = require('../src/modules/room/models/room.model');
const errorRes = require('../src/common/errors');
const logger = require('../src/common/utils/logger');

// Mocks
jest.mock('../src/modules/room/models/room.model');
jest.mock('../src/common/utils/logger', () => ({
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));

describe('Room Service Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ============================================
    // 1. checkRoomExists(roomNumber)
    // ============================================
    describe('checkRoomExists()', () => {
        it('TC-RM-01: True nếu tìm thấy phòng', async () => {
            Room.findOne = jest.fn().mockResolvedValue({ _id: 'room1' });
            const result = await roomService.checkRoomExists(' 101 ');
            expect(result).toBe(true);
            expect(Room.findOne).toHaveBeenCalled();
        });

        it('TC-RM-02: False nếu không tìm thấy phòng', async () => {
            Room.findOne = jest.fn().mockResolvedValue(null);
            const result = await roomService.checkRoomExists('102');
            expect(result).toBe(false);
        });

        it('TC-RM-03: Bắn lỗi hệ thống khi DB sập (500)', async () => {
            Room.findOne = jest.fn().mockRejectedValue(new Error('DB Crash'));
            await expect(roomService.checkRoomExists('103')).rejects.toThrow(errorRes.InternalServerError);
            expect(logger.error).toHaveBeenCalled();
        });
    });

    // ============================================
    // 2. checkRoomExistsNotId(roomNumber, currentRoomId)
    // ============================================
    describe('checkRoomExistsNotId()', () => {
        it('TC-RM-04: True nếu tìm thấy phòng trùng tên nhưng khác ID', async () => {
            Room.findOne = jest.fn().mockResolvedValue({ _id: 'otherId' });
            const result = await roomService.checkRoomExistsNotId(' 101 ', 'myId');
            expect(result).toBe(true);
            expect(Room.findOne).toHaveBeenCalled();
        });

        it('TC-RM-05: False nếu không có phòng trùng', async () => {
            Room.findOne = jest.fn().mockResolvedValue(null);
            const result = await roomService.checkRoomExistsNotId('101', 'myId');
            expect(result).toBe(false);
        });

        it('TC-RM-06: Bắn lỗi hệ thống (500) khi DB chết', async () => {
            Room.findOne = jest.fn().mockRejectedValue(new Error('Crash'));
            await expect(roomService.checkRoomExistsNotId('101', 'myId')).rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 3. createRoom(roomData)
    // ============================================
    describe('createRoom()', () => {
        const payload = { room_number: '101' };

        it('TC-RM-07: Khởi tạo phòng thành công (Trả model phòng)', async () => {
            // Mock checkRoomExists return false
            Room.findOne = jest.fn().mockResolvedValue(null);
            
            // Mock tạo & save new Mongoose model
            const saveMock = jest.fn().mockResolvedValue({ id: 'newResId', room_number: '101' });
            Room.mockImplementation(() => ({ save: saveMock }));

            const result = await roomService.createRoom(payload);
            expect(result.id).toBe('newResId');
        });

        it('TC-RM-08: Báo lỗi trùng lặp (400) vì phòng đã tồn tại', async () => {
            Room.findOne = jest.fn().mockResolvedValue({ _id: 'oldId' });
            await expect(roomService.createRoom(payload)).rejects.toThrow('Số phòng đã tồn tại!');
            await expect(roomService.createRoom(payload)).rejects.toBeInstanceOf(errorRes.BadRequestError);
        });

        it('TC-RM-09: Bắt lỗi Validation của Mongoose (400)', async () => {
            Room.findOne = jest.fn().mockResolvedValue(null);
            Room.mockImplementation(() => ({
                save: jest.fn().mockRejectedValue({
                    name: 'ValidationError',
                    errors: { pathName: { message: 'Max length exceeded' } }
                })
            }));
            await expect(roomService.createRoom(payload)).rejects.toThrow('Max length exceeded');
        });

        it('TC-RM-10: Ném InternalServerError nếu là Exception ẩn danh', async () => {
            Room.findOne = jest.fn().mockResolvedValue(null);
            Room.mockImplementation(() => ({
                save: jest.fn().mockRejectedValue(new Error('Unknown DB Error'))
            }));
            await expect(roomService.createRoom(payload)).rejects.toThrow(errorRes.InternalServerError);
        });
    });

    // ============================================
    // 4. updateRoom(roomId, updateData)
    // ============================================
    describe('updateRoom()', () => {
        it('TC-RM-11: Thành công update không đổi tên phòng', async () => {
            const mockUpdate = { note: 'Repairing' };
            Room.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'room1', note: 'Repairing' });

            const result = await roomService.updateRoom('room1', mockUpdate);
            expect(result.note).toBe('Repairing');
            expect(Room.findOne).not.toHaveBeenCalled(); // Không check roomExistsNotId do k đổi map tên
        });

        it('TC-RM-12: Update đổi tên phòng và check name không trùng (Mượt)', async () => {
            const mockUpdate = { room_number: '102' };
            Room.findOne = jest.fn().mockResolvedValue(null); // Không bị trùng
            Room.findByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'room1', room_number: '102' });

            const result = await roomService.updateRoom('room1', mockUpdate);
            expect(result.room_number).toBe('102');
            expect(Room.findOne).toHaveBeenCalled();
        });

        it('TC-RM-13: Update đổi tên phòng nhưng bị PHÁT HIỆN TRÙNG (400)', async () => {
            const mockUpdate = { room_number: '103' };
            Room.findOne = jest.fn().mockResolvedValue({ _id: 'otherId' });

            await expect(roomService.updateRoom('room1', mockUpdate)).rejects.toThrow('Số phòng đã tồn tại!');
        });

        it('TC-RM-14: Thấy Validation Error Mongoose khi Update (400)', async () => {
            Room.findByIdAndUpdate = jest.fn().mockRejectedValue({
                name: 'ValidationError',
                errors: { formName: { message: 'Type is wrong' } }
            });
            await expect(roomService.updateRoom('room1', { note: 'Bad' })).rejects.toThrow('Type is wrong');
        });

        it('TC-RM-15: Error 404 Cập nhật thất bại vì ID bị xóa', async () => {
            Room.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
            await expect(roomService.updateRoom('deleted_id', { note: 'x' })).rejects.toThrow('Không tìm thấy phòng!');
        });

        it('TC-RM-16: Generic Error 500 khi DB lỗi nặng', async () => {
            Room.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Syntax Crash'));
            await expect(roomService.updateRoom('room1', { note: 'x' })).rejects.toThrow('Có lỗi xảy ra khi cập nhật phòng');
        });
    });

    // ============================================
    // 5. getRooms(query)
    // ============================================
    describe('getRooms()', () => {
        it('TC-RM-17: Truy vấn Pipeline đầy đủ với Search, Status và Sort', async () => {
            Room.aggregate = jest.fn().mockResolvedValue([{
                data: [{ _id: 'r1' }],
                totalCount: [{ count: 1 }]
            }]);

            const res = await roomService.getRooms({
                search: ' 10 ',
                status: 'active',
                sort: 'desc',
                page: 2,
                limit: 5
            });

            expect(res.data.length).toBe(1);
            expect(res.pagination.total).toBe(1);
            expect(res.pagination.page).toBe(2);
            expect(Room.aggregate.mock.calls[0][0][0].$match.room_number.$regex).toBe('10');
            expect(Room.aggregate.mock.calls[0][0][1].$sort.room_number).toBe(-1); // desc
        });

        it('TC-RM-18: Truy vấn Mặc Định và Fallback mảng rỗng (0 count)', async () => {
            Room.aggregate = jest.fn().mockResolvedValue([{
                data: [],
                totalCount: [] // Ko có count
            }]);

            const res = await roomService.getRooms({});
            expect(res.data.length).toBe(0);
            expect(res.pagination.total).toBe(0);
            expect(res.pagination.page).toBe(1); // Default page
        });

        it('TC-RM-19: Aggregate Exception nổ -> Bắn Error 500', async () => {
            Room.aggregate = jest.fn().mockRejectedValue(new Error('Timeout'));
            await expect(roomService.getRooms({})).rejects.toThrow('An error occurred while fetching the rooms');
        });
    });

    // ============================================
    // 6. getRoomById(roomId, query)
    // ============================================
    describe('getRoomById()', () => {
        const validId = '507f1f77bcf86cd799439011'; // Mã ID giả lập đúng định dạng 24-character hex của MongoDB

        it('TC-RM-20: Mongoose Pipeline Complex - Retrieve Fully Data with start/end Date', async () => {
            const mockAggResult = [{
                _id: 'r1',
                room_number: '101',
                status: 'active',
                note: null,
                clinic_id: 'c1',
                history_total: 5,
                service_total: 2,
                history_used: [{ used_date: new Date() }],
                room_service: [{ service_id: 's1', service_name: 'Khám răng', note: 'no' }]
            }];
            Room.aggregate = jest.fn().mockResolvedValue(mockAggResult);

            const res = await roomService.getRoomById(validId, {
                historyPage: 2, historyLimit: 10,
                serviceRoomPage: 3, serviceRoomLimit: 2,
                startDate: '2023-01-01', endDate: '2023-12-31'
            });

            expect(res._id).toBe('r1');
            expect(res.history_used.items.length).toBe(1);
            expect(res.room_service.items.length).toBe(1);
        });

        it('TC-RM-21: Mongoose Pipeline Complex - Parameter Defaults & Fallback Empty array', async () => {
            const mockAggResult = [{
                _id: 'r1', room_number: '101', status: 'maintenance'
            }]; // Thiếu các biến history_total (dẫn đến undefined) -> null fallback logic test
            Room.aggregate = jest.fn().mockResolvedValue(mockAggResult);

            const res = await roomService.getRoomById(validId, { /* No params */ });

            expect(res.history_used.pagination.totalItems).toBe(0);
            expect(res.room_service.pagination.totalItems).toBe(0);
            expect(res.history_used.items).toEqual([]);
        });

        it('TC-RM-22: Pipeline trả về mảng rỗng [] (Thực sự ko thấy ID nào)', async () => {
            Room.aggregate = jest.fn().mockResolvedValue([]);
            const res = await roomService.getRoomById(validId, {});
            expect(res).toBeNull();
        });

        it('TC-RM-23: Lỗi DB cấp thấp aggregate văng Error (500)', async () => {
            Room.aggregate = jest.fn().mockRejectedValue(new Error('Connection Loss'));
            await expect(roomService.getRoomById(validId, {})).rejects.toThrow('An error occurred while fetching the room');
        });
    });
});
