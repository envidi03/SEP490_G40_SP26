import React from 'react';
import { Calendar, Users, DollarSign, Clock, PhoneCall } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { mockAppointments, mockInvoices, mockPatients } from '../../utils/mockData';

const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
            </div>
            <div className={`p-4 rounded-full ${color}`}>
                <Icon size={28} className="text-white" />
            </div>
        </div>
    </Card>
);

const ReceptionistDashboard = () => {
    const todayAppointments = mockAppointments.filter(apt => apt.date === '2026-01-15');
    const pending = todayAppointments.filter(apt => apt.status === 'Pending');
    const pendingInvoices = mockInvoices.filter(inv => inv.status === 'Pending');
    const recentPatients = mockPatients.slice(0, 5);

    const stats = [
        {
            icon: Calendar,
            title: 'Lịch hẹn hôm nay',
            value: todayAppointments.length,
            color: 'bg-blue-500'
        },
        {
            icon: Clock,
            title: 'Chờ xác nhận',
            value: pending.length,
            color: 'bg-yellow-500'
        },
        {
            icon: DollarSign,
            title: 'Hóa đơn chờ',
            value: pendingInvoices.length,
            color: 'bg-red-500'
        },
        {
            icon: Users,
            title: 'Bệnh nhân mới',
            value: mockPatients.length,
            color: 'bg-green-500'
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Lễ Tân</h1>
                <p className="text-gray-600 mt-1">Quản lý lịch hẹn và tiếp đón bệnh nhân</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Appointments */}
                <Card
                    title="Lịch hẹn hôm nay"
                    actions={
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                            + Đặt lịch mới
                        </button>
                    }
                >
                    <div className="space-y-3">
                        {todayAppointments.length > 0 ? (
                            todayAppointments.map(apt => (
                                <div key={apt.id} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{apt.patientName}</p>
                                            <p className="text-sm text-gray-600">{apt.patientPhone}</p>
                                        </div>
                                        <Badge variant={apt.status === 'Confirmed' ? 'success' : 'warning'}>
                                            {apt.status}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p><strong>Giờ:</strong> {apt.time}</p>
                                        <p><strong>Bác sĩ:</strong> {apt.doctorName}</p>
                                    </div>
                                    <div className="mt-3 flex space-x-2">
                                        {apt.status === 'Pending' && (
                                            <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                                                Xác nhận
                                            </button>
                                        )}
                                        <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50">
                                            Liên hệ
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Calendar size={40} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-gray-500">Chưa có lịch hẹn hôm nay</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Pending Invoices */}
                <Card
                    title="Hóa đơn chưa thanh toán"
                    actions={
                        <Badge variant="danger">{pendingInvoices.length}</Badge>
                    }
                >
                    <div className="space-y-3">
                        {pendingInvoices.map(inv => (
                            <div key={inv.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-900">{inv.patientName}</p>
                                        <p className="text-sm text-gray-600">Mã HD: {inv.code}</p>
                                    </div>
                                    <p className="font-bold text-red-600">
                                        {inv.total.toLocaleString('vi-VN')}đ
                                    </p>
                                </div>
                                <div className="mt-2 text-xs text-gray-600">
                                    <p>Ngày: {inv.date}</p>
                                </div>
                                <button className="mt-3 w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                                    Thu tiền
                                </button>
                            </div>
                        ))}
                        {pendingInvoices.length === 0 && (
                            <div className="text-center py-8">
                                <DollarSign size={40} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-gray-500">Tất cả đã thanh toán</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="Thao tác nhanh">
                    <div className="grid grid-cols-2 gap-3">
                        <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
                            <Calendar size={24} className="text-blue-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Đặt lịch hẹn</p>
                        </button>
                        <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
                            <Users size={24} className="text-green-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Thêm BN mới</p>
                        </button>
                        <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors">
                            <DollarSign size={24} className="text-yellow-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Tạo hóa đơn</p>
                        </button>
                        <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
                            <PhoneCall size={24} className="text-purple-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Gọi nhắc lịch</p>
                        </button>
                    </div>
                </Card>

                {/* Recent Patients */}
                <Card title="Bệnh nhân gần đây">
                    <div className="space-y-2">
                        {recentPatients.map(patient => (
                            <div key={patient.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">{patient.name}</p>
                                        <p className="text-xs text-gray-600">{patient.phone}</p>
                                    </div>
                                    <Badge variant="success">Active</Badge>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Đăng ký: {patient.createdAt}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
