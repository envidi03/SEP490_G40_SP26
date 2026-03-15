const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const subServiceController = require('../controllers/sub_service.controller');

/**
 * GET /api/service/:id/sub-services
 * Public - Lấy danh sách dịch vụ con theo dịch vụ cha
 */
router.get('/:id/sub-services', subServiceController.getSubServicesByParent);

/**
 * GET /api/service/sub-service/:subId
 * Public - Lấy chi tiết 1 dịch vụ con
 */
router.get('/sub-service/:subId', subServiceController.getSubServiceById);

/**
 * POST /api/service/:id/sub-services
 * Admin only - Tạo dịch vụ con mới
 */
router.post('/:id/sub-services', auth.authenticate, auth.authorize('ADMIN_CLINIC'), subServiceController.createSubService);

/**
 * PATCH /api/service/sub-service/:subId
 * Admin only - Cập nhật dịch vụ con
 */
router.patch('/sub-service/:subId', auth.authenticate, auth.authorize('ADMIN_CLINIC'), subServiceController.updateSubService);

/**
 * DELETE /api/service/sub-service/:subId
 * Admin only - Xóa dịch vụ con
 */
router.delete('/sub-service/:subId', auth.authenticate, auth.authorize('ADMIN_CLINIC'), subServiceController.deleteSubService);

module.exports = router;
