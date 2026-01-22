const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const roomController = require('../controllers/room.controller');

// router.post('/', auth.authenticate, auth.authorize("ADMIN_CLINIC"), roomController.createRoom);

router.post('/', roomController.createRoom);

module.exports = router;