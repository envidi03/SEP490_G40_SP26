const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/staff.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const cpUpload = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'license', maxCount: 10 }
]);
router.patch('/:id', cpUpload, controller.updateController);
router.patch('/leave/:id', controller.editLeaveRequestController);

module.exports = router;