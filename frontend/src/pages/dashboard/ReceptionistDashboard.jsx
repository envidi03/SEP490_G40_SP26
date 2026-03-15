import React, { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Clock, PhoneCall, UserCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import appointmentService from '../../services/appointmentService';
import patientService from '../../services/patientService';
import billingService from '../../services/billingService';

const StatCard = ({ icon: Icon, title, value, color, loading }) => (
    <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                {loading ? (
                    <div className="h-9 w-16 bg-gray-100 animate-pulse rounded mt-2" />
                ) : (
                    <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
                )}
            </div>
            <div className={`p-4 rounded-full ${color}`}>
                <Icon size={28} className="text-white" />
            </div>
        </div>
    </Card>
);

const ReceptionistDashboard = () => {
    const [stats, setStats] = useState({
        todayAppointments: 0,
        pendingAppointments: 0,
        pendingInvoices: 0,
        totalPatients: 0
    });
    const [todayApts, setTodayApts] = useState([]);
    const [pendingInvs, setPendingInvs] = useState([]);
    const [recentPatients, setRecentPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    const todayStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Today's Appointments
                const aptRes = await appointmentService.getStaffAppointments({ limit: 100 });
                const aptList = (aptRes.data?.data || aptRes.data || []).filter(apt =>
                    new Date(apt.appointment_date).toISOString().split('T')[0] === todayStr
                );
                setTodayApts(aptList);

                // 2. Fetch Pending Invoices
                const invRes = await billingService.getAllInvoices({ status: 'PENDING' });
                const invList = invRes.data?.data || invRes.data || [];
                setPendingInvs(invList.slice(0, 5));

                // 3. Fetch Recent Patients
                const patRes = await patientService.getAllPatients({ limit: 5 });
                const patList = patRes.data?.data || patRes.data || [];
                setRecentPatients(patList);

                // 4. Update Stats
                setStats({
                    todayAppointments: aptList.length,
                    pendingAppointments: aptList.filter(a => a.status === 'SCHEDULED').length,
                    pendingInvoices: invList.length,
                    totalPatients: patRes.data?.total || patRes.data?.data?.length || 0
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        {
            icon: Calendar,
            title: 'Lịch hẹn hôm nay',
            value: stats.todayAppointments,
            color: 'bg-blue-500'
        },
        {
            icon: Clock,
            title: 'Chờ tiếp đón',
            value: stats.pendingAppointments,
            color: 'bg-yellow-500'
        },
        {
            icon: DollarSign,
            title: 'Hóa đơn chưa thu',
            value: stats.pendingInvoices,
            color: 'bg-red-500'
        },
        {
            icon: Users,
            title: 'Tổng số bệnh nhân',
            value: stats.totalPatients,
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
                {statCards.map((stat, index) => (
                    <StatCard key={index} {...stat} loading={loading} />
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Appointments */}
                <Card
                    title="Lịch hẹn sắp tới"
                    actions={
                        <Link to="/receptionist/appointments" className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                            Xem tất cả
                        </Link>
                    }
                >
                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-blue-500" size={32} />
                            </div>
                        ) : todayApts.length > 0 ? (
                            todayApts.slice(0, 5).map(apt => (
                                <div key={apt._id} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{apt.full_name}</p>
                                            <p className="text-sm text-gray-600">{apt.phone}</p>
                                        </div>
                                        <Badge variant={apt.status === 'CHECKED_IN' ? 'success' : 'warning'}>
                                            {apt.status === 'CHECKED_IN' ? 'Đã đến' : 'Chờ khám'}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p><strong>Giờ:</strong> {apt.appointment_time}</p>
                                        <p><strong>Bác sĩ:</strong> {apt.doctorId?.name || 'Chưa chọn'}</p>
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
                    title="Hóa đơn chờ thanh toán"
                    actions={
                        <Link to="/receptionist/invoices" className="text-sm text-blue-600 hover:underline">
                            Tất cả ({stats.pendingInvoices})
                        </Link>
                    }
                >
                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-red-500" size={32} />
                            </div>
                        ) : pendingInvs.length > 0 ? (
                            pendingInvs.map(inv => (
                                <div key={inv._id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{inv.patientId?.name || 'Bệnh nhân'}</p>
                                            <p className="text-sm text-gray-600">ID: {inv._id.substring(18)}</p>
                                        </div>
                                        <p className="font-bold text-red-600">
                                            {(inv.total_amount || 0).toLocaleString('vi-VN')}đ
                                        </p>
                                    </div>
                                    <Link to={`/receptionist/invoices?id=${inv._id}`} className="mt-3 block text-center py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                                        Thu tiền
                                    </Link>
                                </div>
                            ))
                        ) : (
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
                        <Link to="/receptionist/check-in" className="p-4 bg-teal-50 hover:bg-teal-100 rounded-lg text-left transition-colors">
                            <UserCheck size={24} className="text-teal-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Tiếp đón</p>
                        </Link>
                        <Link to="/receptionist/appointments?book=true" className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
                            <Calendar size={24} className="text-blue-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Đặt lịch hẹn</p>
                        </Link>
                        <Link to="/receptionist/patients?add=true" className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
                            <Users size={24} className="text-green-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Thêm BN mới</p>
                        </Link>
                        <Link to="/receptionist/invoices" className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors">
                            <DollarSign size={24} className="text-yellow-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Hóa đơn</p>
                        </Link>
                    </div>
                </Card>

                {/* Recent Patients */}
                <Card title="Bệnh nhân mới">
                    <div className="space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-green-500" size={32} />
                            </div>
                        ) : recentPatients.length > 0 ? (
                            recentPatients.map(patient => (
                                <div key={patient._id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-900">{patient.profile?.full_name || patient.name}</p>
                                            <p className="text-xs text-gray-600">{patient.phone}</p>
                                        </div>
                                        <Badge variant={patient.status?.toUpperCase() === 'ACTIVE' ? 'success' : 'default'}>
                                            {patient.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Chưa có bệnh nhân nào</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
