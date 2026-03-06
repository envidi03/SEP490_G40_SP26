const controller = require('./controllers/index.controller');
const model = require('./models/index.model');
const service = require('./services/index.service');
const route = require('./routes/index.route');

module.exports = {
    controller,
    model,
    service,
    route
};