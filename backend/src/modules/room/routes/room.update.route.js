const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const roomController = require('../controllers/room.controller');

router.patch('/:roomId', auth.authenticate, auth.authorize("ADMIN_CLINIC"), roomController.updateRoom);

module.exports = router;