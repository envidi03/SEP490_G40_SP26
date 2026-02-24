const express = require('express');
const router = express.Router();

const createRoute = require('./service.create.route');
const viewDetailRoute = require('./service.detail.route');
const viewListRoute = require('./service.list.route');
const updateRoute = require('./service.update.route');
const updateStatusRoute = require('./service.update.status.route');
const rolesRoute = require('./service.roles.route');

router.use(rolesRoute);  // /roles trước /:staffId để tránh conflict
router.use(viewListRoute);
router.use(viewDetailRoute);
router.use(createRoute);
router.use(updateRoute);
router.use(updateStatusRoute);

module.exports = router;