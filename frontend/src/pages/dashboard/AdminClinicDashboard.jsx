import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Calendar, AlertTriangle, ClipboardList,
    PackagePlus, Pill, Wrench, DoorOpen, ClipboardCheck,
    TrendingDown, Clock, ChevronRight, Activity, Briefcase, Loader2
} from 'lucide-react';

// Services
import staffService from '../../services/staffService';
import inventoryService from '../../services/inventoryService';
import equipmentService from '../../services/equipmentService';
import apiClient from '../../services/api';

// ==================== SUB-COMPONENTS ====================

const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor, loading }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
        <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center shadow-lg`}>
                <Icon className="text-white" size={28} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                {loading ? (
                    <div className="flex items-center gap-2 mt-1">
                        <Loader2 size={20} className="animate-spin text-gray-400" />
                    </div>
                ) : (
                    <>
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                        {subtitle && (
                            <p className={`text-xs font-medium mt-0.5 ${color || 'text-gray-500'}`}>{subtitle}</p>
                        )}
                    </>
                )}
            </div>
        </div>
    </div>
);

const SectionHeader = ({ icon: Icon, title, linkTo, linkText = 'Xem tất cả' }) => (
    <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Icon size={20} className="text-blue-600" />
            {title}
        </h2>
        {linkTo && (
            <Link to={linkTo} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors">
                {linkText}
                <ChevronRight size={16} />
            </Link>
        )}
    </div>
);

const EmptyState = ({ message }) => (
    <div className="text-center py-8 text-gray-400">
        <Activity size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">{message}</p>
    </div>
);

const PriorityBadge = ({ priority }) => {
    const config = {
        high: 'bg-red-100 text-red-700 border-red-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        low: 'bg-green-100 text-green-700 border-green-200',
    };
    const labels = { high: 'Cao', medium: 'Trung bình', low: 'Thấp' };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${config[priority] || config.medium}`}>
            {labels[priority] || priority}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const config = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        CONFIRMED: 'bg-blue-100 text-blue-700',
        COMPLETED: 'bg-green-100 text-green-700',
        CANCELLED: 'bg-red-100 text-red-700',
        IN_PROGRESS: 'bg-indigo-100 text-indigo-700'
    };
    const labels = {
        PENDING: 'Chờ xác nhận',
        CONFIRMED: 'Đã xác nhận',
        COMPLETED: 'Hoàn thành',
        CANCELLED: 'Đã hủy',
        IN_PROGRESS: 'Đang khám'
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config[status] || 'bg-gray-100 text-gray-700'}`}>
            {labels[status] || status}
        </span>
    );
};

// ==================== MAIN DASHBOARD ====================

const AdminClinicDashboard = () => {
    // KPI State
    const [staffCount, setStaffCount] = useState(0);
    const [appointmentsToday, setAppointmentsToday] = useState([]);
    const [inventoryStats, setInventoryStats] = useState(null);
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [pendingRestocks, setPendingRestocks] = useState([]);

    // Detail State
    const [lowStockMedicines, setLowStockMedicines] = useState([]);
    const [nearExpiredMedicines, setNearExpiredMedicines] = useState([]);
    const [maintenanceEquipment, setMaintenanceEquipment] = useState([]);

    // Loading
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                // [0] Staff count
                staffService.getStaffs({ page: 1, limit: 1 }),
                // [1] Appointments today
                apiClient.get('/api/appointment/staff'),
                // [2] Inventory stats
                inventoryService.getDashboardStats(),
                // [3] Pending leave requests
                staffService.getAllLeaveRequestsAdmin(),
                // [4] Pending restock requests
                inventoryService.getRestockRequests({ status: 'pending', page: 1, limit: 5 }),
                // [5] Low stock medicines
                inventoryService.getLowStockMedicines(5),
                // [6] Near expired medicines
                inventoryService.getNearExpiredMedicines(30),
                // [7] Equipment needing maintenance
                equipmentService.getEquipments({ status: 'MAINTENANCE' }),
            ]);

            // [0] Staff
            if (results[0].status === 'fulfilled') {
                const staffData = results[0].value;
                setStaffCount(staffData?.pagination?.totalItems || staffData?.data?.length || 0);
            }

            // [1] Appointments today
            if (results[1].status === 'fulfilled') {
                const today = new Date().toISOString().split('T')[0];
                const allAppointments = results[1].value?.data || [];
                const todayApts = allAppointments.filter(apt => {
                    const aptDate = apt.appointment_date?.split('T')[0] || apt.date?.split('T')[0];
                    return aptDate === today;
                });
                setAppointmentsToday(todayApts);
            }

            // [2] Inventory stats
            if (results[2].status === 'fulfilled') {
                setInventoryStats(results[2].value?.data || null);
            }

            // [3] Pending leaves
            if (results[3].status === 'fulfilled') {
                const allLeaves = results[3].value?.data || [];
                const pending = allLeaves.filter(l => l.status === 'PENDING');
                setPendingLeaves(pending);
            }

            // [4] Pending restocks
            if (results[4].status === 'fulfilled') {
                setPendingRestocks(results[4].value?.data || []);
            }

            // [5] Low stock
            if (results[5].status === 'fulfilled') {
                setLowStockMedicines(results[5].value?.data || []);
            }

            // [6] Near expired
            if (results[6].status === 'fulfilled') {
                setNearExpiredMedicines(results[6].value?.data || []);
            }

            // [7] Maintenance equipment
            if (results[7].status === 'fulfilled') {
                const equipData = results[7].value?.data || [];
                setMaintenanceEquipment(equipData);
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helpers
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const totalPendingActions = pendingLeaves.length + pendingRestocks.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">

                {/* ==================== HEADER ==================== */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Activity className="text-blue-600" size={32} />
                        Dashboard Admin Clinic
                    </h1>
                    <p className="text-gray-500 mt-1">Tổng quan hoạt động phòng khám hôm nay</p>
                </div>

                {/* ==================== [1] KPI CARDS ==================== */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={Users}
                        title="Tổng nhân viên"
                        value={staffCount}
                        subtitle="Đang hoạt động"
                        color="text-blue-600"
                        bgColor="bg-gradient-to-br from-blue-500 to-indigo-600"
                        loading={loading}
                    />
                    <StatCard
                        icon={Calendar}
                        title="Lịch hẹn hôm nay"
                        value={appointmentsToday.length}
                        subtitle={appointmentsToday.length > 0 ? `${appointmentsToday.filter(a => a.status === 'CONFIRMED').length} đã xác nhận` : 'Không có lịch hẹn'}
                        color="text-green-600"
                        bgColor="bg-gradient-to-br from-green-500 to-emerald-600"
                        loading={loading}
                    />
                    <StatCard
                        icon={AlertTriangle}
                        title="Thuốc sắp hết"
                        value={inventoryStats?.lowStockCount || 0}
                        subtitle={inventoryStats?.urgentStockCount > 0 ? `${inventoryStats.urgentStockCount} cần gấp` : 'Kho ổn định'}
                        color={inventoryStats?.lowStockCount > 0 ? 'text-orange-600' : 'text-green-600'}
                        bgColor="bg-gradient-to-br from-orange-500 to-amber-600"
                        loading={loading}
                    />
                    <StatCard
                        icon={ClipboardList}
                        title="Chờ duyệt"
                        value={totalPendingActions}
                        subtitle={`${pendingLeaves.length} nghỉ phép · ${pendingRestocks.length} nhập thuốc`}
                        color={totalPendingActions > 0 ? 'text-purple-600' : 'text-green-600'}
                        bgColor="bg-gradient-to-br from-purple-500 to-violet-600"
                        loading={loading}
                    />
                </div>

                {/* ==================== [2] & [3] MAIN CONTENT ==================== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    {/* ---------- LEFT: Cảnh báo & Đợi xử lý ---------- */}
                    <div className="space-y-6">

                        {/* Đơn nghỉ phép chờ duyệt */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <SectionHeader icon={Briefcase} title="Nghỉ phép chờ duyệt" linkTo="/admin/leave-management" />
                            {loading ? (
                                <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
                            ) : pendingLeaves.length === 0 ? (
                                <EmptyState message="Không có đơn nghỉ phép nào đang chờ" />
                            ) : (
                                <div className="space-y-3">
                                    {pendingLeaves.slice(0, 4).map((leave, idx) => (
                                        <div key={leave._id || idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100 hover:bg-yellow-100 transition-colors">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-900 text-sm truncate">
                                                    {leave.staff_name || leave.full_name || 'Nhân viên'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                                                </p>
                                            </div>
                                            <span className="px-2.5 py-1 bg-yellow-200 text-yellow-800 text-xs font-bold rounded-full whitespace-nowrap">
                                                Chờ duyệt
                                            </span>
                                        </div>
                                    ))}
                                    {pendingLeaves.length > 4 && (
                                        <p className="text-xs text-center text-gray-400 pt-1">
                                            và {pendingLeaves.length - 4} đơn khác...
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Yêu cầu nhập thuốc chờ duyệt */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <SectionHeader icon={PackagePlus} title="Nhập thuốc chờ duyệt" linkTo="/admin/restock-requests" />
                            {loading ? (
                                <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
                            ) : pendingRestocks.length === 0 ? (
                                <EmptyState message="Không có yêu cầu nhập thuốc nào đang chờ" />
                            ) : (
                                <div className="space-y-3">
                                    {pendingRestocks.slice(0, 4).map((req, idx) => (
                                        <div key={req._id || idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-900 text-sm truncate">{req.medicine_name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    SL yêu cầu: <span className="font-bold text-blue-700">{req.quantity_requested}</span> · Tồn: {req.current_quantity}
                                                </p>
                                            </div>
                                            <PriorityBadge priority={req.priority} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thuốc sắp hết hạn */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <SectionHeader icon={Clock} title="Thuốc sắp hết hạn (30 ngày)" linkTo="/admin/medicines" />
                            {loading ? (
                                <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
                            ) : nearExpiredMedicines.length === 0 ? (
                                <EmptyState message="Không có thuốc nào sắp hết hạn" />
                            ) : (
                                <div className="space-y-3">
                                    {nearExpiredMedicines.slice(0, 4).map((med, idx) => (
                                        <div key={med._id || idx} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-900 text-sm truncate">{med.medicine_name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    SL: {med.quantity} · HSD: <span className="font-bold text-red-600">{formatDate(med.expiry_date)}</span>
                                                </p>
                                            </div>
                                            <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ---------- RIGHT: Hoạt động gần đây ---------- */}
                    <div className="space-y-6">

                        {/* Lịch hẹn hôm nay */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <SectionHeader icon={Calendar} title="Lịch hẹn hôm nay" />
                            {loading ? (
                                <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
                            ) : appointmentsToday.length === 0 ? (
                                <EmptyState message="Không có lịch hẹn nào hôm nay" />
                            ) : (
                                <div className="space-y-3">
                                    {appointmentsToday.slice(0, 6).map((apt, idx) => (
                                        <div key={apt._id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-900 text-sm truncate">
                                                    {apt.patient_name || apt.patientName || 'Bệnh nhân'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {formatTime(apt.appointment_date || apt.date)} · {apt.dentist_name || apt.doctorName || 'Bác sĩ'}
                                                </p>
                                            </div>
                                            <StatusBadge status={apt.status} />
                                        </div>
                                    ))}
                                    {appointmentsToday.length > 6 && (
                                        <p className="text-xs text-center text-gray-400 pt-1">
                                            và {appointmentsToday.length - 6} cuộc hẹn khác...
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Thuốc sắp hết hàng */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <SectionHeader icon={TrendingDown} title="Thuốc sắp hết hàng" linkTo="/admin/medicines" />
                            {loading ? (
                                <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
                            ) : lowStockMedicines.length === 0 ? (
                                <EmptyState message="Tất cả thuốc đều có đủ tồn kho" />
                            ) : (
                                <div className="space-y-3">
                                    {lowStockMedicines.slice(0, 5).map((med, idx) => (
                                        <div key={med._id || idx} className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-gray-900 text-sm truncate flex-1">{med.medicine_name}</p>
                                                <span className="text-xs font-bold text-orange-700 bg-orange-200 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                                                    Còn {med.quantity}
                                                </span>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="mt-2">
                                                <div className="w-full h-1.5 bg-orange-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-orange-500 rounded-full transition-all"
                                                        style={{ width: `${Math.min((med.quantity / (med.min_quantity || 100)) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Tối thiểu: {med.min_quantity || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ==================== [4] RESOURCE OVERVIEW ==================== */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <SectionHeader icon={ClipboardCheck} title="Tổng quan tài nguyên" />
                            {loading ? (
                                <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Inventory total */}
                                    <Link to="/admin/medicines" className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100 group">
                                        <Pill size={24} className="text-blue-600 mb-2" />
                                        <p className="text-2xl font-bold text-gray-900">{inventoryStats?.totalMedicines || 0}</p>
                                        <p className="text-xs text-gray-500 group-hover:text-blue-700">Loại thuốc</p>
                                    </Link>

                                    {/* Equipment maintenance */}
                                    <Link to="/admin/equipment" className="p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors border border-yellow-100 group">
                                        <Wrench size={24} className="text-yellow-600 mb-2" />
                                        <p className="text-2xl font-bold text-gray-900">{maintenanceEquipment.length}</p>
                                        <p className="text-xs text-gray-500 group-hover:text-yellow-700">Thiết bị bảo trì</p>
                                    </Link>

                                    {/* Pending Restock */}
                                    <Link to="/admin/restock-requests" className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100 group">
                                        <PackagePlus size={24} className="text-purple-600 mb-2" />
                                        <p className="text-2xl font-bold text-gray-900">{inventoryStats?.pendingOrders || 0}</p>
                                        <p className="text-xs text-gray-500 group-hover:text-purple-700">Đơn nhập chờ</p>
                                    </Link>

                                    {/* Total inventory Qty */}
                                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                        <DoorOpen size={24} className="text-green-600 mb-2" />
                                        <p className="text-2xl font-bold text-gray-900">{inventoryStats?.totalInventoryQuantity?.toLocaleString('vi-VN') || 0}</p>
                                        <p className="text-xs text-gray-500">Tổng tồn kho</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminClinicDashboard;
