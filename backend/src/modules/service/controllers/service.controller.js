const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const successRes = require('../../../common/success');
const Pagination = require('../../../common/responses/Pagination');
const { cleanObjectData } = require('../../../common/utils/cleanObjectData');

const ServiceModel = require('../models/service.model');
const ServiceProcess = require('../services/service.service');

/*
    get list service with pagination and filter 
    (
        search: search by service_name; 
        filter: filter by status; 
        sort: sort by price
        page 
        limit
    )
*/
const getListController = async (req, res) => {
    try {
        const queryParams = req.query;
        logger.debug('Get services request received', {
            context: 'ServiceController.getList',
            query: queryParams
        });

        // Gọi service xử lý logic
        const { data, pagination } = await ServiceProcess.getListService(queryParams);

        // Tạo object pagination chuẩn để trả về cho client
        const paginationData = new Pagination({
            page: pagination.page,
            size: pagination.size,
            totalItems: pagination.totalItems,
        });

        return new successRes.GetListSuccess(data, paginationData, 'Lấy danh sách dịch vụ thành công').send(res);
    } catch (error) {
        logger.error('Error get service', {
            context: 'ServiceController.getList',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

/*
    get service by id with 
        filter equipment_service 
        (
            page
            limit
        )
*/
const getByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const queryParams = req.query;
        logger.debug('Get service by id request received', {
            context: 'ServiceController.getById',
            serviceId: id,
            query: queryParams
        });

        // check id empty
        if (!id) {
            logger.warn('Empty service ID', {
                context: 'ServiceController.getById',
                serviceId: id
            });
            throw new errorRes.BadRequestError('Mã dịch vụ là bắt buộc');
        }

        // Gọi service xử lý logic
        const service = await ServiceProcess.getByIdService(id);
        return new successRes.GetDetailSuccess(service, 'Lấy thông tin dịch vụ thành công').send(res);
    } catch (error) {
        logger.error('Error get service by id', {
            context: 'ServiceController.getById',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

// create Service don't have equipment_service
const createController = async (req, res) => {
    try {
        const dataCreate = req.body || {};
        logger.debug('Create service request received', {
            context: 'ServiceController.create',
            data: dataCreate
        });

        // clean data
        const cleanedData = cleanObjectData(dataCreate);

        // check required fields
        const requiredFields = ['service_name'];
        for (const field of requiredFields) {
            const value = cleanedData[field];

            // Ép kiểu sang String để sử dụng .trim() an toàn cho cả Number và String
            if (value === undefined || value === null || String(value).trim() === '') {
                logger.warn(`Missing required field`, {
                    context: 'ServiceController.createService',
                    field: field
                });
                throw new errorRes.BadRequestError(`Thiếu trường bắt buộc: ${field}`);
            }
        }

        // check unique service_name
        const existingService = await ServiceProcess.checkUniqueServiceName(cleanedData.service_name);
        if (existingService) {
            logger.warn('Service name already exists', {
                context: 'ServiceController.create',
                serviceName: cleanedData.service_name
            });
            throw new errorRes.ConflictError('Tên dịch vụ đã tồn tại');
        }

        // check price positive number
        if (cleanedData.price < 0) {
            logger.warn('Price must be a positive number', {
                context: 'ServiceController.create',
                price: cleanedData.price
            });
            throw new errorRes.BadRequestError('Giá phải là số dương');
        }
        // check duration positive number
        if (cleanedData.duration < 0) {
            logger.warn('Duration must be a positive number', {
                context: 'ServiceController.create',
                duration: cleanedData.duration
            });
            throw new errorRes.BadRequestError('Thời lượng phải là số dương');
        }

        // check price > 1000 
        if (cleanedData.price < 1000) {
            logger.warn('Price must be at least 1000', {
                context: 'ServiceController.create',
                price: cleanedData.price
            });
            throw new errorRes.BadRequestError('Giá phải tối thiểu 1000');
        }

        // Gọi service xử lý logic
        const createdService = await ServiceProcess.createService(cleanedData);
        logger.info('Service created successfully', {
            context: 'ServiceController.create',
            serviceId: createdService.id
        });
        return new successRes.CreateSuccess(createdService, 'Tạo dịch vụ thành công').send(res);
    } catch (error) {
        logger.error('Error create service', {
            context: 'ServiceController.create',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

// update Service don't have equipment_service, status
const updateController = async (req, res) => {
    try {
        const { id } = req.params;
        const serviceData = req.body || {};
        logger.debug('Update service request received', {
            context: 'ServiceController.update',
            serviceId: id,
            serviceData: serviceData
        });

        // check id empty
        if (!id) {
            logger.warn('Empty service ID', {
                context: 'ServiceController.update',
                serviceId: id
            });
            throw new errorRes.BadRequestError('Mã dịch vụ là bắt buộc');
        }
        // clean data (cho phép status và equipment_service)
        const cleanedData = cleanObjectData(serviceData);
        if (Object.keys(cleanedData).length === 0) {
            logger.warn('No data provided for update', {
                context: 'ServiceController.update',
                serviceId: id
            });
            throw new errorRes.BadRequestError('Không có dữ liệu để cập nhật');
        }

        // check unique service_name
        if (cleanedData.service_name) {
            const existingService = await ServiceProcess.checkUniqueServiceNameNotId(cleanedData.service_name, id);
            if (existingService) {
                logger.warn('Service name already exists', {
                    context: 'ServiceController.update',
                    serviceId: id,
                    serviceName: cleanedData.service_name
                });
                throw new errorRes.ConflictError('Tên dịch vụ đã tồn tại');
            }
        }
        if (cleanedData.price !== undefined) {
            // check price positive number
            if (cleanedData.price < 0) {
                logger.warn('Price must be a positive number', {
                    context: 'ServiceController.update',
                    serviceId: id,
                    price: cleanedData.price
                });
                throw new errorRes.BadRequestError('Giá phải là số dương');
            }
            // check price > 1000
            if (cleanedData.price < 1000) {
                logger.warn('Price must be at least 1000', {
                    context: 'ServiceController.update',
                    serviceId: id,
                    price: cleanedData.price
                });
                throw new errorRes.BadRequestError('Giá phải tối thiểu 1000');
            }
        }
        if (cleanedData.duration !== undefined) {
            // check duration positive number
            if (cleanedData.duration < 0) {
                logger.warn('Duration must be a positive number', {
                    context: 'ServiceController.update',
                    serviceId: id,
                    duration: cleanedData.duration
                });
                throw new errorRes.BadRequestError('Thời lượng phải là số dương');
            }
        }
        // Gọi service xử lý logic
        const updatedService = await ServiceProcess.updateService(id, cleanedData);
        // QUAN TRỌNG: Kiểm tra nếu ID không tồn tại trong DB
        if (!updatedService) {
            throw new errorRes.NotFoundError('Không tìm thấy dịch vụ');
        }
        logger.info('Service updated successfully', {
            context: 'ServiceController.update',
            serviceId: updatedService.id
        });
        return new successRes.UpdateSuccess(updatedService, 'Cập nhật dịch vụ thành công').send(res);
    } catch (error) {
        logger.error('Error update service', {
            context: 'ServiceController.update',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

// update equipment status only
const updateStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body || {};
        logger.debug('Update service status request received', {
            context: 'ServiceController.updateStatus',
            serviceId: id,
            status: status
        });

        // validate status
        const validStatuses = ["AVAILABLE", "UNAVAILABLE"];
        if (!status || !validStatuses.includes(status)) {
            logger.warn('Invalid or missing status value', {
                context: 'ServiceController.updateStatus',
                status: status
            });
            throw new errorRes.BadRequestError('Giá trị trạng thái không hợp lệ hoặc bị thiếu');
        }

        // update status
        const updatedService = await ServiceProcess.updateService(id, { status });
        logger.debug('Updated service status', {
            context: 'ServiceController.updateStatus',
            service: updatedService
        });
        logger.info('Service status updated successfully', {
            context: 'ServiceController.updateStatus',
            serviceId: updatedService.id
        });

        // QUAN TRỌNG: Kiểm tra nếu ID không tồn tại trong DB
        if (!updatedService) {
            throw new errorRes.NotFoundError('Không tìm thấy dịch vụ');
        }

        // return response update success
        return new successRes.UpdateSuccess(updatedService, 'Cập nhật trạng thái dịch vụ thành công').send(res);
    } catch (error) {
        logger.error('Error update service status', {
            context: 'ServiceController.updateStatus',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};


module.exports = {
    getListController,
    getByIdController,
    createController,
    updateController,
    updateStatusController
};
