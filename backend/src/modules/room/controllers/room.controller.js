const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const successRes = require('../../../common/success');
const { default: Pagination } = require('../../../common/responses/Pagination');
const {cleanObjectData} = require('../../../common/utils/cleanObjectData');

const getRooms = async (req, res) => {};

const getRoomById = async (req, res) => {};

const updateRoom = async (req, res) => {
    const roomId = req.params.roomId;
    logger.info(`Updating room with ID: ${roomId}`);
    const updateData = cleanObjectData(req.body);
    logger.info(`Update data: ${JSON.stringify(updateData)}`);

    
};

const updateRoomStatus = async (req, res) => {};

module.exports = { getRooms, getRoomById, updateRoom, updateRoomStatus };