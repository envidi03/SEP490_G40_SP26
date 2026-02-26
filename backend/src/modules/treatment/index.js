const controller = require('./controllers/dental.record.controller');
const model = require('./models/index.model');
const service = require('./services/dental.record.service');
const route = require('./routes/index.route');

module.exports = {
    controller,
    model,
    service,
    route
};