const logger = require('../../../common/utils/logger');

const Clinic = require('../models/clinic.model');
const getInforClinics = async (id) => {
    try {
        if (!id) {
            logger.warn('No clinic ID provided to getInforClinics service');
            return null;
        }
        const clinic = await Clinic.findById(id).select('-__v -createdAt -updatedAt');
        logger.debug('Clinic data in service:', JSON.stringify(clinic));
        return clinic;
    } catch (error) {
        logger.error('Error in getInforClinics service:', error);
        throw error;
    }
};

module.exports = { getInforClinics };