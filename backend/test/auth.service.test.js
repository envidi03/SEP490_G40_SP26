const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');

jest.mock('../src/modules/auth/models/account.model', () => ({
    findOne: jest.fn(), findById: jest.fn(), create: jest.fn()
}));
jest.mock('../src/modules/auth/models/role.model', () => ({ findOne: jest.fn() }));
jest.mock('../src/modules/auth/models/email-verification.model', () => ({
    findOne: jest.fn(), create: jest.fn(), deleteMany: jest.fn(), deleteOne: jest.fn()
}));
jest.mock('../src/modules/auth/models/profile.model', () => ({
    findOne: jest.fn(), create: jest.fn()
}));
jest.mock('../src/modules/auth/models/session.model', () => ({
    create: jest.fn(), findOne: jest.fn(), deleteOne: jest.fn(), deleteMany: jest.fn()
}));
jest.mock('../src/modules/auth/models/login-attempt.model', () => ({
    countDocuments: jest.fn(), create: jest.fn()
}));
jest.mock('../src/modules/patient/model/patient.model', () => ({
    create: jest.fn(), findOne: jest.fn()
}));
jest.mock('../src/modules/auth/models/auth-provider.model', () => ({
    findOne: jest.fn(), create: jest.fn(), deleteOne: jest.fn()
}));
jest.mock('../src/modules/auth/models/password-reset.model', () => ({
    findOne: jest.fn(), create: jest.fn(), deleteMany: jest.fn(), deleteOne: jest.fn()
}));
jest.mock('../src/common/service/email.service', () => ({
    sendEmailVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendWelcomeGoogleAuthEmail: jest.fn()
}));
jest.mock('../src/common/utils/logger', () => ({
    debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn()
}));

jest.mock('../src/common/utils/jwt', () => ({
    signToken: jest.fn().mockReturnValue('mock_access_token'),
    signRefreshToken: jest.fn().mockReturnValue('mock_refresh_token'),
    hashToken: jest.fn().mockReturnValue('mock_hashed_token')
}));
jest.mock('google-auth-library', () => ({ OAuth2Client: jest.fn() }));

const Account = require('../src/modules/auth/models/account.model');
const Role = require('../src/modules/auth/models/role.model');
const EmailVerification = require('../src/modules/auth/models/email-verification.model');
const Profile = require('../src/modules/auth/models/profile.model');
const Patient = require('../src/modules/patient/model/patient.model');
const LoginAttempt = require('../src/modules/auth/models/login-attempt.model');
const Session = require('../src/modules/auth/models/session.model');
const AuthProvider = require('../src/modules/auth/models/auth-provider.model');
const PasswordReset = require('../src/modules/auth/models/password-reset.model');
const emailService = require('../src/common/service/email.service');
const { signToken } = require('../src/common/utils/jwt');
const { ValidationError, ConflictError, NotFoundError, ForbiddenError, UnauthorizedError } = require('../src/common/errors');
const authService = require('../src/modules/auth/service/auth.service');

// Tạo mock session mongoose (dùng trong register)
const mockMongoSession = () => {
    mongoose.startSession = jest.fn().mockResolvedValue({
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn()
    });
};

// Mock đủ dữ liệu để register thành công (sau validation)
const mockRegisterSuccess = () => {
    Account.findOne.mockResolvedValue(null); // email, username, phone đều chưa tồn tại
    Role.findOne.mockResolvedValue({ _id: 'roleId', name: 'PATIENT' });
    jest.spyOn(bcryptjs, 'hash').mockResolvedValue('hashedpw');
    Account.create.mockResolvedValue([{ _id: 'acc1', username: 'quoc123', email: 'quoc@ex.com', status: 'PENDING', email_verified: false }]);
    EmailVerification.create.mockResolvedValue([{}]);
    Profile.create.mockResolvedValue([{ _id: 'prof1', full_name: 'Quoc Nguyen', dob: null, gender: null }]);
    Patient.create.mockResolvedValue([{ _id: 'pat1', profile_id: 'prof1', status: 'active' }]);
};

// Mock đủ dữ liệu để login thành công
const mockLoginSuccess = (overrides = {}) => {
    const mockAccount = {
        _id: 'acc1',
        email: 'user@example.com',
        password: 'hashedpw',
        status: 'ACTIVE',
        role_id: { _id: 'role1', name: 'PATIENT', permissions: [] },
        ...overrides
    };
    Account.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockAccount)
    });
    LoginAttempt.countDocuments.mockResolvedValue(0);
    jest.spyOn(bcryptjs, 'compare').mockResolvedValue(true);
    Profile.findOne.mockResolvedValue({ _id: 'prof1', full_name: 'Quoc Nguyen', dob: null, gender: null, is_doctor: false, is_patient: true });
    Session.create.mockResolvedValue({});
    LoginAttempt.create.mockResolvedValue({});
    return mockAccount;
};

// TEST SUITE
describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockMongoSession();
    });

    //  1. register(data)
    //  Input: username, email, password, full_name, phone_number, dob, gender, address, avatar_url
    describe('register(data)', () => {
        // Data valid đầy đủ tất cả 9 fields
        const validData = {
            username: 'quoc123',
            password: 'StrongPass@123',
            email: 'quoc@ex.com',
            full_name: 'Quoc Nguyen',
            phone_number: '0123456789',
            dob: '1990-01-01',
            gender: 'male',
            address: '123 Main St',
            avatar_url: 'http://ex.com/img.png'
        };

        // TC-R-01: Tất cả fields hợp lệ → thành công
        it('TC-R-01: Đăng ký thành công với đủ 9 fields', async () => {
            mockRegisterSuccess();

            const result = await authService.register(validData);

            expect(result).toHaveProperty('account');
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('patient');
            expect(result.account.username).toBe('quoc123');
            expect(result.account.status).toBe('PENDING');
            expect(emailService.sendEmailVerificationEmail).toHaveBeenCalledWith('quoc@ex.com', expect.any(String), 'Quoc Nguyen');
            // Optional fields được truyền vào Profile.create đúng
            expect(Profile.create).toHaveBeenCalledWith(
                expect.arrayContaining([expect.objectContaining({ dob: '1990-01-01', gender: 'male', address: '123 Main St' })]),
                expect.anything()
            );
        });

        // TC-R-02: Chỉ có 5 fields bắt buộc, optional = null/empty
        it('TC-R-02: Đăng ký thành công chỉ với 5 fields bắt buộc (optional = null)', async () => {
            mockRegisterSuccess();
            const minData = { username: 'quoc123', password: 'StrongPass@123', email: 'quoc@ex.com', full_name: 'Quoc Nguyen' };

            const result = await authService.register(minData);

            expect(result).toHaveProperty('account');
            // dob, gender, address không có → Profile.create nhận null
            expect(Profile.create).toHaveBeenCalledWith(
                expect.arrayContaining([expect.objectContaining({ dob: null, gender: null, address: null })]),
                expect.anything()
            );
        });

        // TC-R-03: Thiếu username
        it('TC-R-03: Thiếu username → ValidationError', async () => {
            const { username, ...data } = validData;
            await expect(authService.register({ ...data, username: null })).rejects.toThrow(ValidationError);
        });

        // TC-R-04: Thiếu password
        it('TC-R-04: Thiếu password → ValidationError', async () => {
            await expect(authService.register({ ...validData, password: null })).rejects.toThrow(ValidationError);
        });

        // TC-R-05: Thiếu email
        it('TC-R-05: Thiếu email → ValidationError', async () => {
            await expect(authService.register({ ...validData, email: null })).rejects.toThrow(ValidationError);
        });

        // TC-R-06: Thiếu full_name
        it('TC-R-06: Thiếu full_name → ValidationError', async () => {
            await expect(authService.register({ ...validData, full_name: null })).rejects.toThrow(ValidationError);
        });

        // TC-R-07: Username quá ngắn (Boundary: < 3)
        it('TC-R-07: Username quá ngắn (2 chars) → ValidationError', async () => {
            await expect(authService.register({ ...validData, username: 'qu' })).rejects.toThrow(ValidationError);
        });

        // TC-R-08: Username quá dài (Boundary: > 20)
        it('TC-R-08: Username quá dài (> 20 chars) → ValidationError', async () => {
            await expect(authService.register({ ...validData, username: 'quoc_very_long_username_abc' })).rejects.toThrow(ValidationError);
        });

        // TC-R-09: Username bắt đầu bằng số
        it('TC-R-09: Username bắt đầu bằng số → ValidationError', async () => {
            await expect(authService.register({ ...validData, username: '1quocnguyen' })).rejects.toThrow(ValidationError);
        });

        // TC-R-10: Username chứa ký tự đặc biệt
        it('TC-R-10: Username chứa ký tự đặc biệt → ValidationError', async () => {
            await expect(authService.register({ ...validData, username: 'quoc!@#$' })).rejects.toThrow(ValidationError);
        });

        // TC-R-11: Password quá ngắn (Boundary: < 8)
        it('TC-R-11: Password quá ngắn (< 8 chars) → ValidationError', async () => {
            await expect(authService.register({ ...validData, password: 'pass' })).rejects.toThrow(ValidationError);
        });

        // TC-R-12: Password thiếu chữ hoa + ký tự đặc biệt
        it('TC-R-12: Password yếu (thiếu chữ hoa, ký tự đặc biệt) → ValidationError', async () => {
            await expect(authService.register({ ...validData, password: 'password123' })).rejects.toThrow(ValidationError);
        });

        // TC-R-13: Email đã tồn tại trong DB
        it('TC-R-13: Email đã tồn tại → ConflictError', async () => {
            // findOne sẽ trả về account khi query theo email
            Account.findOne.mockImplementation(async (query) =>
                query.email === 'quoc@ex.com' ? { _id: 'existing' } : null
            );
            await expect(authService.register(validData)).rejects.toThrow(ConflictError);
        });

        // TC-R-14: Username đã tồn tại trong DB
        it('TC-R-14: Username đã tồn tại → ConflictError', async () => {
            Account.findOne.mockImplementation(async (query) =>
                query.username === 'quoc123' ? { _id: 'existing' } : null
            );
            await expect(authService.register(validData)).rejects.toThrow(ConflictError);
        });

        // TC-R-15: Số điện thoại đã tồn tại
        it('TC-R-15: Số điện thoại đã tồn tại → ConflictError', async () => {
            Account.findOne.mockImplementation(async (query) =>
                query.phone_number === '0123456789' ? { _id: 'existing' } : null
            );
            await expect(authService.register(validData)).rejects.toThrow(ConflictError);
        });

        // TC-R-16: DB không có Default Role PATIENT
        it('TC-R-16: Không có Role PATIENT trong DB → NotFoundError', async () => {
            Account.findOne.mockResolvedValue(null);
            Role.findOne.mockResolvedValue(null);
            await expect(authService.register(validData)).rejects.toThrow(NotFoundError);
        });
    });

    //  2. login(data)
    //  Input: identifier(email hoặc username), password
    describe('login(data)', () => {
        const validLogin = { identifier: 'user@example.com', password: 'ValidPassword123!' };

        // TC-L-01: Đăng nhập thành công bằng email
        it('TC-L-01: Login thành công bằng email → trả về token, user info', async () => {
            mockLoginSuccess();
            const result = await authService.login({ identifier: 'user@example.com', password: 'ValidPassword123!' });
            expect(result.token).toBe('mock_access_token');
            expect(result.refreshToken).toBe('mock_refresh_token');
            expect(result).toHaveProperty('account');
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('role');
        });

        // TC-L-02: Đăng nhập thành công bằng username
        it('TC-L-02: Login thành công bằng username → trả về token', async () => {
            mockLoginSuccess();
            const result = await authService.login({ identifier: 'quoc123', password: 'ValidPassword123!' });
            expect(result).toHaveProperty('token');
        });

        // TC-L-03: Thiếu identifier
        it('TC-L-03: Thiếu identifier → ValidationError', async () => {
            await expect(authService.login({ password: 'ValidPassword123!' })).rejects.toThrow(ValidationError);
        });

        // TC-L-04: Thiếu password
        it('TC-L-04: Thiếu password → ValidationError', async () => {
            await expect(authService.login({ identifier: 'user@example.com' })).rejects.toThrow(ValidationError);
        });

        // TC-L-05: Email/Username không tồn tại trong DB
        it('TC-L-05: Email/Username không tồn tại → NotFoundError', async () => {
            Account.findOne.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(null)
            });
            await expect(authService.login({ identifier: 'wrong@email.com', password: 'ValidPassword123!' })).rejects.toThrow(NotFoundError);
        });

        // TC-L-06: Tài khoản bị khoá (>= 5 lần sai trong 3p) (Boundary: 5 attempts)
        it('TC-L-06: 5 lần nhập sai trong 3 phút → ForbiddenError (Too many attempts)', async () => {
            const account = { _id: 'acc1', status: 'ACTIVE', password: 'hashedpw', role_id: { name: 'PATIENT', permissions: [] } };
            Account.findOne.mockReturnValue({ select: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue(account) });
            LoginAttempt.countDocuments.mockResolvedValue(5); // Đúng ngưỡng 5
            await expect(authService.login(validLogin)).rejects.toThrow(ForbiddenError);
        });

        // TC-L-07: Tài khoản INACTIVE
        it('TC-L-07: Tài khoản status=INACTIVE → ForbiddenError', async () => {
            const account = { _id: 'acc1', status: 'INACTIVE', password: 'hashedpw', role_id: {} };
            Account.findOne.mockReturnValue({ select: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue(account) });
            LoginAttempt.countDocuments.mockResolvedValue(0);
            await expect(authService.login(validLogin)).rejects.toThrow(ForbiddenError);
        });

        // TC-L-08: Tài khoản PENDING (chưa verify email)
        it('TC-L-08: Tài khoản status=PENDING → ForbiddenError (verify email)', async () => {
            const account = { _id: 'acc1', status: 'PENDING', password: 'hashedpw', role_id: {} };
            Account.findOne.mockReturnValue({ select: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue(account) });
            LoginAttempt.countDocuments.mockResolvedValue(0);
            await expect(authService.login(validLogin)).rejects.toThrow(ForbiddenError);
        });

        // TC-L-09: Sai mật khẩu
        it('TC-L-09: Sai mật khẩu → UnauthorizedError (Invalid password)', async () => {
            const account = { _id: 'acc1', status: 'ACTIVE', password: 'hashedpw', role_id: { name: 'PATIENT', permissions: [] } };
            Account.findOne.mockReturnValue({ select: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue(account) });
            LoginAttempt.countDocuments.mockResolvedValue(0);
            jest.spyOn(bcryptjs, 'compare').mockResolvedValue(false);
            LoginAttempt.create.mockResolvedValue({});
            await expect(authService.login(validLogin)).rejects.toThrow(UnauthorizedError);
        });
    });

    // ===================================================
    //  3. verifyEmail(token)
    //  Input: token (string từ email)
    // ===================================================
    describe('verifyEmail(token)', () => {
        // TC-VE-01: Token hợp lệ, còn hạn, account tồn tại
        it('TC-VE-01: Token hợp lệ → xác thực thành công, account status = ACTIVE', async () => {
            const mockVerification = { _id: 'v1', account_id: 'acc1', expires_at: new Date(Date.now() + 60000), deleteOne: jest.fn() };
            EmailVerification.findOne.mockResolvedValue(mockVerification);
            const mockAccount = { _id: 'acc1', email_verified: false, status: 'PENDING', save: jest.fn() };
            Account.findById.mockResolvedValue(mockAccount);

            await authService.verifyEmail('valid_token');

            expect(mockAccount.email_verified).toBe(true);
            expect(mockAccount.status).toBe('ACTIVE');
            expect(mockAccount.save).toHaveBeenCalled();
            expect(mockVerification.deleteOne).toHaveBeenCalled();
        });

        // TC-VE-02: Token không tồn tại trong DB
        it('TC-VE-02: Token không tồn tại → NotFoundError', async () => {
            EmailVerification.findOne.mockResolvedValue(null);
            await expect(authService.verifyEmail('fake_token')).rejects.toThrow(NotFoundError);
        });

        // TC-VE-03: Token đã hết hạn (expires_at < now) (Boundary)
        it('TC-VE-03: Token hết hạn → ForbiddenError', async () => {
            const expired = { _id: 'v1', expires_at: new Date(Date.now() - 1000), deleteOne: jest.fn() };
            EmailVerification.findOne.mockResolvedValue(expired);
            await expect(authService.verifyEmail('expired_token')).rejects.toThrow(ForbiddenError);
        });

        // TC-VE-04: Token còn hạn nhưng Account bị xoá
        it('TC-VE-04: Account bị xoá khỏi DB → NotFoundError', async () => {
            const valid = { _id: 'v1', account_id: 'acc1', expires_at: new Date(Date.now() + 60000) };
            EmailVerification.findOne.mockResolvedValue(valid);
            Account.findById.mockResolvedValue(null);
            await expect(authService.verifyEmail('valid_token')).rejects.toThrow(NotFoundError);
        });
    });

    // ===================================================
    //  4. forgotPassword(email)
    //  Input: email
    // ===================================================
    describe('forgotPassword(email)', () => {
        // TC-FP-01: Email tồn tại trong DB → gửi OTP
        it('TC-FP-01: Email hợp lệ → tạo OTP và gửi email thành công', async () => {
            Account.findOne.mockResolvedValue({ _id: 'acc1' });
            Profile.findOne.mockResolvedValue({ full_name: 'Quoc Nguyen' });
            PasswordReset.deleteMany.mockResolvedValue({});
            PasswordReset.create.mockResolvedValue({});

            const result = await authService.forgotPassword('user@email.com');

            expect(result.message).toBe('Password reset email sent successfully');
            expect(PasswordReset.create).toHaveBeenCalled();
            expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
        });

        // TC-FP-02: Email không tồn tại trong DB
        it('TC-FP-02: Email không tồn tại trong DB → NotFoundError', async () => {
            Account.findOne.mockResolvedValue(null);
            await expect(authService.forgotPassword('notfound@email.com')).rejects.toThrow(NotFoundError);
        });
    });

    // ===================================================
    //  5. resetPassword(email, otp, newPassword)
    //  Input: email, otp (6 số), newPassword
    // ===================================================
    describe('resetPassword(email, otp, newPassword)', () => {
        // TC-RP-01: Tất cả input hợp lệ → đổi mật khẩu thành công
        it('TC-RP-01: OTP hợp lệ, còn hạn → đổi mật khẩu thành công', async () => {
            Account.findOne.mockResolvedValue({ _id: 'acc1', save: jest.fn() });
            PasswordReset.findOne.mockResolvedValue({ _id: 'otp1', expires_at: new Date(Date.now() + 60000), save: jest.fn() });
            jest.spyOn(bcryptjs, 'hash').mockResolvedValue('newhashedpw');
            PasswordReset.deleteOne.mockResolvedValue({});
            Session.deleteMany.mockResolvedValue({});

            const result = await authService.resetPassword('user@email.com', '123456', 'NewPass@123');

            expect(result.message).toBe('Password reset successfully');
            expect(PasswordReset.deleteOne).toHaveBeenCalled();
            expect(Session.deleteMany).toHaveBeenCalled();
        });

        // TC-RP-02: newPassword null hoặc < 8 ký tự (Boundary)
        it('TC-RP-02: Password mới quá ngắn (null hoặc < 8 chars) → ValidationError', async () => {
            await expect(authService.resetPassword('e@e.com', '123456', null)).rejects.toThrow(ValidationError);
            await expect(authService.resetPassword('e@e.com', '123456', 'short')).rejects.toThrow(ValidationError);
        });

        // TC-RP-03: Password mới không đủ tiêu chí (thiếu hoa, số, ký tự đặc biệt)
        it('TC-RP-03: Password mới yếu (không đủ regex) → ValidationError', async () => {
            await expect(authService.resetPassword('e@e.com', '123456', 'weakpassword')).rejects.toThrow(ValidationError);
        });

        // TC-RP-04: Email không tồn tại trong DB
        it('TC-RP-04: Account không tồn tại → NotFoundError', async () => {
            Account.findOne.mockResolvedValue(null);
            await expect(authService.resetPassword('notfound@e.com', '123456', 'NewPass@123')).rejects.toThrow(NotFoundError);
        });

        // TC-RP-05: OTP sai hoặc không tồn tại trong DB
        it('TC-RP-05: OTP sai/không tồn tại → UnauthorizedError', async () => {
            Account.findOne.mockResolvedValue({ _id: 'acc1' });
            PasswordReset.findOne.mockResolvedValue(null); // OTP không khớp
            await expect(authService.resetPassword('e@e.com', '000000', 'NewPass@123')).rejects.toThrow(UnauthorizedError);
        });

        // TC-RP-06: OTP hết hạn (expires_at < now) (Boundary)
        it('TC-RP-06: OTP hết hạn → UnauthorizedError', async () => {
            Account.findOne.mockResolvedValue({ _id: 'acc1' });
            PasswordReset.findOne.mockResolvedValue({ _id: 'otp1', expires_at: new Date(Date.now() - 1000) });
            PasswordReset.deleteOne.mockResolvedValue({});
            await expect(authService.resetPassword('e@e.com', '123456', 'NewPass@123')).rejects.toThrow(UnauthorizedError);
        });
    });

    // ===================================================
    //  6. changePassword(account_id, currentPassword, newPassword)
    //  Input: account_id, currentPassword, newPassword
    // ===================================================
    describe('changePassword(account_id, currentPassword, newPassword)', () => {
        // TC-CP-01: Đổi mật khẩu thành công
        it('TC-CP-01: Mật khẩu cũ đúng, mật khẩu mới hợp lệ → thành công', async () => {
            const mockAccount = { _id: 'acc1', password: 'hashedold', save: jest.fn() };
            Account.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockAccount) });
            jest.spyOn(bcryptjs, 'compare')
                .mockResolvedValueOnce(true)  // currentPassword đúng
                .mockResolvedValueOnce(false); // newPassword khác với old
            jest.spyOn(bcryptjs, 'hash').mockResolvedValue('hashednew');
            Session.deleteMany.mockResolvedValue({});

            const result = await authService.changePassword('acc1', 'OldPass@123', 'NewPass@123');

            expect(result.message).toBe('Password changed successfully');
            expect(Session.deleteMany).toHaveBeenCalled();
        });

        // TC-CP-02: newPassword null hoặc < 8 ký tự (Boundary)
        it('TC-CP-02: Password mới null hoặc < 8 chars → ValidationError', async () => {
            await expect(authService.changePassword('acc1', 'OldPass@123', null)).rejects.toThrow(ValidationError);
            await expect(authService.changePassword('acc1', 'OldPass@123', 'short')).rejects.toThrow(ValidationError);
        });

        // TC-CP-03: newPassword không đủ regex
        it('TC-CP-03: Password mới yếu (thiếu hoa/thường/số/ký tự đặc biệt) → ValidationError', async () => {
            await expect(authService.changePassword('acc1', 'OldPass@123', 'weakpassword')).rejects.toThrow(ValidationError);
        });

        // TC-CP-04: account_id không tồn tại
        it('TC-CP-04: Account không tồn tại → NotFoundError', async () => {
            Account.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
            await expect(authService.changePassword('fake_id', 'OldPass@123', 'NewPass@123')).rejects.toThrow(NotFoundError);
        });

        // TC-CP-05: Mật khẩu cũ không khớp
        it('TC-CP-05: Mật khẩu cũ sai → UnauthorizedError', async () => {
            const mockAccount = { _id: 'acc1', password: 'hashedold', save: jest.fn() };
            Account.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockAccount) });
            jest.spyOn(bcryptjs, 'compare').mockResolvedValue(false); // currentPassword sai
            await expect(authService.changePassword('acc1', 'WrongPass@123', 'NewPass@123')).rejects.toThrow(UnauthorizedError);
        });

        // TC-CP-06: Mật khẩu mới giống mật khẩu cũ
        it('TC-CP-06: Mật khẩu mới trùng mật khẩu cũ → UnauthorizedError', async () => {
            const mockAccount = { _id: 'acc1', password: 'hashedold', save: jest.fn() };
            Account.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockAccount) });
            jest.spyOn(bcryptjs, 'compare')
                .mockResolvedValueOnce(true)  // currentPassword đúng
                .mockResolvedValueOnce(true); // newPassword == old → lỗi
            await expect(authService.changePassword('acc1', 'SamePass@123', 'SamePass@123')).rejects.toThrow(UnauthorizedError);
        });
    });

    //  7. logout(refreshToken)
    //  Input: refreshToken (string)
    describe('logout(refreshToken)', () => {
        // TC-LO-01: Session hợp lệ, chưa bị revoke
        it('TC-LO-01: Logout thành công → xoá session', async () => {
            Session.findOne.mockResolvedValue({ _id: 'ses1', revoked_at: null });
            Session.deleteOne.mockResolvedValue({});

            const result = await authService.logout('valid_refresh_token');
            expect(result.message).toBe('Logged out successfully');
            expect(Session.deleteOne).toHaveBeenCalled();
        });

        // TC-LO-02: Refresh token không tồn tại trong DB
        it('TC-LO-02: Session không tìm thấy → NotFoundError', async () => {
            Session.findOne.mockResolvedValue(null);
            await expect(authService.logout('invalid_token')).rejects.toThrow(NotFoundError);
        });

        // TC-LO-03: Session đã bị revoke trước đó
        it('TC-LO-03: Session đã bị revoke → UnauthorizedError', async () => {
            Session.findOne.mockResolvedValue({ _id: 'ses1', revoked_at: new Date() });
            await expect(authService.logout('revoked_token')).rejects.toThrow(UnauthorizedError);
        });
    });

    //  8. refreshToken(refreshToken)
    //  Input: refreshToken (string)
    describe('refreshToken(refreshToken)', () => {
        // TC-RT-01: Session hợp lệ, account active → cấp token mới
        it('TC-RT-01: Session hợp lệ, account active → trả về access token mới', async () => {
            Session.findOne.mockResolvedValue({ _id: 'ses1', account_id: 'acc1', revoked_at: null, expires_at: new Date(Date.now() + 60000) });
            Account.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ _id: 'acc1', status: 'ACTIVE', role_id: { name: 'PATIENT' } })
            });
            Profile.findOne.mockResolvedValue({ _id: 'prof1' });
            signToken.mockReturnValue('new_access_token');

            const result = await authService.refreshToken('valid_refresh_token');
            expect(result.token).toBe('new_access_token');
        });

        // TC-RT-02: Session không tồn tại
        it('TC-RT-02: Session không tồn tại → NotFoundError', async () => {
            Session.findOne.mockResolvedValue(null);
            await expect(authService.refreshToken('invalid_token')).rejects.toThrow(NotFoundError);
        });

        // TC-RT-03: Session đã bị revoke
        it('TC-RT-03: Session đã bị revoke → UnauthorizedError', async () => {
            Session.findOne.mockResolvedValue({ _id: 'ses1', revoked_at: new Date() });
            await expect(authService.refreshToken('revoked_token')).rejects.toThrow(UnauthorizedError);
        });

        // TC-RT-04: Session đã hết hạn (Boundary: expires_at < now)
        it('TC-RT-04: Session hết hạn → ForbiddenError, session bị xoá', async () => {
            const expiredSession = { _id: 'ses1', revoked_at: null, expires_at: new Date(Date.now() - 1000), deleteOne: jest.fn() };
            Session.findOne.mockResolvedValue(expiredSession);
            await expect(authService.refreshToken('expired_token')).rejects.toThrow(ForbiddenError);
            expect(expiredSession.deleteOne).toHaveBeenCalled();
        });

        // TC-RT-05: Account bị xoá sau khi session tạo
        it('TC-RT-05: Account bị xoá → NotFoundError', async () => {
            Session.findOne.mockResolvedValue({ _id: 'ses1', account_id: 'acc1', revoked_at: null, expires_at: new Date(Date.now() + 60000) });
            Account.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
            await expect(authService.refreshToken('valid_token')).rejects.toThrow(NotFoundError);
        });

        // TC-RT-06: Account INACTIVE hoặc PENDING
        it('TC-RT-06: Account status=INACTIVE hoặc PENDING → ForbiddenError', async () => {
            Session.findOne.mockResolvedValue({ _id: 'ses1', account_id: 'acc1', revoked_at: null, expires_at: new Date(Date.now() + 60000) });
            Account.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({ _id: 'acc1', status: 'INACTIVE', role_id: { name: 'PATIENT' } })
            });
            await expect(authService.refreshToken('valid_token')).rejects.toThrow(ForbiddenError);
        });
    });
});
