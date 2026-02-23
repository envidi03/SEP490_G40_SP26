const controller = require('./controllers/staff.controller');
const model = require('./models/index.model');
const service = require('./services/staff.service');
const route = require('./routes/index.route');

module.exports = {
    controller,
    model,
    service,
    route
};