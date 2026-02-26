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
    const serviceRoomPage = parseInt(query.serviceRoomPage) || 1;
    const serviceRoomLimit = parseInt(query.serviceRoomLimit) || 5;
    const startDate = query.startDate ? new Date(query.startDate) : null;
    const endDate = query.endDate ? new Date(query.endDate) : null;

    const historySkip = (historyPage - 1) * historyLimit;
    const serviceSkip = (serviceRoomPage - 1) * serviceRoomLimit;

    // Log 1: Query data
    logger.debug("Query data in service", {
      context: "RoomService.getRoomById",
      historyPage, historyLimit, historySkip,
      serviceRoomPage, serviceRoomLimit, serviceSkip,
      startDate, endDate,
    });

    // Log 2: Fetching start
    logger.info("Fetching room by ID in service", {
      context: "RoomService.getRoomById",
      roomId,
    });

    const aggregateResult = await Room.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(roomId) },
      },
      {
        $addFields: {
          // Sử dụng $ifNull để tránh lỗi khi history_used không tồn tại
          safe_history: { $ifNull: ["$history_used", []] },
          safe_services: { $ifNull: ["$room_service", []] }
        }
      },
      {
        $addFields: {
          // Lọc mảng history_used sau khi đã đảm bảo nó là array
          filtered_history: {
            $filter: {
              input: "$safe_history",
              as: "h",
              cond: {
                $and: [
                  startDate ? { $gte: ["$$h.used_date", startDate] } : { $literal: true },
                  endDate ? { $lte: ["$$h.used_date", endDate] } : { $literal: true },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          room_number: 1,
          status: 1,
          note: 1,
          clinic_id: 1,
          history_total: { $size: "$filtered_history" },
          service_total: { $size: "$safe_services" },
          history_used: {
            $slice: [
              { $sortArray: { input: "$filtered_history", sortBy: { used_date: -1 } } },
              historySkip,
              historyLimit,
            ],
          },
          // Lấy slice trước rồi lookup để tránh lookup toàn bộ
          room_service_paged: {
            $slice: ["$safe_services", serviceSkip, serviceRoomLimit],
          },
        },
      },
      // Unwind room_service_paged để lookup từng item
      {
        $unwind: {
          path: "$room_service_paged",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup service name
      {
        $lookup: {
          from: "services",
          localField: "room_service_paged.service_id",
          foreignField: "_id",
          as: "room_service_paged.service_info",
        },
      },
      // Thêm service_name vào từng item
      {
        $addFields: {
          "room_service_paged.service_name": {
            $ifNull: [
              { $arrayElemAt: ["$room_service_paged.service_info.service_name", 0] },
              "Không xác định",
            ],
          },
        },
      },
      // Group lại thành array
      {
        $group: {
          _id: "$_id",
          room_number: { $first: "$room_number" },
          status: { $first: "$status" },
          note: { $first: "$note" },
          clinic_id: { $first: "$clinic_id" },
          history_total: { $first: "$history_total" },
          service_total: { $first: "$service_total" },
          history_used: { $first: "$history_used" },
          room_service: {
            $push: {
              service_id: "$room_service_paged.service_id",
              service_name: "$room_service_paged.service_name",
              note: "$room_service_paged.note",
            },
          },
        },
      },
    ]);


    // Log 3: Raw result
    logger.debug("Raw aggregation result", {
      context: "RoomService.getRoomById",
      result: aggregateResult,
    });

    if (!aggregateResult || aggregateResult.length === 0) return null;

    const result = aggregateResult[0];

    const historyPagination = new Pagination({
      page: historyPage,
      size: historyLimit,
      totalItems: result.history_total || 0,
    });

    const servicePagination = new Pagination({
      page: serviceRoomPage,
      size: serviceRoomLimit,
      totalItems: result.service_total || 0,
    });

    const data = {
      _id: result._id,
      room_number: result.room_number,
      status: result.status,
      note: result.note,
      clinic_id: result.clinic_id,
      history_used: {
        items: result.history_used || [],
        pagination: historyPagination,
      },
      room_service: {
        items: result.room_service || [],
        pagination: servicePagination,
      },
    };

    // Log 4: Final data
    logger.debug("Data submitted from aggregation", {
      context: "RoomService.getRoomById",
      data,
    });

    return data;
  } catch (error) {
    // Log 5: Error handling
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
                room_service: 0,
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
