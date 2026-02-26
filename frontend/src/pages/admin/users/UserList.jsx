import React, { useState, useEffect, useCallback } from 'react';
import { Users, Shield, UserCheck, Plus } from 'lucide-react';
import Toast from '../../../components/ui/Toast';
import staffService from '../../../services/staffService';

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

// =============================================
// CONFIG: Role & Status mapping
// Tên role phải khớp với field account.role_id.name từ backend
// =============================================
const roleConfig = {
    ADMIN_CLINIC: { label: 'Quản trị viên', color: 'bg-red-100 text-red-800', icon: Shield },
    DOCTOR: { label: 'Bác sĩ', color: 'bg-blue-100 text-blue-800', icon: UserCheck },
    RECEPTIONIST: { label: 'Lễ tân', color: 'bg-purple-100 text-purple-800', icon: Users },
    PHARMACY: { label: 'Dược sĩ', color: 'bg-green-100 text-green-800', icon: UserCheck },
    ASSISTANT: { label: 'Trợ lý', color: 'bg-yellow-100 text-yellow-800', icon: Users },
    PATIENT: { label: 'Bệnh nhân', color: 'bg-gray-100 text-gray-800', icon: Users },
};

const statusConfig = {
    ACTIVE: { label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
    INACTIVE: { label: 'Tạm khóa', color: 'bg-red-100 text-red-800' },
    PENDING: { label: 'Chờ xác thực', color: 'bg-yellow-100 text-yellow-800' },
};

/**
 * Normalize staff data từ API về flat structure dùng trong UI
 * API trả về: { _id, account: {_id, username, email, phone_number, status}, profile: {full_name, ...} }
 */
const normalizeStaff = (staff) => ({
    // ID của Staff document (dùng cho view detail)
    _id: staff._id,
    // ID của Account (dùng cho update/status)
    accountId: staff.account?._id,
    username: staff.account?.username || '',
    email: staff.account?.email || '',
    phone: staff.account?.phone_number || '',
    status: staff.account?.status || 'INACTIVE',
    createdAt: staff.account?.createdAt,
    // Profile fields
    fullName: staff.profile?.full_name || 'Chưa có tên',
    gender: staff.profile?.gender,
    dob: staff.profile?.dob,
    address: staff.profile?.address,
    avatarUrl: staff.profile?.avatar_url,
    // Role - staff list không join role name, cần xử lý từ account.role_id nếu có
    role: staff.account?.role_id?.name || '',
    // License (chỉ có ở getById)
    licenses: staff.licenses || [],
});

const UserList = () => {
    // ========== STATE ==========
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, size: 10, totalItems: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // Modal states
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formMode, setFormMode] = useState('add');
    const [confirmAction, setConfirmAction] = useState(null);

    // ========== API CALLS ==========
    const fetchUsers = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: pagination.size,
                ...(searchTerm.trim() && { search: searchTerm.trim() }),
            };
            const response = await staffService.getStaffs(params);
            const raw = response?.data || [];
            const pagi = response?.pagination || {};

            setUsers(raw.map(normalizeStaff));
            setPagination({
                page: pagi.page || page,
                size: pagi.size || 10,
                totalItems: pagi.totalItems || 0,
                totalPages: Math.ceil((pagi.totalItems || 0) / (pagi.size || 10))
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            setToast({ show: true, type: 'error', message: '❌ Không thể tải danh sách người dùng.' });
        } finally {
            setLoading(false);
        }
    }, [searchTerm, pagination.size]);

    useEffect(() => {
        fetchUsers(1);
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // ========== CLIENT-SIDE FILTER (role & status — backend không hỗ trợ) ==========
    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchesRole && matchesStatus;
    });

    // ========== STATS ==========
    const stats = {
        total: pagination.totalItems,
        active: users.filter(u => u.status === 'ACTIVE').length,
        inactive: users.filter(u => u.status === 'INACTIVE').length,
        admins: users.filter(u => u.role === 'ADMIN_CLINIC').length,
        doctors: users.filter(u => u.role === 'DOCTOR').length,
        staff: users.filter(u => ['RECEPTIONIST', 'PHARMACIST', 'ASSISTANT'].includes(u.role)).length,
    };

    // ========== HANDLERS ==========
    const showToast = (type, message) => setToast({ show: true, type, message });

    const handleViewUser = async (user) => {
        try {
            const detail = await staffService.getStaffById(user._id);
            const normalized = normalizeStaff(detail?.data || detail || user);
            setSelectedUser(normalized);
        } catch (error) {
            console.error('Error fetching user detail:', error);
            setSelectedUser(user);
        }
        setDetailModalOpen(true);
    };

    const handleEditUser = async (user) => {
        setSelectedUser(user);
        setFormMode('edit');
        setFormModalOpen(true);
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setFormMode('add');
        setFormModalOpen(true);
    };

    const handleLockUnlock = (user) => {
        const isActive = user.status === 'ACTIVE';
        setSelectedUser(user);
        setConfirmAction({
            type: isActive ? 'lock' : 'unlock',
            title: isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
            message: isActive
                ? `Bạn có chắc muốn khóa tài khoản của ${user.fullName}?`
                : `Bạn có chắc muốn mở khóa tài khoản của ${user.fullName}?`,
            confirmText: isActive ? 'Khóa' : 'Mở khóa',
            confirmColor: isActive ? 'yellow' : 'green',
            onConfirm: async () => {
                try {
                    await staffService.updateStaffStatus(user.accountId, isActive ? 'INACTIVE' : 'ACTIVE');
                    showToast('success', isActive ? '✅ Đã khóa tài khoản!' : '✅ Đã mở khóa tài khoản!');
                    fetchUsers(pagination.page);
                } catch (error) {
                    showToast('error', error?.message || '❌ Có lỗi xảy ra.');
                }
                setConfirmModalOpen(false);
            }
        });
        setConfirmModalOpen(true);
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setConfirmAction({
            type: 'delete',
            title: 'Xóa người dùng',
            message: `Bạn có chắc muốn xóa người dùng ${user.fullName}? Hành động này sẽ khóa tài khoản vĩnh viễn.`,
            confirmText: 'Xóa',
            confirmColor: 'red',
            onConfirm: async () => {
                try {
                    await staffService.updateStaffStatus(user.accountId, 'INACTIVE');
                    showToast('success', '✅ Đã xóa người dùng!');
                    fetchUsers(pagination.page);
                } catch (error) {
                    showToast('error', error?.message || '❌ Có lỗi xảy ra khi xóa.');
                }
                setConfirmModalOpen(false);
            }
        });
        setConfirmModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            const data = new FormData();
            data.append('full_name', formData.fullName);
            data.append('email', formData.email);
            data.append('phone_number', formData.phone);
            data.append('username', formData.username);
            data.append('role_id', formData.role_id);
            data.append('gender', formData.gender || 'OTHER');
            if (formData.dob) data.append('dob', formData.dob);
            if (formData.address) data.append('address', formData.address);

            if (formMode === 'add') {
                data.append('password', formData.password);
                if (formData.certificate) data.append('license', formData.certificate);
                if (formData.avatar) data.append('avatar', formData.avatar);
                await staffService.createStaff(data);
                showToast('success', '✅ Thêm người dùng thành công!');
            } else {
                if (formData.certificate) data.append('license', formData.certificate);
                if (formData.avatar) data.append('avatar', formData.avatar);
                await staffService.updateStaff(selectedUser.accountId, data);
                showToast('success', '✅ Cập nhật thông tin thành công!');
            }

            setFormModalOpen(false);
            fetchUsers(pagination.page);
        } catch (error) {
            console.error('Error saving user:', error);
            showToast('error', error?.response?.data?.message || error?.message || '❌ Có lỗi xảy ra.');
        }
    };

    // ========== RENDER ==========
    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Người dùng</h1>
                    <p className="text-gray-600 mt-1">Quản lý tài khoản và phân quyền hệ thống</p>
                </div>
                <button
                    onClick={handleAddUser}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    <span>Thêm người dùng</span>
                </button>
            </div>

            {/* Stats */}
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

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <UserTable
                        users={filteredUsers}
                        roleConfig={roleConfig}
                        statusConfig={statusConfig}
                        onView={handleViewUser}
                        onEdit={handleEditUser}
                        onLockUnlock={handleLockUnlock}
                        onDelete={handleDeleteUser}
                    />

                    {/* Mobile Card */}
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
                    {pagination.totalItems > 0 && (
                        <UserPagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalItems}
                            currentCount={filteredUsers.length}
                            onPageChange={(page) => fetchUsers(page)}
                        />
                    )}
                </>
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

            {/* Toast */}
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast({ ...toast, show: false })}
                duration={3000}
            />
        </div>
    );
};

export default UserList;
