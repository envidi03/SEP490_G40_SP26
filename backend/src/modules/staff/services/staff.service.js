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
        const roleFilter = query.role_name?.trim().toUpperCase();
        const genderFilter = query.filter;
        const sortOrder = query.sort === "desc" ? -1 : 1;
        const page = Math.max(1, parseInt(query.page || 1));
        const limit = Math.max(1, parseInt(query.limit || 5));
        const skip = (page - 1) * limit;

        const pipeline = [
            {
                $lookup: {
                    from: "accounts",
                    localField: "account_id",
                    foreignField: "_id",
                    as: "account_info"
                }
            },
            { $addFields: { account_info: { $arrayElemAt: ["$account_info", 0] } } },
            {
                $lookup: {
                    from: "roles",
                    localField: "account_info.role_id",
                    foreignField: "_id",
                    as: "role_info"
                }
            },
            { $addFields: { role_info: { $arrayElemAt: ["$role_info", 0] } } },
            {
                $lookup: {
                    from: "profiles",
                    localField: "profile_id",
                    foreignField: "_id",
                    as: "profile_info"
                }
            },
            { $addFields: { profile_info: { $arrayElemAt: ["$profile_info", 0] } } }
        ];

        // --- ĐIỀU KIỆN LỌC (MATCH) ---
        const matchCondition = {};
        if (genderFilter) {
            matchCondition["profile_info.gender"] = genderFilter;
        }
        if (roleFilter) {
            matchCondition["role_info.name"] = roleFilter;
        }
        if (query.status && query.status !== 'all') {
            matchCondition["account_info.status"] = query.status;
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

        // --- CHUẨN BỊ FACET (PHÂN TRANG + THỐNG KÊ) ---
        pipeline.push({
            $facet: {
                data: [
                    { $match: matchCondition },
                    { $sort: { "profile_info.full_name": sortOrder } },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            _id: 1,
                            work_start: 1,
                            work_end: 1,
                            status: 1,
                            account: {
                                _id: "$account_info._id",
                                username: "$account_info.username",
                                email: "$account_info.email",
                                phone_number: "$account_info.phone_number",
                                status: "$account_info.status",
                                createdAt: "$account_info.createdAt",
                                updatedAt: "$account_info.updatedAt",
                                role_id: {
                                    _id: "$role_info._id",
                                    name: "$role_info.name"
                                }
                            },
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
                totalCount: [
                    { $match: matchCondition },
                    { $count: "count" }
                ],
                overallStats: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            active: { $sum: { $cond: [{ $eq: ["$account_info.status", "ACTIVE"] }, 1, 0] } },
                            inactive: { $sum: { $cond: [{ $eq: ["$account_info.status", "INACTIVE"] }, 1, 0] } },
                            admins: { $sum: { $cond: [{ $eq: ["$role_info.name", "ADMIN_CLINIC"] }, 1, 0] } },
                            doctors: { $sum: { $cond: [{ $eq: ["$role_info.name", "DOCTOR"] }, 1, 0] } },
                            staff: { 
                                $sum: { 
                                    $cond: [
                                        { $in: ["$role_info.name", ["RECEPTIONIST", "PHARMACY", "ASSISTANT"]] }, 
                                        1, 0
                                    ] 
                                } 
                            }
                        }
                    }
                ]
            }
        });

        const result = await StaffModel.Staff.aggregate(pipeline);

        const staffs = result[0]?.data || [];
        const totalItems = result[0]?.totalCount?.[0]?.count || 0;
        const stats = result[0]?.overallStats?.[0] || { total: 0, active: 0, inactive: 0, admins: 0, doctors: 0, staff: 0 };

        return {
            data: staffs,
            pagination: {
                page,
                size: limit,
                totalItems
            },
            statistics: {
                total: stats.total || 0,
                active: stats.active || 0,
                inactive: stats.inactive || 0,
                admins: stats.admins || 0,
                doctors: stats.doctors || 0,
                staff: stats.staff || 0
            }
        };

    } catch (error) {
        logger.error("Error getting staff list", {
            context: "StaffService.getListService",
            message: error.message,
            stack: error.stack
        });
        throw new errorRes.InternalServerError(
            "Hệ thống lỗi, vui lòng thực hiện sau"
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
            throw new errorRes.BadRequestError("Định dạng mã nhân viên không hợp lệ");
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
                    as: "licenses"
                }
            },
            // 2.5 JOIN bảng Role (Quan hệ 1-1, dựa theo account.role_id)
            {
                $lookup: {
                    from: "roles",
                    localField: "account.role_id",
                    foreignField: "_id",
                    as: "role_info"
                }
            },
            {
                $addFields: {
                    role_info: { $arrayElemAt: ["$role_info", 0] },
                    "account.role_id": {
                        $let: {
                            vars: { r: { $arrayElemAt: ["$role_info", 0] } },
                            in: {
                                _id: "$$r._id",
                                name: "$$r.name"
                            }
                        }
                    }
                }
            },
            // --- 3. FORMAT DỮ LIỆU TRẢ VỀ ($project) ---
            {
                $project: {
                    "__v": 0,
                    "status": 0,
                    // Loại bỏ trường nhạy cảm của Account (giữ lại role_id đã được populate)
                    "account.password": 0,
                    "account.email_verified": 0,
                    "account.__v": 0,
                    // Loại bỏ trường của Profile
                    "profile.status": 0,
                    "profile.__v": 0,
                    // Loại bỏ trường __v trong từng object của mảng licenses
                    "licenses.__v": 0,
                    // Loại bỏ role_info tạm (đã được đặt vào account.role_id)
                    "role_info": 0
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
            "Hệ thống lỗi, vui lòng thực hiện sau"
        );
    }
};

const createService = async (dataCreate) => {
    // 1. Kiểm tra Role trước khi bắt đầu Transaction (để tiết kiệm tài nguyên)
    const role = await getRoleById(dataCreate.role_id || null);
    if (!role) {
        throw new errorRes.NotFoundError('Mã vai trò không hợp lệ: Không tìm thấy vai trò');
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
            work_start: dataCreate.work_start || Date.now(),
            degree: dataCreate.degree || null,
            education: dataCreate.education || null,
            note: dataCreate.note || null
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
        throw new errorRes.InternalServerError("Hệ thống lỗi, vui lòng thực hiện sau");
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
        if (data.degree !== undefined) staffUpdate.degree = data.degree;
        if (data.education !== undefined) staffUpdate.education = data.education;
        if (data.note !== undefined) staffUpdate.note = data.note;

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
            if (!updatedAccount) throw new errorRes.NotFoundError("Không tìm thấy tài khoản");
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
            throw new errorRes.NotFoundError("Không tìm thấy hồ sơ nhân viên cho tài khoản này!");
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
            "Hệ thống lỗi, vui lòng thực hiện sau"
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
    // Frontend đọc account.status → phải update Account model
    const updatedAccount = await AuthModel.Account.findByIdAndUpdate(
        accountId,
        { $set: { status } },
        { new: true }
    );
    if (!updatedAccount) throw new errorRes.NotFoundError("Không tìm thấy tài khoản");

    // Đồng bộ Staff.status
    await StaffModel.Staff.findOneAndUpdate(
        { account_id: accountId },
        { $set: { status } },
        { new: true }
    );

    return updatedAccount;
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
        throw new errorRes.BadRequestError("Ngày kết thúc phải sau ngày bắt đầu");
    }

    // 3. Tạo leave request
    const leave = await leaveRequestModel.create({
        ...payload,
        staff_id: staff._id,
    });

    // Gửi thông báo cho Admin
    try {
        const notificationService = require('../../notification/service/notification.service');
        const profile = await AuthModel.Profile.findOne({ account_id: accountId });
        const staffName = profile?.full_name || 'Nhân viên';
        await notificationService.sendToRole(['ADMIN_CLINIC'], {
            type: 'LEAVE_REQUESTED',
            title: 'Yêu cầu nghỉ phép/đổi ca mới',
            message: `Nhân viên ${staffName} vừa tạo một yêu cầu nghỉ phép/đổi ca. Vui lòng kiểm tra và xét duyệt.`,
            action_url: `/admin/leave-requests`
        });
    } catch (err) {
        logger.error("Lỗi gửi thông báo xin nghỉ phép cho Admin:", { message: err.message });
    }

    return leave;
};

// View leave request with filtering and statistics
const getLeaveRequestService = async (accountId, query = {}) => {
    const { status } = query;
    // 1. Lấy staff theo account_id
    const staff = await StaffModel.Staff.findOne({ account_id: accountId });
    if (!staff) throw new errorRes.NotFoundError("Không tìm thấy nhân viên");

    const staffId = staff._id;
    const matchCondition = { staff_id: staffId };

    // Lọc theo status nếu được cung cấp và không phải 'all'
    if (status && status !== 'all') {
        matchCondition.status = status.toUpperCase();
    }

    // Sử dụng aggregate để lấy cả data (theo filter) và statistics (toàn bộ của staff này)
    const result = await leaveRequestModel.aggregate([
        {
            $facet: {
                data: [
                    { $match: matchCondition },
                    { $sort: { createdAt: -1 } }
                ],
                statistics: [
                    { $match: { staff_id: staffId } },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
                            approved: { $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] } },
                            rejected: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] } }
                        }
                    }
                ]
            }
        }
    ]);

    const data = result[0]?.data || [];
    const stats = result[0]?.statistics[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };

    return {
        data,
        statistics: {
            total: stats.total,
            pending: stats.pending,
            approved: stats.approved,
            rejected: stats.rejected
        }
    };
};

// Edit leave request (chỉ cho phép sửa khi còn PENDING)
const editLeaveRequestService = async (accountId, leaveId, payload) => {
    const staff = await StaffModel.Staff.findOne({ account_id: accountId });
    if (!staff) throw new errorRes.NotFoundError("Không tìm thấy nhân viên");

    const leave = await leaveRequestModel.findById(leaveId);
    if (!leave) throw new errorRes.NotFoundError("Không tìm thấy yêu cầu nghỉ phép");

    // Chỉ cho sửa khi PENDING
    if (leave.status !== "PENDING") {
        throw new errorRes.BadRequestError("Chỉ có thể chỉnh sửa yêu cầu đang chờ duyệt");
    }

    // Validate ngày
    if (
        payload.startedDate &&
        payload.endDate &&
        new Date(payload.startedDate) > new Date(payload.endDate)
    ) {
        throw new errorRes.BadRequestError("Ngày kết thúc phải sau ngày bắt đầu");
    }

    Object.assign(leave, payload);

    await leave.save();

    return leave;
};

// Cancel leave request (chỉ cho phép cancel khi còn PENDING)
const cancelLeaveRequestService = async (accountId, leaveId) => {
    const staff = await StaffModel.Staff.findOne({ account_id: accountId });
    if (!staff) throw new errorRes.NotFoundError("Không tìm thấy nhân viên");

    const leave = await leaveRequestModel.findOne({
        _id: leaveId,
        staff_id: staff._id,
    });

    if (!leave) throw new errorRes.NotFoundError("Không tìm thấy yêu cầu nghỉ phép");

    if (leave.status !== "PENDING") {
        throw new errorRes.BadRequestError("Chỉ có thể hủy yêu cầu đang chờ duyệt");
    }

    leave.status = "CANCELLED";

    await leave.save();

    return leave;
};


// Lấy danh sách roles phù hợp cho nhân viên (loại bỏ PATIENT)
const getStaffRoles = async () => {
    try {
        const roles = await AuthModel.Role.find(
            { name: { $in: ['ADMIN_CLINIC', 'DOCTOR', 'RECEPTIONIST', 'PHARMACY', 'ASSISTANT'] } },
            { _id: 1, name: 1, description: 1 }
        ).sort({ name: 1 });
        return roles;
    } catch (error) {
        logger.error('Error getting staff roles', {
            context: 'StaffService.getStaffRoles',
            message: error.message
        });
        throw error;
    }
};

// Admin: Lấy tất cả leave requests (view toàn bộ nhân viên) với bộ lọc
const getAllLeaveRequestsService = async (query = {}) => {
    const { status, search, page = 1, limit = 100 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pipeline = [
        // 1. Join với bảng Staff
        {
            $lookup: {
                from: "staffs",
                localField: "staff_id",
                foreignField: "_id",
                as: "staff"
            }
        },
        { $unwind: "$staff" },

        // 2. Join với bảng Profile (để lấy name)
        {
            $lookup: {
                from: "profiles",
                localField: "staff.profile_id",
                foreignField: "_id",
                as: "profile"
            }
        },
        { $unwind: "$profile" },

        // 3. Join với bảng Account (để lấy username/email/role)
        {
            $lookup: {
                from: "accounts",
                localField: "staff.account_id",
                foreignField: "_id",
                as: "account"
            }
        },
        { $unwind: "$account" },

        // 4. Join với bảng Role (để lấy role name)
        {
            $lookup: {
                from: "roles",
                localField: "account.role_id",
                foreignField: "_id",
                as: "role"
            }
        },
        { $unwind: "$role" }
    ];

    // 5. Thống kê tổng quan (Chỉ loại bỏ CANCELLED, không theo search/status)
    const statsPipeline = [
        { $match: { status: { $ne: 'CANCELLED' } } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
                approved: { $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] } },
                rejected: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] } }
            }
        }
    ];

    // 6. Dữ liệu bảng (Có áp dụng search/status)
    const matchCondition = {};
    if (status && status !== 'All') {
        matchCondition.status = status;
    } else if (!status || status === 'All') {
        matchCondition.status = { $ne: 'CANCELLED' };
    }

    if (search) {
        const searchRegex = new RegExp(search, 'i');
        matchCondition.$or = [
            { "profile.full_name": searchRegex }
        ];
    }

    const dataPipeline = [
        { $match: matchCondition },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
            $project: {
                _id: 1,
                type: 1,
                reason: 1,
                startedDate: 1,
                endDate: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                staff_id: {
                    _id: "$staff._id",
                    account_id: {
                        _id: "$account._id",
                        username: "$account.username",
                        email: "$account.email",
                        phone_number: "$account.phone_number",
                        role_id: {
                            _id: "$role._id",
                            name: "$role.name"
                        }
                    },
                    profile_id: {
                        _id: "$profile._id",
                        full_name: "$profile.full_name"
                    }
                }
            }
        }
    ];

    const result = await leaveRequestModel.aggregate([
        ...pipeline, // Đầu tiên là các bước Join (Lookup)
        {
            $facet: {
                data: dataPipeline,
                totalCount: [
                    { $match: matchCondition },
                    { $count: "count" }
                ],
                overallStats: statsPipeline
            }
        }
    ]);

    const finalData = result[0]?.data || [];
    const totalItems = result[0]?.totalCount[0]?.count || 0;
    const stats = result[0]?.overallStats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };

    return {
        data: finalData,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems: totalItems,
            totalPages: Math.ceil(totalItems / parseInt(limit))
        },
        statistics: {
            total: stats.total,
            pending: stats.pending,
            approved: stats.approved,
            rejected: stats.rejected
        }
    };
};

// Admin: Phê duyệt hoặc từ chối leave request
const approveLeaveRequestService = async (leaveId, status) => {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
        throw new errorRes.BadRequestError('Trạng thái phải là APPROVED hoặc REJECTED');
    }
    const leave = await leaveRequestModel.findById(leaveId);
    if (!leave) throw new errorRes.NotFoundError('Không tìm thấy yêu cầu nghỉ phép');
    if (leave.status !== 'PENDING') {
        throw new errorRes.BadRequestError('Chỉ có thể duyệt hoặc từ chối yêu cầu đang chờ');
    }
    leave.status = status;
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
    updateStaffStatusOnly,
    getStaffRoles,
    getAllLeaveRequestsService,
    approveLeaveRequestService
};
