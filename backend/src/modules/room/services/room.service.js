const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");

const Room = require("../models/room.model");
const { default: mongoose } = require("mongoose");

/**
 * update room infor
 * 
 * @param {ObjectId} roomId room id
 * @param {JSON} updateData data to update
 * @returns new room data after update
 */
const updateRoom = async (roomId, updateData) => {
  try {
    logger.info("Updating room in service");
    logger.debug(`Room id need to update: ${(roomId)}`);
    logger.debug(`Data need to update: ${(updateData)}`);

    const updatedRoom = await Room.findByIdAndUpdate(roomId, updateData, {
      new: true,
      runValidators: true,
    });
    logger.debug(`Updated room data in service: ${(updatedRoom)}`);
    return updatedRoom || null;
  } catch (error) {
    logger.error(`Error in updateRoom service: ${error}`, {
      stack: error.stack,
      context: 'RoomService.updateRoom'
    });
    throw new errorRes.InternalServerError('An error occurred while updating the room');
  }
};

/**
 * find room by id
 * 
 * @param {ObjectId} roomId room id
 * @returns room data
 */
const getRoomById = async (roomId, query) => {
  try {
    const historyPage = parseInt(query.historyPage) || 1;
    const historyLimit = parseInt(query.historyLimit) || 5;
    const startDate = query.startDate ? new Date(query.startDate) : null;
    const endDate = query.endDate ? new Date(query.endDate) : null;

    const skip = (historyPage - 1) * historyLimit;

    logger.debug(`History pagination - Page: ${historyPage}, Limit: ${historyLimit}, Skip: ${skip}`);
    logger.debug(`History date filter - Start Date: ${startDate}, End Date: ${endDate}`);

    logger.info('Fetching room by ID in service');
    logger.debug(`Room ID to fetch: ${(roomId)}`);

    // Build history_used filter
    const result = await Room.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(roomId) }
      },

      // fillter history_used by date range
      {
        $project: {
          room_number: 1,
          status: 1,
          clinic_id: 1,

          history_used_filtered: {
            $filter: {
              input: "$history_used",
              as: "h",
              cond: {
                $and: [
                  startDate ? { $gte: ["$$h.use_start", startDate] } : true,
                  endDate ? { $lte: ["$$h.use_end", endDate] } : true
                ]
              },
              sort: { use_start: -1 }
            }
          }
        }
      },
      // paginate history_used
      {
        $project: {
          room_number: 1,
          status: 1,
          clinic_id: 1,

          history_total: { $size: "$history_used_filtered" },
          history_used: {
            $slice: ["$history_used_filtered", skip, historyLimit]
          }
        }
      }
    ]);

    // const room = await Room.findById(roomId).select('-__v -createdAt -updatedAt');
    logger.debug(`Room data in service: ${(result)}`);
    const {history_total, ...roomData} = result[0] || {};
    const data = {
      data: roomData,
      history_pagination: {
        page: historyPage,
        limit: historyLimit,
        total: history_total || 0,
        totalPages: history_total ? Math.ceil(history_total / historyLimit) : 0
      }
    };
    return data || null;
  } catch (error) {
    logger.error(`Error in getRoomById service: ${error}`, {
      stack: error.stack,
      context: 'RoomService.getRoomById'
    });
    throw new errorRes.InternalServerError('An error occurred while fetching the room');
  }
};

/**
 * get all rooms with search by room_number, sort by room_number and fill by status room with pagination
 * 
 * @param {Object} query {search, status, sort, page, limit}
 */
const getRooms = async (query) => {
  try {
    logger.info('Fetching rooms in service');
    logger.debug('Query params', query);

    const search = query.search?.trim();
    const status = query.status;
    const sort = query.sort === 'desc' ? -1 : 1;
    const page = parseInt(query.page || 1);
    const limit = parseInt(query.limit || 5);
    const skip = (page - 1) * limit;

    // Build filter object
    const result = await Room.aggregate([
      {
        $match: {
          ...(search ? { room_number: { $regex: search, $options: 'i' } } : {}),
          ...(status ? { status: status } : {})
        }
      },
      { $sort: { room_number: sort } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                __v: 0,
                createdAt: 0,
                updatedAt: 0,
                history_used: 0
              }
            }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ]);
    logger.debug(`Rooms data in service: ${(result)}`);
    const rooms = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    return {
      data: rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error(`Error in getRooms service: ${error}`, {
      stack: error.stack,
      context: 'RoomService.getRooms'
    });
    throw new errorRes.InternalServerError('An error occurred while fetching the rooms');
  }
};
/**
 * create new room
 * @param {Object} roomData room data
 * @returns new room
 */
const createRoom = async (roomData) => {
  try {
    logger.info('Creating new room in service');
    logger.debug(`Room data to create: ${(roomData)}`);
    const newRoom = new Room(roomData);
    const savedRoom = await newRoom.save();
    logger.debug(`New room created: ${(savedRoom)}`);
    return savedRoom;
  } catch (error) {
    logger.error(`Error in createRoom service: ${error}`, {
      stack: error.stack,
      context: 'RoomService.createRoom'
    });
    throw new errorRes.InternalServerError('An error occurred while creating the room');
  }
};

module.exports = { updateRoom, getRoomById, getRooms, createRoom };