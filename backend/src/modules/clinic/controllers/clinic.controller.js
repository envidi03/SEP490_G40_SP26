const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const successRes = require('../../../common/success');
const { default: Pagination } = require('../../../common/responses/Pagination');
const {cleanObjectData} = require('../../../common/utils/cleanObjectData');

const clinicService = require('../services/clinic.service');

const updateClinic = async (req, res) => {
    try {
        logger.info('Attempting to update clinic');
        const clinicId = req.params.clinicId;
        const updateData = req.body;
        
        // Sửa: Dùng Template Literals để nối chuỗi ID và dữ liệu đã clean
        logger.debug(`Clinic ID: ${clinicId}`);
        logger.debug(`Update data: ${JSON.stringify(cleanObjectData(updateData))}`);

        // 1. Kiểm tra xem body có dữ liệu không
        if (!updateData || Object.keys(updateData).length === 0) {
            throw new AppError.BadRequestError('No update data provided');
        }

        // 2. Gọi service để cập nhật clinic
        const updatedClinic = await clinicService.updateClinic(clinicId, cleanObjectData(updateData));

        // Sửa: Dùng Template Literals để hiển thị kết quả trả về
        logger.debug(`Updated clinic: ${JSON.stringify(updatedClinic)}`);
        
        logger.info(`Clinic ${clinicId} updated successfully`);
        return new successRes.UpdateSuccess(updatedClinic, 'Clinic updated successfully').send(res);
    } catch (error) {
        // Sửa: Log chi tiết lỗi message
        logger.error(`Error updating clinic: ${error.message}`, error);
        throw new errorRes.InternalServerError('An error occurred while updating the clinic');
    }
};

const getInforClinics = async (req, res) => {
    try {
        logger.info('Fetching data clinic');
        const clinicId = req.params.clinicId;
        logger.debug('Clinic ID from request params:', clinicId);
        const clicic = await clinicService.getInforClinics(clinicId);
        if (!clicic) {
            throw new errorRes.NotFoundError('No clinics found');
        }
        logger.debug('Clinics data retrieved:', JSON.stringify(clicic));
        return new successRes.GetInfoSuccess(clicic, 'Clinics retrieved successfully').send(res);
    } catch (error) {
        logger.error('Error getting clinic data:', error);
        throw new errorRes.InternalServerError('An error occurred while fetching clinics');
    }
};

module.exports = { updateClinic, getInforClinics };