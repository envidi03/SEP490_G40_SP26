const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/staff.controller');

// Admin: Get all leave requests
router.get('/admin/leave', auth.authenticate, auth.authorize('ADMIN_CLINIC'), controller.getAllLeaveController);

// Admin: Approve or reject a leave request
router.patch('/admin/leave/:id', auth.authenticate, auth.authorize('ADMIN_CLINIC'), controller.approveLeaveController);

module.exports = router;
