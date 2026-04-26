const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const successRes = require('../../../common/success');
const Pagination = require('../../../common/responses/Pagination'); // Có thể bỏ nếu controller này chưa dùng đến
const { cleanObjectData } = require('../../../common/utils/cleanObjectData');

const clinicService = require('../services/clinic.service');
const { uploadToCloudinary } = require('../../../utils/cloudinaryHelper');

const updateClinic = async (req, res) => {
    try {
        logger.info('Attempting to update clinic', { context: 'ClinicController.updateClinic' });
        const clinicId = req.params.clinicId;
        const updateData = { ...req.body };

        // Handle logo upload if file is present
        if (req.file) {
            logger.info('Logo file detected, uploading to Cloudinary', { context: 'ClinicController.updateClinic' });
            const logoUrl = await uploadToCloudinary(req.file, 'clinics/logos');
            updateData.logo = logoUrl;
        }

        // Tối ưu: Để tham số thứ 2 là object để Logger in ra chi tiết dữ liệu thay vì chuỗi [object Object]
        logger.debug('Clinic update payload details', { 
            clinicId: clinicId, 
            updateData: cleanObjectData(updateData) 
        });

        // 1. Kiểm tra xem body có dữ liệu không
        if (!updateData || Object.keys(updateData).length === 0) {
            // Sửa AppError thành errorRes và dịch sang tiếng Việt
            throw new errorRes.BadRequestError('Không có dữ liệu cập nhật nào được cung cấp');
        }

        // 2. Gọi service để cập nhật clinic
        const updatedClinic = await clinicService.updateClinic(clinicId, cleanObjectData(updateData));

        logger.debug('Clinic successfully updated in DB', { 
            clinicId: clinicId,
            updatedClinic: updatedClinic 
        });

        logger.info(`Clinic ${clinicId} updated successfully`);
        
        // Trả về Frontend bằng tiếng Việt
        return new successRes.UpdateSuccess(updatedClinic, 'Cập nhật thông tin phòng khám thành công').send(res);
    } catch (error) {
        logger.error('Error updating clinic', {
            context: 'ClinicController.updateClinic',
            message: error.message,
            stack: error.stack
        });
        // Bắn thẳng lỗi gốc ra ngoài để Global Error Middleware xử lý thành 500
        throw error;
    }
};

const getInforClinics = async (req, res) => {
    try {
        logger.info('Fetching clinic data', { context: 'ClinicController.getInforClinics' });
        const clinicId = req.params.clinicId;
        
        logger.debug('Clinic ID from request params', { clinicId });
        
        const clinic = await clinicService.getInforClinics(clinicId);
        if (!clinic) {
            throw new errorRes.NotFoundError('Không tìm thấy thông tin phòng khám');
        }
        
        return new successRes.GetDetailSuccess(clinic, 'Lấy thông tin phòng khám thành công').send(res);
    } catch (error) {
        if (error.name === 'NotFoundError') throw error;
        logger.error('Error getting clinic data', {
            context: 'ClinicController.getInforClinics',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

const getAllClinics = async (req, res) => {
    try {
        logger.info('Fetching all clinics', { context: 'ClinicController.getAllClinics' });
        
        const clinics = await clinicService.getAllClinics();
        
        return new successRes.GetListSuccess(clinics, 'Lấy danh sách phòng khám thành công').send(res);
    } catch (error) {
        logger.error('Error getting all clinics', {
            context: 'ClinicController.getAllClinics',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

const getPublicClinics = async (req, res) => {
    try {
        logger.info('Fetching public clinics data', { context: 'ClinicController.getPublicClinics' });
        
        const clinics = await clinicService.getAllClinics(); // Giả định service này lấy toàn bộ, bạn có thể cân nhắc hàm getPublicClinics riêng ở service sau này
        
        return new successRes.GetListSuccess(clinics, 'Lấy thông tin phòng khám công khai thành công').send(res);
    } catch (error) {
        logger.error('Error getting public clinics', {
            context: 'ClinicController.getPublicClinics',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

module.exports = { updateClinic, getInforClinics, getAllClinics, getPublicClinics };