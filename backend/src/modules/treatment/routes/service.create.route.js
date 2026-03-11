const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/index.controller');

router.post('/treatment/:id', controller.treatment.createController);

router.post('/dental-record/:id', auth.authenticate, auth.authorize("DOCTOR"), controller.dental.createController);

router.post('/dental-records/plans', auth.authenticate, controller.dental.createTreatmentPlanController);

module.exports = router;