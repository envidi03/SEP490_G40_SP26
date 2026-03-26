const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const successRes = require('../../../common/success');
const Pagination = require('../../../common/responses/Pagination');
const { cleanObjectData } = require('../../../common/utils/cleanObjectData');

const EquipmentService = require('../services/equipment.service');

/**
 * Get list of equipments with pagination and filter (Optimized for Nested Array, No $unwind)
 *
 * Query Params:
 * - search: Tìm kiếm theo tên máy, số serial, nhà cung cấp (Cấp độ thiết bị con)
 * - category_status: Lọc theo trạng thái danh mục - ACTIVE, INACTIVE (Cấp độ danh mục cha)
 * - status: Lọc theo trạng thái máy - READY, IN_USE, MAINTENANCE... (Cấp độ thiết bị con)
 * - sort: Sắp xếp (asc/desc) theo tên danh mục (equipment_type)
 * - page: Số trang hiện tại
 * - limit: Số lượng danh mục trên 1 trang
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

/**
 * create equipment (Model mới: Gom nhóm theo equipment_type chứa mảng equipment)
 * - Không cho phép tự truyền purchase_date, maintenance_history, equipments_log
 * * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createEquipment = async (req, res) => {
    const context = 'EquipmentController.createEquipment';
    try {
        const payload = req.body || {};

        // 1. Kiểm tra Dữ liệu cha (equipment_type)
        if (!payload.equipment_type || !payload.equipment_type.trim()) {
            throw new errorRes.BadRequestError("Missing required field: equipment_type");
        }

        // 2. Kiểm tra Dữ liệu con (Mảng thiết bị)
        if (!payload.equipment || !Array.isArray(payload.equipment) || payload.equipment.length === 0) {
            throw new errorRes.BadRequestError("The 'equipment' array is required and must contain at least one item");
        }

        const cleanEquipmentArray = [];
        const serialNumbersInRequest = new Set(); // Dùng để check trùng lặp ngay trong nội bộ request gửi lên

        // 3. Quét và Validate từng thiết bị trong mảng
        for (let i = 0; i < payload.equipment.length; i++) {
            let item = payload.equipment[i];

            // Loại bỏ các field không được phép khởi tạo
            const { purchase_date, maintenance_history, equipments_log, ...dataCreate } = item;

            // Các field bắt buộc theo logic cũ của bạn
            const requiredFields = ['equipment_name', 'equipment_serial_number', 'supplier', 'warranty'];
            for (const field of requiredFields) {
                if (!dataCreate[field] || !String(dataCreate[field]).trim()) {
                    logger.warn(`Missing required field in array`, {
                        context: context,
                        index: i,
                        field: field
                    });
                    throw new errorRes.BadRequestError(`Missing required field '${field}' at item index ${i}`);
                }
            }

            const serialNumber = dataCreate.equipment_serial_number.trim();

            // Check độ dài Serial Number
            if (serialNumber.length < 6 || serialNumber.length > 20) {
                logger.warn('Serial number length is invalid', { context, serial_number: serialNumber });
                throw new errorRes.BadRequestError(`Serial number length must be between 6 and 20 characters at item index ${i}`);
            }

            // Check trùng lặp Serial Number ngay trong chính payload gửi lên (ngăn chặn user gửi 2 cái giống hệt nhau)
            if (serialNumbersInRequest.has(serialNumber)) {
                throw new errorRes.BadRequestError(`Duplicate serial number '${serialNumber}' found in the request payload`);
            }
            serialNumbersInRequest.add(serialNumber);

            // Check trùng lặp Serial Number dưới Database (Phải viết lại hàm check bên Service)
            const existingEquipment = await EquipmentService.checkExitSerialNumber(serialNumber);
            if (existingEquipment) {
                logger.warn('Serial number already exists in DB', { context, serial_number: serialNumber });
                throw new errorRes.ConflictError(`Serial number '${serialNumber}' already exists in the system`);
            }

            cleanEquipmentArray.push(dataCreate);
        }

        // 4. Chuẩn bị Data sạch để gọi Service
        const finalDataCreate = {
            equipment_type: payload.equipment_type.trim(),
            equipment: cleanEquipmentArray
        };

        // 5. Gọi Service tạo/cập nhật dữ liệu
        const equipmentResult = await EquipmentService.createEquipment(finalDataCreate);

        logger.info('Equipment processed successfully', {
            context: context,
            equipmentTypeId: equipmentResult._id
        });

        return new successRes.CreateSuccess(equipmentResult, 'Equipment created successfully').send(res);

    } catch (error) {
        logger.error('Error create equipment', {
            context: context,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

/**
 * Add new equipment items to an existing Equipment Category
 * Client gửi lên ID của Danh mục cha (equipment_type) và mảng các thiết bị muốn thêm vào
 * @param {*} req 
 * @param {*} res 
 */
const addEquipmentItemsController = async (req, res) => {
    const context = 'EquipmentController.addEquipmentItems';
    try {
        const { categoryId } = req.params; // ID của document cha (Equipment Type)
        const payload = req.body || {};

        logger.debug('Add equipment items request received', {
            context: context,
            categoryId: categoryId,
            itemCount: payload.equipment ? payload.equipment.length : 0
        });

        if (!payload.equipment || !Array.isArray(payload.equipment) || payload.equipment.length === 0) {
            throw new errorRes.BadRequestError("The 'equipment' array is required and must contain at least one item");
        }

        const cleanEquipmentArray = [];
        const serialNumbersInRequest = new Set();

        for (let i = 0; i < payload.equipment.length; i++) {
            let item = payload.equipment[i];

            const { purchase_date, maintenance_history, equipments_log, ...dataCreate } = item;

            const requiredFields = ['equipment_name', 'equipment_serial_number', 'supplier', 'warranty'];
            for (const field of requiredFields) {
                if (!dataCreate[field] || !String(dataCreate[field]).trim()) {
                    throw new errorRes.BadRequestError(`Missing required field '${field}' at item index ${i}`);
                }
            }

            const serialNumber = dataCreate.equipment_serial_number.trim();

            if (serialNumber.length < 6 || serialNumber.length > 20) {
                throw new errorRes.BadRequestError(`Serial number length must be between 6 and 20 characters at item index ${i}`);
            }

            if (serialNumbersInRequest.has(serialNumber)) {
                throw new errorRes.BadRequestError(`Duplicate serial number '${serialNumber}' found in the request payload`);
            }
            serialNumbersInRequest.add(serialNumber);

            const existingEquipment = await EquipmentService.checkExitSerialNumber(serialNumber);
            if (existingEquipment) {
                throw new errorRes.ConflictError(`Serial number '${serialNumber}' already exists in the system`);
            }

            cleanEquipmentArray.push(dataCreate);
        }

        const updatedCategory = await EquipmentService.addEquipmentItems(categoryId, cleanEquipmentArray);

        logger.info('New equipment items added successfully', {
            context: context,
            categoryId: categoryId,
            addedCount: cleanEquipmentArray.length
        });

        return new successRes.CreateSuccess(
            updatedCategory, 
            'New equipment items added successfully'
        ).send(res);

    } catch (error) {
        logger.error('Error adding equipment items', {
            context: context,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

/**
 * Update Equipment Category (Parent level: equipment_type, status)
 * Cập nhật tên loại thiết bị hoặc trạng thái của cả nhóm, KHÔNG đụng vào mảng equipment
 * @param {*} req 
 * @param {*} res 
 */
const updateCategoryController = async (req, res) => {
    const context = 'EquipmentController.updateCategory';
    try {
        const { categoryId } = req.params;
        const payload = req.body || {};

        // Whitelist các trường được phép update ở cấp độ cha
        const safeData = {};
        if (payload.equipment_type) safeData.equipment_type = payload.equipment_type.trim();
        if (payload.status) safeData.status = payload.status.trim();

        if (Object.keys(safeData).length === 0) {
            throw new errorRes.BadRequestError('No valid category data provided for update');
        }

        const updatedCategory = await EquipmentService.updateCategory(categoryId, safeData);

        return new successRes.UpdateSuccess(updatedCategory, 'Equipment category updated successfully').send(res);
    } catch (error) {
        logger.error('Error updating equipment category', { context, message: error.message });
        throw error;
    }
};

/**
 * Update Specific Equipment Item (Child level) don't have update purchase_date, status, maintence_history and equiments_logs
 * Cập nhật thông tin của 1 thiết bị cụ thể dựa vào _id của thiết bị đó trong mảng
 * @param {*} req 
 * @param {*} res 
 */
const updateEquipmentItemController = async (req, res) => {
    const context = 'EquipmentController.updateEquipmentItem';
    try {
        const { equipmentId } = req.params; // _id của cái máy cụ thể trong mảng
        const dataUpdate = req.body || {};

        // 1. Dùng Whitelist để tự động loại bỏ purchase_date, maintenance_history...
        const allowedFields = ['equipment_name', 'equipment_serial_number', 'supplier', 'warranty', 'status'];
        const safeData = {};

        for (const field of allowedFields) {
            if (dataUpdate[field] !== undefined) {
                safeData[field] = dataUpdate[field];
            }
        }

        const cleanedData = cleanObjectData(safeData);

        if (Object.keys(cleanedData).length === 0) {
            throw new errorRes.BadRequestError('No valid equipment data provided');
        }

        // 2. Kiểm tra Serial Number (Nếu có thay đổi)
        if (cleanedData.equipment_serial_number) {
            const serial = cleanedData.equipment_serial_number;

            if (serial.length < 6 || serial.length > 20) {
                throw new errorRes.BadRequestError('Serial number length must be between 6 and 20 characters');
            }

            // Gọi hàm check trùng lặp (Đã được viết lại bên Service)
            const isExist = await EquipmentService.checkExitSerialNumberNotId(serial, equipmentId);
            if (isExist) {
                throw new errorRes.ConflictError('Serial number already exists in another equipment');
            }
        }

        // 3. Gọi Service để update
        const updatedDoc = await EquipmentService.updateEquipmentItem(equipmentId, cleanedData);

        return new successRes.UpdateSuccess(updatedDoc, 'Equipment item updated successfully').send(res);
    } catch (error) {
        logger.error('Error updating equipment item', { context, message: error.message });
        throw error;
    }
};

// update equipment status only
const updateEquipmentStatus = async (req, res) => {
    const context = 'EquipmentController.updateEquipmentStatus';
    try {
        const { equipmentId } = req.params;
        const { status } = req.body || {};

        logger.debug('Update equipment status request received', {
            context: context,
            equipmentId: equipmentId,
            status: status
        });

        // validate status
        const validStatuses = ["READY", "IN_USE", "MAINTENANCE", "REPAIRING", "FAULTY", "STERILIZING"];

        if (!status || !validStatuses.includes(status)) {
            logger.warn('Invalid or missing status value', {
                context: context,
                status: status
            });
            throw new errorRes.BadRequestError('Invalid or missing status value');
        }

        // Gọi đúng tên hàm Service là updateEquipmentItem
        const updatedEquipment = await EquipmentService.updateEquipmentItem(equipmentId, { status });

        logger.info('Equipment status updated successfully', {
            context: context,
            equipmentId: equipmentId // Sử dụng ID truyền vào thay vì updatedEquipment.id (tránh lỗi null)
        });

        // return response update success
        return new successRes.UpdateSuccess(
            updatedEquipment,
            'Equipment status updated successfully'
        ).send(res);

    } catch (error) {
        logger.error('Error update equipment status', {
            context: context,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

// report equipment incident
const reportIncident = async (req, res) => {
    try {
        const { equipmentId } = req.params;
        const incidentData = req.body || {};

        logger.debug('Report equipment incident request received', {
            context: 'EquipmentController.reportIncident',
            equipmentId: equipmentId,
            incidentData: incidentData
        });

        // 1. Basic validation
        if (!incidentData.issue_type || !incidentData.severity || !incidentData.description) {
            throw new errorRes.BadRequestError('Missing required incident reporting fields');
        }

        // 2. Map frontend types to backend enums if necessary
        // Frontend uses: malfunction, maintenance, broken, missing, other
        // Backend uses: MALFUNCTION, MAINTENANCE, BROKEN, MISSING, OTHER
        const mappedData = {
            ...incidentData,
            issue_type: incidentData.issue_type.toUpperCase(),
            severity: incidentData.severity.toUpperCase(),
            reported_by: req.user?._id // Assuming auth middleware provides req.user
        };

        const updatedEquipment = await EquipmentService.reportIncident(equipmentId, mappedData);

        logger.info('Equipment incident reported successfully', {
            context: 'EquipmentController.reportIncident',
            equipmentId: updatedEquipment.id
        });

        return new successRes.UpdateSuccess(updatedEquipment, 'Equipment incident reported successfully').send(res);
    } catch (error) {
        logger.error('Error report equipment incident', {
            context: 'EquipmentController.reportIncident',
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
    updateEquipmentItemController,
    updateCategoryController,
    updateEquipmentStatus,
    reportIncident,
    addEquipmentItemsController
};
