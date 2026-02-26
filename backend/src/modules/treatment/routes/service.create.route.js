const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/dental.record.controller');

router.post('/dental-record', auth.authenticate, auth.authorize("DOCTOR"), controller.createDentalRecordController);


module.exports = router;