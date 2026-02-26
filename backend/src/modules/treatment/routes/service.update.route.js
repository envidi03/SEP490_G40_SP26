const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/dental.record.controller');

router.patch('/dental-record/:id', auth.authenticate, auth.authorize("DOCTOR"), controller.editDentalRecordController);


module.exports = router;