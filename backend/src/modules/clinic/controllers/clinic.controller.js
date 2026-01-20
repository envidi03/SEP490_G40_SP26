const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const successRes = require('../../../common/success');
const { default: Pagination } = require('../../../common/responses/Pagination');

const clinicService = require('../services/clinic.service');

const updateClinic = async (req, res) => {
    try {
        logger.info('Attempting to update clinic');

        // Implementation here
    } catch (error) {
        logger.error('Error updating clinic:', error);
    }
};

const getInforClinics = async (req, res) => {
    try {
        logger.info('Fetching data clinic');
        const clinicId = req.user.clinicId;
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