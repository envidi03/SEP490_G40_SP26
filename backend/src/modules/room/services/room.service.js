const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");

const Room = require("../models/room.model");
const { default: mongoose } = require("mongoose");
const Pagination = require("../../../common/responses/Pagination");

/**
 * update room infor
 *
 * @param {ObjectId} roomId room id
 * @param {JSON} updateData data to update
 * @returns new room data after update
 */
const updateRoom = async (roomId, updateData) => {
  try {
    logger.info("Updating room in service", {
      context: "RoomService.updateRoom",
      roomId,
    });

    logger.debug("Room update payload", {
      context: "RoomService.updateRoom",
      updateData,
    });

    const updatedRoom = await Room.findByIdAndUpdate(roomId, updateData, {
      new: true,
      runValidators: true,
    });

    logger.debug("Updated room data in service", {
      context: "RoomService.updateRoom",
      updatedRoom,
    });

    return updatedRoom || null;
  } catch (error) {
    logger.error("Error in updateRoom service", {
      context: "RoomService.updateRoom",
      message: error.message,
      stack: error.stack,
    });

    throw new errorRes.InternalServerError(
      "An error occurred while updating the room",
    );
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

    logger.debug("Query data", {
      context: "RoomService.getRoomById",
      historyPage: historyPage,
      historyLimit: historyLimit,
      skip: skip,
      startDate: startDate,
      endDate: endDate,
    });

    logger.info("Fetching room by ID in service", {
      context: "RoomService.getRoomById",
      roomId,
    });

    // Build history_used filter
    // 1. Xây dựng bộ lọc ngày tháng trước để tránh lỗi $and rỗng
    const dateFilters = [];
    if (startDate)
      dateFilters.push({ "history_used.use_start": { $gte: startDate } });
    if (endDate)
      dateFilters.push({ "history_used.use_end": { $lte: endDate } });

    // 2. Thực hiện Aggregate
    const result = await Room.aggregate([
      {
        // Fix lỗi Class constructor ObjectId cannot be invoked without 'new'
        $match: { _id: new mongoose.Types.ObjectId(roomId) },
      },
      {
        // Fix lỗi mất dữ liệu khi mảng history_used rỗng
        $unwind: {
          path: "$history_used",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        // Fix lỗi $and argument must be a non-empty array
        $match: {
          $or: [
            { history_used: null },
            { history_used: { $exists: false } },
            // Nếu có ngày thì lọc theo mảng dateFilters, nếu không thì lấy tất cả
            dateFilters.length > 0
              ? { $and: dateFilters }
              : { _id: { $exists: true } },
          ],
        },
      },
      { $sort: { "history_used.use_start": -1 } },
      {
        $group: {
          _id: "$_id",
          room_number: { $first: "$room_number" },
          status: { $first: "$status" },
          note: { $first: "$note" },
          clinic_id: { $first: "$clinic_id" },
          // Dùng $cond để loại bỏ giá trị null khỏi mảng sau khi push
          history_used_filtered: {
            $push: {
              $cond: [
                { $gt: ["$history_used", null] },
                "$history_used",
                "$$REMOVE",
              ],
            },
          },
        },
      },
      {
        $project: {
          room_number: 1,
          status: 1,
          clinic_id: 1,
          note: 1,
          // Tính tổng dựa trên mảng đã lọc
          history_total: { $size: "$history_used_filtered" },
          // Phân trang cho mảng history_used
          history_used: {
            $slice: ["$history_used_filtered", skip, historyLimit],
          },
        },
      },
    ]);

    logger.debug("Raw aggregation result", {
      context: "RoomService.getRoomById",
      result,
    });

    // get total history_used and room data
    const { history_total, ...roomData } = result[0] || {};
    const { history_used, ...roomInfo } = roomData || {};

    const pagination = new Pagination({
      page: historyPage,
      size: historyLimit,
      totalItems: history_total || 0,
    });
    // format data to return
    const data = {
      ...roomInfo,
      history_used: {
        item: history_used || [],
        pagination,
      },
    };

    logger.debug("Data submitted from aggregation", {
      context: "RoomService.getRoomById",
      data,
    });

    return data || null;
  } catch (error) {
    logger.error("Error in getRoomById service", {
      context: "RoomService.getRoomById",
      message: error.message,
      stack: error.stack,
    });

    throw new errorRes.InternalServerError(
      "An error occurred while fetching the room",
    );
  }
};

/**
 * get all rooms with search by room_number, sort by room_number and fill by status room with pagination
 *
 * @param {Object} query {search, status, sort, page, limit}
 */
const getRooms = async (query) => {
  try {
    logger.info("Fetching rooms in service", {
      context: "RoomService.getRooms",
    });

    logger.debug("Query params", {
      context: "RoomService.getRooms",
      query,
    });

    const search = query.search?.trim();
    const status = query.status;
    const sort = query.sort === "desc" ? -1 : 1;
    const page = parseInt(query.page || 1);
    const limit = parseInt(query.limit || 5);
    const skip = (page - 1) * limit;

    const result = await Room.aggregate([
      {
        $match: {
          ...(search ? { room_number: { $regex: search, $options: "i" } } : {}),
          ...(status ? { status } : {}),
        },
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
                history_used: 0,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    logger.debug("Rooms aggregation result", {
      context: "RoomService.getRooms",
      result,
    });

    const rooms = result[0].data;
    const total = result[0]?.totalCount[0]?.count || 0;

    logger.debug("Data submitted from aggregation", {
      context: "RoomService.getRooms",
      data: rooms,
      pagination: {
        page,
        limit,
        total,
      },
    });

    return {
      data: rooms,
      pagination: {
        page,
        limit,
        total,
      },
    };
  } catch (error) {
    logger.error("Error in getRooms service", {
      context: "RoomService.getRooms",
      message: error.message,
      stack: error.stack,
    });

    throw new errorRes.InternalServerError(
      "An error occurred while fetching the rooms",
    );
  }
};

/**
 * create new room
 * @param {Object} roomData room data
 * @returns new room
 */
const createRoom = async (roomData) => {
  try {
    logger.info("Creating new room in service", {
      context: "RoomService.createRoom",
    });

    logger.debug("Room data to create", {
      context: "RoomService.createRoom",
      roomData,
    });

    const newRoom = new Room(roomData);
    const savedRoom = await newRoom.save();

    logger.debug("New room created", {
      context: "RoomService.createRoom",
      roomId: savedRoom.id,
    });

    return savedRoom;
  } catch (error) {
    logger.error("Error in createRoom service", {
      context: "RoomService.createRoom",
      message: error.message,
      stack: error.stack,
    });

    throw new errorRes.InternalServerError(
      "An error occurred while creating the room",
    );
  }
};

/**
 * check room number exists
 *
 * @param {String} roomNumber room number
 * @returns true if exited, false if not
 */
const checkRoomExists = async (roomNumber) => {
  try {
    const room = await Room.findOne({ room_number: roomNumber });
    return !!room;
  } catch (error) {
    logger.error("Error in checkRoomExists service", {
      context: "RoomService.checkRoomExists",
      message: error.message,
      stack: error.stack,
    });

    throw new errorRes.InternalServerError(
      "An error occurred while checking room existence",
    );
  }
};

/**
 * check room number exists but not current room id
 *
 * @param {String} roomNumber room number
 * @param {ObjectId} currentRoomId _id room
 * @returns true if exists, false if not
 */
const checkRoomExistsNotId = async (roomNumber, currentRoomId) => {
  try {
    const room = await Room.findOne({
      room_number: roomNumber,
      _id: { $ne: currentRoomId },
    });
    return !!room;
  } catch (error) {
    logger.error("Error in checkRoomExistsNotId service", {
      context: "RoomService.checkRoomExistsNotId",
      message: error.message,
      stack: error.stack,
    });

    throw new errorRes.InternalServerError(
      "An error occurred while checking room existence",
    );
  }
};

module.exports = {
  updateRoom,
  getRoomById,
  getRooms,
  createRoom,
  checkRoomExists,
  checkRoomExistsNotId,
};
