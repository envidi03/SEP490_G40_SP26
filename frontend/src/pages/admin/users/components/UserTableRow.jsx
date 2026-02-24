import React from 'react';
import Badge from '../../../../components/ui/Badge';
import { formatDateTime } from '../../../../utils/dateUtils';
import {
    Edit,
    Trash2,
    Eye,
    Lock,
    Unlock,
    UserCheck,
    Mail,
    Phone,
    Calendar
} from 'lucide-react';

const UserTableRow = ({ user, roleConfig, statusConfig, onView, onEdit, onLockUnlock, onDelete }) => {
    const RoleIcon = roleConfig[user.role]?.icon;

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        {RoleIcon && <RoleIcon className="text-primary-600" size={20} />}
                    </div>
                    <div className="min-w-0">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                            <span className="truncate">{user.fullName}</span>
                            {user.emailVerified && (
                                <UserCheck
                                    className="text-green-600 flex-shrink-0"
                                    size={16}
                                    title="Email đã xác thực"
                                />
                            )}
                        </div>
                        <div className="text-sm text-gray-500 truncate">@{user.username}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} className="flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} className="flex-shrink-0" />
                        {user.phone}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={roleConfig[user.role]?.color}>
                    {roleConfig[user.role]?.label}
                </Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={statusConfig[user.status]?.color}>
                    {statusConfig[user.status]?.label}
                </Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar size={14} />
                    {formatDateTime(user.lastLogin)}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => onView(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => onEdit(user)}
                        className="text-green-600 hover:text-green-900"
                        title="Chỉnh sửa"
                    >
                        <Edit size={18} />
                    </button>
                    {user.status === 'active' ? (
                        <button
                            onClick={() => onLockUnlock(user)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Khóa tài khoản"
                        >
                            <Lock size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={() => onLockUnlock(user)}
                            className="text-green-600 hover:text-green-900"
                            title="Mở khóa"
                        >
                            <Unlock size={18} />
                        </button>
                    )}
                    {user.role !== 'ADMIN_CLINIC' && (
                        <button
                            onClick={() => onDelete(user)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default UserTableRow;
