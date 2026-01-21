const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const roomController = require('../controllers/room.controller');

router.get('/:roomId', auth.authenticate, auth.authorize("ADMIN_CLINIC"), roomController.getRoomById);

module.exports = router;