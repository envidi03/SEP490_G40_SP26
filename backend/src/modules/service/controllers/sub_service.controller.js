const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const successRes = require('../../../common/success');
const subServiceService = require('../services/sub_service.service');
const { cleanObjectData } = require('../../../common/utils/cleanObjectData');

/**
 * GET /api/service/:id/sub-services
 * Lấy danh sách dịch vụ con theo dịch vụ cha
 */
const getSubServicesByParent = async (req, res) => {
    try {
        const { id: parentId } = req.params;
        const query = req.query;

        logger.debug('Fetching sub-services for parent', {
            context: 'SubServiceController.getSubServicesByParent',
            parentId
        });

        const subServices = await subServiceService.getSubServicesByParentId(parentId, query);

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Lấy danh sách dịch vụ con thành công',
            data: subServices
        });
    } catch (error) {
        logger.error('Error fetching sub-services', {
            context: 'SubServiceController.getSubServicesByParent',
            message: error.message
        });
        throw error;
    }
};

/**
 * GET /api/service/sub-service/:subId
 * Lấy chi tiết 1 dịch vụ con
 */
const getSubServiceById = async (req, res) => {
    try {
        const { subId } = req.params;

        logger.debug('Fetching sub-service by ID', {
            context: 'SubServiceController.getSubServiceById',
            subId
        });

        const subService = await subServiceService.getSubServiceById(subId);

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Lấy thông tin dịch vụ con thành công',
            data: subService
        });
    } catch (error) {
        logger.error('Error fetching sub-service', {
            context: 'SubServiceController.getSubServiceById',
            message: error.message
        });
        throw error;
    }
};

/**
 * POST /api/service/:id/sub-services
 * Tạo mới dịch vụ con (Admin only)
 */
const createSubService = async (req, res) => {
    try {
        const { id: parentId } = req.params;
        const rawData = req.body || {};
        const cleanData = cleanObjectData(rawData);

        if (!cleanData || Object.keys(cleanData).length === 0) {
            throw new errorRes.BadRequestError('Không có dữ liệu được cung cấp');
        }

        if (!cleanData.sub_service_name) {
            throw new errorRes.BadRequestError('Tên dịch vụ con là bắt buộc');
        }

        logger.debug('Creating sub-service', {
            context: 'SubServiceController.createSubService',
            parentId,
            data: cleanData
        });

        const created = await subServiceService.createSubService(parentId, cleanData);

        return res.status(201).json({
            success: true,
            statusCode: 201,
            message: 'Tạo dịch vụ con thành công',
            data: created
        });
    } catch (error) {
        logger.error('Error creating sub-service', {
            context: 'SubServiceController.createSubService',
            message: error.message
        });
        throw error;
    }
};

/**
 * PATCH /api/service/sub-service/:subId
 * Cập nhật dịch vụ con (Admin only)
 */
const updateSubService = async (req, res) => {
    try {
        const { subId } = req.params;
        const rawData = req.body || {};
        const cleanData = cleanObjectData(rawData);

        if (!cleanData || Object.keys(cleanData).length === 0) {
            throw new errorRes.BadRequestError('Không có dữ liệu cập nhật được cung cấp');
        }

        logger.debug('Updating sub-service', {
            context: 'SubServiceController.updateSubService',
            subId,
            data: cleanData
        });

        const updated = await subServiceService.updateSubService(subId, cleanData);

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Cập nhật dịch vụ con thành công',
            data: updated
        });
    } catch (error) {
        logger.error('Error updating sub-service', {
            context: 'SubServiceController.updateSubService',
            message: error.message
        });
        throw error;
    }
};

/**
 * DELETE /api/service/sub-service/:subId
 * Xóa dịch vụ con (Admin only)
 */
const deleteSubService = async (req, res) => {
    try {
        const { subId } = req.params;

        logger.debug('Deleting sub-service', {
            context: 'SubServiceController.deleteSubService',
            subId
        });

        await subServiceService.deleteSubService(subId);

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Xóa dịch vụ con thành công'
        });
    } catch (error) {
        logger.error('Error deleting sub-service', {
            context: 'SubServiceController.deleteSubService',
            message: error.message
        });
        throw error;
    }
};

module.exports = {
    getSubServicesByParent,
    getSubServiceById,
    createSubService,
    updateSubService,
    deleteSubService
};
