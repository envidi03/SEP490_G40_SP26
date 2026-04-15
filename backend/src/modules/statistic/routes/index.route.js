const express = require('express');
const router = express.Router();

const statistic = require('./statistic.route');

router.use(statistic);

module.exports = router;