const roomController = require('./controllers/room.controller');
const roomModel = require('./models/room.model');
const roomService = require('./services/room.service');
const roomRoute = require('./routes/index.route');

module.exports = {
    roomController,
    roomModel,
    roomService,
    roomRoute
};