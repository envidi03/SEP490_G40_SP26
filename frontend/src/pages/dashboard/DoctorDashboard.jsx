import React from 'react';
import { Calendar, Users, ClipboardList, Clock, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { mockAppointments } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';

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

const DoctorDashboard = () => {
    const { user } = useAuth();

    // Filter appointments for current doctor
    const myAppointments = mockAppointments.filter(apt => apt.doctorId === user?.id);
    const todayAppointments = myAppointments.filter(apt => apt.date === '2026-01-15');
    const pending = todayAppointments.filter(apt => apt.status === 'Pending');
    const confirmed = todayAppointments.filter(apt => apt.status === 'Confirmed');
    const completed = myAppointments.filter(apt => apt.status === 'Completed');

    const stats = [
        {
            icon: Calendar,
            title: 'Lịch hẹn hôm nay',
            value: todayAppointments.length,
            color: 'bg-blue-500'
        },
        {
            icon: Clock,
            title: 'Đang chờ khám',
            value: pending.length,
            color: 'bg-yellow-500'
        },
        {
            icon: Users,
            title: 'Đã xác nhận',
            value: confirmed.length,
            color: 'bg-green-500'
        },
        {
            icon: CheckCircle,
            title: 'Hoàn thành (tuần)',
            value: completed.length,
            color: 'bg-purple-500'
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Bác Sĩ</h1>
                <p className="text-gray-600 mt-1">Chào mừng, {user?.name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Schedule */}
                <Card
                    title="Lịch khám hôm nay"
                    actions={
                        <Badge variant="info">{todayAppointments.length} lịch hẹn</Badge>
                    }
                >
                    <div className="space-y-3">
                        {todayAppointments.length > 0 ? (
                            todayAppointments.map(apt => (
                                <div key={apt.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{apt.patientName}</p>
                                            <p className="text-sm text-gray-600">{apt.patientPhone}</p>
                                        </div>
                                        <Badge variant={apt.status === 'Confirmed' ? 'success' : 'warning'}>
                                            {apt.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 mt-2">
                                        <Clock size={14} className="mr-2" />
                                        <span className="font-medium">{apt.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-2">
                                        <strong>Lý do:</strong> {apt.reason}
                                    </p>
                                    <div className="mt-3 flex space-x-2">
                                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                                            Bắt đầu khám
                                        </button>
                                        <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                                            Xem hồ sơ
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500">Không có lịch hẹn hôm nay</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="Thao tác nhanh">
                    <div className="space-y-3">
                        <button className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors flex items-center">
                            <ClipboardList size={24} className="text-blue-600 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900">Tạo phiếu điều trị</p>
                                <p className="text-sm text-gray-600">Ghi nhận kết quả khám và điều trị</p>
                            </div>
                        </button>
                        <button className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors flex items-center">
                            <Users size={24} className="text-green-600 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900">Xem danh sách bệnh nhân</p>
                                <p className="text-sm text-gray-600">Tra cứu hồ sơ bệnh nhân</p>
                            </div>
                        </button>
                        <button className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors flex items-center">
                            <Calendar size={24} className="text-purple-600 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900">Xem lịch làm việc</p>
                                <p className="text-sm text-gray-600">Quản lý lịch hẹn tuần này</p>
                            </div>
                        </button>
                    </div>
                </Card>

                {/* Recent Patients */}
                <Card title="Bệnh nhân gần đây" className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {myAppointments.slice(0, 3).map(apt => (
                            <div key={apt.id} className="p-4 border border-gray-200 rounded-lg">
                                <p className="font-medium text-gray-900">{apt.patientName}</p>
                                <p className="text-sm text-gray-600 mt-1">Khám {apt.date}</p>
                                <p className="text-xs text-gray-500 mt-2">{apt.reason}</p>
                                <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    Xem chi tiết →
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DoctorDashboard;
