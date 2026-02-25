const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');
const successRes = require('../../../common/success');
const { cleanObjectData } = require('../../../common/utils/cleanObjectData');
const Pagination = require('../../../common/responses/Pagination');
const { uploadToCloudinary, uploadMultipleToCloudinary } = require('../../../utils/cloudinaryHelper');

const ServiceProcess = require('../services/staff.service');
const { checkRequiredFields } = require('../../../utils/checkRequiredFields');

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
const getListController = async (req, res) => {
    try {
        const queryParams = req.query;
        logger.debug('Get services request received', {
            context: 'StaffController.getListController',
            query: queryParams
        });

        const { data, pagination } = await ServiceProcess.getListService(queryParams);
        const paginationData = new Pagination({
            page: pagination.page,
            size: pagination.size,
            totalItems: pagination.totalItems,
        });

        return new successRes.GetListSuccess(data, paginationData, 'Staff retrieved successfully').send(res);

    } catch (error) {
        logger.error('Error get staffs', {
            context: 'StaffController.getListController',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

/*
    get infor staff, account, profile by staffId
*/
const getByIdController = async (req, res) => {
    try {
        const { staffId: id } = req.params;
        const queryParams = req.query;
        logger.debug('Get service by id request received', {
            context: 'StaffController.getByIdController',
            staffId: id,
            query: queryParams
        });

        // check id empty
        if (!id) {
            logger.warn('Empty staff ID', {
                context: 'StaffController.getByIdController',
                serviceId: id
            });
            throw new errorRes.BadRequestError('Staff ID is required');
        }

        // Gọi service xử lý logic
        const service = await ServiceProcess.getByIdService(id, queryParams);
        return new successRes.GetDetailSuccess(service, 'Service retrieved successfully').send(res);
    } catch (error) {
        logger.error('Error get staff by id', {
            context: 'StaffController.getByIdController',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

// create Service don't have equipment_service
const createController = async (req, res) => {
    try {
        const dataCreate = req.body || {};
        const cleanedData = cleanObjectData(dataCreate);

        // 1. Khai báo fields bắt buộc cơ bản
        let requiredFields = ['username', 'email', 'password', 'phone_number', 'role_id', 'full_name'];

        // 2. Validate Role & Cập nhật requiredFields
        const role = await ServiceProcess.getRoleById(cleanedData.role_id || null);
        if (!role) {
            throw new errorRes.BadRequestError('Invalid role_id: Role not found');
        }

        if (role.name === 'DOCTOR') {
            requiredFields.push('license_number', 'issued_by', 'issued_date');
        }

        // 3. Chạy các hàm check validation (Dữ liệu thô)
        // Lưu ý: Đổi 'required' thành 'requiredFields' ở đây
        checkRequiredFields(requiredFields, cleanedData, this, 'createController');
        checkEmail(cleanedData.email);
        checkPhone(cleanedData.phone_number);
        checkPassword(cleanedData.password);

        // 4. Kiểm tra Unique trong Database (Tránh trùng lặp)
        if (await ServiceProcess.checkUniqueUsername(cleanedData.username)) {
            throw new errorRes.ConflictError("Username already exists!");
        }
        if (await ServiceProcess.checkUniqueEmail(cleanedData.email)) {
            throw new errorRes.ConflictError("Email already exists!");
        }

        if (role.name === 'DOCTOR') {
            checkLicenseNumber(cleanedData.license_number);
            if (await ServiceProcess.checkUniqueLicenseNumber(cleanedData.license_number)) {
                throw new errorRes.ConflictError("License number already exists!");
            }
            checkIssuedBy(cleanedData.issued_by);
            checkIssuedDate(cleanedData.issued_date);
        }

        // 5. Xử lý File (Chỉ chạy khi mọi thứ ở trên đã PASS)
        if (req.files) {
            if (req.files['avatar']) {
                const avatarFile = req.files['avatar'][0];
                cleanedData.avatar_url = await uploadToCloudinary(avatarFile, 'user_avatars');
            }
            if (req.files['license']) {
                const licenseFiles = req.files['license'];
                cleanedData.document_url = await uploadMultipleToCloudinary(licenseFiles, 'user_licenses');
            }
        }

        // 6. Gọi Service thực hiện Transaction (Lưu ý: Service nên hash password)
        const newStaff = await ServiceProcess.createService(cleanedData);

        return new successRes.CreateSuccess(newStaff).send(res);

    } catch (error) {
        logger.error('Error create staff controller', {
            context: 'StaffController.createController',
            message: error.message
        });
        throw error;
    }
};

const checkPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
        const errorMsg = 'Passwords must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.';

        // Ghi log lỗi để tiện debug khi deploy
        logger.error('Weak password validation failed.', {
            context: 'StaffController.createController',
            password: password
        });

        throw new errorRes.BadRequestError(errorMsg);
    }
}

const checkEmail = (email) => {
    if (email) {
        const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/;
        if (!emailPattern.test(email)) {
            logger.warn('Invalid email format', {
                context: 'StaffController.createController',
                email: email
            });
            throw new errorRes.BadRequestError('Invalid email format');
        }
    }

}

const checkPhone = (phone) => {
    if (phone) {
        const phonePattern = /^(?:\+84|84|0)(3|5|7|8|9)\d{1}([-.]?)\d{3}\2\d{4}$/;
        if (phone && !phonePattern.test(phone)) {
            logger.warn('Invalid phone number format', {
                context: 'StaffController.createController',
                phone_number: phone
            });
            // Cập nhật thông báo lỗi bao quát hơn
            throw new errorRes.BadRequestError('The phone number is not in the correct format (e.g., 0912345678 or +84912345678)');
        }
    }
}

const checkLicenseNumber = (license_number) => {
    if (license_number) {
        const licenseLength = license_number.length;
        const licenseRegex = /^[A-Z0-9]+$/i; // Chỉ cho phép chữ cái và số

        if (licenseLength < 6 || licenseLength > 15) {
            logger.error('The license number must be between 6 and 15 characters long.', {
                context: 'StaffController.createController',
                license_number: license_number
            });
            throw new errorRes.BadRequestError('The license number must be between 6 and 15 characters long.');
        } else if (!licenseRegex.test(license_number)) {
            logger.error('The license number must not contain special characters.', {
                context: 'StaffController.createController',
                license_number: license_number
            });
            throw new errorRes.BadRequestError('The license number must not contain special characters.');
        }
    }
}

const checkIssuedBy = (issued_by) => {
    if (issued_by) {
        if (issued_by.trim().length < 3) {
            logger.error('The name of the issuing authority is too short.', {
                context: 'StaffController.createController',
                issued_by: issued_by
            });
            throw new errorRes.BadRequestError('The name of the issuing authority is too short.');
        }
    }
}

const checkIssuedDate = (issued_date) => {
    if (issued_date) {
        const issueDate = new Date(issued_date);
        const minDate = new Date('1950-01-01');
        if (issueDate < minDate) {
            logger.warn('The certificate issuance date is invalid (too old).', {
                context: 'StaffController.createController',
                issued_date: issued_date
            });
            throw new errorRes.BadRequestError('The certificate issuance date is invalid (too old).');
        }
    }
}

// update staff by accountId
const updateController = async (req, res) => {
    try {
        // 1. Lấy ID từ params và đổi tên thành accountId cho rõ nghĩa
        const { id: accountId } = req.params;
        const dataUpdate = req.body || {};

        // 2. Làm sạch dữ liệu
        // Loại bỏ field 'status' để bảo mật, chỉ lấy phần còn lại
        const { status, ...restData } = dataUpdate;
        const cleanedData = cleanObjectData(restData);

        // Kiểm tra xem có dữ liệu nào để update không (bao gồm cả file)
        if (Object.keys(cleanedData).length === 0 && !req.files) {
            throw new errorRes.BadRequestError('No data provided for update');
        }

        // 3. VALIDATION: Chỉ kiểm tra những trường có trong dữ liệu gửi lên

        // Kiểm tra Email
        if (cleanedData.email) {
            checkEmail(cleanedData.email);
            // Kiểm tra trùng lặp email, ngoại trừ chính tài khoản này
            const isEmailExist = await ServiceProcess.checkUniqueEmailNotId(cleanedData.email, accountId);
            if (isEmailExist) {
                throw new errorRes.ConflictError("Email already exists!");
            }
        }

        // Kiểm tra Username
        if (cleanedData.username) {
            // Kiểm tra trùng lặp username, ngoại trừ chính tài khoản này
            const isUsernameExist = await ServiceProcess.checkUniqueUsernameNotId(cleanedData.username, accountId);
            if (isUsernameExist) {
                throw new errorRes.ConflictError("Username already exists!");
            }
        }

        // Validate các trường thông thường
        if (cleanedData.phone_number) checkPhone(cleanedData.phone_number);
        // Lưu ý: Nếu update password, hãy đảm bảo password được hash trước khi lưu vào DB (có thể xử lý ở Service hoặc tại đây)
        if (cleanedData.password) checkPassword(cleanedData.password);

        // 4. Validate License (Logic nghiệp vụ đặc thù)
        if (cleanedData.license_number) {
            checkLicenseNumber(cleanedData.license_number);
            // SỬA LỖI: Dùng biến accountId thay vì id
            const isLicenseExist = await ServiceProcess.checkUniqueLicenseNumberNotId(cleanedData.license_number, accountId);
            if (isLicenseExist) {
                throw new errorRes.ConflictError("License number already exists!");
            }
        }

        if (cleanedData.issued_by) checkIssuedBy(cleanedData.issued_by);
        if (cleanedData.issued_date) checkIssuedDate(cleanedData.issued_date);

        // 5. Xử lý upload file (Cloudinary)
        if (req.files) {
            if (req.files['avatar']) {
                // Lấy file đầu tiên trong mảng avatar
                cleanedData.avatar_url = await uploadToCloudinary(req.files['avatar'][0], 'user_avatars');
            }
            if (req.files['license']) {
                // Upload nhiều file license nếu cần
                cleanedData.document_url = await uploadMultipleToCloudinary(req.files['license'], 'user_licenses');
            }
        }

        // 6. Gọi Service thực hiện cập nhật
        // SỬA LỖI: Dùng biến accountId thay vì id
        const updated = await ServiceProcess.updateService(accountId, cleanedData);

        // Gửi response thành công
        return new successRes.UpdateSuccess(updated).send(res);

    } catch (error) {
        // Logging lỗi chi tiết để debug
        logger.error('Error update staff', {
            context: 'StaffController.updateController',
            message: error.message,
            stack: error.stack // Nên log thêm stack trace để dễ sửa lỗi
        });
        throw error;
    }
};

// update equipment status only
const updateStatusController = async (req, res) => {
    try {
        // 1. Lấy ID (Giả định đây là accountId)
        const { id: accountId } = req.params;
        const { status } = req.body || {};

        logger.debug('Update staff status request received', {
            context: 'StaffController.updateStatusController',
            accountId: accountId,
            status: status
        });

        // 2. Validate Status
        const validStatuses = ["ACTIVE", "INACTIVE"]; 
        
        if (!status || !validStatuses.includes(status)) {
            logger.warn('Invalid or missing status value', {
                context: 'StaffController.updateStatusController',
                status: status,
                allowed: validStatuses
            });
            throw new errorRes.BadRequestError(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
        }

        // 3. Gọi Service cập nhật
        // Lưu ý: updateService trả về object chứa { account, profile, staff, license }
        const result = await ServiceProcess.updateStaffStatusOnly(accountId, { status });

        // Kiểm tra kết quả
        if (!result || !result.staff) {
             throw new errorRes.NotFoundError('Staff not found');
        }

        logger.info('Staff status updated successfully', {
            context: 'StaffController.updateStatusController',
            staffId: result.staff._id,
            newStatus: result.staff.status
        });

        // 4. Trả về kết quả
        return new successRes.UpdateSuccess(result, 'Staff status updated successfully').send(res);

    } catch (error) {
        logger.error('Error update staff status', {
            context: 'StaffController.updateStatusController',
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

const createLeaveController = async (req, res) => {
  try {
    const { id: accountId } = req.params;

    const result = await ServiceProcess.createLeaveRequestService(
      accountId,
      req.body
    );

    return new successRes.CreateSuccess(
      result,
      "Create leave request successfully"
    ).send(res);

  } catch (error) {
    logger.error("Create leave error", {
      context: "LeaveController.createLeaveController",
      message: error.message,
    });
    throw error;
  }
};

module.exports = {
    getListController,
    getByIdController,
    createController,
    updateController,
    updateStatusController,
    createLeaveController
};
