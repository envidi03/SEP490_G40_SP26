// clinic/index.js
const clinicController = require('./controllers/clinic.controller');
const clinicService = require('./service/clinic.service');
const clinicModel = require('./models/clinic.model');
const clinicRoute = require('./routes/clinic.route');

module.exports = {
    clinicController,
    clinicService,
    clinicModel,
    clinicRoute
};