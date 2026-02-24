import React from 'react';
import Card from '../../../../components/ui/Card';
import { Users } from 'lucide-react';
import UserTableRow from './UserTableRow';

const UserTable = ({ users, roleConfig, statusConfig, onView, onEdit, onLockUnlock, onDelete }) => {
    return (
        <Card className="hidden lg:block">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Người dùng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Liên hệ
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vai trò
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ngày tạo
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <Users size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">Không tìm thấy người dùng nào</p>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <UserTableRow
                                    key={user.id}
                                    user={user}
                                    roleConfig={roleConfig}
                                    statusConfig={statusConfig}
                                    onView={onView}
                                    onEdit={onEdit}
                                    onLockUnlock={onLockUnlock}
                                    onDelete={onDelete}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default UserTable;
