const controller = require('./controllers/service.controller');
const model = require('./models/service.model');
const service = require('./services/service.service');
const route = require('./routes/index.route');

module.exports = {
    controller,
    model,
    service,
    route
};