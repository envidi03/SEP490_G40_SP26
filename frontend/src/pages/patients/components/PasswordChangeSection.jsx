import React from 'react';
import PropTypes from 'prop-types';
import { Lock } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

/**
 * PasswordChangeSection - Component đổi mật khẩu
 * Hiển thị form đổi mật khẩu với validation
 * 
 * @param {boolean} isOpen - Có hiển thị form hay không
 * @param {function} onToggle - Callback khi click nút đổi mật khẩu
 * @param {Object} passwordData - Dữ liệu password (currentPassword, newPassword, confirmPassword)
 * @param {function} onChange - Callback khi thay đổi password input
 * @param {function} onSubmit - Callback khi submit form
 * @param {boolean} loading - Có đang loading hay không
 */
const PasswordChangeSection = ({
    isOpen,
    onToggle,
    passwordData,
    onChange,
    onSubmit,
    loading
}) => {
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu hiện tại
                            </label>
                            <Input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={onChange}
                                className="w-full"
                                required
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu mới
                            </label>
                            <Input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={onChange}
                                className="w-full"
                                placeholder="Ít nhất 6 ký tự"
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Xác nhận mật khẩu mới
                            </label>
                            <Input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={onChange}
                                className="w-full"
                                required
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
                                    // Reset form handled by parent
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
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default PasswordChangeSection;
