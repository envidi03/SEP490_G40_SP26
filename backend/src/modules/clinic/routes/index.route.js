const express = require('express');
const router = express.Router();

// Import các router con
const getInforClinicRoute = require('./get.infor.clinic.route');
const updateClinicRoute = require('./update.clinic.route');

// Nhúng các router con vào router tổng
// Giả sử bên trong các file con kia bạn đã định nghĩa router.get(...) và router.patch(...)
router.use(getInforClinicRoute);
router.use(updateClinicRoute);

// Export router tổng ra ngoài
module.exports = router;