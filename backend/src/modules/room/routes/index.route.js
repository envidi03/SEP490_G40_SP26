const express = require('express');
const router = express.Router();

const viewListRoomRoute = require('./room.list.route');
const viewDetailRoomRoute = require('./room.detail.route');
const updateRoomRoute = require('./room.update.route');
const updateRoomStatusRoute = require('./room.update.status.route');
const createRoomRoute = require('./room.create.route');

router.use(createRoomRoute);
router.use(viewListRoomRoute);
router.use(viewDetailRoomRoute);
router.use(updateRoomRoute);
router.use(updateRoomStatusRoute);

module.exports = router;