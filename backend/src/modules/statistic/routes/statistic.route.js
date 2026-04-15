const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const statisticController = require('../controllers/statistic.controller');

router.get('/money', auth.authenticate, auth.authorize("ADMIN_CLINIC"), statisticController.getMoneyStatistics);
router.get('/booking', auth.authenticate, auth.authorize("ADMIN_CLINIC"), statisticController.getBookingStatistics);
module.exports = router;