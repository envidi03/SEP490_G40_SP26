const route = require('./route/dashboard.route');
const DashboardService = require('./service/dashboard.service');
const DashboardController = require('./controller/dashboard.controller');
const DashboardModel = null; // Dashboard ko dùng model riêng mà query từ nhiều models khác

module.exports = {
    route,
    DashboardService,
    DashboardController,
    DashboardModel
};
