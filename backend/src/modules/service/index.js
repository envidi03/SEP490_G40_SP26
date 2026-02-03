const equipmentController = require('./controllers/service.controller');
const equipmentModel = require('./models/service.model');
const equipmentService = require('./services/service.service');
const equipmentRoute = require('./routes/index.route');

module.exports = {
    equipmentController,
    equipmentModel,
    equipmentService,
    equipmentRoute
};