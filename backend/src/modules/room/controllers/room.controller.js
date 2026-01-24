const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const successRes = require('../../../common/success');
const Pagination = require('../../../common/responses/Pagination');
const { cleanObjectData } = require('../../../common/utils/cleanObjectData');
const roomService = require('../services/room.service');

/* 
get list room with pagination and filter (search by name, filter by status, sort by room_number) 
query params: search, status, sort, page, limit
*/
const getRooms = async (req, res) => {
    try {
        const query = req.query;

        logger.debug('Query parameters for getRooms', {
            context: 'RoomController.getRooms',
            query
        });

        const { data: rooms, pagination: pageData } = await roomService.getRooms(query);

        logger.debug('Rooms data retrieved', {
            context: 'RoomController.getRooms',
            data: rooms,
            pagination: pageData
        });

        const pagination = new Pagination({
            page: pageData.page,
            size: pageData.limit,
            totalItems: pageData.total
        });

        logger.debug('Data response', {
            context: 'RoomController.getRooms',
            data: rooms,
            pagination: pagination,
            message: 'Rooms retrieved successfully'
        });
        return new successRes.GetListSuccess(
            rooms,
            pagination,
            'Rooms retrieved successfully'
        ).send(res);

    } catch (error) {
        logger.error('Error getting rooms', {
            context: 'RoomController.getRooms',
            message: error.message,
            stack: error.stack
        });

        throw new errorRes.InternalServerError(
            `An error occurred while fetching rooms: ${error.message}`
        );
    }
};

// create room
const createRoom = async (req, res) => {
    try {
        const roomData = req.body || {};

        logger.debug('Raw room data from request body', {
            context: 'RoomController.createRoom',
            roomData
        });

        // Làm sạch dữ liệu phòng
        const cleanRoomData = cleanObjectData(roomData);

        logger.debug('Cleaned room data', {
            context: 'RoomController.createRoom',
            cleanRoomData
        });


        // Kiểm tra xem body có dữ liệu không
        if (!cleanRoomData || Object.keys(cleanRoomData).length === 0) {
            logger.warn('No room data provided in request body', {
                context: 'RoomController.createRoom'
            });
            throw new errorRes.BadRequestError('No room data provided');
        }

        if (!cleanRoomData.room_number) {
            logger.warn('Room number is required but not provided', {
                context: 'RoomController.createRoom'
            });
            throw new errorRes.BadRequestError('Room number is required');
        }

        if (await roomService.checkRoomExists(cleanRoomData.room_number)) {
            logger.warn('Room number already exists', {
                context: 'RoomController.createRoom',
                room_number: cleanRoomData.room_number
            });
            throw new errorRes.ConflictError(`Room number ${cleanRoomData.room_number} already exists`);
        }   

        // Gọi service để tạo phòng mới
        const newRoom = await roomService.createRoom(cleanRoomData);

        logger.info('Room created successfully', {
            context: 'RoomController.createRoom',
            roomId: newRoom.id
        });

        // Trả về phản hồi thành công
        return new successRes.CreateSuccess(
            newRoom,
            'Room created successfully'
        ).send(res);

    } catch (error) {
        logger.error('Error creating room', {
            context: 'RoomController.createRoom',
            message: error.message,
            stack: error.stack
        });
        throw error;
        
    }
};

// Lấy thông tin phòng theo ID
const getRoomById = async (req, res) => {
    try {
        // Lấy roomId từ params
        const {roomId} = req.params;
        const query = req.query;

        logger.debug('Fetching room with ID', {
            context: 'RoomController.getRoomById',
            roomId,
            query
        });

        // call serveice to get room by id
        const room = await roomService.getRoomById(roomId, query);

        logger.debug('Room data retrieved', {
            context: 'RoomController.getRoomById',
            roomId
        });

        return new successRes.GetDetailSuccess(
            room,
            'Room retrieved successfully'
        ).send(res);

    } catch (error) {
        logger.error('Error getting room by ID', {
            context: 'RoomController.getRoomById',
            message: error.message,
            stack: error.stack
        });

        throw error;
    }
};

// Cập nhật thông tin phòng, không bao gồm status and history_used
const updateRoom = async (req, res) => {
    try {
        // Lấy roomId từ params và dữ liệu cập nhật từ body
        const {roomId} = req.params;
        const updateData = req.body || {};

        logger.debug('Room update', {
            context: 'RoomController.updateRoom',
            id: roomId,
            dataUpdate: updateData
        });

        // remove status and history_used from updateData if exists
        const { status, history_used, ...rest } = updateData;

        // Làm sạch dữ liệu cập nhật
        const cleanUpdateData = cleanObjectData(rest);

        logger.debug('Update data after clean', {
            context: 'RoomController.updateRoom',
            id: roomId,
            cleanUpdateData: cleanUpdateData
        });

        // Kiểm tra xem body có dữ liệu không
        if (!cleanUpdateData || Object.keys(cleanUpdateData).length === 0) {
            logger.warn('No update data provided in request body', {
                context: 'RoomController.updateRoom'
            });
            throw new errorRes.BadRequestError('No update data provided');
        }

        // check if change room_number, if yes check exists
        if (cleanUpdateData.room_number && await roomService.checkRoomExistsNotId(cleanUpdateData.room_number, roomId)) {
            logger.warn('Room number already exists', {
                context: 'RoomController.updateRoom',
                room_number: cleanUpdateData.room_number
            });
            throw new errorRes.ConflictError(`Room number ${cleanUpdateData.room_number} already exists`);
        }


        // Gọi service để cập nhật room
        const updatedRoom = await roomService.updateRoom(roomId, cleanUpdateData);

        logger.info('Room updated successfully', {
            context: 'RoomController.updateRoom',
            roomId
        });

        // Trả về phản hồi thành công
        return new successRes.UpdateSuccess(
            updatedRoom,
            `Room ${roomId} updated successfully`
        ).send(res);

    } catch (error) {
        logger.error('Error updating room', {
            context: 'RoomController.updateRoom',
            message: error.message,
            stack: error.stack
        });

        throw error;
    }
};

// Cập nhật trạng thái phòng
const updateRoomStatus = async (req, res) => {
    try {
        // Lấy roomId từ params và trạng thái mới từ body
        const {roomId} = req.params;
        const { status } = req.body || {};

        logger.debug('Updating status for room', {
            context: 'RoomController.updateRoomStatus',
            roomId,
            status
        });

        // Kiểm tra xem trạng thái có được cung cấp không
        if (typeof status !== 'string' || status.trim() === '') {
            logger.warn('No status provided in request body', {
                context: 'RoomController.updateRoomStatus'
            });
            throw new errorRes.BadRequestError('No status provided');
        }

        // check status value is "ACTIVE", "INACTIVE", "MAINTENANCE"
        const validStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];
        if (!validStatuses.includes(status)) {
            logger.warn('Invalid status value provided', {
                context: 'RoomController.updateRoomStatus',
                status
            });
            throw new errorRes.BadRequestError(
                `Invalid status value. Must be one of: ${validStatuses.join(', ')}`
            );
        }

        // Gọi service để cập nhật trạng thái room
        const updatedRoom = await roomService.updateRoom(roomId, { status });

        logger.info('Room status updated successfully', {
            context: 'RoomController.updateRoomStatus',
            roomId,
            status
        });

        // Trả về phản hồi thành công
        logger.info(`Room ${roomId} status updated successfully to ${status}`);
        return new successRes.UpdateSuccess(updatedRoom, `Room ${roomId} status updated successfully`).send(res);
    } catch (error) {
        logger.error('Error updating room status', {
            context: 'RoomController.updateRoomStatus',
            message: error.message,
            stack: error.stack
        });

        throw error;
    }
};

module.exports = {
    getRooms,
    getRoomById,
    updateRoom,
    updateRoomStatus,
    createRoom
};
