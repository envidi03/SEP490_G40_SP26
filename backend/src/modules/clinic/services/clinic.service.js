const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors"); // Thêm import custom errors
const Clinic = require("../models/clinic.model");

const getInforClinics = async (id) => {
  try {
    if (!id) {
      logger.warn("No clinic ID provided to getInforClinics service");
      throw new errorRes.BadRequestError("ID phòng khám là bắt buộc");
    }

    const clinic = await Clinic.findById(id).select("-__v -createdAt -updatedAt");
    
    if (!clinic) {
        throw new errorRes.NotFoundError("Không tìm thấy thông tin phòng khám");
    }

    // Sửa lỗi Template Literals biến object thành [object Object]
    logger.debug("Clinic data retrieved in service", { clinic });
    
    return clinic;
  } catch (error) {
    if (['NotFoundError', 'BadRequestError'].includes(error.name)) throw error;
    
    logger.error("Error in getInforClinics service", {
        message: error.message,
        stack: error.stack
    });
    throw error;
  }
};

const updateClinic = async (clinicId, updateData) => {
  try {
    logger.info("Updating clinic in service", { clinicId });
    
    const updatedClinic = await Clinic.findByIdAndUpdate(clinicId, updateData, {
      new: true,
      runValidators: true,
    });

    // Fix lỗ hổng: Bắt buộc kiểm tra null nếu ID không tồn tại trong DB
    if (!updatedClinic) {
        throw new errorRes.NotFoundError("Không tìm thấy thông tin phòng khám để cập nhật");
    }

    // Sửa lỗi Template Literals
    logger.debug("Updated clinic data in service", { updatedClinic });
    
    return updatedClinic;
  } catch (error) {
    if (error.name === 'NotFoundError') throw error;
    
    logger.error("Error in updateClinic service", {
        message: error.message,
        stack: error.stack
    });
    throw error;
  }
};

const getAllClinics = async () => {
  try {
    logger.info("Fetching all clinics in service");
    const clinics = await Clinic.find().select("-__v -createdAt -updatedAt");
    return clinics;
  } catch (error) {
    logger.error("Error in getAllClinics service", {
        message: error.message,
        stack: error.stack
    });
    throw error;
  }
};

module.exports = { getInforClinics, updateClinic, getAllClinics };