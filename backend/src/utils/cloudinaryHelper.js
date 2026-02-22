const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const sharp = require('sharp');
const logger = require('../common/utils/logger'); //

const ALLOWED_FORMATS = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    video: ['video/mp4', 'video/mpeg', 'video/quicktime'],
    raw: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

/**
 * Xử lý upload một file duy nhất
 */
const uploadToCloudinary = async (file, folder = 'uploads') => {
    const context = 'src.utils.cloudinaryHelper.js';
    
    if (!file) {
        const error = new Error('Vui lòng chọn một file!');
        logger.error('No file provided for upload.', { context, error: error.message });
        throw error;
    }

    try {
        const mimeType = file.mimetype;
        let maxSize = 0;
        let resourceType = '';

        // 1. KIỂM TRA ĐỊNH DẠNG VÀ LẤY LIMIT TỪ .ENV
        if (ALLOWED_FORMATS.image.includes(mimeType)) {
            resourceType = 'image';
            maxSize = process.env.MAX_SIZE_IMAGE * 1024 * 1024; // 10MB
            
            const metadata = await sharp(file.buffer).metadata();
            const megapixels = (metadata.width * metadata.height) / 1000000;
            if (megapixels > process.env.MAX_IMAGE_MEGAPIXELS) { // 25MP
                throw new Error(`Ảnh quá lớn (${megapixels.toFixed(2)}MP). Giới hạn là ${process.env.MAX_IMAGE_MEGAPIXELS}MP.`);
            }

        } else if (ALLOWED_FORMATS.video.includes(mimeType)) {
            resourceType = 'video';
            maxSize = process.env.MAX_SIZE_VIDEO * 1024 * 1024; // 100MB

        } else if (ALLOWED_FORMATS.raw.includes(mimeType)) {
            resourceType = 'raw';
            maxSize = process.env.MAX_SIZE_RAW * 1024 * 1024; // 10MB

        } else {
            throw new Error('Định dạng file không được hỗ trợ!');
        }

        // 2. KIỂM TRA DUNG LƯỢNG (SIZE)
        if (file.size > maxSize) {
            throw new Error(`File vượt giới hạn cho phép (${maxSize / (1024 * 1024)}MB).`);
        }

        // 3. THỰC HIỆN UPLOAD
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder, resource_type: resourceType },
                (error, result) => {
                    if (result) {
                        logger.debug('Upload to cloudinary success.', { context, result });
                        resolve(result.secure_url); // Trả về URL của Cloud name dhlvi7ydy
                    } else {
                        logger.error('Error upload to cloudinary.', { context, error });
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
        });

    } catch (error) {
        logger.error('Validation failed before uploading to cloudinary.', {
            context: context,
            error: error.message
        });
        throw error;
    }
};

/**
 * Xử lý upload nhiều file cùng lúc
 */
const uploadMultipleToCloudinary = async (files, folder = 'uploads') => {
    const context = 'src.utils.cloudinaryHelper.js';
    
    try {
        if (!files || !Array.isArray(files) || files.length === 0) {
            throw new Error('Danh sách file trống!');
        }

        // Sử dụng Promise.all để upload song song, tăng tốc độ xử lý
        const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
        const urls = await Promise.all(uploadPromises);

        logger.debug('Multiple upload success.', { context, count: urls.length });
        return urls; // Trả về mảng các URL
    } catch (error) {
        logger.error('Multiple upload failed.', { context, error: error.message });
        throw error;
    }
};

module.exports = { 
    uploadToCloudinary, 
    uploadMultipleToCloudinary 
};