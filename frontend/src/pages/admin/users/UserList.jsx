import React, { useState } from 'react';
import { Users, Shield, UserCheck } from 'lucide-react';

// Import components
import UserStatsCards from './components/UserStatsCards';
import UserFilters from './components/UserFilters';
import UserTable from './components/UserTable';
import UserMobileList from './components/UserMobileList';
import UserPagination from './components/UserPagination';

// Import modals
import UserDetailModal from './components/modals/UserDetailModal';
import UserFormModal from './components/modals/UserFormModal';
import ConfirmModal from './components/modals/ConfirmModal';

// Mock data for users
const mockUsers = [
    {
        id: 1,
        username: 'admin01',
        fullName: 'Nguyễn Văn Admin',
        email: 'admin@dental.com',
        phone: '0912345678',
        role: 'Admin',
        status: 'active',
        emailVerified: true,
        createdAt: '2025-01-15',
        lastLogin: '2026-01-19 10:30'
    },
    {
        id: 2,
        username: 'doctor_tran',
        fullName: 'BS. Trần Văn Bình',
        email: 'tranbinh@dental.com',
        phone: '0923456789',
        role: 'Doctor',
        status: 'active',
        emailVerified: true,
        createdAt: '2025-03-20',
        lastLogin: '2026-01-19 09:15',
        certificateUrl: 'https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=Doctor+Certificate'
    },
    {
        id: 3,
        username: 'receptionist_mai',
        fullName: 'Lê Thị Mai',
        email: 'mai.le@dental.com',
        phone: '0934567890',
        role: 'Receptionist',
        status: 'active',
        emailVerified: true,
        createdAt: '2025-05-10',
        lastLogin: '2026-01-18 16:45'
    },
    {
        id: 4,
        username: 'pharmacy_an',
        fullName: 'Phạm Thị An',
        email: 'an.pham@dental.com',
        phone: '0945678901',
        role: 'Pharmacy',
        status: 'active',
        emailVerified: true,
        createdAt: '2025-06-15',
        lastLogin: '2026-01-19 08:00'
    },
    {
        id: 5,
        username: 'assistant_linh',
        fullName: 'Hoàng Thị Linh',
        email: 'linh.hoang@dental.com',
        phone: '0956789012',
        role: 'Assistant',
        status: 'active',
        emailVerified: true,
        createdAt: '2025-08-22',
        lastLogin: '2026-01-19 07:30'
    },
    {
        id: 6,
        username: 'doctor_pham',
        fullName: 'BS. Phạm Thị Cẩm',
        email: 'cam.pham@dental.com',
        phone: '0967890123',
        role: 'Doctor',
        status: 'inactive',
        emailVerified: true,
        createdAt: '2025-09-01',
        lastLogin: '2025-12-20 14:20'
    },
    {
        id: 7,
        username: 'patient_nguyen',
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0978901234',
        role: 'Patient',
        status: 'active',
        emailVerified: false,
        createdAt: '2026-01-10',
        lastLogin: '2026-01-18 11:00'
    },
];

const roleConfig = {
    Admin: { label: 'Quản trị viên', color: 'bg-red-100 text-red-800', icon: Shield },
    Doctor: { label: 'Bác sĩ', color: 'bg-blue-100 text-blue-800', icon: UserCheck },
    Receptionist: { label: 'Lễ tân', color: 'bg-purple-100 text-purple-800', icon: Users },
    Pharmacy: { label: 'Dược sĩ', color: 'bg-green-100 text-green-800', icon: UserCheck },
    Assistant: { label: 'Trợ lý', color: 'bg-yellow-100 text-yellow-800', icon: Users },
    Patient: { label: 'Bệnh nhân', color: 'bg-gray-100 text-gray-800', icon: Users },
};

const statusConfig = {
    active: { label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
    inactive: { label: 'Tạm khóa', color: 'bg-red-100 text-red-800' },
    pending: { label: 'Chờ xác thực', color: 'bg-yellow-100 text-yellow-800' },
};

const UserList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Modal states
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formMode, setFormMode] = useState('add');
    const [confirmAction, setConfirmAction] = useState(null);

    // Filter logic
    const filteredUsers = mockUsers.filter(user => {
        const matchesSearch =
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Calculate stats
    const stats = {
        total: mockUsers.length,
        active: mockUsers.filter(u => u.status === 'active').length,
        inactive: mockUsers.filter(u => u.status === 'inactive').length,
        admins: mockUsers.filter(u => u.role === 'Admin').length,
        doctors: mockUsers.filter(u => u.role === 'Doctor').length,
        staff: mockUsers.filter(u => ['Receptionist', 'Pharmacy', 'Assistant'].includes(u.role)).length,
    };

    // Action handlers
    const handleViewUser = (user) => {
        setSelectedUser(user);
        setDetailModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setFormMode('edit');
        setFormModalOpen(true);
    };

    const handleLockUnlock = (user) => {
        setSelectedUser(user);
        setConfirmAction({
            type: user.status === 'active' ? 'lock' : 'unlock',
            title: user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
            message: user.status === 'active'
                ? `Bạn có chắc muốn khóa tài khoản của ${user.fullName}?`
                : `Bạn có chắc muốn mở khóa tài khoản của ${user.fullName}?`,
            confirmText: user.status === 'active' ? 'Khóa' : 'Mở khóa',
            confirmColor: user.status === 'active' ? 'yellow' : 'green',
            onConfirm: () => {
                console.log(`${confirmAction.type} user:`, user.id);
                // TODO: API call to lock/unlock user
            }
        });
        setConfirmModalOpen(true);
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setConfirmAction({
            type: 'delete',
            title: 'Xóa người dùng',
            message: `Bạn có chắc muốn xóa người dùng ${user.fullName}? Hành động này không thể hoàn tác.`,
            confirmText: 'Xóa',
            confirmColor: 'red',
            onConfirm: () => {
                console.log('Delete user:', user.id);
                // TODO: API call to delete user
            }
        });
        setConfirmModalOpen(true);
    };

    const handleFormSubmit = (formData) => {
        console.log('Form submitted:', formData);
        // TODO: API call to add/edit user
        setFormModalOpen(false);
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setFormMode('add');
        setFormModalOpen(true);
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Người dùng</h1>
                    <p className="text-gray-600 mt-1">Quản lý tài khoản và phân quyền hệ thống</p>
                </div>

                {/* Add User Button */}
                <button
                    onClick={handleAddUser}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <Users size={20} />
                    <span>Thêm người dùng</span>
                </button>
            </div>

            {/* Stats Cards */}
            <UserStatsCards stats={stats} />

            {/* Filters */}
            <UserFilters
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                filterRole={filterRole}
                onRoleChange={(e) => setFilterRole(e.target.value)}
                filterStatus={filterStatus}
                onStatusChange={(e) => setFilterStatus(e.target.value)}
            />

            {/* Desktop Table View */}
            <UserTable
                users={filteredUsers}
                roleConfig={roleConfig}
                statusConfig={statusConfig}
                onView={handleViewUser}
                onEdit={handleEditUser}
                onLockUnlock={handleLockUnlock}
                onDelete={handleDeleteUser}
            />

            {/* Mobile Card View */}
            <UserMobileList
                users={filteredUsers}
                roleConfig={roleConfig}
                statusConfig={statusConfig}
                onView={handleViewUser}
                onEdit={handleEditUser}
                onLockUnlock={handleLockUnlock}
                onDelete={handleDeleteUser}
            />

            {/* Pagination */}
            {filteredUsers.length > 0 && (
                <UserPagination
                    currentCount={filteredUsers.length}
                    totalCount={mockUsers.length}
                />
            )}

            {/* Modals */}
            <UserDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                user={selectedUser}
                roleConfig={roleConfig}
                statusConfig={statusConfig}
            />

            <UserFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                user={selectedUser}
                mode={formMode}
            />

            <ConfirmModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={confirmAction?.onConfirm}
                title={confirmAction?.title}
                message={confirmAction?.message}
                confirmText={confirmAction?.confirmText}
                confirmColor={confirmAction?.confirmColor}
            />
        </div>
    );
};

export default UserList;
