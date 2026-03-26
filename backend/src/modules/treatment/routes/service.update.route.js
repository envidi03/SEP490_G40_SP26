const express = require('express');
const router = express.Router();
const auth = require('../../../common/middlewares/index');
const controller = require('../controllers/index.controller');

router.patch('/treatment/:id', controller.treatment.updateController);

router.patch('/dental-record/:id', auth.authenticate, auth.authorize("DOCTOR"), controller.dental.updateController);

router.put('/dental-records/plans/:id', auth.authenticate, controller.dental.updateTreatmentPlanController);

module.exports = router;