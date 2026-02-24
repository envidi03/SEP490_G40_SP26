import React from 'react';
import { X, Mail, Phone, Calendar, Shield, CheckCircle, FileText } from 'lucide-react';
import Badge from '../../../../../components/ui/Badge';
import { formatDate, formatDateTime } from '../../../../../utils/dateUtils';

const UserDetailModal = ({ isOpen, onClose, user, roleConfig, statusConfig }) => {
    if (!isOpen || !user) return null;

    const RoleIcon = roleConfig[user.role]?.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Chi tiết người dùng</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Avatar & Basic Info */}
                    <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            {RoleIcon && <RoleIcon className="text-primary-600" size={32} />}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{user.fullName}</h3>
                            <div className="flex gap-2 mb-3">
                                <Badge className={roleConfig[user.role]?.color}>
                                    {roleConfig[user.role]?.label}
                                </Badge>
                                <Badge className={statusConfig[user.status]?.color}>
                                    {statusConfig[user.status]?.label}
                                </Badge>
                                {user.emailVerified && (
                                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                        <CheckCircle size={14} />
                                        Email xác thực
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Username</label>
                            <p className="mt-1 text-gray-900">@{user.username}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <Mail size={14} />
                                Email
                            </label>
                            <p className="mt-1 text-gray-900">{user.email}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <Phone size={14} />
                                Số điện thoại
                            </label>
                            <p className="mt-1 text-gray-900">{user.phone}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <Shield size={14} />
                                Vai trò
                            </label>
                            <p className="mt-1 text-gray-900">{roleConfig[user.role]?.label}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <Calendar size={14} />
                                Ngày tạo
                            </label>
                            <p className="mt-1 text-gray-900">{formatDate(user.createdAt)}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                <Calendar size={14} />
                                Đăng nhập cuối
                            </label>
                            <p className="mt-1 text-gray-900">{formatDateTime(user.lastLogin)}</p>
                        </div>
                    </div>

                    {/* Doctor Certificate - Only for Doctors */}
                    {user.role === 'Doctor' && (user.certificateUrl || user.certificate) && (
                        <div className="border-t border-gray-200 pt-6">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                <FileText size={16} className="text-purple-600" />
                                Chứng chỉ hành nghề
                            </label>

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                {user.certificateUrl ? (
                                    user.certificateUrl.endsWith('.pdf') ? (
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-16 h-16 bg-red-100 rounded flex items-center justify-center">
                                                <FileText className="text-red-600" size={32} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">Chứng chỉ (PDF)</p>
                                                <a
                                                    href={user.certificateUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-purple-600 hover:text-purple-700 underline"
                                                >
                                                    Xem file PDF
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <img
                                                src={user.certificateUrl}
                                                alt="Chứng chỉ hành nghề"
                                                className="w-full max-w-md mx-auto rounded-lg border border-gray-300 shadow-sm"
                                            />
                                            <div className="mt-2 text-center">
                                                <a
                                                    href={user.certificateUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-purple-600 hover:text-purple-700 underline"
                                                >
                                                    Xem ảnh full size
                                                </a>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <p className="text-sm text-gray-600 italic">Chưa upload chứng chỉ</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
