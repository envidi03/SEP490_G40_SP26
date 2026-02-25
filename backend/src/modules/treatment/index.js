const controller = require('./controllers/appointment.controller');
const model = require('./models/index.model');
const service = require('./services/appointment.service');
const route = require('./routes/index.route');

module.exports = {
    controller,
    model,
    service,
    route
};