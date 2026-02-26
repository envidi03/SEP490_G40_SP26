import React from 'react';
import Card from '../../../../components/ui/Card';
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

const UserMobileCard = ({ user, roleConfig, statusConfig, onView, onEdit, onLockUnlock, onDelete }) => {
    const RoleIcon = roleConfig[user.role]?.icon;

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        {RoleIcon && <RoleIcon className="text-primary-600" size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{user.fullName}</h3>
                        </div>
                        <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                        <div className="flex gap-2 mt-2">
                            <Badge className={roleConfig[user.role]?.color}>
                                {roleConfig[user.role]?.label || user.role}
                            </Badge>
                            <Badge className={statusConfig[user.status]?.color}>
                                {statusConfig[user.status]?.label || user.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={16} className="flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={16} className="flex-shrink-0" />
                        <span>{user.phone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="flex-shrink-0" />
                        <span className="text-xs">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                        onClick={() => onView(user)}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        <Eye size={16} />
                        Xem
                    </button>
                    <button
                        onClick={() => onEdit(user)}
                        className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        <Edit size={16} />
                        Sửa
                    </button>
                    {user.status === 'ACTIVE' ? (
                        <button
                            onClick={() => onLockUnlock(user)}
                            className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <Lock size={16} />
                            Khóa
                        </button>
                    ) : (
                        <button
                            onClick={() => onLockUnlock(user)}
                            className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <Unlock size={16} />
                            Mở
                        </button>
                    )}
                    {user.role !== 'ADMIN_CLINIC' && (
                        <button
                            onClick={() => onDelete(user)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default UserMobileCard;
