import React, { useState, useEffect, useMemo } from 'react';
import {
    Activity, Banknote, CalendarCheck, BarChart3,
    Loader2, CalendarDays, CheckCircle2, XCircle
} from 'lucide-react';

// === IMPORT RECHARTS ===
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Services
import statisticService from '../../services/statisticService';

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
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">{value}</p>
                        {subtitle && (
                            <p className={`text-xs font-medium mt-0.5 ${color || 'text-gray-500'}`}>{subtitle}</p>
                        )}
                    </>
                )}
            </div>
        </div>
    </div>
);

const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Icon size={20} className="text-blue-600" />
            {title}
        </h2>
    </div>
);

// ==================== MAIN DASHBOARD ====================

const AdminClinicDashboard = () => {
    // Thống kê State
    const [moneyStats, setMoneyStats] = useState(null);
    const [bookingStats, setBookingStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                statisticService.getMoneyStatistics(),
                statisticService.getBookingStatistics(),
            ]);
            if (results[0].status === 'fulfilled') {
                const apiResponse = results[0].value?.data;
                setMoneyStats(apiResponse || null);
            }

            if (results[1].status === 'fulfilled') {
                const apiResponse = results[1].value?.data;
                setBookingStats(apiResponse || null);
            }

        } catch (error) {
            console.error('Lỗi khi tải dữ liệu dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // LOGIC XỬ LÝ DỮ LIỆU CHO BIỂU ĐỒ & BẢNG
    // ==========================================

    // 1. Dữ liệu cho biểu đồ Doanh thu
    const revenueChartData = useMemo(() => {
        if (!moneyStats?.daily) return [];
        return moneyStats.daily.map(item => ({
            date: new Date(item._id).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
            revenue: item.totalIn
        }));
    }, [moneyStats]);

    // 2. Dữ liệu cho biểu đồ Lịch hẹn
    const bookingChartData = useMemo(() => {
        if (!bookingStats) return [];
        const map = {};
        const processData = (sourceArray, type) => {
            if (!sourceArray) return;
            sourceArray.forEach(item => {
                if (!map[item._id]) map[item._id] = { rawDate: item._id, normal: 0, cancelled: 0 };
                map[item._id][type] += item.totalCount;
            });
        };
        processData(bookingStats?.normal?.daily, 'normal');
        processData(bookingStats?.cancelled?.daily, 'cancelled');

        return Object.values(map)
            .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate))
            .map(item => ({
                date: new Date(item.rawDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                normal: item.normal,
                cancelled: item.cancelled
            }));
    }, [bookingStats]);

    // 3. DỮ LIỆU GỘP CHO BẢNG CHI TIẾT THEO NGÀY (Từ mới nhất đến cũ nhất)
    const combinedDailyDetails = useMemo(() => {
        const map = {};

        // Gộp Doanh thu
        if (moneyStats?.daily) {
            moneyStats.daily.forEach(item => {
                if (!map[item._id]) map[item._id] = { rawDate: item._id, revenue: 0, revenueCount: 0, normalBooking: 0, cancelledBooking: 0 };
                map[item._id].revenue = item.totalIn;
                map[item._id].revenueCount = item.totalCount;
            });
        }

        // Gộp Lịch hẹn (Bình thường)
        if (bookingStats?.normal?.daily) {
            bookingStats.normal.daily.forEach(item => {
                if (!map[item._id]) map[item._id] = { rawDate: item._id, revenue: 0, revenueCount: 0, normalBooking: 0, cancelledBooking: 0 };
                map[item._id].normalBooking = item.totalCount;
            });
        }

        // Gộp Lịch hẹn (Hủy)
        if (bookingStats?.cancelled?.daily) {
            bookingStats.cancelled.daily.forEach(item => {
                if (!map[item._id]) map[item._id] = { rawDate: item._id, revenue: 0, revenueCount: 0, normalBooking: 0, cancelledBooking: 0 };
                map[item._id].cancelledBooking = item.totalCount;
            });
        }

        // Convert thành mảng và sắp xếp (Mới nhất lên đầu)
        return Object.values(map).sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
    }, [moneyStats, bookingStats]);


    // ==========================================
    // HELPERS FORMAT FORMAT
    // ==========================================
    const formatMoney = (amount) => {
        if (amount == null) return '0 ₫';
        return amount.toLocaleString('vi-VN') + ' ₫';
    };

    const formatDateFull = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Activity className="text-blue-600" size={32} />
                        Báo Cáo Hoạt Động & Kinh Doanh
                    </h1>
                    <p className="text-gray-500 mt-1">Phân tích chuyên sâu về Doanh thu và Lịch khám</p>
                </div>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <StatCard
                        icon={Banknote}
                        title="Tổng Doanh Thu (Tháng này)"
                        value={formatMoney(moneyStats?.summary?.totalIn)}
                        subtitle={moneyStats?.summary?.totalCount > 0 ? `${moneyStats.summary.totalCount} giao dịch phát sinh` : 'Chưa có dữ liệu'}
                        color="text-emerald-600"
                        bgColor="bg-gradient-to-br from-emerald-500 to-teal-600"
                        loading={loading}
                    />
                    <StatCard
                        icon={CalendarCheck}
                        title="Tổng Lịch Hẹn (Tháng này)"
                        value={bookingStats?.normal?.summary?.totalCount || 0}
                        subtitle={bookingStats?.cancelled?.summary?.totalCount > 0 ? `Đã có ${bookingStats.cancelled.summary.totalCount} lịch hẹn bị hủy` : 'Tỉ lệ hủy 0%'}
                        color={bookingStats?.cancelled?.summary?.totalCount > 0 ? "text-orange-500" : "text-gray-500"}
                        bgColor="bg-gradient-to-br from-blue-500 to-indigo-600"
                        loading={loading}
                    />
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <SectionHeader icon={BarChart3} title="Biểu đồ Doanh thu" />
                        {loading ? (
                            <div className="h-[350px] flex items-center justify-center"><Loader2 size={32} className="animate-spin text-gray-300" /></div>
                        ) : revenueChartData.length === 0 ? (
                            <div className="h-[350px] flex items-center justify-center text-gray-400">Chưa có dữ liệu doanh thu</div>
                        ) : (
                            <div className="h-[350px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => value === 0 ? '0' : `${(value / 1000)}k`} width={50} />
                                        <Tooltip formatter={(value) => [formatMoney(value), 'Doanh thu']} labelStyle={{ color: '#374151', fontWeight: 'bold' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Booking Chart */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <SectionHeader icon={CalendarCheck} title="Phân tích Lịch hẹn (Thành công vs Hủy)" />
                        {loading ? (
                            <div className="h-[350px] flex items-center justify-center"><Loader2 size={32} className="animate-spin text-gray-300" /></div>
                        ) : bookingChartData.length === 0 ? (
                            <div className="h-[350px] flex items-center justify-center text-gray-400">Chưa có dữ liệu lịch hẹn</div>
                        ) : (
                            <div className="h-[350px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bookingChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                        <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="normal" name="Hoàn thành / Mới" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} maxBarSize={50} />
                                        <Bar dataKey="cancelled" name="Đã hủy" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>

                {/* ==================== [3] BẢNG CHI TIẾT THEO NGÀY (THÊM MỚI) ==================== */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <SectionHeader icon={CalendarDays} title="Nhật ký chi tiết theo ngày" />
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 size={32} className="animate-spin text-gray-300" /></div>
                    ) : combinedDailyDetails.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">Chưa có phát sinh giao dịch hoặc lịch hẹn nào.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Ngày</th>
                                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Doanh Thu</th>
                                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Lịch Hẹn & Khám</th>
                                        <th className="px-6 py-4 font-semibold whitespace-nowrap">Lịch Hủy</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {combinedDailyDetails.map((day, idx) => (
                                        <tr key={day.rawDate} className="hover:bg-blue-50/50 transition-colors">
                                            {/* Cột 1: Ngày tháng */}
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 capitalize">
                                                    {formatDateFull(day.rawDate)}
                                                </div>
                                            </td>

                                            {/* Cột 2: Tiền */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-emerald-600 text-base">
                                                        {formatMoney(day.revenue)}
                                                    </span>
                                                    {day.revenueCount > 0 && (
                                                        <span className="text-xs text-gray-500 mt-1">
                                                            Từ {day.revenueCount} giao dịch
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Cột 3: Lịch Thành công/Mới */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 size={18} className={day.normalBooking > 0 ? "text-blue-500" : "text-gray-300"} />
                                                    <span className={`font-semibold ${day.normalBooking > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                                                        {day.normalBooking} ca
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Cột 4: Lịch Hủy */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <XCircle size={18} className={day.cancelledBooking > 0 ? "text-red-500" : "text-gray-300"} />
                                                    <span className={`font-semibold ${day.cancelledBooking > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                                        {day.cancelledBooking} ca
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminClinicDashboard;