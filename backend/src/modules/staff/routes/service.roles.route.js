const express = require('express');
const router = express.Router();
const controller = require('../controllers/staff.controller');

// GET /api/staff/roles - Lấy danh sách roles khả dụng để tạo nhân viên
router.get('/roles', controller.getRolesController);

module.exports = router;
