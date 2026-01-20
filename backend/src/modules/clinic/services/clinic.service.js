const logger = require('../../../common/utils/logger');

const Clinic = require('../models/clinic.model');
const getInforClinics = async (id) => {
    try {
        logger.debug('Fetching clinic data for ID:', id);
        const clinic = await Clinic.findById(id).select('-__v -createdAt -updatedAt');
        logger.debug('Clinic data in service:', JSON.stringify(clinic));
        return clinic;
    } catch (error) {
        logger.error('Error in getInforClinics service:', error);
        throw error;
    }
};

module.exports = { getInforClinics };