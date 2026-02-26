const express = require('express');
const router = express.Router();

const createRoute = require('./service.create.route');
// const viewDetailRoute = require('./service.detail.route');
const viewListRoute = require('./service.list.route');
const updateRoute = require('./service.update.route');

router.use(viewListRoute);
// router.use(viewDetailRoute);
router.use(createRoute);
router.use(updateRoute);

module.exports = router;