import React from 'react';
import Badge from '../../../../components/ui/Badge';
import { formatDateTime } from '../../../../utils/dateUtils';
import {
    Edit,
    Eye,
    Lock,
    Unlock,
    UserCheck,
    Mail,
    Phone,
    Calendar,
    Users
} from 'lucide-react';

const UserTableRow = ({ user, roleConfig, statusConfig, onView, onEdit, onLockUnlock }) => {
    const RoleIcon = roleConfig[user.role]?.icon;

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        {RoleIcon ? <RoleIcon className="text-primary-600" size={20} /> : <Users size={20} className="text-primary-600" />}
                    </div>
                    <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{user.fullName}</div>
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
                        {user.phone || '—'}
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
                    {statusConfig[user.status]?.label || user.status}
                </Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} className="flex-shrink-0" />
                    {user.createdAt ? formatDateTime(user.createdAt) : '—'}
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
                    {user.status === 'ACTIVE' ? (
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
                </div>
            </td>
        </tr>
    );
};

export default UserTableRow;
