const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const successRes = require('../../../common/success');
const Pagination = require('../../../common/responses/Pagination');
const { cleanObjectData } = require('../../../common/utils/cleanObjectData');

const Equipment = require('../models/equipment.model');
const EquipmentService = require('../services/equipment.service');

/*
    get list equipments with pagination and filter 
    (
        search: search by equipment_name, equipment_serial_number, supplier; 
        filter: filter by equipment_type, status; 
        sort: sort by equipment_name
        page 
        limit
    )
*/
const getEquipments = async (req, res) => {
    try {
        const queryParams = req.query;
        logger.debug('Get equipments request received', {
            context: 'EquipmentController.getEquipments',
            query: queryParams
        });
        // get data from service
        const { data, pagination } = await EquipmentService.getEquipments(queryParams);
        logger.debug('Equipments retrieved successfully', {
            context: 'EquipmentController.getEquipments',
            data: data,
            pagination: pagination
        });
        // create pagination object
        const page = new Pagination({
            page: pagination.page,
            size: pagination.size,
            totalItems: pagination.totalItems,
        });
        const statistics = await EquipmentService.getStatistics();
        
        return new successRes.GetListSuccess(data, page, 'Equipments retrieved successfully', statistics).send(res);
    } catch (error) {
        logger.error('Error get equipment', {
            context: 'EquipmentController.getEquipments',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

/*
    get equipment by id with 
        filter maintence_history 
        (
            filter_maintence_history: {maintence_start_date, maintence_end_date}
            sort_maintence_history: maintence_date
            page_maintence_history  
            limit_maintence_history
        )

        filter equipments_logs
        (
            filter_equipments_logs: {usage_start_date, usage_end_date}
            sort_equipments_logs: usage_date
            page_equipments_logs  
            limit_equipments_logs
        )
*/
const getEquipmentById = async (req, res) => {
    try {
        const { equipmentId } = req.params;
        const queryParams = req.query;
        logger.debug('Get equipment by id request received', {
            context: 'EquipmentController.getEquipmentById',
            equipmentId: equipmentId,
            query: queryParams
        });
        // get data from service
        const equipment = await EquipmentService.getEquipmentById(equipmentId, queryParams);
        logger.debug('Equipment retrieved successfully', {
            context: 'EquipmentController.getEquipmentById',
            equipment: equipment
        });
        // return success response
        return new successRes.GetDetailSuccess(equipment, 'Equipment retrieved successfully').send(res);
    } catch (error) {
        logger.error('Error get equipment by id', {
            context: 'EquipmentController.getEquipmentById',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

// create equipment don't have purchase_date, maintence_history and equiments_logs
const createEquipment = async (req, res) => {
    try {
        const equipmentData = req.body || {};
        // Validate and clean data
        const cleanedData = cleanObjectData(equipmentData, Equipment.createFields);
        logger.debug('Equipment created successfully', {
            context: 'EquipmentController.createEquipment',
            data: cleanedData
        });
        // Remove purchase_date, maintenance_history and equipments_log from the data to be created
        const { purchase_date, maintenance_history, equipments_log, ...dataCreate } = cleanedData;
        // check required fields
        const requiredFields = ['equipment_name', 'equipment_type', 'equipment_serial_number', 'supplier', 'warranty'];
        for (const field of requiredFields) {
            if (!(dataCreate[field].trim())) {
                logger.warn(`Missing required field`, {
                    context: 'EquipmentController.createEquipment',
                    field: field
                });
                throw new errorRes.BadRequestError(`Missing required field: ${field}`);
            }
        }
        // check unique serial_number
        const existingEquipment = await EquipmentService.checkExitSerialNumber(dataCreate.equipment_serial_number);
        if (existingEquipment) {
            logger.warn('Serial number already exists', {
                context: 'EquipmentController.createEquipment',
                serial_number: dataCreate.equipment_serial_number
            });
            throw new errorRes.ConflictError('Serial number already exists');
        }
        // check lengh of serial_number from 6 to 20
        if (dataCreate.equipment_serial_number.length < 6 || dataCreate.equipment_serial_number.length > 20) {
            logger.warn('Serial number length is invalid', {
                context: 'EquipmentController.createEquipment',
                serial_number: dataCreate.equipment_serial_number
            });
            throw new errorRes.BadRequestError('Serial number length must be between 6 and 20 characters');
        }
        // crate data
        const equipment = await EquipmentService.createEquipment(dataCreate);
        logger.info('Equipment created successfully', {
            context: 'EquipmentController.createEquipment',
            equipmentId: equipment.id
        });
        logger.debug('Created equipment details', {
            context: 'EquipmentController.createEquipment',
            equipment: equipment
        });
        // return new success response
        return new successRes.CreateSuccess(equipment, 'Equipment created successfully').send(res);
    } catch (error) {
        logger.error('Error create equipment', {
            context: 'EquipmentController.createEquipment',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};
// update equipment don't have purchase_date, status, maintence_history and equiments_logs
const updateEquipment = async (req, res) => {
    try {
        const { equipmentId } = req.params;
        const equipmentData = req.body || {};
        // remove purchase_date, status, maintenance_history and equipments_log from the data to be updated
        const { purchase_date, status, maintenance_history, equipments_log, ...dataUpdate } = cleanObjectData(equipmentData, Equipment.createFields);
        // check field is empty
        if (Object.keys(dataUpdate).length === 0) {
            logger.warn('No equipment data provided in request body', {
                context: 'EquipmentController.updateEquipment'
            });
            throw new errorRes.BadRequestError('No equipment data provided');
        }
        // check unique serial_number and not belong to this equipment
        if (dataUpdate.equipment_serial_number) {
            const existingEquipment = await EquipmentService.checkExitSerialNumberNotId(dataUpdate.equipment_serial_number);
            if (existingEquipment && existingEquipment.id !== equipmentId) {
                logger.warn('Serial number already exists', {
                    context: 'EquipmentController.updateEquipment',
                    serial_number: dataUpdate.equipment_serial_number
                });
                throw new errorRes.ConflictError('Serial number already exists');
            }
            // check lengh of serial_number from 6 to 20
            if (dataUpdate.equipment_serial_number.length < 6 || dataUpdate.equipment_serial_number.length > 20) {
                logger.warn('Serial number length is invalid', {
                    context: 'EquipmentController.updateEquipment',
                    serial_number: dataUpdate.equipment_serial_number
                });
                throw new errorRes.BadRequestError('Serial number length must be between 6 and 20 characters');
            }
        }
        const updatedEquipment = await EquipmentService.updateEquipment(equipmentId, dataUpdate);
        logger.debug('Updated equipment details', {
            context: 'EquipmentController.updateEquipment',
            equipment: updatedEquipment
        });
        logger.info('Equipment updated successfully', {
            context: 'EquipmentController.updateEquipment',
            equipmentId: updatedEquipment.id
        });
        return new successRes.UpdateSuccess(updatedEquipment, 'Equipment updated successfully').send(res);
    } catch (error) {
        logger.error('Error update equipment', {
            context: 'EquipmentController.updateEquipment',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

// update equipment status only
const updateEquipmentStatus = async (req, res) => {
    try {
        const { equipmentId } = req.params;
        const { status } = req.body || {};
        logger.debug('Update equipment status request received', {
            context: 'EquipmentController.updateEquipmentStatus',
            equipmentId: equipmentId,
            status: status
        });
        // validate status
        const validStatuses = ["READY", "IN_USE", "MAINTENANCE", "REPAIRING", "FAULTY", "STERILIZING"];
        if (!status || !validStatuses.includes(status)) {
            logger.warn('Invalid or missing status value', {
                context: 'EquipmentController.updateEquipmentStatus',
                status: status
            });
            throw new errorRes.BadRequestError('Invalid or missing status value');
        }
        // update status
        const updatedEquipment = await EquipmentService.updateEquipment(equipmentId, { status });
        logger.debug('Updated equipment status', {
            context: 'EquipmentController.updateEquipmentStatus',
            equipment: updatedEquipment
        });
        logger.info('Equipment status updated successfully', {
            context: 'EquipmentController.updateEquipmentStatus',
            equipmentId: updatedEquipment.id
        });
        // return response update success
        return new successRes.UpdateSuccess(updatedEquipment, 'Equipment status updated successfully').send(res);
    } catch (error) {
        logger.error('Error update equipment status', {
            context: 'EquipmentController.updateEquipmentStatus',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};


module.exports = {
    createEquipment,
    getEquipments,
    getEquipmentById,
    updateEquipment,
    updateEquipmentStatus
};
