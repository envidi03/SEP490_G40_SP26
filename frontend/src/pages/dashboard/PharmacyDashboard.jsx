import React from 'react';
import { Pill, Package, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
            <div className={`p-4 rounded-full ${color}`}>
                <Icon size={28} className="text-white" />
            </div>
        </div>
    </Card>
);

const PharmacyDashboard = () => {
    const { user } = useAuth();

    const stats = [
        {
            icon: Pill,
            title: 'Tổng loại thuốc',
            value: '156',
            subtitle: 'Đang hoạt động',
            color: 'bg-blue-500'
        },
        {
            icon: Package,
            title: 'Tồn kho',
            value: '12,450',
            subtitle: 'Tổng số lượng',
            color: 'bg-green-500'
        },
        {
            icon: FileText,
            title: 'Đơn chờ xuất',
            value: '8',
            subtitle: 'Cần xử lý',
            color: 'bg-yellow-500'
        },
        {
            icon: AlertTriangle,
            title: 'Sắp hết hàng',
            value: '5',
            subtitle: 'Cần nhập thêm',
            color: 'bg-red-500'
        },
    ];

    const lowStockMeds = [
        { name: 'Vitamin C 1000mg', stock: 50, minStock: 100 },
        { name: 'Cetirizine 10mg', stock: 30, minStock: 50 },
        { name: 'Paracetamol 500mg', stock: 80, minStock: 100 },
    ];

    const recentPrescriptions = [
        { id: 'P001', patient: 'Nguyễn Văn A', items: 2, status: 'pending' },
        { id: 'P002', patient: 'Lê Thị B', items: 1, status: 'pending' },
        { id: 'P003', patient: 'Trần Văn C', items: 3, status: 'completed' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Trợ Lý Bán Thuốc</h1>
                <p className="text-gray-600 mt-1">Chào mừng, {user?.full_name}!</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alert */}
                <Card title="Cảnh báo tồn kho thấp">
                    <div className="space-y-3">
                        {lowStockMeds.map((med, idx) => (
                            <div key={idx} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">{med.name}</p>
                                        <p className="text-sm text-gray-600">Tối thiểu: {med.minStock}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-red-600">{med.stock}</p>
                                        <p className="text-xs text-red-600">Còn lại</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            Tạo yêu cầu bổ sung
                        </button>
                    </div>
                </Card>

                {/* Recent Prescriptions */}
                <Card title="Đơn thuốc gần đây">
                    <div className="space-y-3">
                        {recentPrescriptions.map((presc) => (
                            <div key={presc.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-900">{presc.patient}</p>
                                        <p className="text-sm text-gray-600">Mã: {presc.id} • {presc.items} loại thuốc</p>
                                    </div>
                                    <Badge variant={presc.status === 'pending' ? 'warning' : 'success'}>
                                        {presc.status === 'pending' ? 'Chờ xuất' : 'Đã xuất'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                        <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Xem tất cả
                        </button>
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="Thao tác nhanh" className="lg:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
                            <Pill size={24} className="text-blue-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Quản lý thuốc</p>
                        </button>
                        <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
                            <Package size={24} className="text-green-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Kiểm tra tồn kho</p>
                        </button>
                        <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors">
                            <FileText size={24} className="text-yellow-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Xuất đơn thuốc</p>
                        </button>
                        <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
                            <TrendingUp size={24} className="text-purple-600 mb-2" />
                            <p className="font-medium text-gray-900 text-sm">Báo cáo</p>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PharmacyDashboard;
