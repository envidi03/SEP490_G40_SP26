const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/dental.record.controller');

router.get('/dental-record', auth.authenticate, auth.authorize("DOCTOR"), controller.getDentalRecordsController);


module.exports = router;