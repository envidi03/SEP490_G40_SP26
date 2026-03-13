const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToCloudinary } = require('../../../utils/cloudinaryHelper');

// Dùng memoryStorage để upload lên Cloudinary trực tiếp từ buffer
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/service/upload-image
 * Upload 1 ảnh dịch vụ lên Cloudinary (giữ nguyên cho backward compat)
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

/**
 * POST /api/service/upload-images
 * Upload nhiều ảnh cùng lúc lên Cloudinary (tối đa 10 ảnh)
 * Body: multipart/form-data với field "images" (multiple files)
 * Response: { urls: ["https://...", ...] }
 */
router.post('/upload-images', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Vui lòng chọn ít nhất một file ảnh!' });
        }

        // Upload song song lên Cloudinary
        const uploadPromises = req.files.map(file => uploadToCloudinary(file, 'services'));
        const urls = await Promise.all(uploadPromises);

        return res.status(200).json({
            status: 'success',
            message: `Upload ${urls.length} ảnh thành công`,
            data: { urls }
        });
    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
