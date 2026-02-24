import React from 'react';
import Card from '../../../../components/ui/Card';
import { Users } from 'lucide-react';
import UserMobileCard from './UserMobileCard';

const UserMobileList = ({ users, roleConfig, statusConfig, onView, onEdit, onLockUnlock, onDelete }) => {
    return (
        <div className="lg:hidden space-y-4">
            {users.length === 0 ? (
                <Card>
                    <div className="py-12 text-center">
                        <Users size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Không tìm thấy người dùng nào</p>
                    </div>
                </Card>
            ) : (
                users.map((user) => (
                    <UserMobileCard
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
        </div>
    );
};

export default UserMobileList;
