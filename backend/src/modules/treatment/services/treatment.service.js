const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const mongoose = require("mongoose");

const model = require("../models/index.model");
const { service: AppointmentService } = require("./../../appointment/index");

/**
 * get treatment by id populate medicine_usage.medicine_id
 * @param {ObjectId} id Treatment ID to find
 * @returns return treatment object if found, otherwise throw NotFoundError
 * @throws NotFoundError if treatment with given ID is not found
 * @throws InternalServerError if any error occurs during database operation
 * @description This function retrieves a treatment by its ID. It validates the ID format, checks if the treatment exists, and returns the treatment data. If the treatment is not found or if any error occurs, it throws appropriate errors.
 */
const getByIdService = async (id) => {
    const context = "TreatmentService.getByIdService";
    try {
        logger.debug("Fetching treatment by id", {
            context: context,
            treatmentId: id,
        });

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new errorRes.BadRequestError("Invalid Treatment ID format");
        }

        const treatment = await model.Treatment.findById(id)
            .populate("medicine_usage.medicine_id")
            .populate("record_id")
            .lean();

        if (!treatment) {
            logger.warn("Treatment not found", {
                context: context,
                treatmentId: id,
            });
            throw new errorRes.NotFoundError("Treatment not found");
        }
        return treatment;

    } catch (error) {
        logger.error("Error getting treatment by id", {
            context: context,
            message: error.message,
            stack: error.stack,
        });

        if (error.statusCode) throw error;

        throw new errorRes.InternalServerError(
            `An error occurred while fetching treatment by id: ${error.message}`
        );
    }
};

const createService = async (dataCreate) => {
    const context = "TreatmentService.createService";
    try {
        logger.debug("Raw data to create treatment", {
            context: context,
            dataCreate: dataCreate,
        });

        const newData = await model.Treatment.create(dataCreate);
        return newData;
    } catch (error) {
        logger.error("Error at create new treatment.", {
            context: context,
            message: error.message,
            stack: error.stack,
        });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`Error creating treatment: ${error.message}`);
    }
};

/**
 * update treatment by id
 * @param {*} treatmentId id of treatment to update
 * @param {*} data data to update, excluding 'status' and foreign keys
 */
const updateService = async (treatmentId, data) => {
    const context = "TreatmentService.updateService";
    try {
        logger.debug("Raw data to update treatment", {
            context: context,
            treatmentId: treatmentId,
            data: data,
        });

        const existingTreatment = await findById(treatmentId);
        if (!existingTreatment) {
            throw new errorRes.NotFoundError("Treatment not found");
        }

        if (existingTreatment.status === 'DONE' || existingTreatment.status === 'CANCELLED') {
            throw new errorRes.BadRequestError(`Cannot update treatment because it is already ${existingTreatment.status}`);
        }

        const dataUpdate = await model.Treatment.findByIdAndUpdate(
            treatmentId,
            data,
            { new: true, runValidators: true }
        );

        return dataUpdate;

    } catch (error) {
        logger.error("Error at update treatment.", {
            context: context,
            treatmentId: treatmentId,
            message: error.message,
            stack: error.stack,
        });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`Error updating treatment: ${error.message}`);
    }
};
/**
 * get data raw treatment by id
 * @param {ObjectId} id treatment id to find
 * @returns treatment object or null if not found
 */
const findById = async (id) => {
    try {
        const data = await model.Treatment.findById(id);
        return data || null;
    } catch (error) {
        logger.error("Error finding treatment by id", {
            context: "TreatmentService.findById",
            treatmentId: id,
            message: error.message,
            stack: error.stack,
        });
        return null;
    }
}

/**
 * Update only status of treatment - cannot update status if current status is CANCELLED or DONE
 * if status treatment is WAITING_APPROVAL, system will auto change status appointment to COMPLETED
 * @param {ObjectId} id treatment id to find
 * @param {string} status the new status to set
 * @returns treatment object or null if not found
 */
const updateStatusOnly = async (id, status) => {
    try {
        const treatment = await findById(id);
        if (!treatment) {
            throw new errorRes.NotFoundError("Treatment not found");
        }
        if (treatment.status === status) {
            return treatment;
        }
        if (treatment.status === 'CANCELLED' || treatment.status === 'DONE') {
            throw new errorRes.BadRequestError(`Cannot change status from ${treatment.status}`);
        }

        if (status === "WAITING_APPROVAL") {
            const appoint = await AppointmentService.findByTreatmentId(treatment._id);
            if (appoint.status !== "COMPLETED") {
                if (!appoint) {
                    logger.warn("Appointment not found by treatment", {
                        context: "TreatmentService.updateStatusOnly",
                        treatment: treatment
                    });
                    throw new errorRes.NotFoundError("Không tìm thấy lịch khám để cập nhật.");
                }
                await AppointmentService.updateStatusOnly(appoint._id, "COMPLETED");
            }
        }

        if (status === "APPROVED") status = "DONE";

        const dataUpdate = { status };
        if (status === "IN_PROGRESS") {
            dataUpdate.phase = "SESSION";
        }
        const newData = await model.Treatment.findByIdAndUpdate(
            id,
            dataUpdate,
            { new: true }
        ).populate('patient_id', 'full_name');

        // Gửi thông báo cho Dược sĩ nếu Ca khám đã XONG và Bác sĩ có kê đơn thuốc
        if (status === 'DONE' && newData.medicine_usage && newData.medicine_usage.length > 0) {
            try {
                const notificationService = require('../../notification/service/notification.service');
                const patientName = newData.patient_id?.full_name || 'Khách hàng';
                await notificationService.sendToRole(['PHARMACIST'], {
                    type: 'NEW_PRESCRIPTION',
                    title: 'Đơn thuốc mới cần chuẩn bị',
                    message: `Bác sĩ vừa kê đơn thuốc mới cho bệnh nhân ${patientName}. Vui lòng kiểm tra và chuẩn bị thuốc.`,
                    action_url: `/pharmacy/prescriptions`
                });
            } catch (err) {
                logger.error("Lỗi gửi thông báo Đơn thuốc mới cho Dược sĩ:", { message: err.message });
            }
        }

        return newData;
    } catch (error) {
        logger.error("Error updating treatment status.", {
            context: "TreatmentService.updateStatusOnly",
            treatmentId: id,
            status: status,
            message: error.message
        });
        if (error.statusCode) throw error;
        throw new errorRes.InternalServerError(`Update fails: ${error.message}`);
    }
};

/**
 * get list treatement with appointment_id is null with filter
 * (
 *  search: search by full_name(patient name on dental record), record_name (dental record name), 
 *  filter_date: filter treatement lte planned_date 
 *  sort: sort by planned_date, default is desc
 * )
 */
const getListTreatementWithAppointmentNull = async (query) => {
    const context = "TreatmentService.getListTreatementWithAppointmentNull";
    try {
        logger.debug("Fetching treatments with appointment_id = null", { context, query });

        // 1. Chuẩn hóa tham số query
        const search = query.search?.trim();
        const filterDate = query.filter_date;
        const filterStatus = query.status || "PLANNED";
        const sortOrder = query.sort === "desc" ? -1 : 1; 
        const page = Math.max(1, parseInt(query.page || 1));
        const limit = Math.max(1, parseInt(query.limit || 10));
        const skip = (page - 1) * limit;

        // 2. Điều kiện Match ở vòng 1 (Lọc ngay trên bảng Treatment)
        const initialMatch = {
            appointment_id: null,
            status: filterStatus
        };

        if (filterDate) {
            const startOfToday = new Date(); 
            startOfToday.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(filterDate);
            endOfDay.setUTCHours(23, 59, 59, 999);

            initialMatch.planned_date = { 
                $gte: startOfToday, 
                $lte: endOfDay 
            };
        }

        // 3. Xây dựng Aggregation Pipeline
        const pipeline = [
            // Bước 1: Lọc dữ liệu thô từ bảng Treatment
            { $match: initialMatch },

            // Bước 2: Lookup lấy thông tin Dental Record (Kết quả trả về là 1 MẢNG record_info)
            // (Thao tác này tương đương với populate record_id)
            {
                $lookup: {
                    from: "dental_records", 
                    localField: "record_id",
                    foreignField: "_id",
                    as: "record_info"
                }
            }
        ];

        // Bước 3: Áp dụng điều kiện Search
        if (search) {
            const regexSearch = { $regex: search, $options: "i" };
            pipeline.push({
                $match: {
                    $or: [
                        { "record_info.full_name": regexSearch },
                        { "record_info.record_name": regexSearch }
                    ]
                }
            });
        }

        // Bước 4: Flatten mảng record_info thành Object
        pipeline.push({
            $addFields: {
                record_info: { $arrayElemAt: ["$record_info", 0] }
            }
        });

        // Bước 5: Sắp xếp
        pipeline.push({ $sort: { planned_date: sortOrder } });

        // Bước 6: Phân trang (Facet) và Lookup thêm Doctor + Profile
        pipeline.push({
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    
                    // --- LOOKUP DOCTOR ---
                    {
                        $lookup: {
                            from: "staffs", 
                            localField: "doctor_id",
                            foreignField: "_id",
                            as: "doctor_info"
                        }
                    },
                    // Flatten mảng doctor_info thành Object
                    {
                        $addFields: {
                            doctor_info: { $arrayElemAt: ["$doctor_info", 0] }
                        }
                    },

                    // --- LOOKUP PROFILE CỦA DOCTOR ---
                    // (Thao tác này tương đương với việc populate profile_id bên trong doctor_info)
                    {
                        $lookup: {
                            from: "profiles",
                            localField: "doctor_info.profile_id", // Trỏ vào profile_id bên trong doctor_info vừa tạo
                            foreignField: "_id",
                            as: "doctor_profile" // Tạm thời để ở 1 mảng riêng
                        }
                    },
                    // Gắn đè mảng doctor_profile thành dạng object lồng vào bên trong doctor_info
                    {
                        $addFields: {
                            "doctor_info.profile": { $arrayElemAt: ["$doctor_profile", 0] }
                        }
                    },
                    
                    // --- DỌN DẸP DỮ LIỆU THỪA ---
                    {
                        $project: {
                            __v: 0,
                            doctor_profile: 0, // Ẩn mảng tạm dùng để chứa profile
                            "record_info.__v": 0,
                            "doctor_info.__v": 0,
                            "doctor_info.profile.__v": 0,
                            "doctor_info.password": 0 // Che password nếu có
                        }
                    }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        });

        // 4. Thực thi truy vấn
        const result = await model.Treatment.aggregate(pipeline);

        const treatments = result[0]?.data || [];
        const totalItems = result[0]?.totalCount[0]?.count || 0;

        return {
            data: treatments,
            pagination: {
                page: page,
                size: limit,
                totalItems: totalItems,
                totalPages: Math.ceil(totalItems / limit)
            }
        };

    } catch (error) {
        logger.error("Error cannot get list treatment with appointment is null", {
            context: context,
            query: query,
            error: error.message
        });
        
        throw new errorRes.InternalServerError(
            `Failed to fetch treatments without appointment: ${error.message}`
        );
    }
};

const addAppointmentIdOnTreatment = async (treatmentId, appointmentId, session) => {
    const context = "TreatmentService.AddAppointmentIdOnTreatment";
    try {
        const treatmentUpdate = await model.Treatment.findByIdAndUpdate(
            treatmentId,
            { appointment_id: appointmentId, phase: 'SESSION' },
            { new: true, session: session } 
        );
        
        if (!treatmentUpdate) {
            throw new errorRes.NotFoundError("Can't find treatment by id to update.");
        }
        
        return treatmentUpdate;
    } catch (error) {
        logger.error("Error cannot add appointment_id into treatment", {
            context: context,
            treatmentId: treatmentId,
            appointmentId: appointmentId,
            error: error.message,
            stack: error.stack
        });
        if (error.statusCode) {
            throw error;
        }
        throw new errorRes.InternalServerError("Error cannot add appointment_id on treatment.");
    }
}

module.exports = {
    getByIdService,
    createService,
    updateService,
    updateStatusOnly,
    getListTreatementWithAppointmentNull,
    addAppointmentIdOnTreatment
};
