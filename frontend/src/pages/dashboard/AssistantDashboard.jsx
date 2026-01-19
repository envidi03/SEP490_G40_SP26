import { useState } from 'react';
import { Calendar, FileText, Clock, AlertCircle, CheckCircle, Users, Wrench } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';

const AssistantDashboard = () => {
    const { user } = useAuth();

    // Mock stats
    const stats = {
        todayAppointments: 12,
        pendingRecords: 5,
        leaveBalance: 15
    };

    // Mock today's schedule
    const todaySchedule = [
        { id: 1, time: '08:00', patient: 'Nguyễn Văn A', doctor: 'BS. Nguyễn Văn Anh', status: 'prepared' },
        { id: 2, time: '09:30', patient: 'Trần Thị B', doctor: 'BS. Trần Thị Bình', status: 'pending' },
        { id: 3, time: '10:00', patient: 'Lê Văn C', doctor: 'BS. Nguyễn Văn Anh', status: 'pending' },
        { id: 4, time: '14:00', patient: 'Phạm Thị D', doctor: 'BS. Lê Hoàng Cường', status: 'pending' }
    ];

    const getStatusInfo = (status) => {
        switch (status) {
            case 'prepared':
                return { label: 'Đã chuẩn bị', variant: 'success', icon: CheckCircle };
            case 'pending':
                return { label: 'Chưa chuẩn bị', variant: 'warning', icon: Clock };
            default:
                return { label: status, variant: 'default', icon: AlertCircle };
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Chào mừng, {user?.full_name}!
                </h1>
                <p className="text-gray-600 mt-1">Tổng quan công việc hôm nay</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Lịch hẹn hôm nay</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.todayAppointments}</p>
                            <p className="text-xs text-gray-500 mt-1">Cần chuẩn bị</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Calendar size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Hồ sơ chờ xử lý</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingRecords}</p>
                            <p className="text-xs text-gray-500 mt-1">Cần cập nhật</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                            <FileText size={24} className="text-orange-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Số ngày nghỉ còn lại</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.leaveBalance}</p>
                            <p className="text-xs text-gray-500 mt-1">Ngày phép</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <Clock size={24} className="text-green-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CheckCircle className="text-blue-600" size={20} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-medium text-gray-900">Chuẩn bị ca khám</p>
                            <p className="text-sm text-gray-600">Kiểm tra thiết bị & vật tư</p>
                        </div>
                    </button>

                    <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Wrench className="text-orange-600" size={20} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-medium text-gray-900">Báo cáo sự cố</p>
                            <p className="text-sm text-gray-600">Thiết bị hỏng hóc</p>
                        </div>
                    </button>

                    <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Clock className="text-green-600" size={20} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-medium text-gray-900">Xin nghỉ phép</p>
                            <p className="text-sm text-gray-600">Tạo yêu cầu mới</p>
                        </div>
                    </button>
                </div>
            </Card>

            {/* Today's Schedule */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Lịch hẹn hôm nay</h2>
                    <a href="/assistant/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        Xem tất cả →
                    </a>
                </div>

                <div className="space-y-3">
                    {todaySchedule.map((apt) => {
                        const statusInfo = getStatusInfo(apt.status);
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div
                                key={apt.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="bg-primary-100 px-3 py-2 rounded-lg text-center min-w-[70px]">
                                        <div className="text-xs text-primary-600 font-medium">Giờ</div>
                                        <div className="text-sm font-bold text-primary-700">{apt.time}</div>
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{apt.patient}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Bác sĩ: {apt.doctor}
                                        </p>
                                    </div>

                                    <Badge variant={statusInfo.variant}>
                                        <StatusIcon size={14} className="inline mr-1" />
                                        {statusInfo.label}
                                    </Badge>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {todaySchedule.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <p>Không có lịch hẹn nào hôm nay</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AssistantDashboard;
