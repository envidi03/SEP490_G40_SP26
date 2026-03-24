import React from 'react';
import PropTypes from 'prop-types';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

/**
 * PasswordChangeSection - Component đổi mật khẩu
 * Hiển thị form đổi mật khẩu với validation và toggles hiển thị mật khẩu
 */
const PasswordChangeSection = ({
    isOpen,
    onToggle,
    passwordData,
    errors = {},
    onChange,
    onSubmit,
    loading
}) => {
    const [showCurrent, setShowCurrent] = React.useState(false);
    const [showNew, setShowNew] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Bảo mật</h3>
                        <p className="text-gray-600 text-sm">Quản lý mật khẩu và cài đặt bảo mật</p>
                    </div>
                    {!isOpen && (
                        <button
                            onClick={onToggle}
                            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <Lock size={18} />
                            Đổi mật khẩu
                        </button>
                    )}
                </div>

                {/* Password Change Form */}
                {isOpen && (
                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <Input
                                label="Mật khẩu hiện tại"
                                type={showCurrent ? "text" : "password"}
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={onChange}
                                error={errors.currentPassword}
                                className="w-full"
                                suffix={
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="text-gray-400 hover:text-primary-600 transition-colors"
                                        title={showCurrent ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <Input
                                label="Mật khẩu mới"
                                type={showNew ? "text" : "password"}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={onChange}
                                error={errors.newPassword}
                                className="w-full"
                                placeholder="Ít nhất 6 ký tự"
                                suffix={
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="text-gray-400 hover:text-primary-600 transition-colors"
                                        title={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <Input
                                label="Xác nhận mật khẩu mới"
                                type={showConfirm ? "text" : "password"}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={onChange}
                                error={errors.confirmPassword}
                                className="w-full"
                                suffix={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="text-gray-400 hover:text-primary-600 transition-colors"
                                        title={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700"
                            >
                                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </Button>
                            <button
                                type="button"
                                onClick={() => {
                                    onToggle();
                                    // Password states reset when component toggles
                                }}
                                disabled={loading}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

PasswordChangeSection.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    passwordData: PropTypes.shape({
        currentPassword: PropTypes.string.isRequired,
        newPassword: PropTypes.string.isRequired,
        confirmPassword: PropTypes.string.isRequired,
    }).isRequired,
    errors: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default PasswordChangeSection;
