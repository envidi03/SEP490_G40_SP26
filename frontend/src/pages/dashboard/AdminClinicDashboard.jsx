import React from 'react';
import { Users, Calendar, DollarSign, ClipboardList, TrendingUp, Activity } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { mockPatients, mockAppointments, mockInvoices } from '../../utils/mockData';
import { formatDate } from '../../utils/dateUtils';

const StatCard = ({ icon: Icon, title, value, trend, color }) => (
    <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
                {trend && (
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                        <TrendingUp size={14} className="mr-1" />
                        {trend}
                    </p>
                )}
            </div>
            <div className={`p-4 rounded-full ${color}`}>
                <Icon size={28} className="text-white" />
            </div>
        </div>
    </Card>
);

const AdminClinicDashboard = () => {
    const todayAppointments = mockAppointments.filter(apt => apt.date === '2026-01-15');
    const pendingInvoices = mockInvoices.filter(inv => inv.status === 'Pending');
    const totalRevenue = mockInvoices.reduce((sum, inv) => sum + inv.paid, 0);

    const stats = [
        {
            icon: Users,
            title: 'Tổng bệnh nhân',
            value: mockPatients.length,
            trend: '+12% tháng này',
            color: 'bg-blue-500'
        },
        {
            icon: Calendar,
            title: 'Lịch hẹn hôm nay',
            value: todayAppointments.length,
            color: 'bg-green-500'
        },
        {
            icon: DollarSign,
            title: 'Doanh thu tháng này',
            value: `${(totalRevenue / 1000000).toFixed(1)}M`,
            trend: '+8.2%',
            color: 'bg-yellow-500'
        },
        {
            icon: ClipboardList,
            title: 'Điều trị hoàn thành',
            value: '28',
            color: 'bg-purple-500'
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-gray-600 mt-1">Tổng quan hệ thống quản lý phòng khám</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Appointments */}
                <Card title="Lịch hẹn gần đây">
                    <div className="space-y-3">
                        {todayAppointments.slice(0, 5).map(apt => (
                            <div key={apt.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div>
                                    <p className="font-medium text-gray-900">{apt.patientName}</p>
                                    <p className="text-sm text-gray-600">{formatDate(apt.date)} - {apt.time}</p>
                                    <p className="text-xs text-gray-500 mt-1">{apt.doctorName}</p>
                                </div>
                                <Badge variant={apt.status === 'Confirmed' ? 'success' : 'warning'}>
                                    {apt.status}
                                </Badge>
                            </div>
                        ))}
                        {todayAppointments.length === 0 && (
                            <p className="text-center text-gray-500 py-4">Không có lịch hẹn hôm nay</p>
                        )}
                    </div>
                </Card>

                {/* Pending Invoices */}
                <Card title="Hóa đơn chưa thanh toán">
                    <div className="space-y-3">
                        {pendingInvoices.map(inv => (
                            <div key={inv.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                <div>
                                    <p className="font-medium text-gray-900">{inv.patientName}</p>
                                    <p className="text-sm text-gray-600">{formatDate(inv.date)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-red-600">
                                        {inv.total.toLocaleString('vi-VN')}đ
                                    </p>
                                    <Badge variant="danger">Chưa thanh toán</Badge>
                                </div>
                            </div>
                        ))}
                        {pendingInvoices.length === 0 && (
                            <p className="text-center text-gray-500 py-4">Tất cả hóa đơn đã thanh toán</p>
                        )}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="Thao tác nhanh">
                    <div className="grid grid-cols-2 gap-3">
                        <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
                            <Users size={24} className="text-blue-600 mb-2" />
                            <p className="font-medium text-gray-900">Thêm bệnh nhân</p>
                        </button>
                        <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
                            <Calendar size={24} className="text-green-600 mb-2" />
                            <p className="font-medium text-gray-900">Đặt lịch hẹn</p>
                        </button>
                        <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors">
                            <DollarSign size={24} className="text-yellow-600 mb-2" />
                            <p className="font-medium text-gray-900">Tạo hóa đơn</p>
                        </button>
                        <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
                            <Activity size={24} className="text-purple-600 mb-2" />
                            <p className="font-medium text-gray-900">Xem báo cáo</p>
                        </button>
                    </div>
                </Card>

                {/* System Status */}
                <Card title="Trạng thái hệ thống">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Số bệnh nhân mới (tháng này)</span>
                            <Badge variant="success">+15</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Lịch hẹn đang chờ xác nhận</span>
                            <Badge variant="warning">{mockAppointments.filter(a => a.status === 'Pending').length}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Thuốc sắp hết hàng</span>
                            <Badge variant="danger">2</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Thiết bị cần bảo trì</span>
                            <Badge variant="warning">1</Badge>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminClinicDashboard;
