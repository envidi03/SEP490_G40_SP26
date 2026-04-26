const logger = require('../../../common/utils/logger');
const successRes = require('../../../common/success');

const PatientService = require('../service/patient.service');

const getListController = async (req, res) => {
    try {
        logger.debug('Get patient list request', {
            context: 'PatientController.getListController',
            query: req.query
        });

        const { data, pagination } = await PatientService.getListService(req.query);

        return new successRes.GetListSuccess(
            data,
            pagination,
            'Lấy danh sách bệnh nhân thành công'
        ).send(res);

    } catch (error) {
        logger.error('Error get patient list', {
            context: 'PatientController.getListController',
            message: error.message,
        });
        throw error;
    }
};

// GET /api/patient/:id
const getByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        logger.debug('Get patient by id request', {
            context: 'PatientController.getByIdController',
            id
        });

        const patient = await PatientService.getPatientById(id);

        return new successRes.GetDetailSuccess(
            patient,
            'Lấy thông tin bệnh nhân thành công'
        ).send(res);

    } catch (error) {
        logger.error('Error get patient by id', {
            context: 'PatientController.getByIdController',
            message: error.message,
        });
        throw error;
    }
};

// POST /api/patient
const createController = async (req, res) => {
    try {
        const data = req.body || {};
        logger.debug('Create patient request', {
            context: 'PatientController.createController',
            data
        });

        const patient = await PatientService.createPatientService(data);

        return new successRes.CreateSuccess(
            patient,
            'Tạo bệnh nhân thành công'
        ).send(res);

    } catch (error) {
        logger.error('Error create patient', {
            context: 'PatientController.createController',
            message: error.message,
        });
        throw error;
    }
};

// PUT /api/patient/:id
const updateController = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body || {};
        logger.debug('Update patient request', {
            context: 'PatientController.updateController',
            id, data
        });

        if (Object.keys(data).length === 0) {
            throw new errorRes.BadRequestError('Không có dữ liệu được cung cấp');
        }

        const patient = await PatientService.updatePatientService(id, data);

        return new successRes.UpdateSuccess(
            patient,
            'Cập nhật bệnh nhân thành công'
        ).send(res);

    } catch (error) {
        logger.error('Error update patient', {
            context: 'PatientController.updateController',
            message: error.message,
        });
        throw error;
    }
};

module.exports = { getListController, getByIdController, createController, updateController };
