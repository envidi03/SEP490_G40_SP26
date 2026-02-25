const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/staff.controller');

router.get('/', controller.getListController);
router.get('/leave', auth.authenticate, auth.authorize("DOCTOR", "ASSISTANT"), controller.getLeaveRequestController);

module.exports = router;