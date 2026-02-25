const logger = require("../../../common/utils/logger");
const errorRes = require("../../../common/errors");
const mongoose = require("mongoose");
const Pagination = require("../../../common/responses/Pagination");

const StaffModel = require("../models/index.model");
const { Model: AuthModel } = require("../../../modules/auth/index");
const bcrypt = require('bcrypt');
const leaveRequestModel = require("../models/leaveRequest.model");

/*
    get list with infor (
        account: -password, -role_id, -email_verifiled, -__v
        profile: -status, -__v
    ) with pagination and filter 
    (
        search: search by username, phone_number, email, full_name, address; 
        filter: filter by gender; 
        sort: sort by full_name
        page 
        limit
    )
*/
const getListService = async (query) => {
    try {
        const search = query.search?.trim();
        const genderFilter = query.filter;
        const sortOrder = query.sort === "desc" ? -1 : 1;
        const page = Math.max(1, parseInt(query.page || 1));
        const limit = Math.max(1, parseInt(query.limit || 5));
        const skip = (page - 1) * limit;

        logger.debug("Fetching staff list with query (No Unwind)", {
            context: "StaffService.getListService",
            query: query,
        });

        const pipeline = [
            // 1. JOIN BẢNG ACCOUNT
            {
                $lookup: {
                    from: "accounts",
                    localField: "account_id",
                    foreignField: "_id",
                    as: "account_info"
                }
            },
            // Thay thế $unwind: Lấy phần tử đầu tiên của mảng (vì quan hệ là 1-1)
            {
                $addFields: {
                    account_info: { $arrayElemAt: ["$account_info", 0] }
                }
            },

            // 2. JOIN BẢNG PROFILE
            {
                $lookup: {
                    from: "profiles",
                    localField: "profile_id",
                    foreignField: "_id",
                    as: "profile_info"
                }
            },
            // Thay thế $unwind: Lấy phần tử đầu tiên của mảng
            {
                $addFields: {
                    profile_info: { $arrayElemAt: ["$profile_info", 0] }
                }
            }
        ];

        // 3. ĐIỀU KIỆN LỌC (MATCH)
        const matchCondition = {};

        if (genderFilter) {
            matchCondition["profile_info.gender"] = genderFilter;
        }

        if (search) {
            const regexSearch = { $regex: search, $options: "i" };
            matchCondition.$or = [
                { "account_info.username": regexSearch },
                { "account_info.email": regexSearch },
                { "account_info.phone_number": regexSearch },
                { "profile_info.full_name": regexSearch },
                { "profile_info.address": regexSearch }
            ];
        }

        if (Object.keys(matchCondition).length > 0) {
            pipeline.push({ $match: matchCondition });
        }

        // 4. SẮP XẾP VÀ PHÂN TRANG (FACET)
        pipeline.push({
            $facet: {
                data: [
                    { $sort: { "profile_info.full_name": sortOrder } },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            _id: 1,
                            work_start: 1,
                            work_end: 1,
                            status: 1,

                            // Chỉ định rõ các trường CẦN LẤY cho Account 
                            // (Tự động loại bỏ password, role_id, email_verified, __v)
                            account: {
                                _id: "$account_info._id",
                                username: "$account_info.username",
                                email: "$account_info.email",
                                phone_number: "$account_info.phone_number",
                                status: "$account_info.status",
                                createdAt: "$account_info.createdAt",
                                updatedAt: "$account_info.updatedAt"
                            },

                            // Chỉ định rõ các trường CẦN LẤY cho Profile 
                            // (Tự động loại bỏ status, __v)
                            profile: {
                                _id: "$profile_info._id",
                                full_name: "$profile_info.full_name",
                                address: "$profile_info.address",
                                gender: "$profile_info.gender",
                                dob: "$profile_info.dob",
                                avatar_url: "$profile_info.avatar_url",
                                createdAt: "$profile_info.createdAt",
                                updatedAt: "$profile_info.updatedAt"
                            }
                        }
                    }
                ],
                totalCount: [{ $count: "count" }]
            }
        });

        // 5. THỰC THI
        const result = await StaffModel.Staff.aggregate(pipeline);

        const staffs = result[0]?.data || [];
        const totalItems = result[0]?.totalCount[0]?.count || 0;

        return {
            data: staffs,
            pagination: {
                page: page,
                size: limit,
                totalItems: totalItems
            }
        };

    } catch (error) {
        logger.error("Error getting staff list", {
            context: "StaffService.getListService",
            message: error.message,
            stack: error.stack
        });
        throw new errorRes.InternalServerError(
            `An error occurred while fetching staff: ${error.message}`
        );
    }
};

/*
    get infor (
        account: -password, -role_id, -email_verifiled, -__v
        profile: -status, -__v
        staff: -__v, -status
        license: -__v
    ) by staffId
*/
const getByIdService = async (staffId, query) => {
    try {
        logger.debug("Fetching staff by id", {
            context: "StaffService.getByIdService",
            staffId: staffId,
            query: query,
        });

        // --- 1. KIỂM TRA ĐỊNH DẠNG ID ---
        if (!mongoose.Types.ObjectId.isValid(staffId)) {
            throw new errorRes.BadRequestError("Invalid Staff ID format");
        }

        // --- 2. AGGREGATION PIPELINE ---
        const aggregateResult = await StaffModel.Staff.aggregate([
            // 2.1 Tìm Staff theo ID
            {
                $match: { _id: new mongoose.Types.ObjectId(staffId) }
            },
            // 2.2 JOIN bảng Account (Quan hệ 1-1)
            {
                $lookup: {
                    from: "accounts",
                    localField: "account_id",
                    foreignField: "_id",
                    as: "account"
                }
            },
            {
                $addFields: { account: { $arrayElemAt: ["$account", 0] } }
            },
            // 2.3 JOIN bảng Profile (Quan hệ 1-1)
            {
                $lookup: {
                    from: "profiles",
                    localField: "profile_id",
                    foreignField: "_id",
                    as: "profile"
                }
            },
            {
                $addFields: { profile: { $arrayElemAt: ["$profile", 0] } }
            },
            // 2.4 JOIN bảng License (Quan hệ 1-N) -> Giữ nguyên kết quả là mảng
            {
                $lookup: {
                    from: "licenses",
                    localField: "_id",
                    foreignField: "doctor_id",
                    as: "licenses" // Đổi tên thành số nhiều để thể hiện đây là một List
                }
            },
            // ĐÃ BỎ BƯỚC $addFields ($arrayElemAt) ở đây để licenses giữ nguyên là một mảng (List)
            // --- 3. FORMAT DỮ LIỆU TRẢ VỀ ($project) ---
            {
                $project: {
                    // Loại bỏ trường của Staff
                    "__v": 0,
                    "status": 0,
                    // Loại bỏ trường của Account
                    "account.password": 0,
                    "account.role_id": 0,
                    "account.email_verified": 0,
                    "account.__v": 0,
                    // Loại bỏ trường của Profile
                    "profile.status": 0,
                    "profile.__v": 0,
                    // Loại bỏ trường __v trong từng object của mảng licenses
                    // MongoDB hỗ trợ tự động áp dụng loại bỏ này cho toàn bộ phần tử trong mảng
                    "licenses.__v": 0
                }
            }
        ]);

        // --- 4. KIỂM TRA KẾT QUẢ ---
        if (!aggregateResult || aggregateResult.length === 0) {
            logger.warn("Staff not found", { context: "StaffService.getByIdService", staffId });
            return null;
        }

        const staffInfo = aggregateResult[0];

        logger.debug("Staff fetched successfully", {
            context: "StaffService.getByIdService",
            staffId: staffId
        });

        return staffInfo;

    } catch (error) {
        logger.error("Error getting staff by id", {
            context: "StaffService.getByIdService",
            message: error.message,
            stack: error.stack,
        });

        if (error.statusCode) throw error;

        throw new errorRes.InternalServerError(
            `An error occurred while fetching staff by id: ${error.message}`
        );
    }
};

const createService = async (dataCreate) => {
    // 1. Kiểm tra Role trước khi bắt đầu Transaction (để tiết kiệm tài nguyên)
    const role = await getRoleById(dataCreate.role_id || null);
    if (!role) {
        throw new errorRes.NotFoundError('Invalid role_id: Role not found');
    }

    // Khởi tạo Session để bắt đầu Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 2. Tạo Account
        // Ép kiểu sang Number bằng parseInt hoặc dấu +
        const saltRounds = parseInt(process.env.BCRYPT_SALT, 10) || 10;
        const hashedPassword = await bcrypt.hash(dataCreate.password, saltRounds);
        const newAccount = new AuthModel.Account({
            username: dataCreate.username,
            email: dataCreate.email,
            password: hashedPassword,
            role_id: dataCreate.role_id,
            status: "ACTIVE",
            email_verified: true,
            phone_number: dataCreate.phone_number,
        });
        // Lưu ý: Phải truyền { session } vào hàm save
        const accountSaved = await newAccount.save({ session });

        // 3. Tạo Profile
        const newProfile = new AuthModel.Profile({
            account_id: accountSaved._id,
            address: dataCreate.address || null,
            avatar_url: dataCreate.avatar_url || null,
            dob: dataCreate.dob || null,
            full_name: dataCreate.full_name || null,
            gender: dataCreate.gender || "OTHER",
        });
        const profileSaved = await newProfile.save({ session });

        // 4. Tạo Staff
        const newStaff = new StaffModel.Staff({
            account_id: accountSaved._id,
            profile_id: profileSaved._id,
            status: "ACTIVE",
            work_start: Date.now()
        });
        const staffSaved = await newStaff.save({ session });

        // 5. Nếu là DOCTOR, tạo License
        let licenseSaved = null;
        if (role.name === 'DOCTOR') {
            const newLicense = new StaffModel.License({
                doctor_id: staffSaved._id,
                license_number: dataCreate.license_number,
                document_url: dataCreate.document_url,
                issued_by: dataCreate.issued_by,
                issued_date: dataCreate.issued_date
            });
            licenseSaved = await newLicense.save({ session });
        }

        // Nếu mọi thứ ok, xác nhận lưu vĩnh viễn vào DB
        await session.commitTransaction();

        return {
            data: {
                account: accountSaved,
                profile: profileSaved,
                staff: staffSaved,
                license: licenseSaved
            }
        };

    } catch (error) {
        // Nếu có bất kỳ lỗi nào, hủy bỏ toàn bộ thay đổi đã thực hiện trong Session
        await session.abortTransaction();

        logger.error("Transaction aborted due to error", {
            message: error.message,
            stack: error.stack,
        });

        // Quăng lỗi ra ngoài để Controller xử lý response
        throw new errorRes.InternalServerError(`Transaction failed: ${error.message}`);
    } finally {
        // Kết thúc session
        await session.endSession();
    }
};

/**
 * Update an existing service
 * 
 * @param {ObjectId} id service id to update
 * @param {*} updateData data to update
 * @returns updated service object
 */
const updateService = async (accountId, data) => {
    // 1. Khởi tạo Session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // --- BƯỚC 1: TÁCH DỮ LIỆU (Giữ nguyên) ---
        const accountUpdate = {};
        const profileUpdate = {};
        const staffUpdate = {};
        const licenseUpdate = {};

        // Mapping Account
        if (data.username) accountUpdate.username = data.username;
        if (data.email) accountUpdate.email = data.email;
        if (data.phone_number) accountUpdate.phone_number = data.phone_number;
        if (data.password) {
            const salt = parseInt(process.env.BCRYPT_SALT, 10) || 10;
            accountUpdate.password = await bcrypt.hash(data.password, salt);
        }

        // Mapping Profile
        if (data.full_name) profileUpdate.full_name = data.full_name;
        if (data.dob) profileUpdate.dob = data.dob;
        if (data.gender) profileUpdate.gender = data.gender;
        if (data.address) profileUpdate.address = data.address;
        if (data.avatar_url) profileUpdate.avatar_url = data.avatar_url;

        // Mapping Staff
        if (data.work_start) staffUpdate.work_start = data.work_start;
        if (data.work_end) staffUpdate.work_end = data.work_end;

        // Mapping License
        if (data.license_number) licenseUpdate.license_number = data.license_number;
        if (data.issued_by) licenseUpdate.issued_by = data.issued_by;
        if (data.issued_date) licenseUpdate.issued_date = data.issued_date;
        if (data.document_url) licenseUpdate.document_url = data.document_url;

        // --- BƯỚC 2: THỰC HIỆN UPDATE ---

        // 2.1 Update Account
        if (Object.keys(accountUpdate).length > 0) {
            const updatedAccount = await AuthModel.Account.findByIdAndUpdate(
                accountId,
                { $set: accountUpdate },
                { new: true, session }
            );
            if (!updatedAccount) throw new errorRes.NotFoundError("Account not found");
        }

        // 2.2 Update Profile
        if (Object.keys(profileUpdate).length > 0) {
            await AuthModel.Profile.findOneAndUpdate(
                { account_id: accountId },
                { $set: profileUpdate },
                { new: true, session }
            );
        }

        // 2.3 Update Staff & License
        // Tìm Staff hiện tại (Quan trọng: phải dùng session để đảm bảo tính nhất quán đọc/ghi)
        const currentStaff = await StaffModel.Staff.findOne({ account_id: accountId }).session(session);

        if (!currentStaff) {
            // Nếu không tìm thấy Staff, throw lỗi để rollback tất cả (kể cả Account/Profile vừa update)
            throw new errorRes.NotFoundError("Staff profile not found for this account!");
        }

        // Update Staff info
        if (Object.keys(staffUpdate).length > 0) {
            await StaffModel.Staff.findByIdAndUpdate(
                currentStaff._id,
                { $set: staffUpdate },
                { session }
            );
        }

        // Update License (Upsert: Tạo mới nếu chưa có)
        if (Object.keys(licenseUpdate).length > 0) {
            await StaffModel.License.findOneAndUpdate(
                { doctor_id: currentStaff._id },
                { $set: licenseUpdate },
                { new: true, session, upsert: true }
            );
        }

        // --- BƯỚC 3: COMMIT TRANSACTION ---
        await session.commitTransaction();

        // --- BƯỚC 4: LẤY DỮ LIỆU TRẢ VỀ (Tối ưu Performance) ---
        // Session đã kết thúc (commit), ta có thể query song song bằng Promise.all
        // Lưu ý: Lúc này không cần truyền 'session' vào query nữa

        const [accountResult, profileResult, staffResult, licenseResult] = await Promise.all([
            AuthModel.Account.findById(accountId).select('-password').lean(),
            AuthModel.Profile.findOne({ account_id: accountId }).lean(),
            StaffModel.Staff.findById(currentStaff._id).lean(),
            StaffModel.License.findOne({ doctor_id: currentStaff._id }).lean()
        ]);

        return {
            account: accountResult,
            profile: profileResult,
            staff: staffResult,
            license: licenseResult
        };

    } catch (error) {
        // Rollback nếu transaction đang chạy
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        // Log lỗi
        logger.error("Error updating service", {
            context: "ServiceService.updateService",
            message: error.message,
            stack: error.stack,
        });

        // QUAN TRỌNG: Ném lại đúng lỗi gốc để Controller xử lý (400, 404, 409...)
        throw error;
    } finally {
        session.endSession();
    }
};

const getRoleById = async (id) => {
    try {
        if (!id) return null;
        const role = await AuthModel.Role.findById(id);
        return role;
    } catch (error) {
        logger.error("Error getting role by id", {
            context: "StaffService.getRoleById",
            message: error.message,
            stack: error.stack,
        });
        throw new errorRes.InternalServerError(
            `An error occurred while getting role by id: ${error.message}`
        );
    }
};

// Kiểm tra License Number (trong model Staff hoặc License)
const checkUniqueLicenseNumber = async (license_number) => {
    const exists = await StaffModel.License.findOne({ license_number });
    return !!exists; // Trả về true nếu tìm thấy, false nếu không
};

// Kiểm tra Username (trong model Account)
const checkUniqueUsername = async (username) => {
    const exists = await AuthModel.Account.findOne({ username });
    return !!exists;
};

// Kiểm tra Email (trong model Account)
const checkUniqueEmail = async (email) => {
    const exists = await AuthModel.Account.findOne({ email });
    return !!exists;
};

// Kiểm tra License Number cho người khác (loại trừ License hiện tại theo ID)
const checkUniqueLicenseNumberNotId = async (license_number, licenseId) => {
    const exists = await StaffModel.License.findOne({
        license_number,
        _id: { $ne: licenseId } // $ne = Not Equal (Không bằng ID hiện tại)
    });
    return !!exists;
};

// Kiểm tra Username cho người khác (loại trừ Account hiện tại)
const checkUniqueUsernameNotId = async (username, accountId) => {
    const exists = await AuthModel.Account.findOne({
        username,
        _id: { $ne: accountId }
    });
    return !!exists;
};

// Kiểm tra Email cho người khác (loại trừ Account hiện tại)
const checkUniqueEmailNotId = async (email, accountId) => {
    const exists = await AuthModel.Account.findOne({
        email,
        _id: { $ne: accountId }
    });
    return !!exists;
};

// Service riêng cho việc update nhanh status
const updateStaffStatusOnly = async (accountId, status) => {
    const staff = await StaffModel.Staff.findOneAndUpdate(
        { account_id: accountId },
        { status: status },
        { new: true } // Trả về data mới
    );
    if (!staff) throw new errorRes.NotFoundError("Staff not found");
    return staff;
};

// Create leave request service
const createLeaveRequestService = async (accountId, payload) => {
  // 1. Tìm staff theo account_id
  const staff = await StaffModel.Staff.findOne({ account_id: accountId });

  if (!staff) {
    throw new errorRes.NotFoundError("Staff not found");
  }

  // 2. Kiểm tra ngày hợp lệ
  if (new Date(payload.startedDate) > new Date(payload.endDate)) {
    throw new errorRes.BadRequestError("End date must be after start date");
  }

  // 3. Tạo leave request
  const leave = await leaveRequestModel.create({
    ...payload,
    staff_id: staff._id,
  });

  return leave;
};

// View leave request
const getLeaveRequestService = async (accountId, query) => {
  const { page = 1, limit = 10, status } = query;

  // 1. Lấy staff theo account_id
  const staff = await StaffModel.Staff.findOne({ account_id: accountId });
  if (!staff) throw new errorRes.NotFoundError("Staff not found");

  const filter = { staff_id: staff._id };
  if (status) filter.status = status;

  const total = await leaveRequestModel.countDocuments(filter);

  const data = await leaveRequestModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return new Pagination(data, total, page, limit);
};

// Edit leave request (chỉ cho phép sửa khi còn PENDING)
const editLeaveRequestService = async (accountId, leaveId, payload) => {
  const staff = await StaffModel.Staff.findOne({ account_id: accountId });
  if (!staff) throw new errorRes.NotFoundError("Staff not found");

  const leave = await leaveRequestModel.findById(leaveId);
  if (!leave) throw new errorRes.NotFoundError("Leave request not found");

  // Chỉ cho sửa khi PENDING
  if (leave.status !== "PENDING") {
    throw new errorRes.BadRequestError("Only PENDING request can be edited");
  }

  // Validate ngày
  if (
    payload.startedDate &&
    payload.endDate &&
    new Date(payload.startedDate) > new Date(payload.endDate)
  ) {
    throw new errorRes.BadRequestError("End date must be after start date");
  }

  Object.assign(leave, payload);

  await leave.save();

  return leave;
};

// Cancel leave request (chỉ cho phép cancel khi còn PENDING)
const cancelLeaveRequestService = async (accountId, leaveId) => {
  const staff = await StaffModel.Staff.findOne({ account_id: accountId });
  if (!staff) throw new errorRes.NotFoundError("Staff not found");

  const leave = await leaveRequestModel.findById(leaveId);
  if (!leave) throw new errorRes.NotFoundError("Leave request not found");

  if (leave.status !== "PENDING") {
    throw new errorRes.BadRequestError("Only PENDING request can be cancelled");
  }

  leave.status = "CANCELLED";

  await leave.save();

  return leave;
};

module.exports = {
    getListService,
    getByIdService,
    createService,
    createLeaveRequestService,
    getLeaveRequestService,
    editLeaveRequestService,
    cancelLeaveRequestService,
    updateService,
    checkUniqueLicenseNumber,
    checkUniqueUsername,
    checkUniqueEmail,
    checkUniqueLicenseNumberNotId,
    checkUniqueUsernameNotId,
    checkUniqueEmailNotId,
    getRoleById,
    updateStaffStatusOnly
};
