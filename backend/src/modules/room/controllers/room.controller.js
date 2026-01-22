const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const successRes = require('../../../common/success');
const { default: Pagination } = require('../../../common/responses/Pagination');
const { cleanObjectData } = require('../../../common/utils/cleanObjectData');
const roomService = require('../services/room.service');

// get list room with pagination and filter (search by name, filter by status, sort by room_number)
const getRooms = async (req, res) => {
    try {
        const query = req.query;
        logger.debug(`Query parameters for getRooms: ${query}`);
        const {data: rooms, pagination: pageData} = await roomService.getRooms(query);
        logger.debug(`Rooms data retrieved: ${rooms}`);
        logger.debug(`Pagination data: ${pageData}`);
        const pagination = new Pagination(pageData.page, pageData.limit, pageData.totalItems);
        return new successRes.GetListSuccess(rooms, 'Rooms retrieved successfully', pagination).send(res);
    } catch (error) {
        logger.error(`Error getting rooms: ${error.message}`, {
            stack: error.stack,
            context: "RoomController.getRooms"
        });
        throw new errorRes.InternalServerError(`An error occurred while fetching rooms: ${error.message}`);
    }
};

const createRoom = async (req, res) => {
    try {
        const roomData = req.body;
        logger.debug(`Raw room data from request body: ${roomData}`);
        // Làm sạch dữ liệu phòng
        const cleanRoomData = cleanObjectData(roomData);
        logger.debug(`Cleaned room data: ${cleanRoomData}`);
        // Kiểm tra xem body có dữ liệu không
        if (!cleanRoomData || Object.keys(cleanRoomData).length === 0) {
            logger.warn('No room data provided in request body');
            throw new errorRes.BadRequestError('No room data provided');
        }
        // Gọi service để tạo phòng mới
        const newRoom = await roomService.createRoom(cleanRoomData);
        logger.debug(`New room created: ${newRoom}`);
        // Trả về phản hồi thành công
        logger.info(`Room created successfully with ID: ${newRoom.id}`);
        return new successRes.CreateSuccess(newRoom, 'Room created successfully').send(res);
    } catch (error) {
        logger.error(`Error creating room: ${error.message}`, {
            stack: error.stack,
            context: "RoomController.createRoom"
        });
        throw new errorRes.InternalServerError(`An error occurred while creating the room: ${error.message}`);   
    }
};

// Lấy thông tin phòng theo ID
const getRoomById = async (req, res) => {
    try {
        // Lấy roomId từ params
        const roomId = req.params.roomId;
        const query = req.query;
        logger.debug(`Fetching room with ID: ${roomId}`);
        // call serveice to get room by id
        const room = await roomService.getRoomById(roomId, query);
        // logger debug room data
        logger.debug(`Room data retrieved: ${room}`);
        // create pagination object
        return new successRes.GetDetailSuccess(room, 'Room retrieved successfully').send(res);
    } catch (error) {
        logger.error(`Error getting room by ID: ${error.message}`, {
            stack: error.stack,
            context: "RoomController.getRoomById"
        });
        throw new errorRes.InternalServerError(`An error occurred while fetching the room: ${error.message}`);
    }
};

// Cập nhật thông tin phòng, không bao gồm trạng thái
const updateRoom = async (req, res) => {
    try {
        // Lấy roomId từ params và dữ liệu cập nhật từ body
        const roomId = req.params.roomId;
        logger.debug(`Updating room with ID: ${roomId}`);
        const updateData = req.body;
        logger.debug(`Raw update data from request body: ${updateData}`);
        // remove status from updateData if exists
        const { status, ...rest } = updateData;
        // Làm sạch dữ liệu cập nhật
        const cleanUpdateData = cleanObjectData(rest);
        logger.debug(`Update data: ${cleanUpdateData}`);
        // Kiểm tra xem body có dữ liệu không
        if (!cleanUpdateData || Object.keys(cleanUpdateData).length === 0) {
            logger.warn('No update data provided in request body');
            throw new errorRes.BadRequestError('No update data provided');
        }
        // Gọi service để cập nhật room (giả sử có roomService với hàm updateRoom)
        const updatedRoom = await roomService.updateRoom(roomId, cleanUpdateData);
        logger.debug(`Updated room data: ${updatedRoom}`);
        // Trả về phản hồi thành công
        logger.info(`Room ${roomId} updated successfully`);
        return new successRes.UpdateSuccess(updatedRoom, `Room ${roomId} updated successfully`).send(res);
    } catch (error) {
        logger.error(`Error updating room: ${error.message}`, {
            stack: error.stack,
            context: "RoomController.updateRoom"
        });
        throw new errorRes.InternalServerError(`An error occurred while updating the room: ${error.message}`);
    };
}

// Cập nhật trạng thái phòng
const updateRoomStatus = async (req, res) => {
    try {
        // Lấy roomId từ params và trạng thái mới từ body
        const roomId = req.params.roomId;
        logger.debug(`Updating status for room with ID: ${roomId}`);
        const { status } = req.body;
        logger.debug(`Raw status from request body: ${status}`);
        // Kiểm tra xem trạng thái có được cung cấp không
        if (typeof status !== 'string' || status.trim() === '') {
            logger.warn('No status provided in request body');
            throw new errorRes.BadRequestError('No status provided');
        }
        // check status value is "ACTIVE", "INACTIVE", "MAINTENANCE"
        const validStatuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];
        if (!validStatuses.includes(status)) {
            logger.warn(`Invalid status value provided: ${status}`);
            throw new errorRes.BadRequestError(`Invalid status value. Must be one of: ${validStatuses.join(', ')}`);
        }
        // Gọi service để cập nhật trạng thái room
        const updatedRoom = await roomService.updateRoom(roomId, {status});
        logger.debug(`Updated room data: ${updatedRoom}`);
        // Trả về phản hồi thành công
        logger.info(`Room ${roomId} status updated successfully to ${status}`);
        return new successRes.UpdateSuccess(updatedRoom, `Room ${roomId} status updated successfully`).send(res);
    } catch (error) {
        logger.error(`Error updating room status: ${error.message}`, {
            stack: error.stack,
            context: "RoomController.updateRoomStatus"
        });
        throw new errorRes.InternalServerError(`An error occurred while updating the room status: ${error.message}`);
    }
};

module.exports = { getRooms, getRoomById, updateRoom, updateRoomStatus, createRoom };