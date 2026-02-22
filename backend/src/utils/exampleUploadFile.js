const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToCloudinary, uploadMultipleToCloudinary } = require('../utils/cloudinaryHelper');

// Sử dụng memoryStorage để Multer giữ file trong bộ nhớ đệm (buffer)
const upload = multer({ storage: multer.memoryStorage() });

// 1. Route Upload ĐƠN (Single)
router.post('/upload-single', upload.single('file'), async (req, res) => {
    try {
        // Gọi Utils: ném file vào và nhận về URL
        const imageUrl = await uploadToCloudinary(req.file, 'my_folder_single');

        res.status(200).json({
            success: true,
            message: 'Upload single file thành công!',
            url: imageUrl 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// 2. Route Upload ĐA (Multiple - tối đa 5 file)
router.post('/upload-multiple', upload.array('files', 5), async (req, res) => {
    try {
        // Gọi Utils: ném mảng files vào và nhận về mảng URL
        const imageUrls = await uploadMultipleToCloudinary(req.files, 'my_folder_multiple');

        res.status(200).json({
            success: true,
            message: 'Upload multiple files thành công!',
            urls: imageUrls 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;