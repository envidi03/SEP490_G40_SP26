// clinic/index.js
const clinicController = require('./controllers/clinic.controller');
const clinicService = require('./services/clinic.service');
const clinicModel = require('./models/clinic.model');
const clinicRoute = require('./routes/index.route');

module.exports = {
    clinicController,
    clinicService,
    clinicModel,
    clinicRoute
};