const equipmentController = require('./controllers/equipment.controller');
const equipmentModel = require('./models/equipment.model');
const equipmentService = require('./services/equipment.service');
const equipmentRoute = require('./routes/index.route');

module.exports = {
    equipmentController,
    equipmentModel,
    equipmentService,
    equipmentRoute
};