const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToCloudinary } = require('../../../utils/cloudinaryHelper');

// Dùng memoryStorage để upload lên Cloudinary trực tiếp từ buffer
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/service/upload-image
 * Upload ảnh dịch vụ lên Cloudinary
 * Body: multipart/form-data với field "image"
 * Response: { url: "https://res.cloudinary.com/..." }
 */
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'Vui lòng chọn một file ảnh!' });
        }
        const url = await uploadToCloudinary(req.file, 'services');
        return res.status(200).json({ status: 'success', message: 'Upload ảnh thành công', data: { url } });
    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
