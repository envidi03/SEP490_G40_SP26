import { useState, useEffect, useCallback } from 'react';
import {
    Calendar, FileText, Clock, AlertCircle, CheckCircle, Activity,
    ArrowRight, Wrench, UserCheck, Stethoscope, RefreshCw, TrendingUp,
    ChevronRight, User, ClipboardList
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import appointmentService from '../../services/appointmentService';
import { getAllDentalRecords } from '../../services/dentalRecordService';
import { getMyLeaveRequests } from '../../services/leaveRequestService';
import { useNavigate } from 'react-router-dom';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
};

const getTodayStr = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    return (parts.length >= 2 ? parts[parts.length - 2][0] + parts[parts.length - 1][0] : name.slice(0, 2)).toUpperCase();
};

const AVATAR_COLORS = [
    'from-blue-400 to-blue-600',
    'from-teal-400 to-teal-600',
    'from-violet-400 to-violet-600',
    'from-rose-400 to-rose-600',
    'from-amber-400 to-amber-600',
    'from-cyan-400 to-cyan-600',
];

const COLOR_BY_IDX = (idx) => AVATAR_COLORS[idx % AVATAR_COLORS.length];

const STATUS_MAP = {
    SCHEDULED: { label: 'Đã lên lịch', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    CHECKED_IN: { label: 'Đã check-in', color: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500' },
    IN_CONSULTATION: { label: 'Đang khám', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
    NO_SHOW: { label: 'Không đến', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, colorClass, bgClass, loading }) => (
    <div className={`relative overflow-hidden rounded-3xl p-6 bg-white/70 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                {loading ? (
                    <div className="h-10 w-16 bg-gray-200 animate-pulse rounded-xl mt-1" />
                ) : (
                    <p className={`text-4xl font-bold ${colorClass}`}>{value}</p>
                )}
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
            <div className={`p-3 rounded-2xl ${bgClass}`}>
                <Icon size={22} className={colorClass} />
            </div>
        </div>
        {/* Decorative accent */}
        <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 ${bgClass}`} />
    </div>
);

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] || { label: status, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
};

// Mini donut chart using SVG
const DonutChart = ({ data }) => {
    const total = data.reduce((s, d) => s + d.count, 0) || 1;
    const colors = ['#3b82f6', '#14b8a6', '#8b5cf6', '#22c55e', '#ef4444', '#9ca3af'];
    let offset = 0;
    const cx = 54, cy = 54, r = 40, strokeW = 18;
    const circ = 2 * Math.PI * r;

    return (
        <div className="flex items-center gap-6">
            <svg viewBox="0 0 108 108" className="w-24 h-24 -rotate-90 shrink-0">
                {/* track */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} />
                {data.map((d, i) => {
                    if (!d.count) return null;
                    const pct = d.count / total;
                    const dash = pct * circ;
                    const seg = (
                        <circle
                            key={d.status}
                            cx={cx} cy={cy} r={r}
                            fill="none"
                            stroke={colors[i]}
                            strokeWidth={strokeW}
                            strokeDasharray={`${dash} ${circ - dash}`}
                            strokeDashoffset={-offset * circ}
                            strokeLinecap="round"
                        />
                    );
                    offset += pct;
                    return seg;
                })}
                {/* center text */}
                <text x={cx} y={cy + 5} textAnchor="middle" className="rotate-90" fill="#1e293b"
                    style={{ fontSize: 18, fontWeight: 700, transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}>
                    {total}
                </text>
            </svg>
            <ul className="flex flex-col gap-1.5 flex-1">
                {data.map((d, i) => (
                    <li key={d.status} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: colors[i] }} />
                            <span className="text-gray-600">{STATUS_MAP[d.status]?.label || d.status}</span>
                        </span>
                        <span className="font-semibold text-gray-800">{d.count}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Quick Action Button
const QuickAction = ({ icon: Icon, label, desc, colorFrom, colorTo, textColor, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/60 bg-white/50 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group text-left"
    >
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorFrom} ${colorTo} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
            <Icon size={18} className={textColor} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{label}</p>
            <p className="text-xs text-gray-500 truncate">{desc}</p>
        </div>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
    </button>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const AssistantDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // API data
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [pendingRecordsCount, setPendingRecordsCount] = useState(0);
    const [leaveApprovedCount, setLeaveApprovedCount] = useState(0);
    const [checkedInCount, setCheckedInCount] = useState(0);

    const today = getTodayStr();
    const todayFormatted = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const fetchAll = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const results = await Promise.allSettled([
                appointmentService.getStaffAppointments({ appointment_date: today, limit: 100 }),
                getAllDentalRecords({ filter_dental_record: 'IN_PROGRESS', limit: 1 }),
                getMyLeaveRequests({ status: 'APPROVED' }),
            ]);

            // Appointments
            const apptRes = results[0];
            if (apptRes.status === 'fulfilled') {
                const raw = apptRes.value?.data?.data || apptRes.value?.data || [];
                setTodayAppointments(Array.isArray(raw) ? raw : []);
                setCheckedInCount(Array.isArray(raw) ? raw.filter(a => ['CHECKED_IN', 'IN_CONSULTATION'].includes(a.status)).length : 0);
            }

            // Pending records
            const recRes = results[1];
            if (recRes.status === 'fulfilled') {
                const pagination = recRes.value?.data?.pagination;
                setPendingRecordsCount(pagination?.totalItems ?? 0);
            }

            // Leave balance
            const leaveRes = results[2];
            if (leaveRes.status === 'fulfilled') {
                const list = leaveRes.value?.data?.data || leaveRes.value?.data || [];
                setLeaveApprovedCount(Array.isArray(list) ? list.length : 0);
            }
        } catch (_) {
            // errors handled by allSettled
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [today]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Compute appointment status distribution
    const statusGroups = Object.entries(
        todayAppointments.reduce((acc, a) => {
            acc[a.status] = (acc[a.status] || 0) + 1;
            return acc;
        }, {})
    )
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count);

    const preparedCount = todayAppointments.filter(a => a.status === 'CHECKED_IN' || a.status === 'COMPLETED').length;
    const pendingPrepare = todayAppointments.filter(a => a.status === 'SCHEDULED').length;

    return (
        <div className="space-y-6">
            {/* ── Header ───────────────────────────────── */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {getGreeting()}, <span className="text-blue-600">{user?.full_name || 'Trợ lý'}!</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5 capitalize">{todayFormatted}</p>
                </div>
                <button
                    onClick={() => fetchAll(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 border border-white/60 text-sm text-gray-600 hover:text-blue-600 hover:bg-white shadow-sm transition-all disabled:opacity-60"
                >
                    <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                    Làm mới
                </button>
            </div>

            {/* ── Stats Row ─────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Calendar}
                    label="Lịch hẹn hôm nay"
                    value={todayAppointments.length}
                    sub={`${pendingPrepare} chưa chuẩn bị`}
                    colorClass="text-blue-600"
                    bgClass="bg-blue-100"
                    loading={loading}
                />
                <StatCard
                    icon={UserCheck}
                    label="Đã Check-in"
                    value={checkedInCount}
                    sub="Bệnh nhân đã đến"
                    colorClass="text-teal-600"
                    bgClass="bg-teal-100"
                    loading={loading}
                />
                <StatCard
                    icon={FileText}
                    label="Hồ sơ Đang Điều Trị"
                    value={pendingRecordsCount}
                    sub="Cần theo dõi"
                    colorClass="text-orange-600"
                    bgClass="bg-orange-100"
                    loading={loading}
                />
                <StatCard
                    icon={ClipboardList}
                    label="Ngày phép Đã Dùng"
                    value={leaveApprovedCount}
                    sub="Đã được duyệt"
                    colorClass="text-violet-600"
                    bgClass="bg-violet-100"
                    loading={loading}
                />
            </div>

            {/* ── Main Content 2 Cols ───────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                {/* LEFT: Appointment List */}
                <div className="lg:col-span-3 rounded-3xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-blue-600" />
                            <h2 className="font-semibold text-gray-900">Lịch hẹn hôm nay</h2>
                            {!loading && (
                                <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                    {todayAppointments.length}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/assistant/appointments')}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            Xem tất cả <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                                    <div className="w-14 h-10 bg-gray-100 rounded-xl" />
                                    <div className="w-10 h-10 bg-gray-100 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3.5 bg-gray-100 rounded w-32" />
                                        <div className="h-3 bg-gray-100 rounded w-48" />
                                    </div>
                                    <div className="h-6 w-24 bg-gray-100 rounded-full" />
                                </div>
                            ))
                        ) : todayAppointments.length === 0 ? (
                            <div className="flex flex-col items-center py-16 text-gray-400">
                                <Calendar size={48} className="text-gray-200 mb-3" />
                                <p className="font-medium">Không có lịch hẹn hôm nay</p>
                                <p className="text-sm mt-1">-Hôm nay bạn rảnh rỗi </p>
                            </div>
                        ) : (
                            todayAppointments.slice(0, 8).map((apt, idx) => {
                                const time = apt.appointment_time || apt.time || '—';
                                const patientName = apt.full_name || apt.patient?.full_name || apt.patient_name || 'Bệnh nhân';
                                const doctorName = apt.doctor_info?.profile?.full_name || apt.doctor_name || 'Chưa có bác sĩ phụ trách';
                                return (
                                    <div
                                        key={apt._id || idx}
                                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-blue-50/40 transition-colors group"
                                    >
                                        {/* Time */}
                                        <div className="w-14 shrink-0 bg-blue-50 rounded-xl text-center py-2">
                                            <p className="text-[10px] text-blue-500 font-medium uppercase leading-none mb-0.5">Giờ</p>
                                            <p className="text-sm font-bold text-blue-700">{time}</p>
                                        </div>

                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${COLOR_BY_IDX(idx)} flex items-center justify-center shrink-0`}>
                                            <span className="text-white text-xs font-bold">{getInitials(patientName)}</span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{patientName}</p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                <Stethoscope size={11} className="inline mr-1 text-gray-400" />
                                                {doctorName}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <StatusBadge status={apt.status} />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT: Quick Actions + Chart */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                    {/* Quick Actions */}
                    <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity size={17} className="text-violet-600" />
                            <h2 className="font-semibold text-gray-900">Thao tác nhanh</h2>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <QuickAction
                                icon={CheckCircle}
                                label="Chuẩn bị ca khám"
                                desc="Kiểm tra thiết bị & vật tư"
                                colorFrom="from-blue-400"
                                colorTo="to-blue-600"
                                textColor="text-white"
                                onClick={() => navigate('/assistant/appointments')}
                            />
                            <QuickAction
                                icon={FileText}
                                label="Quản lý hồ sơ bệnh án"
                                desc="Xem & cập nhật hồ sơ"
                                colorFrom="from-orange-400"
                                colorTo="to-orange-600"
                                textColor="text-white"
                                onClick={() => navigate('/assistant/medical-records')}
                            />
                            <QuickAction
                                icon={Wrench}
                                label="Báo cáo sự cố thiết bị"
                                desc="Thiết bị hỏng hóc tại phòng"
                                colorFrom="from-red-400"
                                colorTo="to-rose-600"
                                textColor="text-white"
                                onClick={() => navigate('/assistant/equipment')}
                            />
                            <QuickAction
                                icon={Clock}
                                label="Xin nghỉ phép"
                                desc="Tạo yêu cầu nghỉ mới"
                                colorFrom="from-green-400"
                                colorTo="to-teal-600"
                                textColor="text-white"
                                onClick={() => navigate('/assistant/leave-requests')}
                            />
                        </div>
                    </div>

                    {/* Status Chart */}
                    <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm p-5 flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp size={17} className="text-teal-600" />
                            <h2 className="font-semibold text-gray-900">Phân bố trạng thái</h2>
                        </div>
                        {loading ? (
                            <div className="flex gap-4 animate-pulse">
                                <div className="w-20 h-20 rounded-full bg-gray-100" />
                                <div className="flex-1 space-y-2 pt-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-3 bg-gray-100 rounded" />)}
                                </div>
                            </div>
                        ) : statusGroups.length === 0 ? (
                            <div className="text-center py-6 text-gray-400 text-sm">
                                <AlertCircle size={32} className="mx-auto text-gray-200 mb-2" />
                                Chưa có dữ liệu
                            </div>
                        ) : (
                            <DonutChart data={statusGroups} />
                        )}

                        {/* Progress bar: Đã chuẩn bị */}
                        {!loading && todayAppointments.length > 0 && (
                            <div className="mt-5 pt-4 border-t border-gray-100">
                                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                    <span>Đã chuẩn bị / check-in</span>
                                    <span className="font-semibold text-gray-700">
                                        {preparedCount}/{todayAppointments.length}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-700"
                                        style={{ width: `${Math.round((preparedCount / todayAppointments.length) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    {Math.round((preparedCount / todayAppointments.length) * 100)}% hoàn thành chuẩn bị
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssistantDashboard;
