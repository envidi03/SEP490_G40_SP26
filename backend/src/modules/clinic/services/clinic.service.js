const logger = require("../../../common/utils/logger");

const Clinic = require("../models/clinic.model");
const getInforClinics = async (id) => {
  try {
    if (!id) {
      logger.warn("No clinic ID provided to getInforClinics service");
      return null;
    }
    const clinic = await Clinic.findById(id).select(
      "-__v -createdAt -updatedAt",
    );
    logger.debug(`Clinic data in service: ${(clinic)}`);
    return clinic;
  } catch (error) {
    logger.error(`Error in getInforClinics service: ${error}`);
    throw error;
  }
};

const updateClinic = async (clinicId, updateData) => {
  try {
    logger.info("Updating clinic in service");
    const updatedClinic = await Clinic.findByIdAndUpdate(clinicId, updateData, {
      new: true,
      runValidators: true,
    });
    logger.debug(`Updated clinic data in service: ${(updatedClinic)}`);
    return updatedClinic;
  } catch (error) {
    logger.error(`Error in updateClinic service: ${error}`);
    throw error;
  }
};

const getAllClinics = async () => {
  try {
    const clinics = await Clinic.find().select("-__v -createdAt -updatedAt");
    return clinics;
  } catch (error) {
    logger.error(`Error in getAllClinics service: ${error}`);
    throw error;
  }
};

module.exports = { getInforClinics, updateClinic, getAllClinics };
